import {
  useEffect,
  useState,
} from "react";
import {
  Link,
  useParams,
} from "react-router";
import { ApiError } from "../types/api";
import { useMarketplaceListing } from "../hooks/useMarketplaceData";
import {
  CONDITION_LABELS,
  DELIVERY_LABELS,
} from "../features/marketplace/marketplaceLabels";
import {
  formatMarketplaceDate,
  formatMarketplacePrice,
} from "../features/marketplace/marketplaceFormatters";
import "../styles/marketplace.css";

export function ListingDetailPage() {
  const { listingId } = useParams<{
    listingId: string;
  }>();

  const {
    listing,
    listingError,
    isListingLoading,
    reloadListing,
  } = useMarketplaceListing(listingId);

  const [selectedImageIndex, setSelectedImageIndex] =
    useState(0);

  useEffect(() => {
    setSelectedImageIndex(0);
  }, [listing?.id]);

  const selectedImage =
    listing?.imageUrls[selectedImageIndex] ??
    listing?.imageUrls[0];

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
            <small>Marketplace</small>
          </span>
        </Link>

        <Link
          className="header-action"
          to="/marketplace"
        >
          Browse listings
        </Link>
      </header>

      <section className="listing-detail-content">
        <Link
          className="listing-detail-back"
          to="/marketplace"
        >
          ← Back to Marketplace
        </Link>

        {isListingLoading && (
          <ListingDetailSkeleton />
        )}

        {listingError != null && (
          <div className="market-message error-message">
            <div>
              <strong>Listing unavailable</strong>

              <p>
                {getErrorMessage(listingError)}
              </p>
            </div>

            <button
              type="button"
              onClick={reloadListing}
            >
              Try again
            </button>
          </div>
        )}

        {!isListingLoading &&
          listingError == null &&
          listing && (
            <div className="listing-detail-layout">
              <section className="listing-gallery">
                <div className="listing-main-image">
                  {selectedImage ? (
                    <img
                      src={selectedImage}
                      alt={listing.title}
                    />
                  ) : (
                    <div className="listing-image-empty">
                      No image available
                    </div>
                  )}
                </div>

                {listing.imageUrls.length > 1 && (
                  <div className="listing-thumbnails">
                    {listing.imageUrls.map(
                      (imageUrl, index) => (
                        <button
                          key={`${imageUrl}-${index}`}
                          type="button"
                          className={
                            selectedImageIndex === index
                              ? "listing-thumbnail active"
                              : "listing-thumbnail"
                          }
                          onClick={() =>
                            setSelectedImageIndex(index)
                          }
                          aria-label={`View image ${index + 1}`}
                        >
                          <img
                            src={imageUrl}
                            alt=""
                          />
                        </button>
                      ),
                    )}
                  </div>
                )}
              </section>

              <aside className="listing-detail-panel">
                <div className="listing-detail-taxonomy">
                  <span>
                    {
                      listing.category
                        .parentDisplayName
                    }
                  </span>

                  <span>/</span>

                  <span>
                    {listing.category.displayName}
                  </span>
                </div>

                <h1>{listing.title}</h1>

                {listing.brand && (
                  <p className="listing-detail-brand">
                    {listing.brand.displayName}
                  </p>
                )}

                <p className="listing-detail-price">
                  {formatMarketplacePrice(
                    listing.price,
                    listing.currency,
                  )}
                </p>

                <dl className="listing-detail-facts">
                  <div>
                    <dt>Condition</dt>
                    <dd>
                      {
                        CONDITION_LABELS[
                          listing.condition
                        ]
                      }
                    </dd>
                  </div>

                  {listing.manufactureYear != null && (
                    <div>
                      <dt>Year</dt>
                      <dd>
                        {listing.manufactureYear}
                      </dd>
                    </div>
                  )}

                  <div>
                    <dt>Delivery</dt>
                    <dd>
                      {
                        DELIVERY_LABELS[
                          listing.deliveryMethod
                        ]
                      }
                    </dd>
                  </div>

                  <div>
                    <dt>Location</dt>
                    <dd>{listing.location}</dd>
                  </div>

                  <div>
                    <dt>Listed</dt>
                    <dd>
                      {formatMarketplaceDate(
                        listing.createdAt,
                      )}
                    </dd>
                  </div>
                </dl>

                <div className="listing-v1-notice">
                  <strong>Marketplace V1</strong>

                  <p>
                    Contact, checkout, and payment
                    features will be added in a later
                    release.
                  </p>
                </div>
              </aside>

              <section className="listing-description">
                <p className="section-kicker">
                  DESCRIPTION
                </p>

                <h2>About this item</h2>

                <p>{listing.description}</p>
              </section>
            </div>
          )}
      </section>
    </main>
  );
}

function ListingDetailSkeleton() {
  return (
    <div
      className="listing-detail-layout detail-skeleton"
      aria-label="Loading listing"
    >
      <div className="detail-skeleton-image" />

      <div className="detail-skeleton-copy">
        <span />
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}

function getErrorMessage(
  error: unknown,
): string {
  if (error instanceof ApiError) {
    if (error.status === 404) {
      return "This listing does not exist or is no longer active.";
    }

    return error.message;
  }

  return "Unable to load this listing right now.";
}