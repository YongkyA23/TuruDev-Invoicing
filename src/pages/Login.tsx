import { useState, type FormEvent } from "react";
import {
  ArrowUpRight,
  Check,
  LoaderCircle,
  ShieldCheck,
  LockKeyhole,
  Mail,
  Leaf,
  Sparkles,
} from "lucide-react";
import { api, setCsrf } from "../lib";
import { ErrorBox, Field } from "../components/ui";

export function Login({ onLogin }: { onLogin: (email: string) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const r = await api<{ email: string; csrf: string }>(
        "/auth/login",
        "POST",
        { email, password },
      );
      setCsrf(r.csrf);
      onLogin(r.email);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="login">
      <section className="login-story">
        <a className="brand" href="#">
          <span className="brand-mark">t.</span>
          <span>
            TuruDev<small>INVOICING WORKSPACE</small>
          </span>
        </a>
        <div className="story-content">
          <span className="pill">
            <Leaf size={13} />
            Less admin. More creating.
          </span>
          <h1>
            Good work.
            <br />
            Great invoices.
          </h1>
          <p>
            A little less paperwork, a little more peace of mind.
            <br />
            Your team's invoicing, thoughtfully simplified.
          </p>
          <div className="invoice-illustration">
            <div className="illustration-top">
              <span className="brand-mark">t.</span>
              <span>
                INVOICE
                <br />
                <small>Made for your next project</small>
              </span>
              <span className="illustration-check">
                <Check />
              </span>
            </div>
            <div className="illustration-line wide" />
            <div className="illustration-line" />
            <div className="illustration-row">
              <span>Website development</span>
              <span>01</span>
            </div>
            <div className="illustration-row">
              <span>Thoughtful design</span>
              <span>02</span>
            </div>
            <div className="illustration-total">
              <span>Ready when you are</span>
              <Sparkles size={20} />
            </div>
          </div>
        </div>
        <span className="story-footer">
          Simple by design. Built for your team.
        </span>
      </section>
      <section className="login-form">
        <div>
          <span className="eyebrow">YOUR WORKSPACE AWAITS</span>
          <h2>Welcome back.</h2>
          <p>Sign in to keep your business moving.</p>
          <form onSubmit={submit}>
            {error && <ErrorBox error={error} />}
            <Field label="Email address">
              <div className="input-icon">
                <Mail size={17} />
                <input
                  type="email"
                  required
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                />
              </div>
            </Field>
            <Field label="Password">
              <div className="input-icon">
                <LockKeyhole size={17} />
                <input
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                />
              </div>
            </Field>
            <button className="btn primary full" disabled={busy}>
              {busy ? (
                <LoaderCircle className="spin" size={17} />
              ) : (
                <ArrowUpRight size={17} />
              )}
              Sign in to workspace
            </button>
          </form>
          <p className="secure-note">
            <ShieldCheck size={15} />A private workspace for your team.
          </p>
        </div>
        <small className="login-copyright">
          © {new Date().getFullYear()} TuruDev. Made to make work easier.
        </small>
      </section>
    </div>
  );
}
