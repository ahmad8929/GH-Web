import { PageHero } from "@/components/page-hero";

const dashboardCards = [
  {
    title: "Recommended for your school",
    description: "Surface textbooks, uniforms, and tools matched to your school and class.",
  },
  {
    title: "My listings",
    description: "Track approvals, views, edits, renewals, and sale status in one place.",
  },
  {
    title: "Saved items and alerts",
    description: "Return to favorites and get notified when the right item appears nearby.",
  },
  {
    title: "Donation activity",
    description: "Monitor submitted donation items, pickups, and recipient confirmations.",
  },
];

export default function DashboardPage() {
  return (
    <div className="section-stack">
      <PageHero
        eyebrow="User dashboard"
        title="A personalized home for buyers, sellers, and donors"
        description="After role selection, the dashboard adapts what users see, from recommendations and activity to listing management and donation tracking."
        primaryHref="/sell"
        primaryLabel="Add new listing"
        secondaryHref="/favorites"
        secondaryLabel="Open saved items"
      />

      <div className="dashboard-grid">
        {dashboardCards.map((card) => (
          <article key={card.title} className="feature-card">
            <span className="muted-chip">Dashboard module</span>
            <h3>{card.title}</h3>
            <p>{card.description}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
