import { apiRequest } from "./apiClient";
import type {
  ChangeListingStatusRequest,
  ListingDetail,
  ListingPage,
  ListingSearchParams,
  MarketplaceCatalog,
  MarketplaceImageUpload,
  SellerListingPage,
  SellerListingSearchParams,
  CreateListingRequest,
} from "../types/marketplace";

export async function uploadMarketplaceImages(
  files: File[],
): Promise<MarketplaceImageUpload> {
  const formData = new FormData();

  files.forEach((file) => {
    formData.append("files", file);
  });

  const response =
    await apiRequest<MarketplaceImageUpload>(
      "/api/marketplace/images",
      {
        method: "POST",
        body: formData,
      },
    );

  return response.data;
}

export async function getMarketplaceCatalog(
  signal?: AbortSignal,
): Promise<MarketplaceCatalog> {
  const response =
    await apiRequest<MarketplaceCatalog>(
      "/api/marketplace/catalog",
      {
        method: "GET",
        signal,
      },
    );

  return response.data;
}

export async function searchMarketplaceListings(
  searchParams: ListingSearchParams,
  signal?: AbortSignal,
): Promise<ListingPage> {
  const query = buildListingQuery(searchParams);

  const response = await apiRequest<ListingPage>(
    `/api/marketplace/listings?${query.toString()}`,
    {
      method: "GET",
      signal,
    },
  );

  return response.data;
}

export function buildListingQuery(
  searchParams: ListingSearchParams,
): URLSearchParams {
  const query = new URLSearchParams();

  appendIfPresent(
    query,
    "q",
    searchParams.keyword,
  );

  appendIfPresent(
    query,
    "category",
    searchParams.category,
  );

  appendIfPresent(
    query,
    "brand",
    searchParams.brand,
  );

  appendIfPresent(
    query,
    "condition",
    searchParams.condition,
  );

  appendIfPresent(
    query,
    "minPrice",
    searchParams.minPrice,
  );

  appendIfPresent(
    query,
    "maxPrice",
    searchParams.maxPrice,
  );

  query.set(
    "page",
    String(searchParams.page ?? 0),
  );

  query.set(
    "size",
    String(searchParams.size ?? 20),
  );

  return query;
}

function appendIfPresent(
  query: URLSearchParams,
  name: string,
  value: string | undefined,
): void {
  const normalized = value?.trim();

  if (normalized) {
    query.set(name, normalized);
  }
}

export async function getMarketplaceListing(
  listingId: string,
  signal?: AbortSignal,
): Promise<ListingDetail> {
  const response = await apiRequest<ListingDetail>(
    `/api/marketplace/listings/${encodeURIComponent(listingId)}`,
    {
      method: "GET",
      signal,
    },
  );

  return response.data;
}

export async function getMyMarketplaceListings(
  searchParams: SellerListingSearchParams,
  signal?: AbortSignal,
): Promise<SellerListingPage> {
  const query = buildSellerListingQuery(searchParams);

  const response =
    await apiRequest<SellerListingPage>(
      `/api/marketplace/listings/mine?${query.toString()}`,
      {
        method: "GET",
        signal,
      },
    );

  return response.data;
}

export async function changeMarketplaceListingStatus(
  listingId: string,
  request: ChangeListingStatusRequest,
): Promise<ListingDetail> {
  const response = await apiRequest<ListingDetail>(
    `/api/marketplace/listings/${encodeURIComponent(listingId)}/status`,
    {
      method: "PATCH",
      body: JSON.stringify(request),
    },
  );

  return response.data;
}

export function buildSellerListingQuery(
  searchParams: SellerListingSearchParams,
): URLSearchParams {
  const query = new URLSearchParams();

  appendIfPresent(
    query,
    "status",
    searchParams.status,
  );

  query.set(
    "page",
    String(searchParams.page ?? 0),
  );

  query.set(
    "size",
    String(searchParams.size ?? 20),
  );

  return query;
}

export async function createMarketplaceListing(
  request: CreateListingRequest,
): Promise<ListingDetail> {
  const response = await apiRequest<ListingDetail>(
    "/api/marketplace/listings",
    {
      method: "POST",
      body: JSON.stringify(request),
    },
  );

  return response.data;
}
