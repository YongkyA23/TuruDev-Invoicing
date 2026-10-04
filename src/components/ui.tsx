import { useState, useEffect, useRef, type ReactNode } from "react";
import {
  FileText,
  Plus,
  ArrowUpRight,
  Download,
  Copy,
  X,
  LoaderCircle,
} from "lucide-react";
import type { Client, Invoice, Status } from "../types";
import { api, money, displayDate } from "../lib";

export const statuses: Status[] = ["Draft", "Sent", "Paid", "Cancelled"];
export type Navigate = (route: string) => void;
export function Spinner() {
  return (
    <div className="loading">
      <LoaderCircle size={24} className="spin" />
      <span>Loading your workspace…</span>
    </div>
  );
}

export function ErrorBox({
  error,
  retry,
}: {
  error: string;
  retry?: () => void;
}) {
  return (
    <div className="error" role="alert">
      {error}
      {retry && (
        <button className="text-button" onClick={retry}>
          Try again
        </button>
      )}
    </div>
  );
}

export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
      {hint && <small>{hint}</small>}
    </label>
  );
}

export function Badge({ status }: { status: Status }) {
  return (
    <span className={`badge ${status.toLowerCase()}`}>
      <i />
      {status}
    </span>
  );
}

export function Empty({
  title,
  description,
  action,
  onClick,
}: {
  title: string;
  description: string;
  action?: string;
  onClick?: () => void;
}) {
  return (
    <div className="empty">
      <div className="empty-icon">
        <FileText size={25} />
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
      {action && (
        <button className="btn primary" onClick={onClick}>
          <Plus size={16} />
          {action}
        </button>
      )}
    </div>
  );
}

export function PageTitle({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <div className="page-title">
      <div>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      <div className="title-actions">{children}</div>
    </div>
  );
}

export function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    d?.showModal();
    return () => d?.close();
  }, []);
  return (
    <dialog
      ref={ref}
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      <div className="modal-heading">
        <h2>{title}</h2>
        <button
          className="icon-button"
          aria-label="Close dialog"
          onClick={onClose}
        >
          <X size={20} />
        </button>
      </div>
      {children}
    </dialog>
  );
}

export function useLoad<T>(path: string, refresh = 0) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    let active = true;
    setError("");
    api<T>(path)
      .then((v) => {
        if (active) setData(v);
      })
      .catch((e) => {
        if (active) setError(e.message);
      });
    return () => {
      active = false;
    };
  }, [path, refresh, revision]);
  return { data, error, retry: () => setRevision((v) => v + 1) };
}

export function InvoiceTable({
  list,
  navigate,
  onDuplicate,
  onPdf,
}: {
  list: Invoice[];
  navigate: Navigate;
  onDuplicate?: (i: Invoice) => void;
  onPdf?: (i: Invoice) => void;
}) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Invoice</th>
            <th>Client</th>
            <th>Issued / due</th>
            <th className="align-right">Amount</th>
            <th>Status</th>
            <th className="align-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {list.map((i) => (
            <tr key={i.id}>
              <td>
                <button
                  className="invoice-link"
                  onClick={() => navigate(`invoice/${i.id}`)}
                >
                  {i.number}
                </button>
                {i.archived && <small className="subtext">Archived</small>}
              </td>
              <td>
                <span className="client-cell">
                  <span className="avatar mini">
                    {i.client.name.slice(0, 2).toUpperCase()}
                  </span>
                  <span>
                    {i.client.name}
                    <small>{i.client.company || "Client"}</small>
                  </span>
                </span>
              </td>
              <td>
                {displayDate(i.date)}
                <small className="subtext">Due {displayDate(i.dueDate)}</small>
              </td>
              <td className="align-right amount">
                {money(i.totals!.total, i.currency)}
              </td>
              <td>
                <Badge status={i.status} />
              </td>
              <td>
                <div className="row-actions">
                  <button
                    className="icon-button"
                    title="View invoice"
                    aria-label={`View ${i.number}`}
                    onClick={() => navigate(`invoice/${i.id}`)}
                  >
                    <ArrowUpRight size={16} />
                  </button>
                  {onDuplicate && (
                    <button
                      className="icon-button"
                      title="Duplicate invoice"
                      aria-label={`Duplicate ${i.number}`}
                      onClick={() => onDuplicate(i)}
                    >
                      <Copy size={15} />
                    </button>
                  )}
                  {onPdf && (
                    <button
                      className="icon-button"
                      title="Download PDF"
                      aria-label={`Download ${i.number}`}
                      onClick={() => onPdf(i)}
                    >
                      <Download size={15} />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
