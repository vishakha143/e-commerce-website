import type { ProductListParams } from "@/types/product";

export type RawSearchParams = Record<string, string | string[] | undefined>;

export function parseProductListParams(
  sp: RawSearchParams,
  overrides: Partial<ProductListParams> = {},
): ProductListParams {
  const get = (key: string) => {
    const value = sp[key];
    return Array.isArray(value) ? value[0] : value;
  };

  return {
    search: get("search"),
    category: get("category"),
    subcategory: get("subcategory"),
    size: get("size"),
    color: get("color"),
    brand: get("brand"),
    minPrice: get("minPrice") ? Number(get("minPrice")) : undefined,
    maxPrice: get("maxPrice") ? Number(get("maxPrice")) : undefined,
    isNew: get("isNew") === "true" ? true : undefined,
    sale: get("sale") === "true" ? true : undefined,
    inStock: get("inStock") === "true" ? true : undefined,
    sort: get("sort") as ProductListParams["sort"],
    page: get("page") ? Number(get("page")) : undefined,
    limit: 12,
    ...overrides,
  };
}
