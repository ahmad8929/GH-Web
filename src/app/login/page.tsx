import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="section-stack">
      <section className="auth-page">
        <div className="auth-form auth-form--narrow">
          <div className="auth-copy">
            <span className="eyebrow">Login</span>
            <h1>Welcome back</h1>
            <p className="lead">Access your listings, saved items, and orders.</p>
          </div>
          <div className="field">
            <label htmlFor="email">Email or phone</label>
            <input id="email" placeholder="student@school.com" />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input id="password" type="password" placeholder="Enter password" />
          </div>
          <label className="checkbox-row">
            <input type="checkbox" />
            <span>Keep me signed in</span>
          </label>
          <button type="button" className="button button--primary button--full">
            Login
          </button>
          <div className="auth-links">
            <Link href="/signup">Create account</Link>
            <Link href="/contact">Need help?</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
