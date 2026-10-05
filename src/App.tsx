import { ui } from "./components/styles";
import { styles } from "./App.styles";
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
} from "lucide-react";
import type { Settings } from "./types";
import { api, setCsrf } from "./lib";
import { Spinner, Empty, useConfirm, type Navigate } from "./components/ui";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { InvoiceList, InvoiceDetail, InvoiceEditor } from "./pages/Invoices";
import { Clients } from "./pages/Clients";
import { Services } from "./pages/Services";
import { SettingsPage } from "./pages/Settings";
import { BrandMark } from "./components/Brand";

export function App() {
  const [email, setEmail] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);
  const [route, setRoute] = useState(location.hash.slice(1) || "dashboard");
  const [menu, setMenu] = useState(false);
  const [toast, setToast] = useState("");
  const dirty = useRef(false);
  const routeRef = useRef(route);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const confirm = useConfirm();
  const setDirty = (v: boolean) => {
    dirty.current = v;
  };
  const notify = (message: string) => {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 6000);
  };
  const navigate: Navigate = async (next) => {
    if (
      dirty.current &&
      !(await confirm({
        title: "Leave this page?",
        message: "You have unsaved changes. Leave this page?",
        confirmLabel: "Leave page",
      }))
    )
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
    let handlingHashChange = false;
    const hash = () => {
      const next = location.hash.slice(1) || "dashboard";
      if (next === routeRef.current || handlingHashChange) return;
      handlingHashChange = true;
      void (async () => {
        try {
          if (
            dirty.current &&
            !(await confirm({
              title: "Leave this page?",
              message: "You have unsaved changes. Leave this page?",
              confirmLabel: "Leave page",
            }))
          ) {
            location.hash = routeRef.current;
            return;
          }
          dirty.current = false;
          routeRef.current = next;
          setRoute(next);
          setMenu(false);
        } finally {
          handlingHashChange = false;
        }
      })();
    };
    window.addEventListener("session-expired", expired);
    window.addEventListener("beforeunload", before);
    window.addEventListener("hashchange", hash);
    return () => {
      window.removeEventListener("session-expired", expired);
      window.removeEventListener("beforeunload", before);
      window.removeEventListener("hashchange", hash);
    };
  }, [confirm]);
  async function logout() {
    if (
      dirty.current &&
      !(await confirm({
        title: "Discard changes and sign out?",
        message: "Your unsaved changes will be lost.",
        confirmLabel: "Sign out",
      }))
    )
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
        title="Page not found"
        description="Return to the overview."
        action="Go to overview"
        onClick={() => navigate("dashboard")}
      />
    );
  return (
    <div className={styles.appShell}>
      {menu && (
        <div className={styles.sidebarOverlay} onClick={() => setMenu(false)} />
      )}
      <aside className={menu ? styles.sidebarOpen : styles.sidebar}>
        <button
          className={styles.brandPlainButton}
          onClick={() => navigate("dashboard")}
        >
          <BrandMark />
          <span>
            TuruDev<small>INVOICING WORKSPACE</small>
          </span>
        </button>
        <nav aria-label="Main navigation">
          {navigation.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              className={active === key ? "selected" : ""}
              onClick={() => navigate(key)}
            >
              <Icon size={19} />
              {label}
              {active === key && <span className={styles.navDot} />}
            </button>
          ))}
        </nav>
        <div className={styles.sidebarUser}>
          <span className={styles.avatarDark}>
            {email.slice(0, 2).toUpperCase()}
          </span>
          <span>
            <strong>Administrator</strong>
            <small>{email}</small>
          </span>
          <button
            className={ui.iconButton}
            title="Sign out"
            aria-label="Sign out"
            onClick={logout}
          >
            <LogOut size={17} />
          </button>
        </div>
      </aside>
      <div className={styles.mainShell}>
        <header className={styles.topbar}>
          <button
            className={styles.iconButtonMobileMenu}
            aria-label="Open navigation"
            onClick={() => setMenu(!menu)}
          >
            <Menu size={22} />
          </button>
          <div className={styles.breadcrumb}>
            Workspace <ChevronRight size={14} />
            <strong>
              {navigation.find((n) => n.key === active)?.label || "Overview"}
            </strong>
          </div>
          <div className={styles.topbarRight}>
            <span className={ui.avatar}>{email.slice(0, 2).toUpperCase()}</span>
          </div>
        </header>
        <main className={styles.workspaceContent}>{page}</main>
      </div>
      {toast && (
        <div className={styles.toast} role="status">
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
