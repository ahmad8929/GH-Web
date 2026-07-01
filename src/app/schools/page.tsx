import { PageHero } from "@/components/page-hero";
import { SectionHeading } from "@/components/section-heading";
import { schoolPartners } from "@/data/marketplace";

export default function SchoolsPage() {
  return (
    <div className="section-stack">
      <PageHero
        eyebrow="Schools"
        title="School communities"
        description="Verified spaces for reuse and donation."
        primaryHref="/signup"
        primaryLabel="Register school"
        secondaryHref="/admin"
        secondaryLabel="Admin"
      />

      <section className="section">
        <SectionHeading
          eyebrow="Partners"
          title="Connected schools"
          description="A few example communities."
        />
        <div className="schools-grid">
          {schoolPartners.map((school) => (
            <article key={school.name} className="school-card">
              <span>{school.location}</span>
              <h3>{school.name}</h3>
              <p>{school.focus}</p>
              <strong>{school.members}</strong>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
