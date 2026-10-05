import { ui } from "./styles";
import { styles } from "./ui.styles";
import {
  createContext,
  useCallback,
  useContext,
  useState,
  useEffect,
  useRef,
  useId,
  type ReactNode,
} from "react";
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
export type Navigate = (route: string) => void | Promise<void>;
export function Spinner() {
  return (
    <div className={styles.loading}>
      <LoaderCircle size={24} className={ui.spin} />
      <span>Loading…</span>
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
    <div className={styles.error} role="alert">
      {error}
      {retry && (
        <button className={ui.textButton} onClick={retry}>
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
    <label className={styles.field}>
      <span>{label}</span>
      {children}
      {hint && <small>{hint}</small>}
    </label>
  );
}

export function Badge({ status }: { status: Status }) {
  return (
    <span className={`${styles.badge} ${status.toLowerCase()}`}>
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
  description?: string;
  action?: string;
  onClick?: () => void;
}) {
  return (
    <div className={styles.empty}>
      <div className={styles.emptyIcon}>
        <FileText size={25} />
      </div>
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {action && (
        <button className={ui.btnPrimary} onClick={onClick}>
          <Plus size={16} />
          {action}
        </button>
      )}
    </div>
  );
}

export function PageTitle({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <div className={styles.pageTitle}>
      <div>
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      <div className={styles.titleActions}>{children}</div>
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
  const titleId = useId();
  useEffect(() => {
    const d = ref.current;
    d?.showModal();
    return () => d?.close();
  }, []);
  return (
    <dialog
      className={styles.dialog}
      ref={ref}
      aria-labelledby={titleId}
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      <div className={styles.modalHeading}>
        <h2 id={titleId}>{title}</h2>
        <button
          className={ui.iconButton}
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

type ConfirmOptions = {
  title: string;
  message: string;
  confirmLabel?: string;
  destructive?: boolean;
};

type ConfirmAction = (options: ConfirmOptions) => Promise<boolean>;
const ConfirmContext = createContext<ConfirmAction | null>(null);

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const resolve = useRef<((confirmed: boolean) => void) | null>(null);
  const confirm = useCallback((next: ConfirmOptions) => {
    resolve.current?.(false);
    return new Promise<boolean>((done) => {
      resolve.current = done;
      setOptions(next);
    });
  }, []);
  const finish = (confirmed: boolean) => {
    resolve.current?.(confirmed);
    resolve.current = null;
    setOptions(null);
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {options && (
        <Modal title={options.title} onClose={() => finish(false)}>
          <p
            id="confirm-dialog-message"
            className="text-[13px] leading-6 text-muted"
          >
            {options.message}
          </p>
          <div className={ui.modalFooter}>
            <button className={ui.btn} onClick={() => finish(false)} autoFocus>
              Cancel
            </button>
            <button
              className={options.destructive ? ui.btnDanger : ui.btnPrimary}
              onClick={() => finish(true)}
            >
              {options.confirmLabel || "Continue"}
            </button>
          </div>
        </Modal>
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const confirm = useContext(ConfirmContext);
  if (!confirm) throw new Error("useConfirm must be used within ConfirmProvider");
  return confirm;
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
    <div className={ui.tableWrap}>
      <table>
        <thead>
          <tr>
            <th>Invoice</th>
            <th>Client</th>
            <th>Issued / due</th>
            <th className={ui.alignRight}>Amount</th>
            <th>Status</th>
            <th className={ui.alignRight}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {list.map((i) => (
            <tr key={i.id}>
              <td>
                <button
                  className={styles.invoiceLink}
                  onClick={() => navigate(`invoice/${i.id}`)}
                >
                  {i.number}
                </button>
                {i.archived && <small className={ui.subtext}>Archived</small>}
              </td>
              <td>
                <span className={styles.clientCell}>
                  <span className={styles.avatarMini}>
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
                <small className={ui.subtext}>
                  Due {displayDate(i.dueDate)}
                </small>
              </td>
              <td className={styles.alignRightAmount}>
                {money(i.totals!.total, i.currency)}
              </td>
              <td>
                <Badge status={i.status} />
              </td>
              <td>
                <div className={ui.rowActions}>
                  <button
                    className={ui.iconButton}
                    title="View invoice"
                    aria-label={`View ${i.number}`}
                    onClick={() => navigate(`invoice/${i.id}`)}
                  >
                    <ArrowUpRight size={16} />
                  </button>
                  {onDuplicate && (
                    <button
                      className={ui.iconButton}
                      title="Duplicate invoice"
                      aria-label={`Duplicate ${i.number}`}
                      onClick={() => onDuplicate(i)}
                    >
                      <Copy size={15} />
                    </button>
                  )}
                  {onPdf && (
                    <button
                      className={ui.iconButton}
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
