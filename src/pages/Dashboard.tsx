import { ui } from "../components/styles";
import { styles } from "./Dashboard.styles";
import {
  FileText,
  Users,
  Layers,
  Plus,
  ArrowUpRight,
  Check,
  Wallet,
  Clock3,
  CircleCheck,
  Leaf,
} from "lucide-react";
import type { DashboardData } from "../types";
import { money, downloadPdf } from "../lib";
import {
  Spinner,
  ErrorBox,
  Empty,
  PageTitle,
  useLoad,
  InvoiceTable,
  type Navigate,
} from "../components/ui";

export function Dashboard({
  navigate,
  notify,
}: {
  navigate: Navigate;
  notify: (m: string) => void;
}) {
  const { data, error, retry } = useLoad<DashboardData>("/dashboard");
  if (error) return <ErrorBox error={error} retry={retry} />;
  if (!data) return <Spinner />;
  const currencyKeys = Object.keys(data.amounts);
  const amounts = currencyKeys.length ? currencyKeys : ["IDR"];
  return (
    <>
      <PageTitle title="Overview">
        <button className={ui.btnPrimary} onClick={() => navigate("new")}>
          <Plus size={17} />
          Create invoice
        </button>
      </PageTitle>
      <div className={styles.welcomeBanner}>
        <div>
          <h2>Create an invoice</h2>
          <button className={ui.textButton} onClick={() => navigate("new")}>
            Create your next invoice <ArrowUpRight size={16} />
          </button>
        </div>
        <div className={styles.bannerArt} aria-hidden="true">
          <div className={styles.paper}>
            <div className={styles.paperHead}>
              <FileText size={23} />
              <span>INVOICE</span>
            </div>
            <div className={styles.paperLine} />
            <div className={styles.paperLineShort} />
            <div className={styles.paperRule} />
            <div className={styles.paperDots}>
              <span />
              <span />
            </div>
            <div className={styles.paperRule} />
            <div className={styles.paperPaid}>
              <CircleCheck size={17} /> Ready to send
            </div>
          </div>
          <span className={styles.artBadge}>
            <Check size={22} />
          </span>
          <Leaf className={styles.artLeaf} size={48} />
        </div>
      </div>
      <div className={styles.stats}>
        <div className={styles.stat}>
          <span>
            Total invoices <FileText size={18} />
          </span>
          <strong>{data.total}</strong>
          <small>
            {data.status.Draft} drafts · {data.status.Sent} sent ·{" "}
            {data.status.Paid} paid
          </small>
        </div>
        <div className={styles.stat}>
          <span>
            Total invoiced <Wallet size={18} />
          </span>
          {amounts.map((c) => (
            <strong className={styles.moneyStat} key={c}>
              {money(data.amounts[c]?.invoiced || 0, c)}
            </strong>
          ))}
          <small>Active invoices, excluding cancelled</small>
        </div>
        <div className={styles.stat}>
          <span>
            Payments received <CircleCheck size={18} />
          </span>
          {amounts.map((c) => (
            <strong className={styles.moneyStat} key={c}>
              {money(data.amounts[c]?.paid || 0, c)}
            </strong>
          ))}
          <small>{data.status.Paid} invoices marked paid</small>
        </div>
        <div className={styles.stat}>
          <span>
            Awaiting payment <Clock3 size={18} />
          </span>
          {amounts.map((c) => (
            <strong className={styles.moneyStat} key={c}>
              {money(data.amounts[c]?.outstanding || 0, c)}
            </strong>
          ))}
          <small>
            {data.unpaid} unpaid · {data.status.Cancelled} cancelled
          </small>
        </div>
      </div>
      <section className={ui.panel}>
        <div className={styles.panelHeading}>
          <div>
            <h2>
              Recent invoices <span className={styles.count}>{data.total}</span>
            </h2>
          </div>
          <button
            className={ui.textButton}
            onClick={() => navigate("invoices")}
          >
            View all invoices <ArrowUpRight size={16} />
          </button>
        </div>
        {data.recent.length ? (
          <InvoiceTable
            list={data.recent}
            navigate={navigate}
            onPdf={(i) => downloadPdf(i).catch((e) => notify(e.message))}
          />
        ) : (
          <Empty
            title="No invoices yet"
            action="Create invoice"
            onClick={() => navigate("new")}
          />
        )}
      </section>
      <div className={styles.quickLinks}>
        <button onClick={() => navigate("clients")}>
          <span className={ui.quickIcon}>
            <Users size={20} />
          </span>
          <span>
            <strong>Clients</strong>
          </span>
          <ArrowUpRight size={18} />
        </button>
        <button onClick={() => navigate("services")}>
          <span className={ui.quickIcon}>
            <Layers size={20} />
          </span>
          <span>
            <strong>Services</strong>
          </span>
          <ArrowUpRight size={18} />
        </button>
      </div>
    </>
  );
}
