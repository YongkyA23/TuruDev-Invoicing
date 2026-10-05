import { ui } from "../components/styles";
import { styles } from "./Invoices.styles";
import { BrandMark } from "../components/Brand";
import { useState, useEffect, type FormEvent } from "react";
import {
  Layers,
  Plus,
  ArrowLeft,
  Search,
  Download,
  Copy,
  Pencil,
  Trash2,
  Check,
  X,
  ChevronDown,
  ArrowUp,
  ArrowDown,
  Clock3,
  LoaderCircle,
  Eye,
  Archive,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";
import type { Client, Service, Settings, Invoice, Status } from "../types";
import {
  api,
  money,
  today,
  addDays,
  displayDate,
  calculate,
  blankClient,
  downloadPdf,
} from "../lib";
import {
  Spinner,
  ErrorBox,
  Field,
  Badge,
  Empty,
  PageTitle,
  Modal,
  useLoad,
  InvoiceTable,
  type Navigate,
  statuses,
  useConfirm,
} from "../components/ui";
import { ClientForm } from "../pages/Clients";
import { BusinessFields } from "../pages/Settings";

export function InvoiceList({
  navigate,
  notify,
}: {
  navigate: Navigate;
  notify: (m: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [client, setClient] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [archived, setArchived] = useState(false);
  const params = new URLSearchParams({
    q: query,
    status,
    clientId: client,
    from,
    to,
    archived: String(archived),
  });
  const { data, error, retry } = useLoad<Invoice[]>("/invoices?" + params);
  const clients = useLoad<Client[]>("/clients");
  async function duplicate(i: Invoice) {
    try {
      const result = await api<Invoice>(`/invoices/${i.id}/duplicate`, "POST");
      notify("Invoice duplicated as a new draft");
      navigate(`edit/${result.id}`);
    } catch (e) {
      notify((e as Error).message);
    }
  }
  return (
    <>
      <PageTitle title="Invoices">
        <button className={ui.btnPrimary} onClick={() => navigate("new")}>
          <Plus size={17} />
          Create invoice
        </button>
      </PageTitle>
      <section className={ui.panel}>
        <div className={ui.filterBar}>
          <div className={ui.search}>
            <Search size={17} />
            <input
              aria-label="Search invoices"
              placeholder="Search invoice or client…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <select
            aria-label="Filter by status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">All statuses</option>
            {statuses.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <select
            aria-label="Filter by client"
            value={client}
            onChange={(e) => setClient(e.target.value)}
          >
            <option value="">All clients</option>
            {clients.data?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <button
            className={archived ? styles.btnActiveFilter : ui.btn}
            onClick={() => setArchived(!archived)}
          >
            <Archive size={15} />
            {archived ? "Including archived" : "Active invoices"}
          </button>
        </div>
        <div className={styles.dateFilters}>
          <label>
            Issued from{" "}
            <input
              aria-label="Issued from"
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
          </label>
          <label>
            to{" "}
            <input
              aria-label="Issued to"
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </label>
          {(query || status || client || from || to) && (
            <button
              className={ui.textButton}
              onClick={() => {
                setQuery("");
                setStatus("");
                setClient("");
                setFrom("");
                setTo("");
              }}
            >
              Clear filters
            </button>
          )}
          <span>{data?.length || 0} invoices</span>
        </div>
        {error ? (
          <ErrorBox error={error} retry={retry} />
        ) : !data ? (
          <Spinner />
        ) : data.length ? (
          <InvoiceTable
            list={data}
            navigate={navigate}
            onDuplicate={duplicate}
            onPdf={(i) => downloadPdf(i).catch((e) => notify(e.message))}
          />
        ) : (
          <Empty
            title="No invoices found"
            description="Adjust the filters or create an invoice."
            action="Create invoice"
            onClick={() => navigate("new")}
          />
        )}
      </section>
    </>
  );
}

export function InvoicePaper({ invoice }: { invoice: Invoice }) {
  const totals = invoice.totals || calculate(invoice);
  return (
    <div className={styles.invoicePaper}>
      <div className={styles.paperTop}>
        <div>
          {invoice.business.logo && (
            <img
              className={styles.businessLogo}
              src={invoice.business.logo}
              alt="Business logo"
            />
          )}
          {!invoice.business.logo && invoice.business.name === "TuruDev" && (
            <div className={styles.businessMark}>
              <BrandMark />
            </div>
          )}
          <h2>{invoice.business.name}</h2>
          <p className={ui.preWrap}>{invoice.business.address}</p>
          {(invoice.business.email || invoice.business.phone) && (
            <p>
              {invoice.business.email}
              {invoice.business.email && invoice.business.phone && <br />}
              {invoice.business.phone}
            </p>
          )}
          {invoice.business.website && <p>{invoice.business.website}</p>}
          {invoice.business.taxId && <p>Tax ID: {invoice.business.taxId}</p>}
        </div>
        <div className={styles.paperMeta}>
          <h1>INVOICE</h1>
          <strong>{invoice.number || "Assigned on save"}</strong>
          <dl>
            <dt>Issued</dt>
            <dd>{displayDate(invoice.date)}</dd>
            <dt>Due date</dt>
            <dd>{displayDate(invoice.dueDate)}</dd>
            <dt>Status</dt>
            <dd>{invoice.status}</dd>
          </dl>
        </div>
      </div>
      <div className={styles.billTo}>
        <span className={styles.eyebrow}>BILL TO</span>
        <h3>{invoice.client.name || "Select a client"}</h3>
        <p>{invoice.client.company}</p>
        <p className={ui.preWrap}>{invoice.client.address}</p>
        {(invoice.client.email || invoice.client.phone) && (
          <p>
            {invoice.client.email}
            {invoice.client.email && invoice.client.phone && <br />}
            {invoice.client.phone}
          </p>
        )}
        {invoice.client.taxId && <p>Tax ID: {invoice.client.taxId}</p>}
      </div>
      <div className={ui.tableWrap}>
        <table className={styles.paperItems}>
          <thead>
            <tr>
              <th>Description</th>
              <th>Qty / unit</th>
              <th className={ui.alignRight}>Price</th>
              <th className={ui.alignRight}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, index) => (
              <tr key={index}>
                <td className={ui.preWrap}>
                  {item.description || "Item description"}
                </td>
                <td>
                  {item.quantity} {item.unit}
                </td>
                <td className={ui.alignRight}>
                  {money(item.price, invoice.currency)}
                </td>
                <td className={ui.alignRight}>
                  {money(totals.amounts[index], invoice.currency)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className={styles.paperTotals}>
        <div>
          <span>Subtotal</span>
          <span>{money(totals.subtotal, invoice.currency)}</span>
        </div>
        <div>
          <span>
            Discount
            {invoice.discountType === "percent"
              ? ` (${invoice.discount}%)`
              : ""}
          </span>
          <span>−{money(totals.discount, invoice.currency)}</span>
        </div>
        <div>
          <span>Tax ({invoice.tax}%)</span>
          <span>{money(totals.tax, invoice.currency)}</span>
        </div>
        <div className={styles.grandTotal}>
          <span>Total</span>
          <strong>{money(totals.total, invoice.currency)}</strong>
        </div>
      </div>
      <div className={styles.paperBottom}>
        {(invoice.payment.bank ||
          invoice.payment.accountName ||
          invoice.payment.accountNumber) && (
          <div>
            <span className={styles.eyebrow}>PAYMENT INFORMATION</span>
            <p>
              {invoice.payment.bank}
              <br />
              {invoice.payment.accountName}
              <br />
              {invoice.payment.accountNumber}
            </p>
          </div>
        )}
        {invoice.notes && (
          <div>
            <span className={styles.eyebrow}>NOTES</span>
            <p className={ui.preWrap}>{invoice.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export function InvoiceDetail({
  id,
  navigate,
  notify,
}: {
  id: string;
  navigate: Navigate;
  notify: (m: string) => void;
}) {
  const confirm = useConfirm();
  const [revision, setRevision] = useState(0);
  const { data, error, retry } = useLoad<Invoice>(`/invoices/${id}`, revision);
  const [busy, setBusy] = useState(false);
  async function action(type: string, status?: string) {
    if (!data) return;
    setBusy(true);
    try {
      if (type === "pdf") await downloadPdf(data);
      else if (type === "duplicate") {
        const i = await api<Invoice>(`/invoices/${id}/duplicate`, "POST");
        notify("New draft created");
        navigate(`edit/${i.id}`);
      } else if (type === "status") {
        if (
          !(await confirm({
            title: "Update invoice status?",
            message: `Mark ${data.number} as ${status}?`,
            confirmLabel: `Mark ${status}`,
            destructive: status === "Cancelled",
          }))
        )
          return;
        await api(`/invoices/${id}/status`, "PATCH", {
          status,
          version: data.version,
        });
        setRevision((v) => v + 1);
        notify("Invoice status updated");
      } else if (type === "delete") {
        if (
          !(await confirm({
            title: data.status === "Draft" ? "Delete draft?" : "Archive invoice?",
            message:
              data.status === "Draft"
                ? `Permanently delete draft ${data.number}?`
                : `Archive ${data.number}? It will remain in invoice history.`,
            confirmLabel: data.status === "Draft" ? "Delete draft" : "Archive invoice",
            destructive: true,
          }))
        )
          return;
        await api(`/invoices/${id}`, "DELETE");
        notify(data.status === "Draft" ? "Draft deleted" : "Invoice archived");
        navigate("invoices");
      } else if (type === "restore") {
        await api(`/invoices/${id}/restore`, "POST");
        setRevision((v) => v + 1);
        notify("Invoice restored");
      }
    } catch (e) {
      notify((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  if (error) return <ErrorBox error={error} retry={retry} />;
  if (!data) return <Spinner />;
  return (
    <>
      <button
        className={styles.backButton}
        onClick={() => navigate("invoices")}
      >
        <ArrowLeft size={15} />
        All invoices
      </button>
      <PageTitle
        title={data.number!}
        description={`${data.client.name} · ${displayDate(data.date)}${data.archived ? " · Archived" : ""}`}
      >
        <button className={ui.btn} onClick={() => navigate(`edit/${id}`)}>
          <Pencil size={16} />
          Edit
        </button>
        <button
          className={ui.btn}
          disabled={busy}
          onClick={() => action("duplicate")}
        >
          <Copy size={16} />
          Duplicate
        </button>
        <button
          className={ui.btnPrimary}
          disabled={busy}
          onClick={() => action("pdf")}
        >
          {busy ? (
            <LoaderCircle size={16} className={ui.spin} />
          ) : (
            <Download size={16} />
          )}
          Download PDF
        </button>
      </PageTitle>
      <div className={styles.detailToolbar}>
        <Badge status={data.status} />
        <label>
          Update status{" "}
          <select
            aria-label="Update status"
            value={data.status}
            disabled={busy}
            onChange={(e) => action("status", e.target.value)}
          >
            {statuses.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        {data.archived ? (
          <button
            className={ui.textButton}
            disabled={busy}
            onClick={() => action("restore")}
          >
            <RotateCcw size={15} />
            Restore invoice
          </button>
        ) : (
          <button
            className={styles.textButtonDanger}
            disabled={busy}
            onClick={() => action("delete")}
          >
            {data.status === "Draft" ? (
              <Trash2 size={15} />
            ) : (
              <Archive size={15} />
            )}{" "}
            {data.status === "Draft" ? "Delete draft" : "Archive invoice"}
          </button>
        )}
      </div>
      <InvoicePaper invoice={data} />
    </>
  );
}

export function InvoiceEditor({
  id,
  navigate,
  notify,
  setDirty,
}: {
  id?: string;
  navigate: Navigate;
  notify: (m: string) => void;
  setDirty: (v: boolean) => void;
}) {
  const confirm = useConfirm();
  const [v, setV] = useState<Invoice | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState(false);
  const [addClient, setAddClient] = useState(false);
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    let active = true;
    setError("");
    Promise.all([
      api<Settings>("/settings"),
      api<Client[]>("/clients"),
      api<Service[]>("/services"),
      id ? api<Invoice>(`/invoices/${id}`) : Promise.resolve(null),
    ])
      .then(([s, c, sv, i]) => {
        if (!active) return;
        setSettings(s);
        setClients(c);
        setServices(sv);
        setV(
          i || {
            number: "",
            date: today(),
            dueDate: addDays(today(), s.paymentDays),
            confirmEarlyDue: false,
            clientId: null,
            client: { ...blankClient },
            business: { ...s.business },
            payment: { ...s.payment },
            currency: s.currency,
            paymentDays: s.paymentDays,
            status: "Draft",
            items: [
              { description: "", quantity: 1, unit: "project", price: 0 },
            ],
            discountType: "percent",
            discount: 0,
            tax: s.tax,
            notes: s.notes,
          },
        );
        setDirty(false);
      })
      .catch((e) => {
        if (active) setError(e.message);
      });
    return () => {
      active = false;
    };
  }, [id, revision]);
  const update = (patch: Partial<Invoice>) => {
    if (v) {
      setV({ ...v, ...patch, totals: undefined });
      setDirty(true);
    }
  };
  async function save(e: FormEvent) {
    e.preventDefault();
    if (!v) return;
    if (v.dueDate < v.date && !v.confirmEarlyDue) {
      if (
        !(await confirm({
          title: "Check due date",
          message: "The due date is earlier than the invoice date. Save anyway?",
          confirmLabel: "Save anyway",
        }))
      )
        return;
      v.confirmEarlyDue = true;
    }
    setBusy(true);
    setError("");
    try {
      const saved = await api<Invoice>(
        `/invoices${id ? "/" + id : ""}`,
        id ? "PUT" : "POST",
        v,
      );
      setDirty(false);
      notify("Invoice saved");
      navigate(`invoice/${saved.id}`);
    } catch (e) {
      setError((e as Error).message);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setBusy(false);
    }
  }
  if (error && !v)
    return <ErrorBox error={error} retry={() => setRevision((x) => x + 1)} />;
  if (!v || !settings) return <Spinner />;
  const totals = calculate(v);
  const suggested = `${settings.prefix}-${settings.numberFormat === "year" ? today().slice(0, 4) + "-" : ""}${String(settings.nextNumber).padStart(3, "0")}`;
  const changeItem = (
    index: number,
    patch: Partial<Invoice["items"][number]>,
  ) =>
    update({
      items: v.items.map((item, i) =>
        i === index ? { ...item, ...patch } : item,
      ),
    });
  const moveItem = (index: number, delta: number) => {
    const items = [...v.items];
    [items[index], items[index + delta]] = [items[index + delta], items[index]];
    update({ items });
  };
  return (
    <>
      <button
        className={styles.backButton}
        onClick={() => navigate(id ? `invoice/${id}` : "invoices")}
      >
        <ArrowLeft size={15} />
        {id ? "Back to invoice" : "All invoices"}
      </button>
      <PageTitle title={id ? "Edit invoice" : "Create an invoice"} />
      {error && <ErrorBox error={error} />}
      <form id="invoice-form" onSubmit={save}>
        <div className={styles.editorLayout}>
          <div className={styles.editorMain}>
            <section className={ui.panelFormPanel}>
              <div className={ui.sectionTitle}>
                <span className={styles.stepNumber}>01</span>
                <div>
                  <h2>Invoice details</h2>
                </div>
              </div>
              <div className={styles.formGridFour}>
                <Field
                  label="Invoice number"
                  hint={
                    id
                      ? "Must be unique"
                      : "Leave blank to assign automatically"
                  }
                >
                  <input
                    value={v.number || ""}
                    required={Boolean(id)}
                    placeholder={suggested}
                    onChange={(e) => update({ number: e.target.value })}
                  />
                </Field>
                <Field label="Invoice date *">
                  <input
                    type="date"
                    required
                    value={v.date}
                    onChange={(e) =>
                      update({
                        date: e.target.value,
                        dueDate: addDays(e.target.value, v.paymentDays),
                        confirmEarlyDue: false,
                      })
                    }
                  />
                </Field>
                <Field label="Payment terms">
                  <select
                    value={v.paymentDays}
                    onChange={(e) =>
                      update({
                        paymentDays: Number(e.target.value),
                        dueDate: addDays(v.date, Number(e.target.value)),
                        confirmEarlyDue: false,
                      })
                    }
                  >
                    {[...new Set([0, 7, 14, 30, v.paymentDays])]
                      .sort((a, b) => a - b)
                      .map((n) => (
                        <option key={n} value={n}>
                          {n === 0 ? "Due on receipt" : `${n} days`}
                        </option>
                      ))}
                  </select>
                </Field>
                <Field label="Due date *">
                  <input
                    type="date"
                    required
                    value={v.dueDate}
                    onChange={(e) =>
                      update({
                        dueDate: e.target.value,
                        confirmEarlyDue: false,
                      })
                    }
                  />
                </Field>
              </div>
              <div className={ui.formGrid}>
                <Field label="Currency">
                  <select
                    value={v.currency}
                    onChange={(e) => update({ currency: e.target.value })}
                  >
                    {["IDR", "USD", "SGD"].map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Status">
                  <select
                    value={v.status}
                    onChange={(e) =>
                      update({ status: e.target.value as Status })
                    }
                  >
                    {statuses.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </Field>
              </div>
            </section>
            <section className={ui.panelFormPanel}>
              <div className={ui.sectionTitle}>
                <span className={styles.stepNumber}>02</span>
                <div>
                  <h2>Client</h2>
                </div>
                <button
                  type="button"
                  className={ui.textButton}
                  onClick={() => setAddClient(true)}
                >
                  <Plus size={15} />
                  Add new client
                </button>
              </div>
              <Field label="Select client *">
                <select
                  required
                  value={v.clientId || ""}
                  onChange={(e) => {
                    const client = clients.find(
                      (c) => c.id === Number(e.target.value),
                    );
                    update({
                      clientId: client?.id || null,
                      client: client ? { ...client } : { ...blankClient },
                    });
                  }}
                >
                  <option value="">Choose a saved client</option>
                  {v.clientId && !clients.some((c) => c.id === v.clientId) && (
                    <option value={v.clientId}>
                      {v.client.name} (deleted client)
                    </option>
                  )}
                  {clients.map((c) => (
                    <option value={c.id} key={c.id}>
                      {c.name}
                      {c.company ? " · " + c.company : ""}
                    </option>
                  ))}
                </select>
              </Field>
              {v.clientId && (
                <div className={styles.snapshotFields}>
                  <div className={ui.formGrid}>
                    <Field label="Client name *">
                      <input
                        required
                        value={v.client.name}
                        onChange={(e) =>
                          update({
                            client: { ...v.client, name: e.target.value },
                          })
                        }
                      />
                    </Field>
                    <Field label="Company">
                      <input
                        value={v.client.company}
                        onChange={(e) =>
                          update({
                            client: { ...v.client, company: e.target.value },
                          })
                        }
                      />
                    </Field>
                    <Field label="Email">
                      <input
                        type="email"
                        value={v.client.email}
                        onChange={(e) =>
                          update({
                            client: { ...v.client, email: e.target.value },
                          })
                        }
                      />
                    </Field>
                    <Field label="Phone">
                      <input
                        value={v.client.phone}
                        onChange={(e) =>
                          update({
                            client: { ...v.client, phone: e.target.value },
                          })
                        }
                      />
                    </Field>
                  </div>
                  <Field label="Billing address">
                    <textarea
                      rows={2}
                      value={v.client.address}
                      onChange={(e) =>
                        update({
                          client: { ...v.client, address: e.target.value },
                        })
                      }
                    />
                  </Field>
                  <Field label="Tax ID">
                    <input
                      value={v.client.taxId}
                      onChange={(e) =>
                        update({
                          client: { ...v.client, taxId: e.target.value },
                        })
                      }
                    />
                  </Field>
                  <small className={ui.muted}>
                    Changes here apply only to this invoice.
                  </small>
                </div>
              )}
            </section>
            <section className={ui.panelFormPanel}>
              <div className={ui.sectionTitle}>
                <span className={styles.stepNumber}>03</span>
                <div>
                  <h2>Line items</h2>
                </div>
              </div>
              <div className={styles.serviceSelect}>
                <Layers size={17} />
                <select
                  aria-label="Add saved service"
                  value=""
                  onChange={(e) => {
                    const s = services.find(
                      (s) => s.id === Number(e.target.value),
                    );
                    if (s) {
                      const item = {
                        description: s.description,
                        quantity: 1,
                        unit: s.unit,
                        price: s.price,
                      };
                      update({
                        items:
                          v.items.length === 1 &&
                          !v.items[0].description &&
                          v.items[0].price === 0
                            ? [item]
                            : [...v.items, item],
                      });
                    }
                  }}
                >
                  <option value="">Add a saved service…</option>
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} · {money(s.price, settings.currency)}
                    </option>
                  ))}
                </select>
              </div>
              {v.currency !== settings.currency && (
                <p className={ui.noteBox}>
                  Saved service prices are in {settings.currency}. Adjust prices
                  for {v.currency}; currency conversion is not automatic.
                </p>
              )}
              <div className={styles.itemLabels}>
                <span>Description</span>
                <span>Qty</span>
                <span>Unit</span>
                <span>Unit price</span>
                <span className={ui.alignRight}>Amount</span>
                <span />
              </div>
              {v.items.map((item, index) => (
                <div className={styles.itemRow} key={index}>
                  <label className={styles.itemField}>
                    <span>Description</span>
                    <textarea
                      aria-label={`Item ${index + 1} description`}
                      required
                      rows={2}
                      value={item.description}
                      onChange={(e) =>
                        changeItem(index, { description: e.target.value })
                      }
                      placeholder="Describe the work…"
                    />
                  </label>
                  <label className={styles.itemField}>
                    <span>Quantity</span>
                    <input
                      aria-label={`Item ${index + 1} quantity`}
                      type="number"
                      required
                      min="0.0001"
                      step="0.0001"
                      max="100000"
                      value={item.quantity}
                      onChange={(e) =>
                        changeItem(index, { quantity: Number(e.target.value) })
                      }
                    />
                  </label>
                  <label className={styles.itemField}>
                    <span>Unit</span>
                    <input
                      aria-label={`Item ${index + 1} unit`}
                      value={item.unit}
                      onChange={(e) =>
                        changeItem(index, { unit: e.target.value })
                      }
                    />
                  </label>
                  <label className={styles.itemField}>
                    <span>Unit price</span>
                    <input
                      aria-label={`Item ${index + 1} price`}
                      type="number"
                      required
                      min="0"
                      step={v.currency === "IDR" ? "1" : "0.01"}
                      max="10000000000"
                      value={item.price}
                      onChange={(e) =>
                        changeItem(index, { price: Number(e.target.value) })
                      }
                    />
                  </label>
                  <span className={styles.itemAmount}>
                    {money(totals.amounts[index], v.currency)}
                  </span>
                  <div className={styles.itemActions}>
                    <button
                      type="button"
                      className={ui.iconButton}
                      aria-label={`Move item ${index + 1} up`}
                      disabled={index === 0}
                      onClick={() => moveItem(index, -1)}
                    >
                      <ArrowUp size={13} />
                    </button>
                    <button
                      type="button"
                      className={ui.iconButton}
                      aria-label={`Move item ${index + 1} down`}
                      disabled={index === v.items.length - 1}
                      onClick={() => moveItem(index, 1)}
                    >
                      <ArrowDown size={13} />
                    </button>
                    <button
                      type="button"
                      className={ui.iconButtonDangerIcon}
                      aria-label={`Remove item ${index + 1}`}
                      disabled={v.items.length === 1}
                      onClick={() =>
                        update({ items: v.items.filter((_, i) => i !== index) })
                      }
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ))}
              <button
                type="button"
                className={styles.btnAddItem}
                disabled={v.items.length >= 100}
                onClick={() =>
                  update({
                    items: [
                      ...v.items,
                      { description: "", quantity: 1, unit: "", price: 0 },
                    ],
                  })
                }
              >
                <Plus size={15} />
                Add custom item
              </button>
              <div className={styles.formGridAdjustments}>
                <Field label="Discount type">
                  <select
                    value={v.discountType}
                    onChange={(e) =>
                      update({
                        discountType: e.target.value as "percent" | "fixed",
                        discount: 0,
                      })
                    }
                  >
                    <option value="percent">Percentage (%)</option>
                    <option value="fixed">Fixed amount ({v.currency})</option>
                  </select>
                </Field>
                <Field label="Discount">
                  <input
                    type="number"
                    min="0"
                    max={v.discountType === "percent" ? 100 : totals.subtotal}
                    step="0.01"
                    value={v.discount}
                    onChange={(e) =>
                      update({ discount: Number(e.target.value) })
                    }
                  />
                </Field>
                <Field label="Tax (%)">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={v.tax}
                    onChange={(e) => update({ tax: Number(e.target.value) })}
                  />
                </Field>
              </div>
            </section>
            <section className={ui.panelFormPanel}>
              <div className={ui.sectionTitle}>
                <span className={styles.stepNumber}>04</span>
                <div>
                  <h2>Payment and notes</h2>
                </div>
              </div>
              <div className={styles.formGridThree}>
                <Field label="Bank name">
                  <input
                    value={v.payment.bank}
                    onChange={(e) =>
                      update({
                        payment: { ...v.payment, bank: e.target.value },
                      })
                    }
                  />
                </Field>
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
              <Field label="Invoice notes">
                <textarea
                  rows={3}
                  value={v.notes}
                  onChange={(e) => update({ notes: e.target.value })}
                />
              </Field>
              <details className={styles.businessDetails}>
                <summary>
                  Customize business information for this invoice{" "}
                  <ChevronDown size={15} />
                </summary>
                <BusinessFields
                  value={v.business}
                  onChange={(business) => update({ business })}
                />
              </details>
            </section>
          </div>
          <aside className={styles.summaryPanelPanel}>
            <h2>Invoice summary</h2>
            <p>{v.client.name || "No client selected"}</p>
            <div className={styles.summaryLine}>
              <span>Subtotal</span>
              <strong>{money(totals.subtotal, v.currency)}</strong>
            </div>
            <div className={styles.summaryLine}>
              <span>Discount</span>
              <span>−{money(totals.discount, v.currency)}</span>
            </div>
            <div className={styles.summaryLine}>
              <span>Tax ({v.tax}%)</span>
              <span>{money(totals.tax, v.currency)}</span>
            </div>
            <div className={styles.summaryTotal}>
              <span>Total due</span>
              <strong>{money(totals.total, v.currency)}</strong>
            </div>
            <small>
              <Clock3 size={14} />
              Due {displayDate(v.dueDate)}
            </small>
            <button className={ui.btnPrimaryFull} disabled={busy}>
              {busy ? "Saving…" : id ? "Save changes" : "Save draft"}
              <Check size={16} />
            </button>
            <button
              className={styles.btnFull}
              type="button"
              onClick={() => setPreview(true)}
            >
              <Eye size={16} />
              Preview invoice
            </button>
          </aside>
        </div>
      </form>
      {preview && (
        <Modal title="Invoice preview" onClose={() => setPreview(false)}>
          <InvoicePaper invoice={v} />
          <div className={ui.modalFooter}>
            <button className={ui.btn} onClick={() => setPreview(false)}>
              Continue editing
            </button>
            <button
              className={ui.btnPrimary}
              onClick={() => {
                setPreview(false);
                (
                  document.getElementById(
                    "invoice-form",
                  ) as HTMLFormElement | null
                )?.requestSubmit();
              }}
            >
              Save invoice
            </button>
          </div>
        </Modal>
      )}
      {addClient && (
        <Modal title="Add a client" onClose={() => setAddClient(false)}>
          <ClientForm
            initial={{ ...blankClient }}
            onClose={() => setAddClient(false)}
            onSaved={(client) => {
              setClients([...clients, client]);
              update({ clientId: client.id!, client: { ...client } });
              setAddClient(false);
              notify("Client saved and selected");
            }}
          />
        </Modal>
      )}
    </>
  );
}
