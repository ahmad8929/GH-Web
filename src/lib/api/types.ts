/** Shared API types mirroring the GH-Backend Express + Sequelize models. */

export type ApiEnvelope<T> = {
  success: boolean;
  message?: string;
  data: T;
};

export type Pagination = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
};

export type Paginated<T> = {
  success: boolean;
  data: T[];
  pagination: Pagination;
};

export type Condition = "new" | "like_new" | "good" | "fair" | "poor";
export type ListingType = "sale" | "exchange" | "donate";
export type ListingStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "sold"
  | "archived";

export type SellerRef = { id: string; name: string; avatar: string | null };
export type CategoryRef = { id: string; name: string; slug?: string };
export type SchoolRef = { id: string; name: string };

export type Listing = {
  id: string;
  sellerId: string;
  title: string;
  description: string | null;
  price: string | null;
  originalPrice: string | null;
  condition: Condition;
  listingType: ListingType;
  status: ListingStatus;
  categoryId: string | null;
  schoolId: string | null;
  grade: string | null;
  subject: string | null;
  images: string[];
  city: string | null;
  pincode: string | null;
  isFeatured: boolean;
  viewCount: number;
  rejectionReason?: string | null;
  createdAt: string;
  updatedAt: string;
  seller?: SellerRef | null;
  category?: CategoryRef | null;
  school?: SchoolRef | null;
};

export type ListingQuery = {
  search?: string;
  categoryId?: string;
  schoolId?: string;
  listingType?: ListingType;
  condition?: Condition;
  city?: string;
  minPrice?: number | string;
  maxPrice?: number | string;
  sort?: "newest" | "price_asc" | "price_desc" | "featured";
  page?: number;
  limit?: number;
};

export type NewListingInput = {
  title: string;
  description?: string;
  price?: number | string;
  originalPrice?: number | string;
  condition?: Condition;
  listingType?: ListingType;
  categoryId?: string;
  schoolId?: string;
  grade?: string;
  subject?: string;
  city?: string;
  pincode?: string;
};

export type UserType = "student" | "parent" | "school" | "tuition";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  userType: string;
  avatar?: string | null;
};

export type AuthResponse = {
  success: boolean;
  message?: string;
  accessToken: string;
  refreshToken: string;
  data: AuthUser;
};

export type Theme = {
  id: string;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  headingColor: string;
  buttonBackground: string;
  buttonText: string;
  borderColor: string;
  navbarColor: string;
  footerColor: string;
  isActive: boolean;
};

export type Profile = {
  id: string;
  userId: string;
  bio: string | null;
  avatar: string | null;
  phone: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  website: string | null;
  socialLinks: Record<string, string> | null;
  expertise: string[];
  theme?: Theme | null;
};

export type MeProfile = AuthUser & {
  phone: string | null;
  createdAt: string;
  profile: Profile | null;
};

export type CartItemApi = {
  id: string;
  userId: string;
  listingId: string;
  createdAt: string;
  listing: Listing;
};

export type CartData = {
  items: CartItemApi[];
  itemCount: number;
  subtotal: number;
};

export type CouponValidation = {
  code: string;
  subtotal: number;
  discountAmount: number;
  finalAmount: number;
  items: Array<{
    listingId: string;
    price: number;
    discountAmount: number;
    finalAmount: number;
  }>;
};

export type OrderItemStatus =
  | "pending"
  | "confirmed"
  | "packed"
  | "assigned"
  | "in_transit"
  | "delivered"
  | "cancelled"
  | "returned";

export type OrderItem = {
  id: string;
  orderId: string;
  listingId: string;
  sellerId: string;
  price: string;
  discountAmount: string;
  finalAmount: string;
  status: OrderItemStatus;
  cancelledAt: string | null;
  cancelReason: string | null;
  createdAt: string;
  listing?: { id: string; title: string; images: string[] } | null;
  seller?: SellerRef | null;
};

export type DeliveryAddress = {
  name: string;
  phone: string;
  line1: string;
  city: string;
  pincode: string;
};

export type Order = {
  id: string;
  orderNumber: string;
  buyerId: string;
  couponId: string | null;
  subtotal: string;
  discountAmount: string;
  finalAmount: string;
  paymentStatus: "unpaid" | "paid" | "refunded";
  paymentMethod: string | null;
  deliveryAddress: DeliveryAddress | null;
  deliveryNote: string | null;
  createdAt: string;
  items?: OrderItem[];
};

export type FavoriteApi = {
  id: string;
  userId: string;
  listingId: string;
  createdAt: string;
  listing: Listing;
};

/* ------------------------ Sell / Donate intake ------------------------ */

export type SellbackKind = "sell" | "donate";
export type SellbackStatus =
  | "pending"
  | "approved"
  | "pickup_scheduled"
  | "collected"
  | "listed"
  | "completed"
  | "rejected"
  | "cancelled";

export type SellbackRequest = {
  id: string;
  userId: string;
  kind: SellbackKind;
  title: string;
  description: string | null;
  condition: Condition;
  categoryId: string | null;
  images: string[];
  expectedPrice: string | null;
  contactName: string | null;
  contactPhone: string | null;
  pickupAddress: string | null;
  city: string | null;
  pincode: string | null;
  status: SellbackStatus;
  pickupScheduledAt: string | null;
  collectedAt: string | null;
  agreedPrice: string | null;
  payoutStatus: "not_applicable" | "pending" | "paid";
  resultListingId: string | null;
  adminNote: string | null;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
  category?: CategoryRef | null;
  resultListing?: {
    id: string;
    title: string;
    price: string | null;
    status: ListingStatus;
  } | null;
};

export type Announcement = {
  id: string;
  title: string;
  content: string;
  type: "info" | "warning" | "success" | "maintenance";
  targetRole: string;
  startsAt: string | null;
  endsAt: string | null;
  createdAt: string;
};

/* ---- Contract-first types (backend endpoints not shipped yet) ---- */

export type BlogPost = {
  slug: string;
  title: string;
  cover: string | null;
  excerpt: string;
  contentHtml: string;
  author: string;
  publishedAt: string;
};

export type AdCreative = {
  id: string;
  image: string;
  targetUrl: string;
};

export type AdPlacement = "home_top" | "home_mid" | "sidebar";

export type NotebookTemplate = {
  id: string;
  name: string;
  description?: string;
  basePrice: number;
  cover?: string | null;
};

export type NotebookConfig = {
  templateId: string;
  coverColor: string;
  pages: number;
  ruling: "ruled" | "plain" | "grid" | "dotted";
  binding: "spiral" | "stitched" | "hardbound";
  nameOnCover: string;
};

export type AdPlan = {
  id: string;
  name: string;
  price: number;
  durationDays: number;
  description?: string;
};

export type AdSubmissionStatus = "pending" | "approved" | "rejected";

export type AdSubmission = {
  id: string;
  businessName: string | null;
  title: string;
  description: string | null;
  image: string;
  link: string | null;
  position: AdPlacement;
  contactPhone: string | null;
  contactEmail: string | null;
  status: AdSubmissionStatus;
  rejectionReason: string | null;
  subscriptionId: string;
  createdAt: string;
};

export type AdSubscriptionStatus = "pending" | "active" | "cancelled" | "expired";

export type AdSubscription = {
  id: string;
  planId: string;
  status: AdSubscriptionStatus;
  amountPaid: number | null;
  startsAt: string | null;
  endsAt: string | null;
  createdAt: string;
  plan?: AdPlan;
  ad?: {
    id: string;
    title: string;
    businessName: string | null;
    description: string | null;
    image: string;
    link: string | null;
    position: AdPlacement;
    contactPhone: string | null;
    contactEmail: string | null;
    status: AdSubmissionStatus;
    rejectionReason: string | null;
    createdAt: string;
  } | null;
};
