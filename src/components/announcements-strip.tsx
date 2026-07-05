"use client";

import { useEffect, useState } from "react";

import { useAuth } from "@/context/auth-context";
import { AnnouncementsApi } from "@/lib/api/endpoints";
import type { Announcement } from "@/lib/api/types";

const DISMISS_KEY = "gh.dismissed-announcements";

function readDismissed(): string[] {
  try {
    return JSON.parse(window.localStorage.getItem(DISMISS_KEY) ?? "[]");
  } catch {
    return [];
  }
}

/**
 * Site-wide strip showing active announcements to signed-in users only.
 * Dismissals stick per announcement (localStorage). Renders nothing for
 * guests, when there is nothing to show, or if the endpoint is missing.
 */
export function AnnouncementsStrip() {
  const { user, ready } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [dismissed, setDismissed] = useState<string[]>([]);

  useEffect(() => {
    if (!ready || !user) {
      setAnnouncements([]);
      return;
    }
    let cancelled = false;
    setDismissed(readDismissed());
    (async () => {
      const res = await AnnouncementsApi.list();
      if (!cancelled && res?.data) setAnnouncements(res.data);
    })();
    return () => {
      cancelled = true;
    };
  }, [ready, user]);

  const dismiss = (id: string) => {
    const next = [...dismissed, id].slice(-50);
    setDismissed(next);
    window.localStorage.setItem(DISMISS_KEY, JSON.stringify(next));
  };

  const visible = announcements.filter((a) => !dismissed.includes(a.id));
  if (!user || visible.length === 0) return null;

  return (
    <div className="container announcement-stack" role="region" aria-label="Announcements">
      {visible.slice(0, 3).map((announcement) => (
        <div
          key={announcement.id}
          className="announcement-strip"
          data-type={announcement.type}
        >
          <div>
            <strong>{announcement.title}</strong>
            <p>{announcement.content}</p>
          </div>
          <button
            type="button"
            aria-label="Dismiss announcement"
            onClick={() => dismiss(announcement.id)}
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
