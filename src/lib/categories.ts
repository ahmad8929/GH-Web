import { ListingsApi } from "@/lib/api/endpoints";
import { safe } from "@/lib/api/http";
import type { CategoryRef, ListingQuery } from "@/lib/api/types";

/**
 * The shop's fixed category set. Categories are admin-managed and there is no
 * public categories endpoint, so we resolve each shop category to a real
 * `categoryId` by scanning the category refs embedded in approved listings.
 */

export type ShopCategory = {
  slug: string;
  label: string;
  blurb: string;
  tone: "books" | "uniforms" | "stationery" | "notebook" | "devices";
  href: string;
  emoji: string;
  /** lowercase fragments matched against real category slug/name */
  hints: string[];
};

export const SHOP_CATEGORIES: ShopCategory[] = [
  {
    slug: "old-books",
    label: "Old Books",
    blurb: "Pre-loved textbooks and readers, checked and priced to save.",
    tone: "books",
    href: "/textbooks",
    emoji: "📚",
    hints: ["old-book", "old book", "used book", "second"],
  },
  {
    slug: "new-books",
    label: "New Books",
    blurb: "Brand-new titles for every class and board.",
    tone: "devices",
    href: "/marketplace?cat=new-books",
    emoji: "📖",
    hints: ["new-book", "new book"],
  },
  {
    slug: "uniforms",
    label: "Uniforms",
    blurb: "School-approved sets, sized and ready for the term.",
    tone: "uniforms",
    href: "/uniforms",
    emoji: "👕",
    hints: ["uniform"],
  },
  {
    slug: "stationery",
    label: "Stationery",
    blurb: "Pens, kits, files, and everything for the pencil case.",
    tone: "stationery",
    href: "/stationery",
    emoji: "✏️",
    hints: ["stationery", "stationary"],
  },
  {
    slug: "custom-notebooks",
    label: "Custom Notebook",
    blurb: "Design your own notebook — cover, ruling, and name on front.",
    tone: "notebook",
    href: "/custom-notebook",
    emoji: "📒",
    hints: ["custom", "notebook"],
  },
];

/**
 * Server-side: derive the real category list from listings (cached 5 min).
 * Returns [] when the backend is unreachable — callers must degrade.
 */
export async function getCategoryOptions(): Promise<CategoryRef[]> {
  const res = await safe(
    ListingsApi.list({ limit: 100 }, { next: { revalidate: 300 } }),
  );
  if (!res) return [];
  const map = new Map<string, CategoryRef>();
  for (const listing of res.data) {
    if (listing.category) map.set(listing.category.id, listing.category);
  }
  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export function matchCategory(
  options: CategoryRef[],
  shopSlug: string,
): CategoryRef | undefined {
  const shop = SHOP_CATEGORIES.find((c) => c.slug === shopSlug);
  if (!shop) return undefined;
  return options.find((option) => {
    const haystack = `${option.slug ?? ""} ${option.name}`.toLowerCase();
    return (
      haystack.includes(shop.slug) ||
      shop.hints.some((hint) => haystack.includes(hint))
    );
  });
}

/** Base listing query for a shop category (category id and/or condition). */
export function shopCategoryQuery(
  options: CategoryRef[],
  shopSlug: string,
): Partial<ListingQuery> {
  const matched = matchCategory(options, shopSlug);
  return matched ? { categoryId: matched.id } : {};
}
