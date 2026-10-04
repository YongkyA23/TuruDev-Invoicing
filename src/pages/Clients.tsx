import { useState, type FormEvent } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Check,
  LoaderCircle,
  Eye,
} from "lucide-react";
import type { Client, Invoice } from "../types";
import { api, money, displayDate, blankClient } from "../lib";
import {
  Spinner,
  ErrorBox,
  Field,
  Badge,
  Empty,
  PageTitle,
  Modal,
  useLoad,
  type Navigate,
} from "../components/ui";

export function ClientForm({
  initial,
  onSaved,
  onClose,
}: {
  initial: Client;
  onSaved: (c: Client) => void;
  onClose: () => void;
}) {
  const [value, setValue] = useState({ ...initial });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (key: keyof Client, v: string) =>
    setValue({ ...value, [key]: v });
  async function save(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      onSaved(
        await api<Client>(
          `/clients${value.id ? "/" + value.id : ""}`,
          value.id ? "PUT" : "POST",
          value,
        ),
      );
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <form onSubmit={save}>
      {error && <ErrorBox error={error} />}
      <div className="form-grid">
        <Field label="Client name *">
          <input
            autoFocus
            required
            maxLength={150}
            value={value.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="e.g. Sarah Wijaya"
          />
        </Field>
        <Field label="Company">
          <input
            maxLength={150}
            value={value.company}
            onChange={(e) => set("company", e.target.value)}
            placeholder="Company name"
          />
        </Field>
        <Field label="Email">
          <input
            type="email"
            value={value.email}
            onChange={(e) => set("email", e.target.value)}
          />
        </Field>
        <Field label="Phone">
          <input
            value={value.phone}
            onChange={(e) => set("phone", e.target.value)}
          />
        </Field>
      </div>
      <Field label="Address">
        <textarea
          value={value.address}
          onChange={(e) => set("address", e.target.value)}
          rows={3}
        />
      </Field>
      <Field label="Tax ID">
        <input
          value={value.taxId}
          onChange={(e) => set("taxId", e.target.value)}
        />
      </Field>
      <Field label="Internal notes">
        <textarea
          value={value.notes}
          onChange={(e) => set("notes", e.target.value)}
          rows={2}
        />
      </Field>
      <div className="modal-footer">
        <button className="btn" type="button" onClick={onClose}>
          Cancel
        </button>
        <button className="btn primary" disabled={busy}>
          {busy ? (
            <LoaderCircle size={16} className="spin" />
          ) : (
            <Check size={16} />
          )}
          Save client
        </button>
      </div>
    </form>
  );
}

export function Clients({
  navigate,
  notify,
}: {
  navigate: Navigate;
  notify: (m: string) => void;
}) {
  const [revision, setRevision] = useState(0);
  const [edit, setEdit] = useState<Client | null>(null);
  const [view, setView] = useState<Client | null>(null);
  const [search, setSearch] = useState("");
  const { data, error, retry } = useLoad<Client[]>("/clients", revision);
  const list = data?.filter((c) =>
    `${c.name} ${c.company} ${c.email}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );
  async function remove(c: Client) {
    if (
      !confirm(
        `Delete ${c.name}? Existing invoices will keep their saved client information.`,
      )
    )
      return;
    try {
      await api(`/clients/${c.id}`, "DELETE");
      setRevision((v) => v + 1);
      notify("Client deleted");
    } catch (e) {
      notify((e as Error).message);
    }
  }
  return (
    <>
      <PageTitle
        eyebrow="GOOD RELATIONSHIPS, SAVED"
        title="Clients"
        description="Save their details once. Make the next invoice easier."
      >
        <button
          className="btn primary"
          onClick={() => setEdit({ ...blankClient })}
        >
          <Plus size={17} />
          Add client
        </button>
      </PageTitle>
      <section className="panel">
        <div className="filter-bar">
          <div className="search">
            <Search size={17} />
            <input
              aria-label="Search clients"
              placeholder="Search name, company, or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <span className="muted">{list?.length || 0} clients</span>
        </div>
        {error ? (
          <ErrorBox error={error} retry={retry} />
        ) : !list ? (
          <Spinner />
        ) : !list.length ? (
          <Empty
            title="A place for your clients."
            description="Save client information so it can be reused on future invoices."
            action="Add client"
            onClick={() => setEdit({ ...blankClient })}
          />
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Company</th>
                  <th>Email / phone</th>
                  <th className="align-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {list.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <button
                        className="client-cell plain-button"
                        onClick={() => setView(c)}
                      >
                        <span className="avatar">
                          {c.name.slice(0, 2).toUpperCase()}
                        </span>
                        <strong>{c.name}</strong>
                      </button>
                    </td>
                    <td>{c.company || "—"}</td>
                    <td>
                      {c.email || "—"}
                      <small className="subtext">{c.phone}</small>
                    </td>
                    <td>
                      <div className="row-actions">
                        <button
                          className="icon-button"
                          aria-label={`View ${c.name}`}
                          onClick={() => setView(c)}
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          className="icon-button"
                          aria-label={`Edit ${c.name}`}
                          onClick={() => setEdit(c)}
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          className="icon-button danger-icon"
                          aria-label={`Delete ${c.name}`}
                          onClick={() => remove(c)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      {edit && (
        <Modal
          title={edit.id ? "Edit client" : "Add a client"}
          onClose={() => setEdit(null)}
        >
          <ClientForm
            initial={edit}
            onClose={() => setEdit(null)}
            onSaved={() => {
              setEdit(null);
              setRevision((v) => v + 1);
              notify("Client saved");
            }}
          />
        </Modal>
      )}
      {view && (
        <Modal title={view.name} onClose={() => setView(null)}>
          <div className="client-detail">
            <p>{view.company}</p>
            <p className="pre-wrap">{view.address}</p>
            <p>
              {view.email}
              <br />
              {view.phone}
            </p>
            {view.taxId && <p>Tax ID: {view.taxId}</p>}
            {view.notes && <p className="note-box">{view.notes}</p>}
            <ClientHistory
              id={view.id!}
              navigate={(route) => {
                setView(null);
                navigate(route);
              }}
            />
          </div>
          <div className="modal-footer">
            <button
              className="btn primary"
              onClick={() => {
                setEdit(view);
                setView(null);
              }}
            >
              Edit client
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}

export function ClientHistory({
  id,
  navigate,
}: {
  id: number;
  navigate: Navigate;
}) {
  const { data, error, retry } = useLoad<Invoice[]>(
    `/invoices?clientId=${id}&archived=true`,
  );
  return (
    <>
      <h3>Invoice history</h3>
      {error ? (
        <ErrorBox error={error} retry={retry} />
      ) : !data ? (
        <Spinner />
      ) : data.length ? (
        <div className="history">
          {data.map((i) => (
            <button key={i.id} onClick={() => navigate(`invoice/${i.id}`)}>
              <span>
                {i.number}
                <small>{displayDate(i.date)}</small>
              </span>
              <Badge status={i.status} />
              <strong>{money(i.totals!.total, i.currency)}</strong>
            </button>
          ))}
        </div>
      ) : (
        <p className="muted">No invoices for this client yet.</p>
      )}
    </>
  );
}
