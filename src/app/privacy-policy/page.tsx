import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: "What Gyan Hub collects and how we use and protect it.",
};

const privacySections = [
  {
    title: "Information we collect",
    text: "We may collect account details, listing data, messages, and support requests needed to run the platform.",
  },
  {
    title: "How we use data",
    text: "Your data helps us provide listings, account access, search results, support, and platform safety.",
  },
  {
    title: "Sharing and protection",
    text: "We do not sell personal data. We use reasonable steps to protect user information and platform activity.",
  },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="section-stack">
      <section className="page-hero page-hero--simple">
        <span className="eyebrow">Privacy policy</span>
        <h1>Your information matters.</h1>
        <p>Simple guidance on what we collect and how we use it.</p>
      </section>

      <section className="legal-stack">
        {privacySections.map((section) => (
          <article key={section.title} className="panel">
            <h2>{section.title}</h2>
            <p>{section.text}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
