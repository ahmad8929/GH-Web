import Link from "next/link";

import { userRoles } from "@/data/marketplace";

export default function SignupPage() {
  return (
    <div className="section-stack">
      <section className="auth-page">
        <div className="auth-form">
          <div className="auth-copy">
            <span className="eyebrow">Sign up</span>
            <h1>Create your account</h1>
            <p className="lead">Join as student, parent, school, or institute.</p>
          </div>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="role">Role</label>
              <select id="role" defaultValue="student">
                {userRoles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="phone">Phone</label>
              <input id="phone" placeholder="+91 98..." />
            </div>
            <div className="field">
              <label htmlFor="full-name">Full name</label>
              <input id="full-name" placeholder="Enter full name" />
            </div>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input id="email" placeholder="Enter email" />
            </div>
            <div className="field">
              <label htmlFor="school-name">School or institute</label>
              <input id="school-name" placeholder="Enter school name" />
            </div>
            <div className="field">
              <label htmlFor="city">City</label>
              <input id="city" placeholder="Enter city" />
            </div>
            <div className="field">
              <label htmlFor="password">Password</label>
              <input id="password" type="password" placeholder="Create password" />
            </div>
            <div className="field">
              <label htmlFor="confirm-password">Confirm password</label>
              <input
                id="confirm-password"
                type="password"
                placeholder="Confirm password"
              />
            </div>
          </div>
          <label className="checkbox-row">
            <input type="checkbox" />
            <span>
              I agree to the <Link href="/terms-and-conditions">terms</Link> and{" "}
              <Link href="/privacy-policy">privacy policy</Link>.
            </span>
          </label>
          <button type="button" className="button button--primary button--full">
            Create account
          </button>
          <p className="auth-note">
            Already have an account? <Link href="/login">Login</Link>
          </p>
        </div>
      </section>
    </div>
  );
}
