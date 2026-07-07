"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";

import { AdSlot } from "@/components/ad-slot";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/context/toast-context";
import { ProfileApi } from "@/lib/api/endpoints";
import { ApiError } from "@/lib/api/http";
import type { MeProfile } from "@/lib/api/types";
import { useAuthGuard } from "@/lib/use-auth-guard";

export default function DashboardProfilePage() {
  const { user, ready } = useAuthGuard();
  const { refreshUser } = useAuth();
  const { toast } = useToast();

  const [profile, setProfile] = useState<MeProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const avatarInput = useRef<HTMLInputElement>(null);
  const [avatarBusy, setAvatarBusy] = useState(false);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await ProfileApi.me();
        if (cancelled) return;
        setProfile(res.data);
        setName(res.data.name ?? "");
        setPhone(res.data.profile?.phone ?? res.data.phone ?? "");
        setBio(res.data.profile?.bio ?? "");
        setCity(res.data.profile?.city ?? "");
        setAddress(res.data.profile?.address ?? "");
      } catch {
        /* page shows a friendly error below */
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  if (!ready || !user) {
    return (
      <div className="panel" aria-busy>
        <div className="spinner" />
        <p>Loading your account…</p>
      </div>
    );
  }

  const onSave = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (name.trim() && name.trim() !== profile?.name) {
        await ProfileApi.updateInfo({ name: name.trim() });
      }
      await ProfileApi.update({
        phone: phone.trim() || null,
        bio: bio.trim() || null,
        city: city.trim() || null,
        address: address.trim() || null,
      });
      await refreshUser();
      toast("Profile saved", "success");
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Could not save profile.",
      );
    } finally {
      setBusy(false);
    }
  };

  const onAvatar = async (file: File | undefined) => {
    if (!file) return;
    setAvatarBusy(true);
    try {
      const res = await ProfileApi.uploadAvatar(file);
      setProfile((p) => (p ? { ...p, avatar: res.data.avatar } : p));
      await refreshUser();
      toast("Avatar updated", "success");
    } catch (err) {
      toast(
        err instanceof ApiError ? err.message : "Could not upload avatar",
        "error",
      );
    } finally {
      setAvatarBusy(false);
    }
  };

  return (
    <>
      <section className="panel">
        <div className="cart-line">
          <div className="avatar-circle">
            {profile?.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.avatar} alt={`${user.name}'s avatar`} />
            ) : (
              user.name.charAt(0).toUpperCase()
            )}
          </div>
          <div className="cart-line__body">
            <h1>Hi, {user.name.split(" ")[0]}! 👋</h1>
            <span className="muted-copy">
              {user.email} · {user.userType}
            </span>
          </div>
          <button
            type="button"
            className="button button--ghost button--small"
            onClick={() => avatarInput.current?.click()}
            disabled={avatarBusy}
          >
            {avatarBusy ? "Uploading…" : "Change photo"}
          </button>
          <input
            ref={avatarInput}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => onAvatar(e.target.files?.[0])}
          />
        </div>
      </section>

      <AdSlot placement="account" />

      <form className="panel" onSubmit={onSave}>
        <h3>Profile details</h3>
        {error ? (
          <div className="form-alert form-alert--error">{error}</div>
        ) : null}
        {loading ? (
          <p>Loading…</p>
        ) : (
          <>
            <div className="form-grid">
              <div className="field">
                <label htmlFor="pf-name">Name</label>
                <input
                  id="pf-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="pf-phone">Phone</label>
                <input
                  id="pf-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="pf-city">City</label>
                <input
                  id="pf-city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="pf-address">Address</label>
                <input
                  id="pf-address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
            </div>
            <div className="field">
              <label htmlFor="pf-bio">About you</label>
              <textarea
                id="pf-bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="A line or two about you (optional)"
              />
            </div>
            <button
              type="submit"
              className="button button--primary"
              disabled={busy}
            >
              {busy ? "Saving…" : "Save profile"}
            </button>
          </>
        )}
      </form>

      <div className="cards-grid">
        <article className="feature-card">
          <span className="badge">Orders</span>
          <h3>Track your orders</h3>
          <p>Delivery status, order history, and easy cancellations.</p>
          <Link href="/dashboard/orders" className="button button--ghost button--small">
            View orders
          </Link>
        </article>
        <article className="feature-card">
          <span className="badge badge--mint">Sell &amp; donate</span>
          <h3>My submissions</h3>
          <p>Items you&apos;ve sent for review — approvals, rejections, sales.</p>
          <Link href="/dashboard/submissions" className="button button--ghost button--small">
            View submissions
          </Link>
        </article>
        <article className="feature-card">
          <span className="badge badge--sun">New</span>
          <h3>Advertise with us</h3>
          <p>Reach thousands of school families — right from your account.</p>
          <Link href="/advertise" className="button button--ghost button--small">
            Learn more
          </Link>
        </article>
      </div>
    </>
  );
}
