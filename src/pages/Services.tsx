import { ui } from "../components/styles";
import { styles } from "./Services.styles";
import { useState, type FormEvent } from "react";
import { Layers, Plus, Search, Pencil, Trash2 } from "lucide-react";
import type { Service, Settings, Invoice } from "../types";
import { api, money } from "../lib";
import {
  Spinner,
  ErrorBox,
  Field,
  Empty,
  PageTitle,
  Modal,
  useLoad,
  useConfirm,
} from "../components/ui";

export function Services({ notify }: { notify: (m: string) => void }) {
  const confirm = useConfirm();
  const [revision, setRevision] = useState(0);
  const [edit, setEdit] = useState<Service | null>(null);
  const [search, setSearch] = useState("");
  const { data, error, retry } = useLoad<Service[]>("/services", revision);
  const settings = useLoad<Settings>("/settings");
  const list = data?.filter((s) =>
    `${s.name} ${s.description}`.toLowerCase().includes(search.toLowerCase()),
  );
  async function remove(s: Service) {
    if (
      !(await confirm({
        title: "Delete service?",
        message: `Delete ${s.name}? Existing invoice items will stay unchanged.`,
        confirmLabel: "Delete service",
        destructive: true,
      }))
    )
      return;
    try {
      await api(`/services/${s.id}`, "DELETE");
      setRevision((v) => v + 1);
      notify("Service deleted");
    } catch (e) {
      notify((e as Error).message);
    }
  }
  return (
    <>
      <PageTitle title="Services">
        <button
          className={ui.btnPrimary}
          onClick={() =>
            setEdit({ name: "", description: "", price: 0, unit: "project" })
          }
        >
          <Plus size={17} />
          Add service
        </button>
      </PageTitle>
      <section className={ui.panel}>
        <div className={ui.filterBar}>
          <div className={ui.search}>
            <Search size={17} />
            <input
              aria-label="Search services"
              placeholder="Search services…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <span className={ui.muted}>
            {list?.length || 0} services · prices in default currency
          </span>
        </div>
        {error ? (
          <ErrorBox error={error} retry={retry} />
        ) : !list ? (
          <Spinner />
        ) : !list.length ? (
          <Empty
            title="No services found"
            action="Add service"
            onClick={() =>
              setEdit({ name: "", description: "", price: 0, unit: "project" })
            }
          />
        ) : (
          <div className={styles.serviceGrid}>
            {list.map((s) => (
              <article className={styles.serviceCard} key={s.id}>
                <div className={styles.serviceCardTop}>
                  <span className={ui.quickIcon}>
                    <Layers size={20} />
                  </span>
                  <div>
                    <button
                      className={ui.iconButton}
                      aria-label={`Edit ${s.name}`}
                      onClick={() => setEdit(s)}
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      className={ui.iconButtonDangerIcon}
                      aria-label={`Delete ${s.name}`}
                      onClick={() => remove(s)}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
                <h3>{s.name}</h3>
                <p>{s.description}</p>
                <div className={styles.servicePrice}>
                  <strong>
                    {money(s.price, settings.data?.currency || "IDR")}
                  </strong>
                  <span>/ {s.unit || "item"}</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
      {edit && (
        <Modal
          title={edit.id ? "Edit service" : "Add a service"}
          onClose={() => setEdit(null)}
        >
          <ServiceForm
            initial={edit}
            onClose={() => setEdit(null)}
            onSaved={() => {
              setEdit(null);
              setRevision((v) => v + 1);
              notify("Service saved");
            }}
          />
        </Modal>
      )}
    </>
  );
}

export function ServiceForm({
  initial,
  onClose,
  onSaved,
}: {
  initial: Service;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [v, set] = useState({ ...initial });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api(`/services${v.id ? "/" + v.id : ""}`, v.id ? "PUT" : "POST", v);
      onSaved();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <form onSubmit={submit}>
      {error && <ErrorBox error={error} />}
      <Field label="Service name *">
        <input
          autoFocus
          required
          value={v.name}
          onChange={(e) => set({ ...v, name: e.target.value })}
        />
      </Field>
      <Field label="Invoice description *">
        <textarea
          required
          rows={3}
          value={v.description}
          onChange={(e) => set({ ...v, description: e.target.value })}
        />
      </Field>
      <div className={ui.formGrid}>
        <Field label="Default price *">
          <input
            required
            type="number"
            min="0"
            max="10000000000"
            step="0.01"
            value={v.price}
            onChange={(e) => set({ ...v, price: Number(e.target.value) })}
          />
        </Field>
        <Field label="Unit">
          <input
            value={v.unit}
            onChange={(e) => set({ ...v, unit: e.target.value })}
            placeholder="project, hour, month…"
          />
        </Field>
      </div>
      <div className={ui.modalFooter}>
        <button className={ui.btn} type="button" onClick={onClose}>
          Cancel
        </button>
        <button className={ui.btnPrimary} disabled={busy}>
          Save service
        </button>
      </div>
    </form>
  );
}
