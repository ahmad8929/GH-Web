import Link from "next/link";

import { footerColumns } from "@/data/marketplace";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container site-footer__grid">
        <div className="footer-intro">
          <div className="brand-mark brand-mark--footer">
            <span>G</span>
            <strong>Gyan Hub</strong>
          </div>
          <p>Buy, reuse, donate.</p>
        </div>

        {footerColumns.map((column) => (
          <div key={column.title}>
            <h3>{column.title}</h3>
            <ul className="footer-links">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </footer>
  );
}
