import {
  useMemo,
  useState,
} from "react";
import {
  Link,
  useSearchParams,
} from "react-router";
import {
  changeMarketplaceListingStatus,
} from "../api/marketplaceApi";
import { useAuth } from "../auth/AuthContext";
import { Pagination } from "../components/marketplace/Pagination";
import {
  formatMarketplaceDate,
  formatMarketplacePrice,
} from "../features/marketplace/marketplaceFormatters";
import {
  useMyMarketplaceListings,
} from "../hooks/useMarketplaceData";
import { ApiError } from "../types/api";
import type {
  ListingStatus,
  SellerListingSearchParams,
  SellerListingSummary,
} from "../types/marketplace";
import "../styles/marketplace.css";

const PAGE_SIZE = 12;

const VALID_STATUSES =
  new Set<ListingStatus>([
    "ACTIVE",
    "SOLD",
    "WITHDRAWN",
  ]);

const STATUS_LABELS: Record<
  ListingStatus,
  string
> = {
  ACTIVE: "Active",
  SOLD: "Sold",
  WITHDRAWN: "Withdrawn",
};

export function MyListingsPage() {
  const { logout } = useAuth();

  const [searchParams, setSearchParams] =
    useSearchParams();

  const queryString = searchParams.toString();

  const filters =
    useMemo<SellerListingSearchParams>(
      () => ({
        status: readStatus(
          new URLSearchParams(
            queryString,
          ).get("status"),
        ),
        page: readPage(
          new URLSearchParams(
            queryString,
          ).get("page"),
        ),
        size: PAGE_SIZE,
      }),
      [queryString],
    );

  const {
    sellerListingPage,
    sellerListingsError,
    areSellerListingsLoading,
    reloadSellerListings,
  } = useMyMarketplaceListings(filters);

  const [
    updatingListingId,
    setUpdatingListingId,
  ] = useState<string | null>(null);

  const [actionError, setActionError] =
    useState<unknown>(null);

  function changeStatusFilter(
    status?: ListingStatus,
  ) {
    const next =
      new URLSearchParams(searchParams);

    if (status) {
      next.set("status", status);
    } else {
      next.delete("status");
    }

    next.delete("page");
    setSearchParams(next);
  }

  function changePage(page: number) {
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

  async function updateStatus(
    listing: SellerListingSummary,
    status: ListingStatus,
  ) {
    setUpdatingListingId(listing.id);
    setActionError(null);

    try {
      await changeMarketplaceListingStatus(
        listing.id,
        {
          status,
          expectedVersion: listing.version,
        },
      );

      reloadSellerListings();
    } catch (error: unknown) {
      setActionError(error);

      // A stale version means another request already
      // changed the listing. Refresh before trying again.
      if (
        error instanceof ApiError &&
        error.status === 409
      ) {
        reloadSellerListings();
      }
    } finally {
      setUpdatingListingId(null);
    }
  }

  return (
    <main className="market-shell">
      <header className="market-header">
        <Link
          className="market-brand"
          to="/marketplace"
        >
          <span className="market-brand-mark">
            C
          </span>

          <span>
            CampusHub
            <small>Seller Center</small>
          </span>
        </Link>

        <nav className="market-account">
          <Link
            className="header-action"
            to="/marketplace"
          >
            Browse listings
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

      <section className="seller-listings-content">
        <div className="seller-listings-heading">
          <div>
            <p className="section-kicker">
              SELLER CENTER
            </p>

            <h1>My listings</h1>

            <p>
              Manage the items you have listed on
              CampusHub.
            </p>
          </div>

          <Link
            className="seller-create-button"
            to="/marketplace/new"
            >
            Create listing
          </Link>
        </div>

        <div className="seller-status-filters">
          <StatusFilter
            label="All"
            active={!filters.status}
            onClick={() =>
              changeStatusFilter()
            }
          />

          {(
            [
              "ACTIVE",
              "SOLD",
              "WITHDRAWN",
            ] as ListingStatus[]
          ).map((status) => (
            <StatusFilter
              key={status}
              label={STATUS_LABELS[status]}
              active={filters.status === status}
              onClick={() =>
                changeStatusFilter(status)
              }
            />
          ))}
        </div>

        {actionError != null && (
          <div className="seller-action-error">
            {getErrorMessage(actionError)}
          </div>
        )}

        {sellerListingsError != null && (
          <div className="market-message error-message">
            <div>
              <strong>
                Unable to load your listings
              </strong>

              <p>
                {getErrorMessage(
                  sellerListingsError,
                )}
              </p>
            </div>

            <button
              type="button"
              onClick={reloadSellerListings}
            >
              Try again
            </button>
          </div>
        )}

        {areSellerListingsLoading && (
          <div className="seller-listings-loading">
            Loading your listings...
          </div>
        )}

        {!areSellerListingsLoading &&
          sellerListingsError == null &&
          sellerListingPage?.items.length ===
            0 && (
            <div className="empty-listings">
              <span aria-hidden="true">+</span>
              <h3>No listings here</h3>

              <p>
                {filters.status
                  ? `You do not have any ${STATUS_LABELS[
                      filters.status
                    ].toLowerCase()} listings.`
                  : "You have not listed anything yet."}
              </p>
            </div>
          )}

        {!areSellerListingsLoading &&
          sellerListingsError == null &&
          sellerListingPage &&
          sellerListingPage.items.length >
            0 && (
            <>
              <div className="seller-listing-list">
                {sellerListingPage.items.map(
                  (listing) => (
                    <SellerListingRow
                      key={listing.id}
                      listing={listing}
                      isUpdating={
                        updatingListingId ===
                        listing.id
                      }
                      onStatusChange={
                        updateStatus
                      }
                    />
                  ),
                )}
              </div>

              <Pagination
                page={sellerListingPage.page}
                totalPages={
                  sellerListingPage.totalPages
                }
                hasNext={
                  sellerListingPage.hasNext
                }
                hasPrevious={
                  sellerListingPage.hasPrevious
                }
                onPageChange={changePage}
              />
            </>
          )}
      </section>
    </main>
  );
}

interface StatusFilterProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

function StatusFilter({
  label,
  active,
  onClick,
}: StatusFilterProps) {
  return (
    <button
      type="button"
      className={
        active
          ? "seller-status-filter active"
          : "seller-status-filter"
      }
      onClick={onClick}
    >
      {label}
    </button>
  );
}

interface SellerListingRowProps {
  listing: SellerListingSummary;
  isUpdating: boolean;
  onStatusChange: (
    listing: SellerListingSummary,
    status: ListingStatus,
  ) => Promise<void>;
}

function SellerListingRow({
  listing,
  isUpdating,
  onStatusChange,
}: SellerListingRowProps) {
  const title =
    listing.status === "ACTIVE" ? (
      <Link
        to={`/marketplace/listings/${listing.id}`}
      >
        {listing.title}
      </Link>
    ) : (
      listing.title
    );

  return (
    <article className="seller-listing-row">
      <img
        src={listing.primaryImageUrl}
        alt=""
      />

      <div className="seller-listing-main">
        <span
          className={`seller-listing-status status-${listing.status.toLowerCase()}`}
        >
          {STATUS_LABELS[listing.status]}
        </span>

        <h2>{title}</h2>

        <p>
          Updated{" "}
          {formatMarketplaceDate(
            listing.updatedAt,
          )}
        </p>
      </div>

      <strong className="seller-listing-price">
        {formatMarketplacePrice(
          listing.price,
          listing.currency,
        )}
      </strong>

      <div className="seller-listing-actions">
        {listing.status === "ACTIVE" ? (
          <>
            <button
              type="button"
              disabled={isUpdating}
              onClick={() =>
                void onStatusChange(
                  listing,
                  "SOLD",
                )
              }
            >
              Mark sold
            </button>

            <button
              type="button"
              className="secondary"
              disabled={isUpdating}
              onClick={() =>
                void onStatusChange(
                  listing,
                  "WITHDRAWN",
                )
              }
            >
              Withdraw
            </button>
          </>
        ) : (
          <button
            type="button"
            disabled={isUpdating}
            onClick={() =>
              void onStatusChange(
                listing,
                "ACTIVE",
              )
            }
          >
            Reactivate
          </button>
        )}
      </div>
    </article>
  );
}

function readStatus(
  value: string | null,
): ListingStatus | undefined {
  if (
    value &&
    VALID_STATUSES.has(
      value as ListingStatus,
    )
  ) {
    return value as ListingStatus;
  }

  return undefined;
}

function readPage(value: string | null): number {
  const page = Number(value);

  return Number.isInteger(page) && page >= 0
    ? page
    : 0;
}

function getErrorMessage(
  error: unknown,
): string {
  if (error instanceof ApiError) {
    if (error.status === 409) {
      return "This listing changed in another request. The latest data has been loaded; please try again.";
    }

    return error.message;
  }

  return "Unable to complete this action right now.";
}