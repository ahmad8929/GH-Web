import type { Metadata } from "next";

import { PageHero } from "@/components/page-hero";
import { SectionHeading } from "@/components/section-heading";

export const metadata: Metadata = {
  title: "Schools & communities",
  description:
    "Partner schools and communities on Gyan Hub — reuse programs, uniform exchanges, and donation drives for school families.",
};

const schoolPartners = [
  {
    name: "Delhi Public School, Noida",
    location: "Noida",
    members: "840 families",
    focus: "Textbook reuse and verified parent listings",
  },
  {
    name: "St. Xavier's School",
    location: "Kolkata",
    members: "510 families",
    focus: "Uniform exchange and donation drives",
  },
  {
    name: "National Academy",
    location: "Bengaluru",
    members: "620 families",
    focus: "Exam tools, calculators, and lab equipment",
  },
  {
    name: "Green Valley Public School",
    location: "Pune",
    members: "430 families",
    focus: "Community-led stationery banks",
  },
];

export default function SchoolsPage() {
  return (
    <div className="section-stack">
      <PageHero
        eyebrow="Schools"
        title="School communities"
        description="Verified spaces for reuse, exchange, and donation."
        primaryHref="/signup"
        primaryLabel="Register your school"
        secondaryHref="/contact"
        secondaryLabel="Talk to us"
      />

      <section className="section">
        <SectionHeading
          eyebrow="Partners"
          title="Connected schools"
          description="A few of the communities already on board."
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
