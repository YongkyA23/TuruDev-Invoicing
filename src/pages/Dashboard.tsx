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
      <PageTitle
        eyebrow="A LITTLE CLARITY FOR YOUR DAY"
        title="Your business, at a glance."
        description="Less time on paperwork. More time doing what you love."
      >
        <button className="btn primary" onClick={() => navigate("new")}>
          <Plus size={17} />
          Create invoice
        </button>
      </PageTitle>
      <div className="welcome-banner">
        <div>
          <span className="pill">
            <span className="tiny-dot" /> YOUR INVOICING, SIMPLIFIED
          </span>
          <h2>From good work to getting paid.</h2>
          <p>Your clients, services, and invoices. All in one calm place.</p>
          <button className="text-button" onClick={() => navigate("new")}>
            Create your next invoice <ArrowUpRight size={16} />
          </button>
        </div>
        <div className="banner-art" aria-hidden="true">
          <div className="paper">
            <div className="paper-head">
              <FileText size={23} />
              <span>INVOICE</span>
            </div>
            <div className="paper-line" />
            <div className="paper-line short" />
            <div className="paper-rule" />
            <div className="paper-dots">
              <span />
              <span />
            </div>
            <div className="paper-rule" />
            <div className="paper-paid">
              <CircleCheck size={17} /> Ready to send
            </div>
          </div>
          <span className="art-badge">
            <Check size={22} />
          </span>
          <Leaf className="art-leaf" size={48} />
        </div>
      </div>
      <div className="stats">
        <div className="stat">
          <span>
            Total invoices <FileText size={18} />
          </span>
          <strong>{data.total}</strong>
          <small>
            {data.status.Draft} drafts · {data.status.Sent} sent ·{" "}
            {data.status.Paid} paid
          </small>
        </div>
        <div className="stat">
          <span>
            Total invoiced <Wallet size={18} />
          </span>
          {amounts.map((c) => (
            <strong className="money-stat" key={c}>
              {money(data.amounts[c]?.invoiced || 0, c)}
            </strong>
          ))}
          <small>Active invoices, excluding cancelled</small>
        </div>
        <div className="stat">
          <span>
            Payments received <CircleCheck size={18} />
          </span>
          {amounts.map((c) => (
            <strong className="money-stat" key={c}>
              {money(data.amounts[c]?.paid || 0, c)}
            </strong>
          ))}
          <small>{data.status.Paid} invoices marked paid</small>
        </div>
        <div className="stat">
          <span>
            Awaiting payment <Clock3 size={18} />
          </span>
          {amounts.map((c) => (
            <strong className="money-stat" key={c}>
              {money(data.amounts[c]?.outstanding || 0, c)}
            </strong>
          ))}
          <small>
            {data.unpaid} unpaid · {data.status.Cancelled} cancelled
          </small>
        </div>
      </div>
      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>
              Recent invoices <span className="count">{data.total}</span>
            </h2>
            <p>Your latest work, neatly kept.</p>
          </div>
          <button className="text-button" onClick={() => navigate("invoices")}>
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
            title="Your first invoice starts here."
            description="Save a client, add your services, and turn your work into a professional invoice."
            action="Create invoice"
            onClick={() => navigate("new")}
          />
        )}
      </section>
      <div className="quick-links">
        <button onClick={() => navigate("clients")}>
          <span className="quick-icon">
            <Users size={20} />
          </span>
          <span>
            <strong>Good relationships, saved.</strong>
            <small>Keep your client details ready for next time.</small>
          </span>
          <ArrowUpRight size={18} />
        </button>
        <button onClick={() => navigate("services")}>
          <span className="quick-icon">
            <Layers size={20} />
          </span>
          <span>
            <strong>Your best work, on repeat.</strong>
            <small>Save your services and skip the retyping.</small>
          </span>
          <ArrowUpRight size={18} />
        </button>
      </div>
    </>
  );
}
