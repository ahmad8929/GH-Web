"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { useAuth } from "@/context/auth-context";
import { useCart } from "@/context/cart-context";

const navLinks = [
  { href: "/marketplace", label: "Shop all" },
  { href: "/textbooks", label: "Old Books" },
  { href: "/marketplace?cat=new-books", label: "New Books" },
  { href: "/uniforms", label: "Uniforms" },
  { href: "/stationery", label: "Stationery" },
  { href: "/custom-notebook", label: "Custom Notebook" },
  { href: "/blogs", label: "Blog" },
  { href: "/sell", label: "Sell" },
  { href: "/donate", label: "Donate" },
];

export function SiteHeader() {
  const { user, ready, logout } = useAuth();
  const { count } = useCart();
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close the account menu on outside click.
  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [menuOpen]);

  const onLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <Link href="/" className="brand-mark">
          <span aria-hidden>G</span>
          <strong>Gyan Hub</strong>
        </Link>

        <nav className="site-nav" aria-label="Primary navigation">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={
                pathname === link.href.split("?")[0] &&
                !link.href.includes("?")
                  ? "page"
                  : undefined
              }
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="site-header__actions">
          <Link href="/favorites" className="header-icon-link" aria-label="Favorites">
            ♥
          </Link>
          <Link href="/cart" className="header-icon-link">
            Cart
            {count > 0 ? <span className="cart-count">{count}</span> : null}
          </Link>

          {!ready ? null : user ? (
            <div className="account-menu" ref={menuRef}>
              <button
                type="button"
                className="button button--ghost"
                aria-expanded={menuOpen}
                aria-haspopup="menu"
                onClick={() => setMenuOpen((open) => !open)}
              >
                Hi, {user.name.split(" ")[0]} ▾
              </button>
              {menuOpen ? (
                <div
                  className="account-menu__panel"
                  role="menu"
                  onClick={() => setMenuOpen(false)}
                >
                  <span className="account-menu__label">{user.email}</span>
                  <Link href="/dashboard" role="menuitem">
                    My account
                  </Link>
                  <Link href="/dashboard/orders" role="menuitem">
                    Orders
                  </Link>
                  <Link href="/dashboard/submissions" role="menuitem">
                    My submissions
                  </Link>
                  <Link href="/favorites" role="menuitem">
                    Favorites
                  </Link>
                  <Link href="/advertise" role="menuitem">
                    Advertise with us
                  </Link>
                  <button type="button" role="menuitem" onClick={onLogout}>
                    Log out
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            <>
              <Link href="/login" className="button button--ghost">
                Login
              </Link>
              <Link href="/signup" className="button button--primary">
                Join
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
