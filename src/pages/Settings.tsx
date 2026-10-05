import { ui } from "../components/styles";
import { styles } from "./Settings.styles";
import { BrandMark } from "../components/Brand";
import { useState, useEffect, type FormEvent } from "react";
import {
  FileText,
  Users,
  ArrowUpRight,
  Trash2,
  Check,
  Wallet,
  ShieldCheck,
  LockKeyhole,
} from "lucide-react";
import type { Settings, Invoice } from "../types";
import { api } from "../lib";
import { Spinner, ErrorBox, Field, PageTitle, Modal } from "../components/ui";

const MAX_LOGO_BYTES = 5_000_000;

export function BusinessFields({
  value,
  onChange,
}: {
  value: Settings["business"];
  onChange: (v: Settings["business"]) => void;
}) {
  return (
    <>
      <div className={ui.formGrid}>
        <Field label="Business / team name *">
          <input
            required
            value={value.name}
            onChange={(e) => onChange({ ...value, name: e.target.value })}
          />
        </Field>
        <Field label="Email">
          <input
            type="email"
            value={value.email}
            onChange={(e) => onChange({ ...value, email: e.target.value })}
          />
        </Field>
        <Field label="Phone">
          <input
            value={value.phone}
            onChange={(e) => onChange({ ...value, phone: e.target.value })}
          />
        </Field>
        <Field label="Website">
          <input
            value={value.website}
            onChange={(e) => onChange({ ...value, website: e.target.value })}
          />
        </Field>
      </div>
      <Field label="Business address">
        <textarea
          rows={3}
          value={value.address}
          onChange={(e) => onChange({ ...value, address: e.target.value })}
        />
      </Field>
      <Field label="Tax ID">
        <input
          value={value.taxId}
          onChange={(e) => onChange({ ...value, taxId: e.target.value })}
        />
      </Field>
    </>
  );
}

export function SettingsPage({
  notify,
  setDirty,
}: {
  notify: (m: string) => void;
  setDirty: (v: boolean) => void;
}) {
  const [v, set] = useState<Settings | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [password, setPassword] = useState(false);
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    api<Settings>("/settings")
      .then((s) => {
        set(s);
        setDirty(false);
      })
      .catch((e) => setError(e.message));
  }, [revision]);
  const update = (patch: Partial<Settings>) => {
    if (v) {
      set({ ...v, ...patch });
      setDirty(true);
    }
  };
  async function save(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      set(await api<Settings>("/settings", "PUT", v));
      setDirty(false);
      notify("Settings saved. New invoices will use these defaults.");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  function logo(file?: File) {
    if (!file || !v) return;
    if (
      !["image/png", "image/jpeg"].includes(file.type) ||
      file.size > MAX_LOGO_BYTES
    ) {
      setError("Choose a PNG or JPEG logo that is 5 MB or smaller.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () =>
      update({ business: { ...v.business, logo: String(reader.result) } });
    reader.readAsDataURL(file);
  }
  if (error && !v)
    return <ErrorBox error={error} retry={() => setRevision((x) => x + 1)} />;
  if (!v) return <Spinner />;
  return (
    <>
      <PageTitle title="Settings">
        <button className={ui.btnPrimary} form="settings-form" disabled={busy}>
          <Check size={16} />
          {busy ? "Saving…" : "Save settings"}
        </button>
      </PageTitle>
      {error && <ErrorBox error={error} />}
      <form id="settings-form" onSubmit={save}>
        <div className={styles.settingsLayout}>
          <div>
            <section className={ui.panelFormPanel}>
              <div className={ui.sectionTitle}>
                <span className={ui.quickIcon}>
                  <Users size={20} />
                </span>
                <div>
                  <h2>Business information</h2>
                </div>
              </div>
              <div className={styles.logoUpload}>
                {v.business.logo ? (
                  <img src={v.business.logo} alt="Business logo" />
                ) : (
                  <BrandMark />
                )}
                <div>
                  <Field label="Business logo">
                    <input
                      aria-label="Business logo"
                      type="file"
                      accept="image/png,image/jpeg"
                      onChange={(e) => logo(e.target.files?.[0])}
                    />
                  </Field>
                  <small>PNG or JPEG · up to 5 MB</small>
                </div>
                {v.business.logo && (
                  <button
                    type="button"
                    className={ui.iconButton}
                    aria-label="Remove logo"
                    onClick={() =>
                      update({ business: { ...v.business, logo: "" } })
                    }
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
              <BusinessFields
                value={v.business}
                onChange={(business) => update({ business })}
              />
            </section>
            <section className={ui.panelFormPanel}>
              <div className={ui.sectionTitle}>
                <span className={ui.quickIcon}>
                  <Wallet size={20} />
                </span>
                <div>
                  <h2>Payment information</h2>
                </div>
              </div>
              <Field label="Bank name">
                <input
                  value={v.payment.bank}
                  onChange={(e) =>
                    update({ payment: { ...v.payment, bank: e.target.value } })
                  }
                />
              </Field>
              <div className={ui.formGrid}>
                <Field label="Account name">
                  <input
                    value={v.payment.accountName}
                    onChange={(e) =>
                      update({
                        payment: { ...v.payment, accountName: e.target.value },
                      })
                    }
                  />
                </Field>
                <Field label="Account number">
                  <input
                    value={v.payment.accountNumber}
                    onChange={(e) =>
                      update({
                        payment: {
                          ...v.payment,
                          accountNumber: e.target.value,
                        },
                      })
                    }
                  />
                </Field>
              </div>
            </section>
          </div>
          <div>
            <section className={ui.panelFormPanel}>
              <div className={ui.sectionTitle}>
                <span className={ui.quickIcon}>
                  <FileText size={20} />
                </span>
                <div>
                  <h2>Invoice defaults</h2>
                </div>
              </div>
              <div className={ui.formGrid}>
                <Field label="Invoice prefix">
                  <input
                    required
                    pattern="[A-Za-z0-9-]{1,20}"
                    value={v.prefix}
                    onChange={(e) => update({ prefix: e.target.value })}
                  />
                </Field>
                <Field label="Next sequence number">
                  <input
                    type="number"
                    required
                    min="1"
                    max="999999999"
                    step="1"
                    value={v.nextNumber}
                    onChange={(e) =>
                      update({ nextNumber: Number(e.target.value) })
                    }
                  />
                </Field>
              </div>
              <Field label="Numbering format">
                <select
                  value={v.numberFormat}
                  onChange={(e) =>
                    update({
                      numberFormat: e.target.value as Settings["numberFormat"],
                    })
                  }
                >
                  <option value="year">
                    Prefix-Year-Number · INV-2026-001
                  </option>
                  <option value="simple">Prefix-Number · INV-001</option>
                </select>
              </Field>
              <div className={ui.formGrid}>
                <Field label="Default currency">
                  <select
                    value={v.currency}
                    onChange={(e) => update({ currency: e.target.value })}
                  >
                    {["IDR", "USD", "SGD"].map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Payment terms (days)">
                  <input
                    type="number"
                    min="0"
                    max="365"
                    step="1"
                    value={v.paymentDays}
                    onChange={(e) =>
                      update({ paymentDays: Number(e.target.value) })
                    }
                  />
                </Field>
              </div>
              <Field label="Default tax (%)">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={v.tax}
                  onChange={(e) => update({ tax: Number(e.target.value) })}
                />
              </Field>
              <Field label="Default notes">
                <textarea
                  rows={4}
                  value={v.notes}
                  onChange={(e) => update({ notes: e.target.value })}
                />
              </Field>
              <p className={ui.noteBox}>
                <ShieldCheck size={16} />
                Changes to defaults apply to new invoices. Your existing
                invoices keep their saved information.
              </p>
            </section>
            <section className={ui.panelFormPanel}>
              <div className={ui.sectionTitle}>
                <span className={ui.quickIcon}>
                  <LockKeyhole size={20} />
                </span>
                <div>
                  <h2>Account security</h2>
                </div>
              </div>
              <button
                type="button"
                className={ui.btn}
                onClick={() => setPassword(true)}
              >
                Change admin password <ArrowUpRight size={15} />
              </button>
            </section>
          </div>
        </div>
      </form>
      {password && (
        <Modal title="Change your password" onClose={() => setPassword(false)}>
          <PasswordForm />
        </Modal>
      )}
    </>
  );
}

export function PasswordForm() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [repeat, setRepeat] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e: FormEvent) {
    e.preventDefault();
    if (next !== repeat) {
      setError("New passwords do not match");
      return;
    }
    setBusy(true);
    try {
      await api("/auth/password", "PUT", {
        currentPassword: current,
        newPassword: next,
      });
      window.dispatchEvent(new Event("session-expired"));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <form onSubmit={submit}>
      {error && <ErrorBox error={error} />}
      <p className={ui.muted}>Changing your password signs out all sessions.</p>
      <Field label="Current password">
        <input
          autoFocus
          type="password"
          autoComplete="current-password"
          required
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
        />
      </Field>
      <Field label="New password" hint="At least 12 characters">
        <input
          type="password"
          autoComplete="new-password"
          minLength={12}
          required
          value={next}
          onChange={(e) => setNext(e.target.value)}
        />
      </Field>
      <Field label="Confirm new password">
        <input
          type="password"
          autoComplete="new-password"
          minLength={12}
          required
          value={repeat}
          onChange={(e) => setRepeat(e.target.value)}
        />
      </Field>
      <div className={ui.modalFooter}>
        <button className={ui.btnPrimary} disabled={busy}>
          Change password and sign out
        </button>
      </div>
    </form>
  );
}
