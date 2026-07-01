import { PageHero } from "@/components/page-hero";
import { adminModules } from "@/data/marketplace";

const moderationQueue = [
  ["St. Xavier's Boys Uniform Set", "Pending review", "Uniforms", "School match"],
  ["Community Donation School Bags Pack", "Approved", "Donation", "NGO verified"],
  ["Scientific Calculator fx-991CW", "Flagged", "Devices", "Invoice check"],
];

export default function AdminPage() {
  return (
    <div className="section-stack">
      <PageHero
        eyebrow="Admin dashboard"
        title="Central control for a trusted school marketplace"
        description="Administrators can search, moderate, approve, feature, report, and analyze activity across users, schools, categories, listings, and campaigns."
        primaryHref="/marketplace"
        primaryLabel="Preview public marketplace"
        secondaryHref="/schools"
        secondaryLabel="View school communities"
      />

      <div className="admin-grid">
        {adminModules.map((module) => (
          <article key={module} className="feature-card">
            <span className="badge">Admin</span>
            <h3>{module}</h3>
            <p>Supports filtering, sorting, bulk actions, and workflow visibility.</p>
          </article>
        ))}
      </div>

      <section className="table-card">
        <h3>Moderation queue</h3>
        {moderationQueue.map((row) => (
          <div key={row[0]} className="table-row">
            <strong>{row[0]}</strong>
            <span>{row[1]}</span>
            <span>{row[2]}</span>
            <span>{row[3]}</span>
          </div>
        ))}
      </section>
    </div>
  );
}
