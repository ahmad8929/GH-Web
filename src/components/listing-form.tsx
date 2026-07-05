"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";

import { useToast } from "@/context/toast-context";
import { SellbackApi } from "@/lib/api/endpoints";
import { ApiError } from "@/lib/api/http";
import type { CategoryRef, Condition, ListingType } from "@/lib/api/types";
import { CONDITION_LABELS } from "@/lib/format";
import { useAuthGuard } from "@/lib/use-auth-guard";

const MAX_IMAGES = 6;

type ListingFormProps = {
  /** "sale" => user wants money (kind=sell); "donate" => wants nothing (kind=donate) */
  listingType: Extract<ListingType, "sale" | "donate">;
  /** preselect the matching category by name fragment, e.g. "book" */
  categoryHint?: string;
  categoryOptions: CategoryRef[];
  heading: string;
  intro: string;
};

/**
 * The admin-mediated sell/donate intake. A submission is NOT a listing — it is a
 * pickup request (`POST /sellback`). We collect the item, inspect it, then list it
 * as our own first-party inventory. The submitter is never shown as a seller.
 */
export function ListingForm({
  listingType,
  categoryHint,
  categoryOptions,
  heading,
  intro,
}: ListingFormProps) {
  const { user, ready } = useAuthGuard();
  const { toast } = useToast();
  const isSell = listingType === "sale";

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState(() => {
    if (!categoryHint) return "";
    const match = categoryOptions.find((option) =>
      `${option.slug ?? ""} ${option.name}`
        .toLowerCase()
        .includes(categoryHint.toLowerCase()),
    );
    return match?.id ?? "";
  });
  const [condition, setCondition] = useState<Condition>("good");
  const [expectedPrice, setExpectedPrice] = useState("");
  const [contactName, setContactName] = useState(user?.name ?? "");
  const [contactPhone, setContactPhone] = useState("");
  const [pickupAddress, setPickupAddress] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  if (!ready || !user) {
    return (
      <div className="panel" aria-busy>
        <div className="spinner" />
        <p>Checking your account…</p>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="empty-state">
        <span className="empty-state__emoji" aria-hidden>
          🎉
        </span>
        <h3>Request received!</h3>
        <p>
          Our team will review your item and arrange a pickup from your address.
          {isSell
            ? " Once we've collected and checked it, we'll confirm your payout."
            : " Thanks for donating — we'll take it from here."}{" "}
          Track the status any time in your submissions.
        </p>
        <div className="button-row">
          <Link href="/dashboard/submissions" className="button button--primary">
            View my submissions
          </Link>
          <button
            type="button"
            className="button button--ghost"
            onClick={() => {
              setSubmitted(false);
              setTitle("");
              setDescription("");
              setExpectedPrice("");
              setFiles([]);
            }}
          >
            Submit another item
          </button>
        </div>
      </div>
    );
  }

  const onFiles = (list: FileList | null) => {
    setFiles(Array.from(list ?? []).slice(0, MAX_IMAGES));
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!title.trim()) {
      setError("Please give your item a title.");
      return;
    }
    if (isSell && (!expectedPrice || Number(expectedPrice) <= 0)) {
      setError("Please tell us how much you'd like for it.");
      return;
    }
    if (!contactPhone.trim() || !pickupAddress.trim() || !city.trim()) {
      setError("We need a contact phone and pickup address to collect the item.");
      return;
    }

    setBusy(true);
    try {
      const form = new FormData();
      form.append("kind", isSell ? "sell" : "donate");
      form.append("title", title.trim());
      if (description.trim()) form.append("description", description.trim());
      form.append("condition", condition);
      if (categoryId) form.append("categoryId", categoryId);
      if (isSell && expectedPrice) form.append("expectedPrice", expectedPrice);
      if (contactName.trim()) form.append("contactName", contactName.trim());
      form.append("contactPhone", contactPhone.trim());
      form.append("pickupAddress", pickupAddress.trim());
      form.append("city", city.trim());
      if (pincode.trim()) form.append("pincode", pincode.trim());
      files.forEach((file) => form.append("images", file));

      await SellbackApi.submit(form);
      setSubmitted(true);
      toast("Thanks! We'll review your item and arrange a pickup.", "success");
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Could not submit right now. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="panel" onSubmit={onSubmit}>
      <div className="section-heading">
        <span className="eyebrow">{isSell ? "Sell to Gyan Hub" : "Donate"}</span>
        <h2>{heading}</h2>
        <p>{intro}</p>
      </div>

      {error ? <div className="form-alert form-alert--error">{error}</div> : null}

      <div className="form-grid">
        <div className="field">
          <label htmlFor="lf-title">Item title *</label>
          <input
            id="lf-title"
            value={title}
            maxLength={120}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. NCERT Science Class 8"
            required
          />
        </div>

        {categoryOptions.length ? (
          <div className="field">
            <label htmlFor="lf-category">Category</label>
            <select
              id="lf-category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              <option value="">Choose…</option>
              {categoryOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        <div className="field">
          <label htmlFor="lf-condition">Condition</label>
          <select
            id="lf-condition"
            value={condition}
            onChange={(e) => setCondition(e.target.value as Condition)}
          >
            {Object.entries(CONDITION_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {isSell ? (
          <div className="field">
            <label htmlFor="lf-price">How much would you like? (₹) *</label>
            <input
              id="lf-price"
              type="number"
              min={1}
              value={expectedPrice}
              onChange={(e) => setExpectedPrice(e.target.value)}
              placeholder="250"
              required
            />
            <span className="filter-text">
              We&apos;ll confirm the final amount after we inspect it.
            </span>
          </div>
        ) : null}
      </div>

      <div className="field">
        <label htmlFor="lf-description">Tell us about it</label>
        <textarea
          id="lf-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Edition, class/subject or size, missing pages, wear and tear — anything worth noting."
        />
      </div>

      <div className="section-heading">
        <span className="eyebrow">Pickup details</span>
        <p>We collect the item from you — where should we come?</p>
      </div>

      <div className="form-grid">
        <div className="field">
          <label htmlFor="lf-contact-name">Contact name</label>
          <input
            id="lf-contact-name"
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            placeholder="Your name"
          />
        </div>
        <div className="field">
          <label htmlFor="lf-contact-phone">Contact phone *</label>
          <input
            id="lf-contact-phone"
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
            placeholder="10-digit mobile"
            required
          />
        </div>
        <div className="field">
          <label htmlFor="lf-city">City *</label>
          <input
            id="lf-city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="e.g. Pune"
            required
          />
        </div>
        <div className="field">
          <label htmlFor="lf-pincode">Pincode</label>
          <input
            id="lf-pincode"
            value={pincode}
            onChange={(e) => setPincode(e.target.value)}
            placeholder="e.g. 411001"
          />
        </div>
      </div>

      <div className="field">
        <label htmlFor="lf-address">Pickup address *</label>
        <textarea
          id="lf-address"
          value={pickupAddress}
          onChange={(e) => setPickupAddress(e.target.value)}
          placeholder="Flat / house no., street, landmark, area"
          required
        />
      </div>

      <div className="field">
        <label htmlFor="lf-images">Photos (up to {MAX_IMAGES})</label>
        <input
          id="lf-images"
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => onFiles(e.target.files)}
        />
        {files.length ? (
          <span className="filter-text">
            {files.length} photo{files.length === 1 ? "" : "s"} selected
          </span>
        ) : null}
      </div>

      <button type="submit" className="button button--primary" disabled={busy}>
        {busy
          ? "Submitting…"
          : isSell
            ? "Request a pickup"
            : "Donate this item"}
      </button>
      <p className="auth-note">
        Our team reviews every request, schedules a pickup, and lists the item in
        the store from our end.
      </p>
    </form>
  );
}
