"use client";

import Link from "next/link";
import { useState } from "react";

import { useAuth } from "@/context/auth-context";
import { useCart } from "@/context/cart-context";
import { useToast } from "@/context/toast-context";
import { ApiError } from "@/lib/api/http";
import type { Listing } from "@/lib/api/types";
import { clampQuantity } from "@/lib/pricing";

type AddToCartButtonProps = {
  listing: Listing;
  full?: boolean;
};

export function AddToCartButton({ listing, full }: AddToCartButtonProps) {
  const { user } = useAuth();
  const { add, inCart } = useCart();
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  const [quantity, setQuantity] = useState(listing.isBulk ? listing.moq || 1 : 1);

  const width = full ? " button--full" : "";

  if (listing.status === "sold") {
    return (
      <button type="button" className={`button button--ghost${width}`} disabled>
        Sold out
      </button>
    );
  }

  if (user && listing.sellerId === user.id) {
    return (
      <button type="button" className={`button button--ghost${width}`} disabled>
        Your listing
      </button>
    );
  }

  // Bulk listings accumulate quantity in the cart, so re-adding is fine and
  // there's always a quantity picker; used single items are one-and-done.
  if (!listing.isBulk && inCart(listing.id)) {
    return (
      <Link href="/cart" className={`button button--ghost${width}`}>
        In cart — view
      </Link>
    );
  }

  const onClick = async () => {
    setBusy(true);
    try {
      await add(listing, listing.isBulk ? quantity : 1);
      toast("Added to cart", "success");
    } catch (err) {
      toast(
        err instanceof ApiError ? err.message : "Could not add to cart",
        "error",
      );
    } finally {
      setBusy(false);
    }
  };

  if (!listing.isBulk) {
    return (
      <button
        type="button"
        className={`button button--primary${width}`}
        onClick={onClick}
        disabled={busy}
      >
        {busy ? "Adding…" : "Add to cart"}
      </button>
    );
  }

  return (
    <div className={`bulk-add${full ? " bulk-add--full" : ""}`}>
      <div className="quantity-stepper" role="group" aria-label="Quantity">
        <button
          type="button"
          onClick={() => setQuantity((q) => clampQuantity(listing, q - 1))}
          disabled={busy || quantity <= (listing.moq || 1)}
        >
          −
        </button>
        <span>{quantity}</span>
        <button
          type="button"
          onClick={() => setQuantity((q) => clampQuantity(listing, q + 1))}
          disabled={busy || (listing.stock != null && quantity >= listing.stock)}
        >
          +
        </button>
      </div>
      <button
        type="button"
        className={`button button--primary${width}`}
        onClick={onClick}
        disabled={busy}
      >
        {busy ? "Adding…" : `Add ${quantity} to cart`}
      </button>
    </div>
  );
}
