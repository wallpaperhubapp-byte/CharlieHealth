"use client";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  CircleHelp,
  ClipboardList,
  FileClock,
  Search,
  ShieldCheck,
  UsersRound,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

type AdminView = "Overview" | "Employees" | "Approvals" | "Audit log";
type Employee = {
  id: string;
  employeeNumber: string;
  name: string;
  jobTitle: string;
  status: string;
  workEmail: string;
  userRole: string | null;
  department: { id: string; name: string } | null;
};
type Approval = {
  id: string;
  category: string;
  startDate: string;
  endDate: string;
  requestedDays: string;
  employee: {
    name: string;
    jobTitle: string;
    department?: { name: string } | null;
  };
};
type AuditItem = { action: string; resource: string | null; createdAt: string };

async function getCsrf() {
  const response = await fetch("/api/auth/csrf", { cache: "no-store" });
  const data = await response.json();
  if (!response.ok) throw new Error("Session expired.");
  return data.csrfToken as string;
}

export default function AdminConsole({
  role,
  name,
}: {
  role: string;
  name: string;
}) {
  const [view, setView] = useState<AdminView>("Overview");
  const [summary, setSummary] = useState<{
    activeEmployees: number;
    pendingRequests: number;
    recentAudit: AuditItem[];
  } | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [audit, setAudit] = useState<AuditItem[]>([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [working, setWorking] = useState("");
  const [loading, setLoading] = useState(true);
  const canSeeEmployees = ["HR_ADMIN", "SUPER_ADMIN"].includes(role);
  const canSeeApprovals = ["MANAGER", "HR_ADMIN", "SUPER_ADMIN"].includes(role);
  const canSeeAudit = ["HR_ADMIN", "PAYROLL_ADMIN", "SUPER_ADMIN"].includes(
    role,
  );

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const response = await fetch("/api/admin/summary", {
          cache: "no-store",
        });
        if (!response.ok)
          throw new Error("This dashboard is temporarily unavailable.");
        const data = await response.json();
        if (active) setSummary(data);
      } catch {
        if (active)
          setError(
            "Administrator data couldn’t be loaded. Please refresh and try again.",
          );
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (view === "Employees" && canSeeEmployees) {
      fetch(`/api/admin/employees?q=${encodeURIComponent(query)}`, {
        cache: "no-store",
      })
        .then((response) => (response.ok ? response.json() : Promise.reject()))
        .then((data) => setEmployees(data.employees))
        .catch(() => setError("The employee directory couldn’t be loaded."));
    }
    if (view === "Approvals" && canSeeApprovals) {
      fetch("/api/admin/time-off", { cache: "no-store" })
        .then((response) => (response.ok ? response.json() : Promise.reject()))
        .then((data) => setApprovals(data.requests))
        .catch(() => setError("The approval queue couldn’t be loaded."));
    }
    if (view === "Audit log" && canSeeAudit) {
      fetch("/api/admin/audit", { cache: "no-store" })
        .then((response) => (response.ok ? response.json() : Promise.reject()))
        .then((data) => setAudit(data.logs))
        .catch(() => setError("Audit activity couldn’t be loaded."));
    }
  }, [view, query, canSeeEmployees, canSeeApprovals, canSeeAudit]);

  async function decide(requestId: string, status: "APPROVED" | "DENIED") {
    setWorking(requestId);
    setError("");
    try {
      const csrfToken = await getCsrf();
      const response = await fetch(`/api/admin/time-off/${requestId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error();
      setApprovals((items) => items.filter((item) => item.id !== requestId));
    } catch {
      setError("That decision couldn’t be saved. Please try again.");
    } finally {
      setWorking("");
    }
  }

  async function updateRole(employeeId: string, roleValue: string) {
    setWorking(employeeId);
    setError("");
    try {
      const csrfToken = await getCsrf();
      const response = await fetch(`/api/admin/employees/${employeeId}/role`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
        body: JSON.stringify({ role: roleValue }),
      });
      if (!response.ok) throw new Error();
      setEmployees((items) =>
        items.map((employee) =>
          employee.id === employeeId
            ? { ...employee, userRole: roleValue }
            : employee,
        ),
      );
    } catch {
      setError("This role couldn’t be changed. The update was not saved.");
    } finally {
      setWorking("");
    }
  }

  const views: AdminView[] = [
    "Overview",
    ...(canSeeEmployees ? ["Employees" as const] : []),
    ...(canSeeApprovals ? ["Approvals" as const] : []),
    ...(canSeeAudit ? ["Audit log" as const] : []),
  ];
  return (
    <main className="admin-screen">
      <header className="admin-header">
        <a className="admin-back" href="/">
          <ArrowLeft size={16} /> Employee portal
        </a>
        <span className="admin-role">
          <ShieldCheck size={14} /> Authorized administrator ·{" "}
          {role.replaceAll("_", " ")}
        </span>
        <span className="admin-name">{name}</span>
      </header>
      <div className="admin-shell">
        <div className="admin-heading">
          <span className="eyebrow">CHARLIE HEALTH · INTERNAL</span>
          <h1>People operations.</h1>
          <p>
            Administrative workspace · access is logged and role-restricted.
          </p>
        </div>
        <nav className="admin-nav" aria-label="Administrator workspace">
          {views.map((item) => (
            <button
              key={item}
              onClick={() => {
                setView(item);
                setError("");
              }}
              className={view === item ? "admin-nav-active" : ""}
            >
              {item === "Overview" ? (
                <ClipboardList size={15} />
              ) : item === "Employees" ? (
                <UsersRound size={15} />
              ) : item === "Approvals" ? (
                <Check size={15} />
              ) : (
                <FileClock size={15} />
              )}
              {item}
            </button>
          ))}
        </nav>
        {error && (
          <div className="admin-error" role="alert">
            <CircleHelp size={16} />
            {error}
          </div>
        )}
        {view === "Overview" && (
          <>
            <div className="admin-metrics">
              <article>
                <span>ACTIVE EMPLOYEES</span>
                <strong>
                  {loading ? "—" : (summary?.activeEmployees ?? "—")}
                </strong>
                <small>In the current directory</small>
              </article>
              <article>
                <span>LEAVE REQUESTS</span>
                <strong>
                  {loading ? "—" : (summary?.pendingRequests ?? "—")}
                </strong>
                <small>Awaiting an authorized review</small>
              </article>
              <article>
                <span>ACCESS</span>
                <strong>Restricted</strong>
                <small>Role-scoped, audited actions</small>
              </article>
            </div>
            <section className="admin-panel">
              <div className="admin-panel-title">
                <h2>Recent audit activity</h2>
                <button onClick={() => canSeeAudit && setView("Audit log")}>
                  View audit log <ArrowRight size={14} />
                </button>
              </div>
              {summary?.recentAudit?.length ? (
                summary.recentAudit.map((item, index) => (
                  <div
                    className="admin-audit-row"
                    key={`${item.action}${index}`}
                  >
                    <span className="audit-status">
                      <ShieldCheck size={15} />
                    </span>
                    <span>
                      <strong>
                        {item.action.replaceAll("_", " ").toLowerCase()}
                      </strong>
                      <small>{item.resource ?? "Account"}</small>
                    </span>
                    <time>
                      {new Intl.DateTimeFormat("en", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      }).format(new Date(item.createdAt))}
                    </time>
                  </div>
                ))
              ) : (
                <div className="admin-empty">No recent events.</div>
              )}
            </section>
          </>
        )}
        {view === "Employees" && (
          <section className="admin-panel">
            <div className="admin-panel-title">
              <h2>Employee directory</h2>
              <span>Up to 100 matching employees</span>
            </div>
            <label className="admin-search">
              <Search size={16} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search name or employee ID"
              />
            </label>
            <div className="admin-table-head">
              <span>EMPLOYEE</span>
              <span>DEPARTMENT</span>
              <span>
                {role === "SUPER_ADMIN" ? "ACCOUNT ROLE" : "JOB TITLE"}
              </span>
              <span>STATUS</span>
            </div>
            {employees.map((employee) => (
              <div className="admin-table-row" key={employee.id}>
                <span>
                  <strong>{employee.name}</strong>
                  <small>
                    {employee.employeeNumber} · {employee.workEmail}
                  </small>
                </span>
                <span>{employee.department?.name ?? "—"}</span>
                <span>
                  {role === "SUPER_ADMIN" && employee.userRole ? (
                    <select
                      className="admin-role-select"
                      aria-label={`Role for ${employee.name}`}
                      value={employee.userRole}
                      disabled={working === employee.id}
                      onChange={(event) =>
                        void updateRole(employee.id, event.target.value)
                      }
                    >
                      <option value="EMPLOYEE">Employee</option>
                      <option value="MANAGER">Manager</option>
                      <option value="HR_ADMIN">HR Admin</option>
                      <option value="PAYROLL_ADMIN">Payroll Admin</option>
                      <option value="SUPER_ADMIN">Super Admin</option>
                    </select>
                  ) : (
                    (employee.userRole?.replaceAll("_", " ") ??
                    employee.jobTitle)
                  )}
                </span>
                <span
                  className={`admin-status admin-status-${employee.status.toLowerCase()}`}
                >
                  {employee.status.replaceAll("_", " ")}
                </span>
              </div>
            ))}
            {!employees.length && (
              <div className="admin-empty">
                {loading
                  ? "Loading employee directory…"
                  : "No matching employees."}
              </div>
            )}
          </section>
        )}
        {view === "Approvals" && (
          <section className="admin-panel">
            <div className="admin-panel-title">
              <h2>Time-off approvals</h2>
              <span>{approvals.length} pending</span>
            </div>
            {approvals.map((item) => (
              <div className="approval-row" key={item.id}>
                <div>
                  <strong>{item.employee.name}</strong>
                  <small>
                    {item.employee.jobTitle} ·{" "}
                    {item.employee.department?.name ?? "Team"}
                  </small>
                </div>
                <div>
                  <strong>
                    {item.category} · {item.requestedDays} days
                  </strong>
                  <small>
                    {new Intl.DateTimeFormat("en", {
                      dateStyle: "medium",
                      timeZone: "UTC",
                    }).format(new Date(item.startDate))}{" "}
                    –{" "}
                    {new Intl.DateTimeFormat("en", {
                      dateStyle: "medium",
                      timeZone: "UTC",
                    }).format(new Date(item.endDate))}
                  </small>
                </div>
                <div className="approval-actions">
                  <button
                    disabled={working === item.id}
                    aria-label={`Approve leave for ${item.employee.name}`}
                    onClick={() => void decide(item.id, "APPROVED")}
                  >
                    <Check size={14} /> Approve
                  </button>
                  <button
                    disabled={working === item.id}
                    aria-label={`Decline leave for ${item.employee.name}`}
                    onClick={() => void decide(item.id, "DENIED")}
                  >
                    <X size={14} /> Decline
                  </button>
                </div>
              </div>
            ))}
            {!approvals.length && (
              <div className="admin-empty">
                No requests are waiting for review.
              </div>
            )}
          </section>
        )}
        {view === "Audit log" && (
          <section className="admin-panel">
            <div className="admin-panel-title">
              <h2>Security audit log</h2>
              <span>Most recent 200 events</span>
            </div>
            {audit.map((item, index) => (
              <div className="admin-audit-row" key={`${item.action}${index}`}>
                <span className="audit-status">
                  <ShieldCheck size={15} />
                </span>
                <span>
                  <strong>
                    {item.action.replaceAll("_", " ").toLowerCase()}
                  </strong>
                  <small>{item.resource ?? "Account"}</small>
                </span>
                <time>
                  {new Intl.DateTimeFormat("en", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  }).format(new Date(item.createdAt))}
                </time>
              </div>
            ))}
            {!audit.length && (
              <div className="admin-empty">
                No audit events have been recorded.
              </div>
            )}
          </section>
        )}
        <footer className="admin-footer">
          <ShieldCheck size={14} /> Employee data is only shown to roles
          authorized to access it.
        </footer>
      </div>
    </main>
  );
}
