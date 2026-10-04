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

export function BusinessFields({
  value,
  onChange,
}: {
  value: Settings["business"];
  onChange: (v: Settings["business"]) => void;
}) {
  return (
    <>
      <div className="form-grid">
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
      file.size > 500000
    ) {
      setError("Choose a PNG or JPEG logo smaller than 500 KB.");
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
      <PageTitle
        eyebrow="SET IT ONCE. USE IT EVERY TIME."
        title="Settings"
        description="The familiar details that make every invoice yours."
      >
        <button className="btn primary" form="settings-form" disabled={busy}>
          <Check size={16} />
          {busy ? "Saving…" : "Save settings"}
        </button>
      </PageTitle>
      {error && <ErrorBox error={error} />}
      <form id="settings-form" onSubmit={save}>
        <div className="settings-layout">
          <div>
            <section className="panel form-panel">
              <div className="section-title">
                <span className="quick-icon">
                  <Users size={20} />
                </span>
                <div>
                  <h2>Business information</h2>
                  <p>Your identity, on every invoice.</p>
                </div>
              </div>
              <div className="logo-upload">
                {v.business.logo ? (
                  <img src={v.business.logo} alt="Business logo" />
                ) : (
                  <span className="brand-mark">t.</span>
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
                  <small>PNG or JPEG · up to 500 KB</small>
                </div>
                {v.business.logo && (
                  <button
                    type="button"
                    className="icon-button"
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
            <section className="panel form-panel">
              <div className="section-title">
                <span className="quick-icon">
                  <Wallet size={20} />
                </span>
                <div>
                  <h2>Payment information</h2>
                  <p>Make the next step clear for your clients.</p>
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
              <div className="form-grid">
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
            <section className="panel form-panel">
              <div className="section-title">
                <span className="quick-icon">
                  <FileText size={20} />
                </span>
                <div>
                  <h2>Invoice defaults</h2>
                  <p>A head start on every new invoice.</p>
                </div>
              </div>
              <div className="form-grid">
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
              <div className="form-grid">
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
              <p className="note-box">
                <ShieldCheck size={16} />
                Changes to defaults apply to new invoices. Your existing
                invoices keep their saved information.
              </p>
            </section>
            <section className="panel form-panel">
              <div className="section-title">
                <span className="quick-icon">
                  <LockKeyhole size={20} />
                </span>
                <div>
                  <h2>Account security</h2>
                  <p>Keep your workspace private.</p>
                </div>
              </div>
              <button
                type="button"
                className="btn"
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
      <p className="muted">Changing your password signs out all sessions.</p>
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
      <div className="modal-footer">
        <button className="btn primary" disabled={busy}>
          Change password and sign out
        </button>
      </div>
    </form>
  );
}
