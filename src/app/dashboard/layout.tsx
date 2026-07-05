"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const navItems = [
  { href: "/dashboard", label: "Profile" },
  { href: "/dashboard/orders", label: "Orders" },
  { href: "/dashboard/submissions", label: "My submissions" },
  { href: "/favorites", label: "Favorites" },
  { href: "/advertise", label: "Advertise with us" },
];

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="dashboard-layout">
      <nav className="dashboard-nav" aria-label="Account">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            data-active={
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href)
            }
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="section-stack">{children}</div>
    </div>
  );
}
