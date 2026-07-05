import type { ReactNode } from "react";

import { AnnouncementsStrip } from "@/components/announcements-strip";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <>
      <SiteHeader />
      <AnnouncementsStrip />
      <main className="site-main">
        <div className="container">{children}</div>
      </main>
      <SiteFooter />
    </>
  );
}
