export default function ContactPage() {
  return (
    <div className="section-stack">
      <section className="page-hero page-hero--simple">
        <span className="eyebrow">Contact us</span>
        <h1>We are here to help.</h1>
        <p>Send a question, support issue, or partnership request.</p>
      </section>

      <section className="auth-page">
        <div className="auth-form">
          <div className="form-grid">
            <div className="field">
              <label htmlFor="name">Name</label>
              <input id="name" placeholder="Your name" />
            </div>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input id="email" placeholder="Your email" />
            </div>
          </div>
          <div className="field">
            <label htmlFor="subject">Subject</label>
            <input id="subject" placeholder="How can we help?" />
          </div>
          <div className="field">
            <label htmlFor="message">Message</label>
            <textarea id="message" placeholder="Write your message" />
          </div>
          <button type="button" className="button button--primary button--full">
            Send message
          </button>
        </div>
      </section>
    </div>
  );
}
