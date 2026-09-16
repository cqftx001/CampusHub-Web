import type {
  DeliveryMethod,
  ListingCondition,
} from "../../types/marketplace";

export const CONDITION_OPTIONS: Array<{
  value: ListingCondition;
  label: string;
}> = [
  { value: "NEW", label: "New" },
  { value: "OPEN_BOX", label: "Open box" },
  { value: "LIKE_NEW", label: "Like new" },
  { value: "GOOD", label: "Good" },
  { value: "FAIR", label: "Fair" },
  {
    value: "FOR_PARTS_OR_NOT_WORKING",
    label: "For parts",
  },
];

export const CONDITION_LABELS: Record<
  ListingCondition,
  string
> = Object.fromEntries(
  CONDITION_OPTIONS.map(({ value, label }) => [
    value,
    label,
  ]),
) as Record<ListingCondition, string>;

export const DELIVERY_LABELS: Record<
  DeliveryMethod,
  string
> = {
  LOCAL_PICKUP: "Local pickup",
  SHIPPING: "Shipping",
  PICKUP_OR_SHIPPING: "Pickup or shipping",
};