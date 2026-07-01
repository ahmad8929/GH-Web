import Link from "next/link";

import { navLinks } from "@/data/marketplace";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <Link href="/" className="brand-mark">
          <span>G</span>
          <strong>Gyan Hub</strong>
        </Link>

        <nav className="site-nav" aria-label="Primary navigation">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="site-header__actions">
          <Link href="/cart" className="button button--ghost">
            Cart
          </Link>
          <Link href="/signup" className="button button--primary">
            Join
          </Link>
        </div>
      </div>
    </header>
  );
}
