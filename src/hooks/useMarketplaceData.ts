import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  buildListingQuery,
  buildSellerListingQuery,
  getMarketplaceCatalog,
  getMarketplaceListing,
  getMyMarketplaceListings,
  searchMarketplaceListings,
} from "../api/marketplaceApi";

import type {
  ListingDetail,
  ListingPage,
  ListingSearchParams,
  ListingStatus,
  MarketplaceCatalog,
  SellerListingPage,
  SellerListingSearchParams,
} from "../types/marketplace";

interface QueryState<T> {
  data: T | null;
  error: unknown;
  isLoading: boolean;
}

export function useMarketplaceCatalog() {
  const [state, setState] =
    useState<QueryState<MarketplaceCatalog>>({
      data: null,
      error: null,
      isLoading: true,
    });

  const [reloadVersion, setReloadVersion] =
    useState(0);

  const reload = useCallback(() => {
    setReloadVersion((current) => current + 1);
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    setState((current) => ({
      ...current,
      error: null,
      isLoading: true,
    }));

    void getMarketplaceCatalog(controller.signal)
      .then((catalog) => {
        if (!controller.signal.aborted) {
          setState({
            data: catalog,
            error: null,
            isLoading: false,
          });
        }
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          setState({
            data: null,
            error,
            isLoading: false,
          });
        }
      });

    return () => {
      controller.abort();
    };
  }, [reloadVersion]);

  return {
    catalog: state.data,
    catalogError: state.error,
    isCatalogLoading: state.isLoading,
    reloadCatalog: reload,
  };
}

export function useMarketplaceListings(
  searchParams: ListingSearchParams,
) {
  const queryKey = useMemo(
    () => buildListingQuery(searchParams).toString(),
    [searchParams],
  );

  const [state, setState] =
    useState<QueryState<ListingPage>>({
      data: null,
      error: null,
      isLoading: true,
    });

  const [reloadVersion, setReloadVersion] =
    useState(0);

  const reload = useCallback(() => {
    setReloadVersion((current) => current + 1);
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    setState((current) => ({
      ...current,
      error: null,
      isLoading: true,
    }));

    const currentSearchParams =
      Object.fromEntries(
        new URLSearchParams(queryKey),
      );

    const request: ListingSearchParams = {
      keyword: currentSearchParams.q,
      category: currentSearchParams.category,
      brand: currentSearchParams.brand,
      condition: currentSearchParams.condition as
        | ListingSearchParams["condition"]
        | undefined,
      minPrice: currentSearchParams.minPrice,
      maxPrice: currentSearchParams.maxPrice,
      page: toPageNumber(currentSearchParams.page),
      size: toPageSize(currentSearchParams.size),
    };

    void searchMarketplaceListings(
      request,
      controller.signal,
    )
      .then((page) => {
        if (!controller.signal.aborted) {
          setState({
            data: page,
            error: null,
            isLoading: false,
          });
        }
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          setState({
            data: null,
            error,
            isLoading: false,
          });
        }
      });

    return () => {
      controller.abort();
    };
  }, [queryKey, reloadVersion]);

  return {
    listingPage: state.data,
    listingsError: state.error,
    areListingsLoading: state.isLoading,
    reloadListings: reload,
  };
}

function toPageNumber(
  value: string | undefined,
): number {
  const parsed = Number(value);

  return Number.isInteger(parsed) && parsed >= 0
    ? parsed
    : 0;
}

function toPageSize(
  value: string | undefined,
): number {
  const parsed = Number(value);

  return Number.isInteger(parsed) &&
    parsed >= 1 &&
    parsed <= 50
    ? parsed
    : 20;
}

export function useMarketplaceListing(
  listingId: string | undefined,
) {
  const [state, setState] =
    useState<QueryState<ListingDetail>>({
      data: null,
      error: null,
      isLoading: Boolean(listingId),
    });

  const [reloadVersion, setReloadVersion] =
    useState(0);

  const reload = useCallback(() => {
    setReloadVersion((current) => current + 1);
  }, []);

  useEffect(() => {
    if (!listingId) {
      setState({
        data: null,
        error: new Error("Listing ID is missing."),
        isLoading: false,
      });

      return;
    }

    const controller = new AbortController();

    setState({
      data: null,
      error: null,
      isLoading: true,
    });

    void getMarketplaceListing(
      listingId,
      controller.signal,
    )
      .then((listing) => {
        if (!controller.signal.aborted) {
          setState({
            data: listing,
            error: null,
            isLoading: false,
          });
        }
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          setState({
            data: null,
            error,
            isLoading: false,
          });
        }
      });

    return () => {
      controller.abort();
    };
  }, [listingId, reloadVersion]);

  return {
    listing: state.data,
    listingError: state.error,
    isListingLoading: state.isLoading,
    reloadListing: reload,
  };
}

export function useMyMarketplaceListings(
  searchParams: SellerListingSearchParams,
) {
  const queryKey = useMemo(
    () =>
      buildSellerListingQuery(
        searchParams,
      ).toString(),
    [searchParams],
  );

  const [state, setState] =
    useState<QueryState<SellerListingPage>>({
      data: null,
      error: null,
      isLoading: true,
    });

  const [reloadVersion, setReloadVersion] =
    useState(0);

  const reload = useCallback(() => {
    setReloadVersion((current) => current + 1);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams(queryKey);

    setState((current) => ({
      ...current,
      error: null,
      isLoading: true,
    }));

    const request: SellerListingSearchParams = {
      status:
        (params.get("status") as
          | ListingStatus
          | null) ?? undefined,
      page: toPageNumber(
        params.get("page") ?? undefined,
      ),
      size: toPageSize(
        params.get("size") ?? undefined,
      ),
    };

    void getMyMarketplaceListings(
      request,
      controller.signal,
    )
      .then((page) => {
        if (!controller.signal.aborted) {
          setState({
            data: page,
            error: null,
            isLoading: false,
          });
        }
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          setState({
            data: null,
            error,
            isLoading: false,
          });
        }
      });

    return () => {
      controller.abort();
    };
  }, [queryKey, reloadVersion]);

  return {
    sellerListingPage: state.data,
    sellerListingsError: state.error,
    areSellerListingsLoading: state.isLoading,
    reloadSellerListings: reload,
  };
}