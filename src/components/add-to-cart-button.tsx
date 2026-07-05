"use client";

import Link from "next/link";
import { useState } from "react";

import { useAuth } from "@/context/auth-context";
import { useCart } from "@/context/cart-context";
import { useToast } from "@/context/toast-context";
import { ApiError } from "@/lib/api/http";
import type { Listing } from "@/lib/api/types";

type AddToCartButtonProps = {
  listing: Listing;
  full?: boolean;
};

export function AddToCartButton({ listing, full }: AddToCartButtonProps) {
  const { user } = useAuth();
  const { add, inCart } = useCart();
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);

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

  if (inCart(listing.id)) {
    return (
      <Link href="/cart" className={`button button--ghost${width}`}>
        In cart — view
      </Link>
    );
  }

  const onClick = async () => {
    setBusy(true);
    try {
      await add(listing);
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
