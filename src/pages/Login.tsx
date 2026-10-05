import { ui } from "../components/styles";
import { styles } from "./Login.styles";
import { useState, type FormEvent } from "react";
import {
  ArrowUpRight,
  Check,
  LoaderCircle,
  LockKeyhole,
  Mail,
  Sparkles,
} from "lucide-react";
import { api, setCsrf } from "../lib";
import { ErrorBox, Field } from "../components/ui";
import { BrandMark } from "../components/Brand";

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
    <div className={styles.login}>
      <section className={styles.loginStory}>
        <a className={styles.brand} href="#">
          <BrandMark />
          <span>
            TuruDev<small>INVOICING WORKSPACE</small>
          </span>
        </a>
        <div className={styles.storyContent}>
          <h1>
            TuruDev <br />
            Invoicing
          </h1>
          <div className={styles.invoiceIllustration} aria-hidden="true">
            <div className={styles.illustrationTop}>
              <BrandMark />
              <span>INVOICE</span>
              <span className={styles.illustrationCheck}>
                <Check />
              </span>
            </div>
            <div className={styles.illustrationLineWide} />
            <div className={styles.illustrationLine} />
            <div className={styles.illustrationRow}>
              <span>Website development</span>
              <span>01</span>
            </div>
            <div className={styles.illustrationRow}>
              <span>Design services</span>
              <span>02</span>
            </div>
            <div className={styles.illustrationTotal}>
              <span>Total</span>
              <Sparkles size={20} />
            </div>
          </div>
        </div>
      </section>
      <section className={styles.loginForm}>
        <div>
          <h2>Sign in</h2>
          <form onSubmit={submit}>
            {error && <ErrorBox error={error} />}
            <Field label="Email address">
              <div className={styles.inputIcon}>
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
              <div className={styles.inputIcon}>
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
            <button className={ui.btnPrimaryFull} disabled={busy}>
              {busy ? (
                <LoaderCircle className={ui.spin} size={17} />
              ) : (
                <ArrowUpRight size={17} />
              )}
              Sign in
            </button>
          </form>
        </div>
        <small className={styles.loginCopyright}>
          © {new Date().getFullYear()} TuruDev
        </small>
      </section>
    </div>
  );
}
