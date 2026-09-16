import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import { Link, useSearchParams } from "react-router";
import { ApiError } from "../types/api";
import { useAuth } from "../auth/AuthContext";
import {
  useMarketplaceCatalog,
  useMarketplaceListings,
} from "../hooks/useMarketplaceData";
import {
  CategoryNavigation,
} from "../components/marketplace/CategoryNavigation";
import {
  MarketplaceFilters,
} from "../components/marketplace/MarketplaceFilters";
import {
  ListingCard,
} from "../components/marketplace/ListingCard";
import {
  Pagination,
} from "../components/marketplace/Pagination";
import type {
  ListingCondition,
  ListingSearchParams,
} from "../types/marketplace";
import "../styles/marketplace.css";

const PAGE_SIZE = 12;

const LISTING_CONDITIONS =
  new Set<ListingCondition>([
    "NEW",
    "OPEN_BOX",
    "LIKE_NEW",
    "GOOD",
    "FAIR",
    "FOR_PARTS_OR_NOT_WORKING",
  ]);

export function MarketplacePage() {
  const { account, logout } = useAuth();
  const [searchParams, setSearchParams] =
    useSearchParams();

  const queryString = searchParams.toString();

  const filters = useMemo<ListingSearchParams>(
    () => readFilters(
      new URLSearchParams(queryString),
    ),
    [queryString],
  );

  const [keywordDraft, setKeywordDraft] =
    useState(filters.keyword ?? "");

  useEffect(() => {
    setKeywordDraft(filters.keyword ?? "");
  }, [filters.keyword]);

  const {
    catalog,
    catalogError,
    isCatalogLoading,
    reloadCatalog,
  } = useMarketplaceCatalog();

  const {
    listingPage,
    listingsError,
    areListingsLoading,
    reloadListings,
  } = useMarketplaceListings(filters);

  const activeFilterCount = [
    filters.category,
    filters.brand,
    filters.condition,
    filters.minPrice,
    filters.maxPrice,
  ].filter(Boolean).length;

  function updateFilter(
    name: string,
    value?: string,
  ) {
    const next =
      new URLSearchParams(searchParams);

    if (value) {
      next.set(name, value);
    } else {
      next.delete(name);
    }

    next.delete("page");
    setSearchParams(next);
  }

  function handleSearch(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    updateFilter("q", keywordDraft.trim());
  }

  function handlePriceChange(
    minimum?: string,
    maximum?: string,
  ) {
    const next =
      new URLSearchParams(searchParams);

    setOrDelete(next, "minPrice", minimum);
    setOrDelete(next, "maxPrice", maximum);

    next.delete("page");
    setSearchParams(next);
  }

  function handlePageChange(page: number) {
    const next =
      new URLSearchParams(searchParams);

    if (page > 0) {
      next.set("page", String(page));
    } else {
      next.delete("page");
    }

    setSearchParams(next);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function clearFilters() {
    const next = new URLSearchParams();

    if (filters.keyword) {
      next.set("q", filters.keyword);
    }

    setSearchParams(next);
  }

  return (
    <main className="market-shell">
      <header className="market-header">
        <a
          className="market-brand"
          href="/marketplace"
        >
          <span className="market-brand-mark">C</span>

          <span>
            CampusHub
            <small>Marketplace</small>
          </span>
        </a>

        <nav className="market-account">
          <div className="account-avatar">
            {account?.username
              .charAt(0)
              .toUpperCase()}
          </div>

          <div className="account-name">
            <span>Signed in as</span>
            <strong>{account?.username}</strong>
          </div>

          <Link
            className="header-action"
            to="/marketplace/new"
          >
            Sell an item
          </Link>

          <Link
            className="header-action"
            to="/marketplace/mine"
          >
            My listings
          </Link>

          <button
            type="button"
            className="header-action"
            onClick={() => void logout()}
          >
            Sign out
          </button>
        </nav>
      </header>

      <section className="market-hero">
        <div className="market-hero-content">
          <p className="section-kicker">
            YOUR CAMPUS, YOUR MARKET
          </p>

          <h1>
            Good finds,
            <br />
            closer than you think.
          </h1>

          <p>
            Buy useful things from people around
            campus. Search by name, category, or
            brand.
          </p>

          <form
            className="market-search"
            onSubmit={handleSearch}
          >
            <SearchIcon />

            <input
              type="search"
              placeholder="Search laptops, furniture, NVIDIA..."
              aria-label="Search marketplace"
              maxLength={100}
              value={keywordDraft}
              onChange={(event) =>
                setKeywordDraft(event.target.value)
              }
            />

            <button type="submit">
              Search
            </button>
          </form>
        </div>

        <div
          className="market-hero-decoration"
          aria-hidden="true"
        >
          <span className="decoration-card card-one">
            <strong>Local pickup</strong>
            <small>Meet safely on campus</small>
          </span>

          <span className="decoration-card card-two">
            <strong>Student prices</strong>
            <small>Useful finds nearby</small>
          </span>

          <span className="decoration-orbit" />
        </div>
      </section>

      <CategoryNavigation
        categories={catalog?.categories ?? []}
        selectedCategory={filters.category}
        isLoading={isCatalogLoading}
        onSelect={(category) =>
          updateFilter("category", category)
        }
      />

      <section className="market-content">
        <MarketplaceFilters
          brands={catalog?.brands ?? []}
          selectedBrand={filters.brand}
          selectedCondition={filters.condition}
          minimumPrice={filters.minPrice}
          maximumPrice={filters.maxPrice}
          activeFilterCount={activeFilterCount}
          isCatalogLoading={isCatalogLoading}
          onBrandChange={(brand) =>
            updateFilter("brand", brand)
          }
          onConditionChange={(condition) =>
            updateFilter("condition", condition)
          }
          onApplyPrice={handlePriceChange}
          onClear={clearFilters}
        />

        <div className="listing-section">
          <div className="listing-section-heading">
            <div>
              <p className="section-kicker">
                MARKETPLACE
              </p>

              <h2>
                {filters.keyword
                  ? `Results for “${filters.keyword}”`
                  : "Latest listings"}
              </h2>
            </div>

            {listingPage && (
              <p>
                {listingPage.totalElements}{" "}
                {listingPage.totalElements === 1
                  ? "item"
                  : "items"}
              </p>
            )}
          </div>

          {catalogError != null && (
            <InlineError
              message={getErrorMessage(catalogError)}
              onRetry={reloadCatalog}
            />
          )}
          {listingsError != null && (
            <InlineError
              message={getErrorMessage(listingsError)}
              onRetry={reloadListings}
            />
          )}

          {!listingsError &&
            areListingsLoading && (
              <ListingSkeletonGrid />
            )}

          {!listingsError &&
            !areListingsLoading &&
            listingPage?.items.length === 0 && (
              <EmptyListings
                hasFilters={
                  activeFilterCount > 0 ||
                  Boolean(filters.keyword)
                }
                onClear={() =>
                  setSearchParams(
                    new URLSearchParams(),
                  )
                }
              />
            )}

          {!listingsError &&
            !areListingsLoading &&
            listingPage &&
            listingPage.items.length > 0 && (
              <>
                <div className="listing-grid">
                  {listingPage.items.map(
                    (listing) => (
                      <ListingCard
                        key={listing.id}
                        listing={listing}
                      />
                    ),
                  )}
                </div>

                <Pagination
                  page={listingPage.page}
                  totalPages={
                    listingPage.totalPages
                  }
                  hasNext={listingPage.hasNext}
                  hasPrevious={
                    listingPage.hasPrevious
                  }
                  onPageChange={handlePageChange}
                />
              </>
            )}
        </div>
      </section>
    </main>
  );
}

function readFilters(
  params: URLSearchParams,
): ListingSearchParams {
  const rawCondition =
    params.get("condition");

  return {
    keyword: valueOrUndefined(params.get("q")),
    category: valueOrUndefined(
      params.get("category"),
    ),
    brand: valueOrUndefined(
      params.get("brand"),
    ),
    condition:
      rawCondition &&
      LISTING_CONDITIONS.has(
        rawCondition as ListingCondition,
      )
        ? (rawCondition as ListingCondition)
        : undefined,
    minPrice: valueOrUndefined(
      params.get("minPrice"),
    ),
    maxPrice: valueOrUndefined(
      params.get("maxPrice"),
    ),
    page: readPage(params.get("page")),
    size: PAGE_SIZE,
  };
}

function valueOrUndefined(
  value: string | null,
): string | undefined {
  const normalized = value?.trim();
  return normalized || undefined;
}

function readPage(value: string | null): number {
  const parsed = Number(value);

  return Number.isInteger(parsed) && parsed >= 0
    ? parsed
    : 0;
}

function setOrDelete(
  params: URLSearchParams,
  name: string,
  value?: string,
) {
  const normalized = value?.trim();

  if (normalized) {
    params.set(name, normalized);
  } else {
    params.delete(name);
  }
}

interface InlineErrorProps {
  message: string;
  onRetry: () => void;
}

function InlineError({
  message,
  onRetry,
}: InlineErrorProps) {
  return (
    <div className="market-message error-message">
      <div>
        <strong>Something went wrong</strong>
        <p>{message}</p>
      </div>

      <button type="button" onClick={onRetry}>
        Try again
      </button>
    </div>
  );
}

interface EmptyListingsProps {
  hasFilters: boolean;
  onClear: () => void;
}

function EmptyListings({
  hasFilters,
  onClear,
}: EmptyListingsProps) {
  return (
    <div className="empty-listings">
      <span aria-hidden="true">⌕</span>
      <h3>No listings found</h3>

      <p>
        {hasFilters
          ? "Try changing or clearing your search filters."
          : "There are no active listings yet."}
      </p>

      {hasFilters && (
        <button type="button" onClick={onClear}>
          Clear search
        </button>
      )}
    </div>
  );
}

function ListingSkeletonGrid() {
  return (
    <div
      className="listing-grid"
      aria-label="Loading listings"
    >
      {Array.from({ length: 6 }, (_, index) => (
        <div
          className="listing-card skeleton-card"
          key={index}
        >
          <span className="skeleton-image" />

          <div className="skeleton-lines">
            <span />
            <span />
            <span />
          </div>
        </div>
      ))}
    </div>
  );
}

function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }

  return "Unable to load Marketplace right now.";
}

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        cx="11"
        cy="11"
        r="6.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="m16 16 4 4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}