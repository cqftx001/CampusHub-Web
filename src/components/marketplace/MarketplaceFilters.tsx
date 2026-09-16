import {
  useEffect,
  useState,
  type FormEvent,
} from "react";
import { CONDITION_OPTIONS } from "../../features/marketplace/marketplaceLabels";
import type {
  BrandReference,
  ListingCondition,
} from "../../types/marketplace";

interface MarketplaceFiltersProps {
  brands: BrandReference[];
  selectedBrand?: string;
  selectedCondition?: ListingCondition;
  minimumPrice?: string;
  maximumPrice?: string;
  activeFilterCount: number;
  isCatalogLoading: boolean;
  onBrandChange: (brand?: string) => void;
  onConditionChange: (
    condition?: ListingCondition,
  ) => void;
  onApplyPrice: (
    minimum?: string,
    maximum?: string,
  ) => void;
  onClear: () => void;
}

export function MarketplaceFilters({
  brands,
  selectedBrand,
  selectedCondition,
  minimumPrice,
  maximumPrice,
  activeFilterCount,
  isCatalogLoading,
  onBrandChange,
  onConditionChange,
  onApplyPrice,
  onClear,
}: MarketplaceFiltersProps) {
  const [minimumDraft, setMinimumDraft] =
    useState(minimumPrice ?? "");

  const [maximumDraft, setMaximumDraft] =
    useState(maximumPrice ?? "");

  useEffect(() => {
    setMinimumDraft(minimumPrice ?? "");
    setMaximumDraft(maximumPrice ?? "");
  }, [minimumPrice, maximumPrice]);

  function handlePriceSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    onApplyPrice(
      minimumDraft || undefined,
      maximumDraft || undefined,
    );
  }

  return (
    <aside className="filter-panel">
      <div className="filter-panel-heading">
        <div>
          <p className="section-kicker">REFINE</p>
          <h2>Filters</h2>
        </div>

        {activeFilterCount > 0 && (
          <button
            type="button"
            className="text-button"
            onClick={onClear}
          >
            Clear all
          </button>
        )}
      </div>

      <div className="filter-group">
        <label htmlFor="brand-filter">
          Brand
        </label>

        <select
          id="brand-filter"
          value={selectedBrand ?? ""}
          disabled={isCatalogLoading}
          onChange={(event) =>
            onBrandChange(
              event.target.value || undefined,
            )
          }
        >
          <option value="">All brands</option>

          {brands.map((brand) => (
            <option
              key={brand.slug}
              value={brand.slug}
            >
              {brand.displayName}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="condition-filter">
          Condition
        </label>

        <select
          id="condition-filter"
          value={selectedCondition ?? ""}
          onChange={(event) =>
            onConditionChange(
              (event.target.value ||
                undefined) as
                | ListingCondition
                | undefined,
            )
          }
        >
          <option value="">Any condition</option>

          {CONDITION_OPTIONS.map((option) => (
            <option
              key={option.value}
              value={option.value}
            >
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <form
        className="filter-group"
        onSubmit={handlePriceSubmit}
      >
        <label>Price range</label>

        <div className="price-inputs">
          <div className="price-input">
            <span>$</span>
            <input
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              placeholder="Min"
              aria-label="Minimum price"
              value={minimumDraft}
              onChange={(event) =>
                setMinimumDraft(event.target.value)
              }
            />
          </div>

          <span className="price-separator">to</span>

          <div className="price-input">
            <span>$</span>
            <input
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              placeholder="Max"
              aria-label="Maximum price"
              value={maximumDraft}
              onChange={(event) =>
                setMaximumDraft(event.target.value)
              }
            />
          </div>
        </div>

        <button
          type="submit"
          className="apply-filter-button"
        >
          Apply price
        </button>
      </form>
    </aside>
  );
}