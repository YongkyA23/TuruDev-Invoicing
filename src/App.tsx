import { useState, useEffect, useRef, type ReactNode } from "react";
import {
  LayoutDashboard,
  FileText,
  Users,
  Layers,
  Settings as SettingsIcon,
  LogOut,
  Menu,
  X,
  ChevronRight,
  CircleCheck,
  Leaf,
} from "lucide-react";
import type { Settings } from "./types";
import { api, setCsrf } from "./lib";
import { Spinner, Empty, type Navigate } from "./components/ui";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { InvoiceList, InvoiceDetail, InvoiceEditor } from "./pages/Invoices";
import { Clients } from "./pages/Clients";
import { Services } from "./pages/Services";
import { SettingsPage } from "./pages/Settings";

export function App() {
  const [email, setEmail] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);
  const [route, setRoute] = useState(location.hash.slice(1) || "dashboard");
  const [menu, setMenu] = useState(false);
  const [toast, setToast] = useState("");
  const dirty = useRef(false);
  const routeRef = useRef(route);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const setDirty = (v: boolean) => {
    dirty.current = v;
  };
  const notify = (message: string) => {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 6000);
  };
  const navigate: Navigate = (next) => {
    if (dirty.current && !confirm("You have unsaved changes. Leave this page?"))
      return;
    dirty.current = false;
    routeRef.current = next;
    setRoute(next);
    location.hash = next;
    setMenu(false);
    window.scrollTo(0, 0);
  };
  useEffect(() => {
    api<{ email: string; csrf: string }>("/auth/me")
      .then((r) => {
        setCsrf(r.csrf);
        setEmail(r.email);
      })
      .catch(() => {})
      .finally(() => setChecking(false));
    const expired = () => {
      setEmail(null);
      setCsrf("");
      dirty.current = false;
    };
    const before = (e: BeforeUnloadEvent) => {
      if (dirty.current) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    const hash = () => {
      const next = location.hash.slice(1) || "dashboard";
      if (next === routeRef.current) return;
      if (
        dirty.current &&
        !confirm("You have unsaved changes. Leave this page?")
      ) {
        location.hash = routeRef.current;
        return;
      }
      dirty.current = false;
      routeRef.current = next;
      setRoute(next);
      setMenu(false);
    };
    window.addEventListener("session-expired", expired);
    window.addEventListener("beforeunload", before);
    window.addEventListener("hashchange", hash);
    return () => {
      window.removeEventListener("session-expired", expired);
      window.removeEventListener("beforeunload", before);
      window.removeEventListener("hashchange", hash);
    };
  }, []);
  async function logout() {
    if (dirty.current && !confirm("Discard unsaved changes and sign out?"))
      return;
    try {
      await api("/auth/logout", "POST");
      setEmail(null);
      setCsrf("");
      dirty.current = false;
    } catch (e) {
      notify((e as Error).message);
    }
  }
  if (checking) return <Spinner />;
  if (!email)
    return (
      <Login
        onLogin={(e) => {
          setEmail(e);
          notify("Welcome to your workspace");
        }}
      />
    );
  const navigation = [
    { key: "dashboard", label: "Overview", icon: LayoutDashboard },
    { key: "invoices", label: "Invoices", icon: FileText },
    { key: "clients", label: "Clients", icon: Users },
    { key: "services", label: "Services", icon: Layers },
    { key: "settings", label: "Settings", icon: SettingsIcon },
  ];
  const active =
    route === "new" || route.startsWith("invoice/") || route.startsWith("edit/")
      ? "invoices"
      : route;
  let page: ReactNode;
  if (route === "dashboard")
    page = <Dashboard navigate={navigate} notify={notify} />;
  else if (route === "invoices")
    page = <InvoiceList navigate={navigate} notify={notify} />;
  else if (route === "clients")
    page = <Clients navigate={navigate} notify={notify} />;
  else if (route === "services") page = <Services notify={notify} />;
  else if (route === "settings")
    page = <SettingsPage notify={notify} setDirty={setDirty} />;
  else if (route === "new" || route.startsWith("edit/"))
    page = (
      <InvoiceEditor
        key={route}
        id={route.startsWith("edit/") ? route.split("/")[1] : undefined}
        navigate={navigate}
        notify={notify}
        setDirty={setDirty}
      />
    );
  else if (route.startsWith("invoice/"))
    page = (
      <InvoiceDetail
        key={route}
        id={route.split("/")[1]}
        navigate={navigate}
        notify={notify}
      />
    );
  else
    page = (
      <Empty
        title="This page wandered off."
        description="Head back to your workspace to pick up where you left off."
        action="Go to overview"
        onClick={() => navigate("dashboard")}
      />
    );
  return (
    <div className="app-shell">
      {menu && (
        <div className="sidebar-overlay" onClick={() => setMenu(false)} />
      )}
      <aside className={`sidebar ${menu ? "open" : ""}`}>
        <button
          className="brand plain-button"
          onClick={() => navigate("dashboard")}
        >
          <span className="brand-mark">t.</span>
          <span>
            TuruDev<small>INVOICING WORKSPACE</small>
          </span>
        </button>
        <span className="nav-label">WORKSPACE</span>
        <nav aria-label="Main navigation">
          {navigation.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              className={active === key ? "selected" : ""}
              onClick={() => navigate(key)}
            >
              <Icon size={19} />
              {label}
              {active === key && <span className="nav-dot" />}
            </button>
          ))}
        </nav>
        <div className="sidebar-tip">
          <Leaf size={23} />
          <strong>A little less busywork.</strong>
          <p>
            Save the details once.
            <br />
            Make room for good work.
          </p>
        </div>
        <div className="sidebar-user">
          <span className="avatar dark">{email.slice(0, 2).toUpperCase()}</span>
          <span>
            <strong>Team workspace</strong>
            <small>{email}</small>
          </span>
          <button
            className="icon-button"
            title="Sign out"
            aria-label="Sign out"
            onClick={logout}
          >
            <LogOut size={17} />
          </button>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <button
            className="icon-button mobile-menu"
            aria-label="Open navigation"
            onClick={() => setMenu(!menu)}
          >
            <Menu size={22} />
          </button>
          <div className="breadcrumb">
            Workspace <ChevronRight size={14} />
            <strong>
              {navigation.find((n) => n.key === active)?.label || "Overview"}
            </strong>
          </div>
          <div className="topbar-right">
            <span className="workspace-live">
              <span className="tiny-dot" />
              Team workspace
            </span>
            <span className="avatar">{email.slice(0, 2).toUpperCase()}</span>
          </div>
        </header>
        <main>{page}</main>
        <footer className="app-footer">
          <span>TuruDev · Thoughtfully simple invoicing.</span>
          <span>
            <Leaf size={13} />
            Room for the work that matters.
          </span>
        </footer>
      </div>
      {toast && (
        <div className="toast" role="status">
          <CircleCheck size={19} />
          <span>{toast}</span>
          <button
            aria-label="Dismiss notification"
            onClick={() => setToast("")}
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
