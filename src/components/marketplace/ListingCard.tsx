import {
  CONDITION_LABELS,
  DELIVERY_LABELS,
} from "../../features/marketplace/marketplaceLabels";
import type {
  ListingSummary,
} from "../../types/marketplace";
import {
  formatMarketplacePrice,
} from "../../features/marketplace/marketplaceFormatters";
import { Link } from "react-router";

interface ListingCardProps {
  listing: ListingSummary;
}

export function ListingCard({
  listing,
}: ListingCardProps) {
  return (
    <Link
      className="listing-card"
      to={`/marketplace/listings/${listing.id}`}
      aria-label={`View ${listing.title}`}
    >
      <div className="listing-image-frame">
        <img
          src={listing.primaryImageUrl}
          alt={listing.title}
          loading="lazy"
        />

        <span className="listing-condition-badge">
          {CONDITION_LABELS[listing.condition]}
        </span>
      </div>

      <div className="listing-card-body">
        <div className="listing-taxonomy">
          <span>{listing.category.parentDisplayName}</span>
          <span aria-hidden="true">/</span>
          <span>{listing.category.displayName}</span>
        </div>

        <h3>{listing.title}</h3>

        {listing.brand && (
          <p className="listing-brand">
            {listing.brand.displayName}
          </p>
        )}

        <p className="listing-price">
          {formatMarketplacePrice(
            listing.price,
            listing.currency,
          )}
        </p>

        <div className="listing-card-footer">
          <span className="listing-location">
            <LocationIcon />
            {listing.location}
          </span>

          <span>
            {DELIVERY_LABELS[
              listing.deliveryMethod
            ]}
          </span>
        </div>
      </div>
    </Link>
  );
}

function LocationIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        d="M12 21s7-5.2 7-12a7 7 0 1 0-14 0c0 6.8 7 12 7 12Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <circle
        cx="12"
        cy="9"
        r="2.4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
  );
}