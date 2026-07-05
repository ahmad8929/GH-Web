import Link from "next/link";

type EmptyStateProps = {
  emoji?: string;
  title: string;
  body?: string;
  ctaHref?: string;
  ctaLabel?: string;
};

export function EmptyState({
  emoji = "🎒",
  title,
  body,
  ctaHref,
  ctaLabel,
}: EmptyStateProps) {
  return (
    <div className="empty-state">
      <span className="empty-state__emoji" aria-hidden>
        {emoji}
      </span>
      <h3>{title}</h3>
      {body ? <p>{body}</p> : null}
      {ctaHref && ctaLabel ? (
        <Link href={ctaHref} className="button button--primary">
          {ctaLabel}
        </Link>
      ) : null}
    </div>
  );
}

/** "Coming soon" flavour for contract-first features awaiting the backend. */
export function ComingSoon({
  emoji = "🚀",
  title,
  body = "We're putting the finishing touches on this. Check back soon!",
}: {
  emoji?: string;
  title: string;
  body?: string;
}) {
  return (
    <div className="empty-state">
      <span className="empty-state__emoji" aria-hidden>
        {emoji}
      </span>
      <h3>{title}</h3>
      <p>{body}</p>
      <span className="badge badge--sun">Coming soon</span>
    </div>
  );
}
