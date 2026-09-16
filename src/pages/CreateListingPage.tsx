import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import {
  Link,
  useNavigate,
} from "react-router";
import {
  createMarketplaceListing,
  uploadMarketplaceImages,
} from "../api/marketplaceApi";
import {
  CONDITION_OPTIONS,
} from "../features/marketplace/marketplaceLabels";
import {
  useMarketplaceCatalog,
} from "../hooks/useMarketplaceData";
import { ApiError } from "../types/api";
import type {
  DeliveryMethod,
  ListingCondition,
} from "../types/marketplace";
import "../styles/marketplace.css";

interface ListingFormState {
  categorySlug: string;
  brandSlug: string;
  title: string;
  description: string;
  manufactureYear: string;
  condition: ListingCondition | "";
  price: string;
  location: string;
  deliveryMethod: DeliveryMethod | "";
}

interface SelectedImage {
  file: File;
  previewUrl: string;
}

type SubmissionStage =
  | "idle"
  | "uploading"
  | "publishing";

const MAXIMUM_IMAGE_COUNT = 8;
const MAXIMUM_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const SUPPORTED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const INITIAL_FORM: ListingFormState = {
  categorySlug: "",
  brandSlug: "",
  title: "",
  description: "",
  manufactureYear: "",
  condition: "",
  price: "",
  location: "",
  deliveryMethod: "",
};

export function CreateListingPage() {
  const navigate = useNavigate();

  const {
    catalog,
    catalogError,
    isCatalogLoading,
    reloadCatalog,
  } = useMarketplaceCatalog();

  const [form, setForm] =
    useState<ListingFormState>(INITIAL_FORM);

  const [submitError, setSubmitError] =
    useState<unknown>(null);

  const [selectedImages, setSelectedImages] =
    useState<SelectedImage[]>([]);

  const [uploadedImageUrls, setUploadedImageUrls] =
    useState<string[] | null>(null);

  const [submissionStage, setSubmissionStage] =
    useState<SubmissionStage>("idle");

  const selectedImagesRef =
    useRef<SelectedImage[]>([]);

  const isSubmitting = submissionStage !== "idle";

  useEffect(() => {
    selectedImagesRef.current = selectedImages;
  }, [selectedImages]);

  useEffect(() => {
    return () => {
      selectedImagesRef.current.forEach(
        (image) => URL.revokeObjectURL(image.previewUrl),
      );
    };
  }, []);

  function updateField<K extends keyof ListingFormState>(
    field: K,
    value: ListingFormState[K],
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleImageSelection(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";

    if (files.length === 0) {
      return;
    }

    if (
      selectedImages.length + files.length >
      MAXIMUM_IMAGE_COUNT
    ) {
      setSubmitError(
        new Error("A listing can contain at most 8 images."),
      );
      return;
    }

    const unsupportedFile = files.find(
      (file) => !SUPPORTED_IMAGE_TYPES.has(file.type),
    );

    if (unsupportedFile) {
      setSubmitError(
        new Error(
          `${unsupportedFile.name} is not a JPEG, PNG, or WebP image.`,
        ),
      );
      return;
    }

    const oversizedFile = files.find(
      (file) => file.size > MAXIMUM_IMAGE_SIZE_BYTES,
    );

    if (oversizedFile) {
      setSubmitError(
        new Error(
          `${oversizedFile.name} is larger than 5 MB.`,
        ),
      );
      return;
    }

    const images = files.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    setSelectedImages((current) => [
      ...current,
      ...images,
    ]);
    setUploadedImageUrls(null);
    setSubmitError(null);
  }

  function removeImage(previewUrl: string) {
    const image = selectedImages.find(
      (candidate) => candidate.previewUrl === previewUrl,
    );

    if (image) {
      URL.revokeObjectURL(image.previewUrl);
    }

    setSelectedImages((current) =>
      current.filter(
        (candidate) => candidate.previewUrl !== previewUrl,
      ),
    );
    setUploadedImageUrls(null);
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setSubmitError(null);

    if (!form.condition) {
      setSubmitError(
        new Error("Please select a condition."),
      );
      return;
    }

    if (!form.deliveryMethod) {
      setSubmitError(
        new Error(
          "Please select a delivery method.",
        ),
      );
      return;
    }

    if (selectedImages.length === 0) {
      setSubmitError(
        new Error(
          "Please select at least one image.",
        ),
      );
      return;
    }

    const price = Number(form.price);

    if (
      !Number.isFinite(price) ||
      price <= 0
    ) {
      setSubmitError(
        new Error(
          "Price must be greater than zero.",
        ),
      );
      return;
    }

    const manufactureYear =
      form.manufactureYear === ""
        ? undefined
        : Number(form.manufactureYear);

    try {
      let imageUrls = uploadedImageUrls;

      if (!imageUrls) {
        setSubmissionStage("uploading");

        const upload = await uploadMarketplaceImages(
          selectedImages.map((image) => image.file),
        );

        imageUrls = upload.imageUrls;
        setUploadedImageUrls(imageUrls);
      }

      setSubmissionStage("publishing");

      const listing =
        await createMarketplaceListing({
          categorySlug: form.categorySlug,
          brandSlug:
            form.brandSlug || undefined,
          title: form.title.trim(),
          description:
            form.description.trim(),
          manufactureYear,
          condition: form.condition,
          price,
          location: form.location.trim(),
          deliveryMethod:
            form.deliveryMethod,
          imageUrls,
        });

      navigate(
        `/marketplace/listings/${listing.id}`,
        {
          replace: true,
        },
      );
    } catch (error: unknown) {
      setSubmitError(error);
    } finally {
      setSubmissionStage("idle");
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
            <small>New listing</small>
          </span>
        </Link>

        <Link
          className="header-action"
          to="/marketplace/mine"
        >
          Cancel
        </Link>
      </header>

      <section className="create-listing-content">
        <div className="create-listing-heading">
          <p className="section-kicker">
            SELL ON CAMPUS
          </p>

          <h1>Create a listing</h1>

          <p>
            Add the essential information buyers
            need. You can update the listing later.
          </p>
        </div>

        {catalogError != null && (
          <div className="market-message error-message">
            <div>
              <strong>
                Unable to load categories
              </strong>

              <p>
                {getErrorMessage(catalogError)}
              </p>
            </div>

            <button
              type="button"
              onClick={reloadCatalog}
            >
              Try again
            </button>
          </div>
        )}

        <form
          className="create-listing-form"
          onSubmit={handleSubmit}
        >
          <section className="listing-form-section">
            <div className="listing-form-section-heading">
              <span>1</span>

              <div>
                <h2>Classification</h2>
                <p>
                  Choose the most specific category
                  and an optional brand.
                </p>
              </div>
            </div>

            <div className="listing-form-grid">
              <label>
                Category
                <select
                  required
                  disabled={isCatalogLoading}
                  value={form.categorySlug}
                  onChange={(event) =>
                    updateField(
                      "categorySlug",
                      event.target.value,
                    )
                  }
                >
                  <option value="">
                    Select a category
                  </option>

                  {catalog?.categories.map(
                    (group) => (
                      <optgroup
                        key={group.slug}
                        label={group.displayName}
                      >
                        {group.children.map(
                          (category) => (
                            <option
                              key={category.slug}
                              value={category.slug}
                            >
                              {
                                category.displayName
                              }
                            </option>
                          ),
                        )}
                      </optgroup>
                    ),
                  )}
                </select>
              </label>

              <label>
                Brand
                <select
                  disabled={isCatalogLoading}
                  value={form.brandSlug}
                  onChange={(event) =>
                    updateField(
                      "brandSlug",
                      event.target.value,
                    )
                  }
                >
                  <option value="">
                    No brand
                  </option>

                  {catalog?.brands.map(
                    (brand) => (
                      <option
                        key={brand.slug}
                        value={brand.slug}
                      >
                        {brand.displayName}
                      </option>
                    ),
                  )}
                </select>
              </label>
            </div>
          </section>

          <section className="listing-form-section">
            <div className="listing-form-section-heading">
              <span>2</span>

              <div>
                <h2>Item details</h2>
                <p>
                  Describe the item accurately and
                  keep the title concise.
                </p>
              </div>
            </div>

            <div className="listing-form-grid">
              <label className="full-width">
                Title
                <input
                  required
                  maxLength={160}
                  value={form.title}
                  placeholder="NVIDIA RTX 5090"
                  onChange={(event) =>
                    updateField(
                      "title",
                      event.target.value,
                    )
                  }
                />
              </label>

              <label className="full-width">
                Description
                <textarea
                  required
                  maxLength={5000}
                  rows={7}
                  value={form.description}
                  placeholder="Condition, included accessories, reason for selling..."
                  onChange={(event) =>
                    updateField(
                      "description",
                      event.target.value,
                    )
                  }
                />
              </label>

              <label>
                Condition
                <select
                  required
                  value={form.condition}
                  onChange={(event) =>
                    updateField(
                      "condition",
                      event.target.value as
                        | ListingCondition
                        | "",
                    )
                  }
                >
                  <option value="">
                    Select condition
                  </option>

                  {CONDITION_OPTIONS.map(
                    (condition) => (
                      <option
                        key={condition.value}
                        value={condition.value}
                      >
                        {condition.label}
                      </option>
                    ),
                  )}
                </select>
              </label>

              <label>
                Manufacture year
                <input
                  type="number"
                  min={1800}
                  max={2100}
                  value={form.manufactureYear}
                  placeholder="Optional"
                  onChange={(event) =>
                    updateField(
                      "manufactureYear",
                      event.target.value,
                    )
                  }
                />
              </label>
            </div>
          </section>

          <section className="listing-form-section">
            <div className="listing-form-section-heading">
              <span>3</span>

              <div>
                <h2>Price and delivery</h2>
                <p>
                  Marketplace V1 uses fixed prices
                  in USD.
                </p>
              </div>
            </div>

            <div className="listing-form-grid">
              <label>
                Price
                <div className="listing-price-input">
                  <span>$</span>

                  <input
                    required
                    type="number"
                    min="0.01"
                    max="9999999999.99"
                    step="0.01"
                    value={form.price}
                    placeholder="0.00"
                    onChange={(event) =>
                      updateField(
                        "price",
                        event.target.value,
                      )
                    }
                  />
                </div>
              </label>

              <label>
                Location
                <input
                  required
                  maxLength={160}
                  value={form.location}
                  placeholder="Main Campus"
                  onChange={(event) =>
                    updateField(
                      "location",
                      event.target.value,
                    )
                  }
                />
              </label>

              <label className="full-width">
                Delivery method
                <select
                  required
                  value={form.deliveryMethod}
                  onChange={(event) =>
                    updateField(
                      "deliveryMethod",
                      event.target.value as
                        | DeliveryMethod
                        | "",
                    )
                  }
                >
                  <option value="">
                    Select delivery method
                  </option>

                  <option value="LOCAL_PICKUP">
                    Local pickup
                  </option>

                  <option value="SHIPPING">
                    Shipping
                  </option>

                  <option value="PICKUP_OR_SHIPPING">
                    Pickup or shipping
                  </option>
                </select>
              </label>
            </div>
          </section>

          <section className="listing-form-section">
            <div className="listing-form-section-heading">
              <span>4</span>

              <div>
                <h2>Images</h2>
                <p>
                  Select 1–8 JPEG, PNG, or WebP
                  images. Each image can be up to
                  5 MB. The first image is the cover.
                </p>
              </div>
            </div>

            <div className="listing-image-upload">
              <label className="listing-image-picker">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  disabled={
                    isSubmitting ||
                    selectedImages.length >= MAXIMUM_IMAGE_COUNT
                  }
                  onChange={handleImageSelection}
                />

                <span>Choose images</span>

                <small>
                  {selectedImages.length} / {MAXIMUM_IMAGE_COUNT} selected
                </small>
              </label>

              {selectedImages.length > 0 && (
                <div className="listing-image-previews">
                  {selectedImages.map((image, index) => (
                    <article
                      className="listing-image-preview"
                      key={image.previewUrl}
                    >
                      <img
                        src={image.previewUrl}
                        alt={`Selected listing image ${index + 1}`}
                      />

                      {index === 0 && (
                        <span>Cover</span>
                      )}

                      <button
                        type="button"
                        aria-label={`Remove ${image.file.name}`}
                        disabled={isSubmitting}
                        onClick={() =>
                          removeImage(image.previewUrl)
                        }
                      >
                        Remove
                      </button>

                      <p title={image.file.name}>
                        {image.file.name}
                      </p>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </section>

          {submitError != null && (
            <div className="seller-action-error">
              {getErrorMessage(submitError)}
            </div>
          )}

          <div className="listing-form-actions">
            <Link
              className="listing-form-cancel"
              to="/marketplace/mine"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={
                isSubmitting ||
                isCatalogLoading ||
                catalogError != null
              }
            >
              {submissionStage === "uploading"
                ? "Uploading images..."
                : submissionStage === "publishing"
                  ? "Publishing..."
                  : "Publish listing"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}

function getErrorMessage(
  error: unknown,
): string {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Unable to publish this listing right now.";
}
