/**
 * Listings have no slug column, so listing URLs are `/listing/<title>-<uuid>`
 * — readable for SEO while the trailing UUID is what we actually query by.
 */

const UUID_RE =
  /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export function listingPath(listing: { id: string; title: string }): string {
  const slug = slugify(listing.title);
  return `/listing/${slug ? `${slug}-` : ""}${listing.id}`;
}

export function listingIdFromSlug(slug: string): string {
  const match = decodeURIComponent(slug).match(UUID_RE);
  return match ? match[0] : slug;
}
