"use client";

import { useEffect, useRef, useState } from "react";

import { AdsApi } from "@/lib/api/endpoints";
import type { AdCreative, AdPlacement } from "@/lib/api/types";

/**
 * Contract-first ad slot. Renders nothing until the ads endpoints exist —
 * once `/ads/serve` ships, creatives appear here automatically and
 * impressions/clicks are reported.
 */
export function AdSlot({ placement }: { placement: AdPlacement }) {
  const [ads, setAds] = useState<AdCreative[]>([]);
  const reported = useRef<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await AdsApi.serve(placement);
      if (cancelled || !res) return;
      const list =
        "ads" in res ? res.ads : (res.data?.ads ?? []);
      setAds(Array.isArray(list) ? list.slice(0, 3) : []);
    })();
    return () => {
      cancelled = true;
    };
  }, [placement]);

  useEffect(() => {
    for (const ad of ads) {
      if (!reported.current.has(ad.id)) {
        reported.current.add(ad.id);
        void AdsApi.impression(ad.id);
      }
    }
  }, [ads]);

  if (!ads.length) return null;

  return (
    <div className="ad-slot">
      <span className="ad-slot__label">Sponsored</span>
      {ads.map((ad) => (
        <a
          key={ad.id}
          href={ad.targetUrl}
          target="_blank"
          rel="noopener noreferrer sponsored"
          onClick={() => void AdsApi.click(ad.id)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={ad.image} alt="Advertisement" />
        </a>
      ))}
    </div>
  );
}
