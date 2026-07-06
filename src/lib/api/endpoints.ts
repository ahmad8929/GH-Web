/**
 * Every backend call in the app, grouped by resource.
 * All requests go through the shared `api()` client (token + refresh-on-401).
 */

import { api, type ApiOptions } from "./http";
import { withFeature } from "./capabilities";
import type {
  AdCreative,
  AdPlacement,
  AdPlan,
  AdSubmission,
  AdSubscription,
  Announcement,
  ApiEnvelope,
  AuthResponse,
  AuthUser,
  BlogPost,
  CartData,
  CartItemApi,
  CouponValidation,
  DeliveryAddress,
  FavoriteApi,
  Listing,
  ListingQuery,
  MeProfile,
  NewListingInput,
  NotebookTemplate,
  Order,
  OrderItem,
  Paginated,
  Profile,
  SellbackRequest,
  Theme,
  UserType,
} from "./types";

/* ------------------------------- Auth ---------------------------------- */

export const AuthApi = {
  register(input: {
    name: string;
    email: string;
    phone?: string;
    password: string;
    userType?: UserType;
  }) {
    return api<AuthResponse>("/auth/register", { body: input, auth: false });
  },
  login(email: string, password: string) {
    return api<AuthResponse>("/auth/login", {
      body: { email, password },
      auth: false,
    });
  },
  me() {
    return api<ApiEnvelope<AuthUser>>("/auth/me");
  },
  forgotPassword(email: string) {
    return api<ApiEnvelope<null>>("/auth/forgot-password", {
      body: { email },
      auth: false,
    });
  },
  verifyOtp(email: string, code: string) {
    return api<ApiEnvelope<null> & { resetToken?: string }>(
      "/auth/verify-otp",
      { body: { email, code }, auth: false },
    );
  },
  resetPassword(email: string, code: string, newPassword: string) {
    return api<ApiEnvelope<null>>("/auth/reset-password", {
      body: { email, code, newPassword },
      auth: false,
    });
  },
};

/* ------------------------------ Profile -------------------------------- */

export const ProfileApi = {
  me() {
    return api<ApiEnvelope<MeProfile>>("/profile/me");
  },
  update(input: Partial<Profile>) {
    return api<ApiEnvelope<Profile>>("/profile/me", {
      method: "PUT",
      body: input,
    });
  },
  updateInfo(input: { name?: string; email?: string }) {
    return api<ApiEnvelope<MeProfile>>("/profile/me/info", {
      method: "PATCH",
      body: input,
    });
  },
  uploadAvatar(file: File) {
    const form = new FormData();
    form.append("avatar", file);
    return api<ApiEnvelope<{ avatar: string }>>("/profile/me/avatar", {
      method: "POST",
      form,
    });
  },
  // themeId: null resets to the site default. Validated server-side (active themes only).
  selectTheme(themeId: string | null) {
    return api<ApiEnvelope<Profile>>("/profile/me/theme", {
      method: "PATCH",
      body: { themeId },
    });
  },
};

export const ThemeApi = {
  list() {
    return api<ApiEnvelope<Theme[]>>("/themes", { auth: false });
  },
};

/* ------------------------------ Listings ------------------------------- */

export const ListingsApi = {
  list(query: ListingQuery = {}, opts: Pick<ApiOptions, "next" | "cache"> = {}) {
    return api<Paginated<Listing>>("/listings", {
      query,
      auth: false,
      ...opts,
    });
  },
  byId(id: string, opts: Pick<ApiOptions, "next" | "cache"> = {}) {
    return api<ApiEnvelope<Listing>>(`/listings/${id}`, {
      auth: false,
      ...opts,
    });
  },
  mine(query: { status?: string; page?: number; limit?: number } = {}) {
    return api<Paginated<Listing>>("/listings/mine", { query });
  },
  create(input: NewListingInput) {
    return api<ApiEnvelope<Listing>>("/listings", { body: input });
  },
  update(id: string, input: NewListingInput) {
    return api<ApiEnvelope<Listing>>(`/listings/${id}`, {
      method: "PUT",
      body: input,
    });
  },
  archive(id: string) {
    return api<ApiEnvelope<null>>(`/listings/${id}`, { method: "DELETE" });
  },
  uploadImages(id: string, files: File[]) {
    const form = new FormData();
    files.forEach((file) => form.append("images", file));
    return api<ApiEnvelope<{ images: string[] }>>(`/listings/${id}/images`, {
      method: "POST",
      form,
    });
  },
};

/* -------------------------------- Cart --------------------------------- */

export const CartApi = {
  get() {
    return api<ApiEnvelope<CartData>>("/cart");
  },
  add(listingId: string) {
    return api<ApiEnvelope<CartItemApi>>("/cart", { body: { listingId } });
  },
  removeItem(cartItemId: string) {
    return api<ApiEnvelope<null>>(`/cart/items/${cartItemId}`, {
      method: "DELETE",
    });
  },
  clear() {
    return api<ApiEnvelope<null>>("/cart", { method: "DELETE" });
  },
};

/* ------------------------------- Coupons ------------------------------- */

export const CouponsApi = {
  validate(code: string) {
    return api<ApiEnvelope<CouponValidation>>("/coupons/validate", {
      body: { code },
    });
  },
};

/* -------------------------------- Orders ------------------------------- */

export const OrdersApi = {
  checkout(input: {
    couponCode?: string;
    deliveryAddress: DeliveryAddress;
    deliveryNote?: string;
    paymentMethod: string;
  }) {
    return api<ApiEnvelope<Order>>("/orders/checkout", { body: input });
  },
  mine(query: { page?: number; limit?: number } = {}) {
    return api<Paginated<Order>>("/orders/mine", { query });
  },
  byId(id: string) {
    return api<ApiEnvelope<Order>>(`/orders/${id}`);
  },
  cancelItem(orderItemId: string, reason?: string) {
    return api<ApiEnvelope<OrderItem>>(`/orders/items/${orderItemId}/cancel`, {
      method: "POST",
      body: { reason },
    });
  },
};

/* ------------------------------ Favorites ------------------------------ */

export const FavoritesApi = {
  list(query: { page?: number; limit?: number } = {}) {
    return api<Paginated<FavoriteApi>>("/favorites", { query });
  },
  toggle(listingId: string) {
    return api<ApiEnvelope<{ favorited: boolean }>>("/favorites", {
      body: { listingId },
    });
  },
};

/* -------------------------- Sell / Donate intake ----------------------- */
/* A user submits an item to SELL (wants money) or DONATE (wants nothing).
   We pick it up, inspect it, then list it as our own first-party inventory —
   the submitter is never shown as a seller. */

export const SellbackApi = {
  // multipart: kind, title, description, condition, categoryId, expectedPrice,
  // contactName, contactPhone, pickupAddress, city, pincode + image files.
  submit(form: FormData) {
    return api<ApiEnvelope<SellbackRequest>>("/sellback", {
      method: "POST",
      form,
    });
  },
  mine(query: { status?: string; page?: number; limit?: number } = {}) {
    return api<Paginated<SellbackRequest>>("/sellback/mine", { query });
  },
  cancel(id: string) {
    return api<ApiEnvelope<SellbackRequest>>(`/sellback/${id}/cancel`, {
      method: "POST",
    });
  },
};

/* ---------------------------- Announcements ----------------------------- */
/* Messages from the Gyan Hub team shown to signed-in users only. */

export const AnnouncementsApi = {
  list() {
    return withFeature("announcements", () =>
      api<ApiEnvelope<Announcement[]>>("/announcements"),
    );
  },
};

/* --------------- Contract-first features (capability-gated) ------------ */
/* These endpoints do not exist on the backend yet. Every call runs behind
   a capability flag and resolves to null instead of throwing, so pages can
   show clean loading -> empty -> "coming soon" states. */

export const BlogsApi = {
  list(page = 1) {
    return withFeature("blogs", () =>
      api<Paginated<BlogPost>>("/blogs", { query: { page }, auth: false }),
    );
  },
  bySlug(slug: string) {
    return withFeature("blogs", () =>
      api<ApiEnvelope<BlogPost>>(`/blogs/${slug}`, { auth: false }),
    );
  },
};

export const AdsApi = {
  serve(placement: AdPlacement) {
    return withFeature("ads", () =>
      api<ApiEnvelope<{ ads: AdCreative[] }> | { ads: AdCreative[] }>(
        "/ads/serve",
        { query: { placement }, auth: false },
      ),
    );
  },
  impression(adId: string) {
    return withFeature("ads", () =>
      api<ApiEnvelope<null>>(`/ads/${adId}/impression`, {
        method: "POST",
        auth: false,
      }),
    );
  },
  click(adId: string) {
    return withFeature("ads", () =>
      api<ApiEnvelope<null>>(`/ads/${adId}/click`, {
        method: "POST",
        auth: false,
      }),
    );
  },
  createCreative(form: FormData) {
    return withFeature("ads", () =>
      api<ApiEnvelope<AdCreative>>("/ads", { method: "POST", form }),
    );
  },
};

export const NotebooksApi = {
  templates() {
    return withFeature("notebooks", () =>
      api<ApiEnvelope<NotebookTemplate[]>>("/custom-notebooks/templates", {
        auth: false,
      }),
    );
  },
};

export const AdvertiseApi = {
  plans() {
    return withFeature("adPlans", () =>
      api<ApiEnvelope<AdPlan[]>>("/ad-plans", { auth: false }),
    );
  },
  optIn() {
    return withFeature("advertiser", () =>
      api<ApiEnvelope<Profile>>("/profile/me", {
        method: "PATCH",
        body: { isAdvertiser: true },
      }),
    );
  },
  subscribe(planId: string) {
    return withFeature("adPlans", () =>
      api<ApiEnvelope<{ id: string }>>("/ad-subscriptions", {
        body: { planId },
      }),
    );
  },
  mySubscriptions() {
    return withFeature("adPlans", () =>
      api<ApiEnvelope<AdSubscription[]>>("/ad-subscriptions/mine"),
    );
  },
  // multipart: subscriptionId, businessName, title, description, targetUrl,
  // placement, contactPhone, contactEmail + image file.
  createAd(form: FormData) {
    return withFeature("ads", () =>
      api<ApiEnvelope<AdSubmission>>("/ads", { form }),
    );
  },
  myAds() {
    return withFeature("ads", () => api<ApiEnvelope<AdSubmission[]>>("/ads/mine"));
  },
};
