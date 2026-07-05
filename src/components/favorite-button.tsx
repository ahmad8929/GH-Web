"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import { useAuth } from "@/context/auth-context";
import { useFavorites } from "@/context/favorites-context";
import { useToast } from "@/context/toast-context";
import { ApiError } from "@/lib/api/http";

type FavoriteButtonProps = {
  listingId: string;
  className?: string;
};

export function FavoriteButton({ listingId, className }: FavoriteButtonProps) {
  const { ready } = useAuth();
  const { isFavorite, toggle } = useFavorites();
  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const [busy, setBusy] = useState(false);

  const active = isFavorite(listingId);

  const onClick = async () => {
    if (busy || !ready) return;
    setBusy(true);
    try {
      const result = await toggle(listingId);
      if (result === "auth-required") {
        toast("Log in to save favorites", "info");
        router.push(`/login?next=${encodeURIComponent(pathname)}`);
      } else {
        toast(
          result === "added" ? "Saved to favorites" : "Removed from favorites",
          "success",
        );
      }
    } catch (err) {
      toast(
        err instanceof ApiError ? err.message : "Could not update favorites",
        "error",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      className={className ?? "product-card__fav"}
      data-active={active}
      aria-label={active ? "Remove from favorites" : "Save to favorites"}
      aria-pressed={active}
      onClick={onClick}
      disabled={busy}
    >
      {active ? "♥" : "♡"}
    </button>
  );
}
