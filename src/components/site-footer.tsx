import Link from "next/link";

const footerColumns = [
  {
    title: "Shop",
    links: [
      { href: "/marketplace", label: "All items" },
      { href: "/textbooks", label: "Old books" },
      { href: "/uniforms", label: "Uniforms" },
      { href: "/stationery", label: "Stationery" },
      { href: "/custom-notebook", label: "Custom notebook" },
    ],
  },
  {
    title: "Community",
    links: [
      { href: "/sell", label: "Sell your items" },
      { href: "/donate", label: "Donate" },
      { href: "/schools", label: "Schools" },
      { href: "/blogs", label: "Blog" },
      { href: "/advertise", label: "Advertise with us" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About us" },
      { href: "/contact", label: "Contact us" },
      { href: "/privacy-policy", label: "Privacy policy" },
      { href: "/terms-and-conditions", label: "Terms and conditions" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container site-footer__grid">
        <div className="footer-intro">
          <div className="brand-mark brand-mark--footer">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-mark.png" alt="" aria-hidden />
            <strong>Gyan Hub</strong>
          </div>
          <p>The friendly school store — buy, reuse, donate.</p>
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
