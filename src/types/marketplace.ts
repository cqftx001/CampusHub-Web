export type ListingCondition =
  | "NEW"
  | "OPEN_BOX"
  | "LIKE_NEW"
  | "GOOD"
  | "FAIR"
  | "FOR_PARTS_OR_NOT_WORKING";

export type DeliveryMethod =
  | "LOCAL_PICKUP"
  | "SHIPPING"
  | "PICKUP_OR_SHIPPING";

export interface CategoryOption {
  slug: string;
  displayName: string;
}

export interface CategoryGroup {
  slug: string;
  displayName: string;
  children: CategoryOption[];
}

export interface CategoryReference {
  slug: string;
  displayName: string;
  parentSlug: string;
  parentDisplayName: string;
}

export interface BrandReference {
  slug: string;
  displayName: string;
}

export interface MarketplaceCatalog {
  categories: CategoryGroup[];
  brands: BrandReference[];
}

export interface ListingSummary {
  id: string;
  category: CategoryReference;
  brand: BrandReference | null;
  title: string;
  condition: ListingCondition;
  price: number;
  currency: string;
  location: string;
  deliveryMethod: DeliveryMethod;
  primaryImageUrl: string;
  createdAt: string;
}

export interface ListingPage {
  items: ListingSummary[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface ListingSearchParams {
  keyword?: string;
  category?: string;
  brand?: string;
  condition?: ListingCondition;
  minPrice?: string;
  maxPrice?: string;
  page?: number;
  size?: number;
}

export type ListingStatus =
  | "ACTIVE"
  | "SOLD"
  | "WITHDRAWN";

export interface ListingDetail {
  id: string;
  sellerAccountId: string;
  category: CategoryReference;
  brand: BrandReference | null;
  title: string;
  description: string;
  manufactureYear: number | null;
  condition: ListingCondition;
  price: number;
  currency: string;
  location: string;
  deliveryMethod: DeliveryMethod;
  imageUrls: string[];
  status: ListingStatus;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface SellerListingSummary {
  id: string;
  title: string;
  price: number;
  currency: string;
  primaryImageUrl: string;
  status: ListingStatus;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface SellerListingPage {
  items: SellerListingSummary[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface SellerListingSearchParams {
  status?: ListingStatus;
  page?: number;
  size?: number;
}

export interface ChangeListingStatusRequest {
  status: ListingStatus;
  expectedVersion: number;
}

export interface CreateListingRequest {
  categorySlug: string;
  brandSlug?: string;
  title: string;
  description: string;
  manufactureYear?: number;
  condition: ListingCondition;
  price: number;
  location: string;
  deliveryMethod: DeliveryMethod;
  imageUrls: string[];
}

export interface MarketplaceImageUpload {
  uploadBatchId: string;
  imageUrls: string[];
}
