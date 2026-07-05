"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

import { useAuth } from "@/context/auth-context";

/**
 * Client-side guard for account pages: once the stored session has been
 * checked, bounce guests to /login with a `next` param pointing back here.
 * Returns { user, ready } so pages can render a loading state until then.
 */
export function useAuthGuard() {
  const { user, ready } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (ready && !user) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [ready, user, router, pathname]);

  return { user, ready };
}
