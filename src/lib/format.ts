import type { Condition, ListingType, OrderItemStatus } from "@/lib/api/types";

export function inr(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === "") return "Free";
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "—";
  if (amount === 0) return "Free";
  return `₹${amount.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export const CONDITION_LABELS: Record<Condition, string> = {
  new: "Brand new",
  like_new: "Like new",
  good: "Good",
  fair: "Fair",
  poor: "Well loved",
};

export const LISTING_TYPE_LABELS: Record<ListingType, string> = {
  sale: "For sale",
  exchange: "Exchange",
  donate: "Free",
};

export const ORDER_ITEM_STATUS_LABELS: Record<OrderItemStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  packed: "Packed",
  assigned: "Assigned",
  in_transit: "On the way",
  delivered: "Delivered",
  cancelled: "Cancelled",
  returned: "Returned",
};

export const CANCELLABLE_STATUSES: OrderItemStatus[] = [
  "pending",
  "confirmed",
  "packed",
];
