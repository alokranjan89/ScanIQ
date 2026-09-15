import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

import {
  getProductByBarcode,
  type Product,
} from "../services/product.service";

import {
  getProductVerification,
  type Verification,
} from "../services/verification.service";

/*
|--------------------------------------------------------------------------
| Local UI types
|--------------------------------------------------------------------------
|
| Your API Product type intentionally contains some flexible fields.
| Nutrition values are therefore treated as unknown by TypeScript.
| We safely convert them before displaying them.
|
*/

type NutritionData = {
  calories?: number | null;
  protein?: number | null;
  carbohydrates?: number | null;
  fat?: number | null;
  saturatedFat?: number | null;
  sugars?: number | null;
  fiber?: number | null;
  salt?: number | null;
  sodium?: number | null;
  unit?: string | null;
  source?: string | null;
};

/*
|--------------------------------------------------------------------------
| Helper functions
|--------------------------------------------------------------------------
*/

function getNutrition(
  nutrition: Product["nutrition"],
): NutritionData | null {
  if (
    typeof nutrition !== "object" ||
    nutrition === null
  ) {
    return null;
  }

  return nutrition as NutritionData;
}

function formatNumber(
  value: unknown,
): string {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value)
  ) {
    return "Not available";
  }

  return String(value);
}

function formatPrice(
  amount: number,
  currency: string,
): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
    }).format(amount);
  } catch {
    return `${currency} ${amount}`;
  }
}

function formatAttributeKey(
  key: string,
): string {
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase(),
    );
}

function getVerificationLabel(
  status: Verification["status"],
): string {
  switch (status) {
    case "VERIFIED":
      return "Verified";

    case "PARTIALLY_VERIFIED":
      return "Partially verified";

    case "UNABLE_TO_VERIFY":
      return "Unable to verify";

    default:
      return "Verification unavailable";
  }
}

function getVerificationClasses(
  status: Verification["status"],
): string {
  switch (status) {
    case "VERIFIED":
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-400";

    case "PARTIALLY_VERIFIED":
      return "border-amber-500/30 bg-amber-500/10 text-amber-400";

    case "UNABLE_TO_VERIFY":
      return "border-slate-700 bg-slate-900 text-slate-400";

    default:
      return "border-slate-700 bg-slate-900 text-slate-400";
  }
}

/*
|--------------------------------------------------------------------------
| Verification check row
|--------------------------------------------------------------------------
*/

function VerificationCheckRow({
  label,
  value,
}: {
  label: string;
  value: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3">
      <span className="text-sm text-slate-300">
        {label}
      </span>

      {value ? (
        <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
          ✓ Match
        </span>
      ) : (
        <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-500">
          No match
        </span>
      )}
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| Main page
|--------------------------------------------------------------------------
*/

function ProductDetailsPage() {
  const { barcode } =
    useParams<{ barcode: string }>();

  const [product, setProduct] =
    useState<Product | null>(null);

  const [verification, setVerification] =
    useState<Verification | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [verificationLoading, setVerificationLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [verificationError, setVerificationError] =
    useState<string | null>(null);

  const [favorite, setFavorite] =
    useState(false);

  /*
  |--------------------------------------------------------------------------
  | Load product
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    let cancelled = false;

    async function loadProduct() {
      if (!barcode) {
        setError(
          "No barcode was provided.",
        );
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const result =
          await getProductByBarcode(
            barcode,
          );

        if (!cancelled) {
          setProduct(result);
        }
      } catch (err) {
        if (cancelled) {
          return;
        }

        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError(
            "Unable to load product.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadProduct();

    return () => {
      cancelled = true;
    };
  }, [barcode]);

  /*
  |--------------------------------------------------------------------------
  | Load verification
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    let cancelled = false;

    async function loadVerification() {
      if (!product?.id) {
        setVerificationLoading(false);
        return;
      }

      try {
        setVerificationLoading(true);
        setVerificationError(null);

        const result =
          await getProductVerification(
            product.id,
          );

        if (!cancelled) {
          setVerification(result);
        }
      } catch (err) {
        if (cancelled) {
          return;
        }

        if (err instanceof Error) {
          setVerificationError(
            err.message,
          );
        } else {
          setVerificationError(
            "Verification information is unavailable.",
          );
        }
      } finally {
        if (!cancelled) {
          setVerificationLoading(false);
        }
      }
    }

    loadVerification();

    return () => {
      cancelled = true;
    };
  }, [product?.id]);

  /*
  |--------------------------------------------------------------------------
  | Derived values
  |--------------------------------------------------------------------------
  */

  const category = useMemo(() => {
    if (!product?.category) {
      return [];
    }

    return product.category
      .split(">")
      .map((item) => item.trim())
      .filter(Boolean);
  }, [product?.category]);

  const nutrition = useMemo(
    () => getNutrition(product?.nutrition),
    [product?.nutrition],
  );

  /*
  |--------------------------------------------------------------------------
  | Loading state
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 px-4 py-10 text-white">
        <div className="mx-auto max-w-6xl">
          <div className="animate-pulse space-y-6">
            <div className="h-5 w-40 rounded bg-slate-800" />

            <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
              <div className="aspect-square rounded-3xl bg-slate-900" />

              <div className="space-y-5">
                <div className="h-5 w-32 rounded bg-slate-800" />

                <div className="h-10 w-3/4 rounded bg-slate-800" />

                <div className="h-24 rounded-2xl bg-slate-900" />

                <div className="grid grid-cols-2 gap-3">
                  <div className="h-20 rounded-2xl bg-slate-900" />
                  <div className="h-20 rounded-2xl bg-slate-900" />
                  <div className="h-20 rounded-2xl bg-slate-900" />
                  <div className="h-20 rounded-2xl bg-slate-900" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Error state
  |--------------------------------------------------------------------------
  */

  if (error || !product) {
    return (
      <main className="min-h-screen bg-slate-950 px-4 py-10 text-white">
        <div className="mx-auto max-w-2xl">
          <Link
            to="/scan"
            className="text-sm text-cyan-400 hover:text-cyan-300"
          >
            ← Scan another product
          </Link>

          <div className="mt-10 rounded-3xl border border-red-500/20 bg-red-500/5 p-8">
            <div className="text-4xl">
              ⚠️
            </div>

            <h1 className="mt-4 text-2xl font-bold">
              Product unavailable
            </h1>

            <p className="mt-3 text-slate-400">
              {error ??
                "We could not load this product."}
            </p>

            <Link
              to="/scan"
              className="mt-6 inline-flex rounded-xl bg-cyan-400 px-5 py-3 font-semibold text-slate-950 hover:bg-cyan-300"
            >
              Scan another product
            </Link>
          </div>
        </div>
      </main>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Page
  |--------------------------------------------------------------------------
  */

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">

        {/* --------------------------------------------------------------
            Header
        -------------------------------------------------------------- */}

        <div className="mb-8 flex items-center justify-between gap-4">
          <Link
            to="/scan"
            className="text-sm font-medium text-cyan-400 hover:text-cyan-300"
          >
            ← Scan another product
          </Link>

          <span className="hidden rounded-full border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-400 sm:inline-flex">
            ScanIQ
          </span>
        </div>

        {/* --------------------------------------------------------------
            Product hero
        -------------------------------------------------------------- */}

        <section className="grid gap-8 lg:grid-cols-[380px_1fr]">

          {/* Product image */}

          <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900">
            <div className="flex aspect-square items-center justify-center p-6">

              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="h-full w-full object-contain"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="text-6xl">
                    📦
                  </div>

                  <p className="mt-4 text-sm text-slate-500">
                    Product image unavailable
                  </p>
                </div>
              )}

            </div>
          </div>

          {/* Product summary */}

          <div className="flex flex-col justify-center">

            {product.brand && (
              <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-cyan-400">
                {product.brand}
              </p>
            )}

            <h1 className="text-3xl font-bold leading-tight sm:text-4xl">
              {product.name}
            </h1>

            {/* Category */}

            {category.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {category.map(
                  (item, index) => (
                    <span
                      key={`${item}-${index}`}
                      className="rounded-full bg-slate-900 px-3 py-1.5 text-xs text-slate-400"
                    >
                      {item}
                    </span>
                  ),
                )}
              </div>
            )}

            {/* Basic information */}

            <div className="mt-6 grid gap-3 sm:grid-cols-2">

              <InfoCard
                label="Barcode"
                value={product.barcode}
                mono
              />

              <InfoCard
                label="Manufacturer"
                value={
                  product.manufacturer ??
                  "Not available"
                }
              />

              <InfoCard
                label="Country"
                value={
                  product.country ??
                  "Not available"
                }
              />

              <InfoCard
                label="Model number"
                value={
                  product.modelNumber ??
                  "Not available"
                }
              />

            </div>

            {/* Actions */}

            <div className="mt-6 flex flex-wrap gap-3">

              <button
                type="button"
                onClick={() => {
                  alert(
                    "Ask AI will be connected next.",
                  );
                }}
                className="rounded-xl bg-cyan-400 px-5 py-3 text-sm font-bold text-slate-950 hover:bg-cyan-300"
              >
                ✦ Ask AI
              </button>

              <button
                type="button"
                onClick={() => {
                  alert(
                    "Product comparison will be connected next.",
                  );
                }}
                className="rounded-xl border border-slate-700 bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
              >
                ⇄ Compare
              </button>

              <button
                type="button"
                onClick={() =>
                  setFavorite(
                    (current) =>
                      !current,
                  )
                }
                className={`rounded-xl border px-5 py-3 text-sm font-semibold ${
                  favorite
                    ? "border-pink-500/30 bg-pink-500/10 text-pink-400"
                    : "border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800"
                }`}
              >
                {favorite
                  ? "♥ Favorited"
                  : "♡ Favorite"}
              </button>

            </div>
          </div>
        </section>

        {/* --------------------------------------------------------------
            Verification
        -------------------------------------------------------------- */}

        <section className="mt-10">

          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5 sm:p-7">

            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
                  Verification
                </p>

                <h2 className="mt-2 text-2xl font-bold">
                  Product verification
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                  ScanIQ checks available product
                  information across independent
                  sources.
                </p>

                <p className="mt-2 max-w-2xl text-xs leading-5 text-slate-500">
                  Unable to verify does not mean
                  counterfeit. Verification only
                  describes the available data
                  evidence.
                </p>
              </div>

              {verification && (
                <span
                  className={`inline-flex w-fit rounded-full border px-4 py-2 text-sm font-semibold ${getVerificationClasses(
                    verification.status,
                  )}`}
                >
                  {getVerificationLabel(
                    verification.status,
                  )}
                </span>
              )}

            </div>

            {/* Verification loading */}

            {verificationLoading && (
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {Array.from({
                  length: 6,
                }).map((_, index) => (
                  <div
                    key={index}
                    className="h-12 animate-pulse rounded-xl bg-slate-950"
                  />
                ))}
              </div>
            )}

            {/* Verification error */}

            {!verificationLoading &&
              verificationError && (
                <div className="mt-6 rounded-xl border border-slate-800 bg-slate-950 p-4">
                  <p className="text-sm text-slate-400">
                    {verificationError}
                  </p>
                </div>
              )}

            {/* Verification result */}

            {!verificationLoading &&
              !verificationError &&
              verification && (
                <>
                  <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950 p-5">

                    <p className="text-sm leading-6 text-slate-300">
                      {verification.message}
                    </p>

                    <p className="mt-3 text-xs text-slate-500">
                      Sources checked:{" "}
                      {
                        verification.sourceCount
                      }
                    </p>

                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">

                    <VerificationCheckRow
                      label="Barcode"
                      value={
                        verification.checks
                          .barcodeMatch
                      }
                    />

                    <VerificationCheckRow
                      label="Product name"
                      value={
                        verification.checks
                          .nameAgreement
                      }
                    />

                    <VerificationCheckRow
                      label="Brand"
                      value={
                        verification.checks
                          .brandAgreement
                      }
                    />

                    <VerificationCheckRow
                      label="Category"
                      value={
                        verification.checks
                          .categoryAgreement
                      }
                    />

                    <VerificationCheckRow
                      label="Manufacturer"
                      value={
                        verification.checks
                          .manufacturerAgreement
                      }
                    />

                    <VerificationCheckRow
                      label="Country"
                      value={
                        verification.checks
                          .countryAgreement
                      }
                    />

                    <VerificationCheckRow
                      label="Model number"
                      value={
                        verification.checks
                          .modelNumberAgreement
                      }
                    />

                  </div>

                  {/* Verification sources */}

                  {verification.sources.length >
                    0 && (
                    <div className="mt-6">

                      <p className="mb-3 text-sm font-semibold text-slate-300">
                        Verification sources
                      </p>

                      <div className="space-y-2">

                        {verification.sources.map(
                          (
                            source,
                            index,
                          ) => (
                            <div
                              key={`${source.provider}-${index}`}
                              className="flex flex-col justify-between gap-2 rounded-xl border border-slate-800 bg-slate-950/60 p-4 sm:flex-row sm:items-center"
                            >
                              <div className="flex items-center gap-3">

                                <span className="text-sm font-semibold text-slate-200">
                                  {
                                    source.provider
                                  }
                                </span>

                                {source.isPrimary && (
                                  <span className="rounded-full bg-cyan-400/10 px-2.5 py-1 text-[11px] font-semibold text-cyan-400">
                                    Primary
                                  </span>
                                )}

                              </div>

                              {source.sourceUrl && (
                                <a
                                  href={
                                    source.sourceUrl
                                  }
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-xs font-semibold text-cyan-400 hover:text-cyan-300"
                                >
                                  View source →
                                </a>
                              )}

                            </div>
                          ),
                        )}

                      </div>
                    </div>
                  )}
                </>
              )}

          </div>
        </section>

        {/* --------------------------------------------------------------
            Description
        -------------------------------------------------------------- */}

        <section className="mt-8">
          <SectionCard title="Description">

            {product.description ? (
              <p className="text-sm leading-7 text-slate-300">
                {product.description}
              </p>
            ) : (
              <EmptyText />
            )}

          </SectionCard>
        </section>

        {/* --------------------------------------------------------------
            Product attributes
        -------------------------------------------------------------- */}

        {product.attributes &&
          product.attributes.length > 0 && (
            <section className="mt-8">

              <SectionCard title="Product information">

                <div className="grid gap-3 sm:grid-cols-2">

                  {product.attributes.map(
                    (attribute, index) => (
                      <div
                        key={`${attribute.key}-${index}`}
                        className="rounded-xl border border-slate-800 bg-slate-950/60 p-4"
                      >

                        <p className="text-xs uppercase tracking-wider text-slate-500">
                          {formatAttributeKey(
                            attribute.key,
                          )}
                        </p>

                        <p className="mt-2 break-words text-sm font-medium text-slate-200">
                          {attribute.value}
                        </p>

                      </div>
                    ),
                  )}

                </div>

              </SectionCard>
            </section>
          )}

        {/* --------------------------------------------------------------
            Ingredients
        -------------------------------------------------------------- */}

        <section className="mt-8">

          <SectionCard title="Ingredients">

            {product.ingredients &&
            product.ingredients.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2">

                {product.ingredients.map(
                  (ingredient, index) => (
                    <div
                      key={`${ingredient.name}-${index}`}
                      className="rounded-xl border border-slate-800 bg-slate-950/60 p-4"
                    >

                      <p className="text-sm font-semibold text-slate-200">
                        {ingredient.name}
                      </p>

                      {ingredient.description && (
                        <p className="mt-1 text-xs leading-5 text-slate-500">
                          {
                            ingredient.description
                          }
                        </p>
                      )}

                    </div>
                  ),
                )}

              </div>
            ) : (
              <EmptyText />
            )}

          </SectionCard>

        </section>

        {/* --------------------------------------------------------------
            Nutrition
        -------------------------------------------------------------- */}

        <section className="mt-8">

          <SectionCard title="Nutrition">

            {nutrition ? (
              <div>

                {/* Nutrition basis */}

                <div className="mb-5 rounded-2xl border border-slate-800 bg-slate-950 p-4">

                  <p className="text-xs uppercase tracking-wider text-slate-500">
                    Nutrition basis
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-200">
                    {nutrition.unit ??
                      "Not specified"}
                  </p>

                </div>

                {/* Nutrition values */}

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">

                  <NutritionItem
                    label="Calories"
                    value={formatNumber(
                      nutrition.calories,
                    )}
                  />

                  <NutritionItem
                    label="Protein"
                    value={formatNumber(
                      nutrition.protein,
                    )}
                  />

                  <NutritionItem
                    label="Carbohydrates"
                    value={formatNumber(
                      nutrition.carbohydrates,
                    )}
                  />

                  <NutritionItem
                    label="Fat"
                    value={formatNumber(
                      nutrition.fat,
                    )}
                  />

                  <NutritionItem
                    label="Saturated fat"
                    value={formatNumber(
                      nutrition.saturatedFat,
                    )}
                  />

                  <NutritionItem
                    label="Sugars"
                    value={formatNumber(
                      nutrition.sugars,
                    )}
                  />

                  <NutritionItem
                    label="Fiber"
                    value={formatNumber(
                      nutrition.fiber,
                    )}
                  />

                  <NutritionItem
                    label="Salt"
                    value={formatNumber(
                      nutrition.salt,
                    )}
                  />

                  <NutritionItem
                    label="Sodium"
                    value={formatNumber(
                      nutrition.sodium,
                    )}
                  />

                </div>

                {nutrition.source && (
                  <p className="mt-5 text-xs text-slate-500">
                    Source:{" "}
                    {nutrition.source}
                  </p>
                )}

              </div>
            ) : (
              <EmptyText />
            )}

          </SectionCard>

        </section>

        {/* --------------------------------------------------------------
            Prices
        -------------------------------------------------------------- */}

        {product.prices &&
          product.prices.length > 0 && (
            <section className="mt-8">

              <SectionCard title="Prices">

                <div className="space-y-3">

                  {product.prices.map(
                    (price, index) => (
                      <div
                        key={`${price.priceType}-${price.amount}-${index}`}
                        className="flex flex-col justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950/60 p-4 sm:flex-row sm:items-center"
                      >

                        <div>

                          <p className="text-sm font-semibold text-slate-200">
                            {price.merchant ??
                              "Merchant unavailable"}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {price.priceType}
                          </p>

                        </div>

                        <p className="text-lg font-bold text-cyan-400">
                          {formatPrice(
                            price.amount,
                            price.currency,
                          )}
                        </p>

                      </div>
                    ),
                  )}

                </div>

              </SectionCard>

            </section>
          )}

        {/* --------------------------------------------------------------
            Product sources
        -------------------------------------------------------------- */}

        <section className="mt-8 pb-12">

          <SectionCard title="Sources">

            {product.sources &&
            product.sources.length > 0 ? (
              <div className="space-y-3">

                {product.sources.map(
                  (source, index) => (
                    <div
                      key={`${source.provider}-${index}`}
                      className="flex flex-col justify-between gap-4 rounded-xl border border-slate-800 bg-slate-950/60 p-4 sm:flex-row sm:items-center"
                    >

                      <div className="flex flex-wrap items-center gap-2">

                        <p className="text-sm font-semibold text-slate-200">
                          {source.provider}
                        </p>

                        {source.isPrimary && (
                          <span className="rounded-full bg-cyan-400/10 px-2.5 py-1 text-[11px] font-semibold text-cyan-400">
                            Primary source
                          </span>
                        )}

                      </div>

                      {source.sourceUrl ? (
                        <a
                          href={
                            source.sourceUrl
                          }
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm font-semibold text-cyan-400 hover:text-cyan-300"
                        >
                          View source →
                        </a>
                      ) : (
                        <span className="text-xs text-slate-600">
                          Source URL unavailable
                        </span>
                      )}

                    </div>
                  ),
                )}

              </div>
            ) : (
              <EmptyText />
            )}

          </SectionCard>

        </section>

      </div>
    </main>
  );
}

/*
|--------------------------------------------------------------------------
| Reusable components
|--------------------------------------------------------------------------
*/

function InfoCard({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">

      <p className="text-xs uppercase tracking-wider text-slate-500">
        {label}
      </p>

      <p
        className={`mt-2 break-words text-sm font-semibold text-slate-200 ${
          mono
            ? "font-mono tracking-wide"
            : ""
        }`}
      >
        {value}
      </p>

    </div>
  );
}

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5 sm:p-7">

      <h2 className="mb-5 text-xl font-bold text-white">
        {title}
      </h2>

      {children}

    </div>
  );
}

function NutritionItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">

      <p className="text-xs text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-sm font-bold text-slate-200">
        {value}
      </p>

    </div>
  );
}

function EmptyText() {
  return (
    <p className="text-sm text-slate-500">
      Information not available for this product.
    </p>
  );
}

export default ProductDetailsPage;