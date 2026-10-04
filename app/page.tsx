"use client";

import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Bell,
  BookOpen,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Clock3,
  Download,
  FileCheck2,
  FileText,
  Fingerprint,
  HeartPulse,
  Home,
  LogOut,
  Menu,
  MessageSquareText,
  MoreHorizontal,
  PartyPopper,
  Plus,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  Sun,
  UserRound,
  UsersRound,
  WalletCards,
  X,
} from "lucide-react";
import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { DEMO_PAYROLL } from "@/lib/demo-data";

const navigation = [
  { label: "Dashboard", icon: Home },
  { label: "My profile", icon: UserRound },
  { label: "Payroll", icon: WalletCards },
  { label: "Benefits", icon: HeartPulse },
  { label: "Time off", icon: CalendarDays },
  { label: "Documents", icon: FileText },
  { label: "Performance", icon: Sparkles },
  { label: "Learning", icon: BookOpen },
  { label: "Directory", icon: UsersRound },
  { label: "Announcements", icon: MessageSquareText },
];

const avatarColors = ["#d8e9dc", "#e8dacf", "#d9e5f2", "#f1e4c9", "#e4dcef"];

const coworkers = [
  {
    name: "Jordan Lee",
    role: "People Operations Partner",
    dept: "People & Culture",
    place: "Brooklyn, NY",
    initials: "JL",
  },
  {
    name: "Sam Rivera",
    role: "Operations Lead",
    dept: "Operations",
    place: "Remote · Austin, TX",
    initials: "SR",
  },
  {
    name: "Taylor Bennett",
    role: "Clinical Programs Manager",
    dept: "Clinical",
    place: "Remote · Denver, CO",
    initials: "TB",
  },
  {
    name: "Casey Nguyen",
    role: "Payroll Specialist",
    dept: "Finance",
    place: "New York, NY",
    initials: "CN",
  },
  {
    name: "Morgan Patel",
    role: "Product Designer",
    dept: "Product & Design",
    place: "Remote · Seattle, WA",
    initials: "MP",
  },
  {
    name: "Alex Morgan",
    role: "Operations Coordinator",
    dept: "Operations",
    place: "Remote · Portland, OR",
    initials: "AM",
  },
];

type AnnouncementItem = {
  id: number;
  recordId?: string;
  category: string;
  date: string;
  title: string;
  body: string;
  unread: boolean;
  color: string;
};

const announcementsSeed: AnnouncementItem[] = [
  {
    id: 1,
    category: "People & culture",
    date: "Today",
    title: "Your open enrollment window is coming up",
    body: "The fall benefits enrollment window opens October 14. Take a moment to review your current elections and explore the plan information in Benefits.",
    unread: true,
    color: "mint",
  },
  {
    id: 2,
    category: "Company",
    date: "Sep 26",
    title: "A note from our leadership team",
    body: "As we move into the new quarter, we want to thank everyone for the care and thought you bring to your work. We have shared a short update on what is ahead.",
    unread: true,
    color: "lavender",
  },
  {
    id: 3,
    category: "Benefits",
    date: "Sep 22",
    title: "Benefits plan documents are available",
    body: "The latest plan summaries and coverage information are now in your Benefits portal. Please review the documents before enrollment opens.",
    unread: false,
    color: "peach",
  },
  {
    id: 4,
    category: "Operations",
    date: "Sep 18",
    title: "Upcoming company holiday · Indigenous Peoples’ Day",
    body: "Our US offices will be closed on Monday, October 12. Please coordinate with your team if you provide coverage that day.",
    unread: false,
    color: "blue",
  },
];

const initialDocuments = [
  {
    title: "Employee handbook",
    category: "Company policies",
    date: "Aug 12, 2026",
    status: "Available",
  },
  {
    title: "Q3 pay statement",
    category: "Pay statements",
    date: "Sep 15, 2026",
    status: "Available",
  },
  {
    title: "2025 W-2",
    category: "Tax documents",
    date: "Jan 31, 2026",
    status: "Available",
  },
  {
    title: "Benefits overview",
    category: "Benefits documents",
    date: "Sep 02, 2026",
    status: "Available",
  },
  {
    title: "Offer letter",
    category: "Employment documents",
    date: "May 13, 2024",
    status: "Available",
  },
  {
    title: "Mid-year check-in",
    category: "Performance documents",
    date: "Jul 03, 2026",
    status: "Available",
  },
];

type Person = {
  first: string;
  preferred: string;
  middle: string;
  last: string;
  birth: string;
  pronouns: string;
  personalEmail: string;
  workEmail: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  contact: string;
  relationship: string;
  contactPhone: string;
  contactEmail: string;
};

const initialPerson: Person = {
  first: "Alex",
  preferred: "Alex",
  middle: "",
  last: "Morgan",
  birth: "1994-06-18",
  pronouns: "They / them",
  personalEmail: "alex.morgan@example.test",
  workEmail: "alex.morgan@charliehealth.example",
  phone: "(555) 013-2042",
  address: "1847 NW Overlook Ave",
  city: "Portland",
  state: "OR",
  zip: "97209",
  country: "United States",
  contact: "Riley Morgan",
  relationship: "Sibling",
  contactPhone: "(555) 013-8821",
  contactEmail: "riley@example.test",
};

const emptyPerson: Person = {
  first: "",
  preferred: "",
  middle: "",
  last: "",
  birth: "",
  pronouns: "",
  personalEmail: "",
  workEmail: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  zip: "",
  country: "",
  contact: "",
  relationship: "Other",
  contactPhone: "",
  contactEmail: "",
};

type TimeOff = {
  id: number | string;
  category: string;
  start: string;
  end: string;
  days: number;
  status: string;
  note?: string;
};

type EmploymentDetails = {
  employeeNumber: string;
  jobTitle: string;
  department: string;
  manager: string;
  employmentType: string;
  status: string;
  hireDate: string;
  workLocation: string;
  workSchedule: string;
  team: string;
};

type SessionUser = {
  name: string;
  employeeId: string;
  role: string;
  title: string;
  department: string;
  demo: boolean;
};

function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`brand ${compact ? "brand-compact" : ""}`}
      aria-label="Charlie Health"
    >
      <span className="brand-mark" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
      </span>
      <span className="brand-name">
        charlie<span>health</span>
      </span>
    </div>
  );
}

function Avatar({
  initials,
  size = "normal",
  imageUrl,
}: {
  initials: string;
  size?: "normal" | "small" | "large";
  imageUrl?: string | null;
}) {
  if (imageUrl) {
    return (
      <span
        className={`avatar avatar-${size}`}
        aria-label="Profile photo"
        style={{
          overflow: "hidden",
          padding: 0,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <img
          src={imageUrl}
          alt="Profile"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
        />
      </span>
    );
  }
  return (
    <span className={`avatar avatar-${size}`} aria-hidden="true">
      {initials}
    </span>
  );
}

function DemoPill({ demo }: { demo: boolean }) {
  if (!demo)
    return null;
  return (
    <span className="demo-pill">
      <span /> Demo mode · fictional data
    </span>
  );
}

async function csrfToken() {
  const response = await fetch("/api/auth/csrf", { cache: "no-store" });
  if (!response.ok) throw new Error("Your session has expired. Sign in again.");
  return (await response.json()).csrfToken as string;
}

function formatPortalDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value.slice(0, 10)}T00:00:00.000Z`));
}

function SignIn({ onSignIn }: { onSignIn: (user: SessionUser) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function csrf() {
    const response = await fetch("/api/auth/csrf", { cache: "no-store" });
    if (!response.ok) throw new Error("Sign-in is temporarily unavailable.");
    return response.json() as Promise<{ csrfToken: string }>;
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setNotice("");
    try {
      const { csrfToken } = await csrf();
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
        body: JSON.stringify({ email, password, rememberMe }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(
          data.error ??
            "We couldn’t sign you in. Check your details and try again.",
        );
        return;
      }
      onSignIn(data.user);
    } catch {
      setError("We couldn’t reach the sign-in service. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function enterDemo() {
    setLoading(true);
    setError("");
    setNotice("");
    try {
      const { csrfToken } = await csrf();
      const response = await fetch("/api/auth/demo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
        body: "{}",
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error ?? "Demo access is currently unavailable.");
      onSignIn(data.user);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Demo access is currently unavailable.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function forgotPassword() {
    setError("");
    setNotice("");
    if (!email.trim()) {
      setError(
        "Enter your work email above and we’ll send a reset link if there’s an account for it.",
      );
      return;
    }
    setLoading(true);
    try {
      const { csrfToken } = await csrf();
      await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
        body: JSON.stringify({ email }),
      });
      setNotice(
        "If that email belongs to an account, a reset link is on its way.",
      );
    } catch {
      setError(
        "We couldn’t reach the password reset service. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-screen">
      <div className="auth-side">
        <div className="auth-side-top">
          <Logo />
          <span className="auth-authorized">
            <ShieldCheck size={14} /> Authorized employee portal
          </span>
        </div>
        <div className="auth-welcome">
          <span className="eyebrow">YOUR WORK, IN ONE PLACE</span>
          <h1>
            Good work
            <br />
            starts with <em>feeling</em>
            <br />
            supported.
          </h1>
          <p>
            A considered space for the people who make a difference every day.
          </p>
        </div>
        <div className="auth-side-bottom">
          <div className="auth-art" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
          </div>
          <span>Care for people starts with care for each other.</span>
          <span className="auth-copyright">
            © 2026 Charlie Health · Internal use only
          </span>
        </div>
      </div>
      <div className="auth-main">
        <div className="auth-main-top">
          <span>Already part of our team?</span>
          <a href="mailto:people@example.test">
            Get help <ArrowRight size={14} />
          </a>
        </div>
        <section className="auth-card" aria-labelledby="sign-in-heading">
          <div className="auth-card-kicker">
            <span className="live-dot" /> Secure employee sign in
          </div>
          <h2 id="sign-in-heading">Welcome back.</h2>
          <p className="auth-subtitle">
            Sign in to your Charlie Health employee account.
          </p>
          <form onSubmit={submit} className="sign-in-form">
            <label htmlFor="email">Work email</label>
            <div className="input-wrap">
              <UserRound size={17} />
              <input
                id="email"
                autoComplete="username"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@charliehealth.com"
                required
              />
            </div>
            <div className="password-label">
              <label htmlFor="password">Password</label>
              <button
                type="button"
                className="text-button"
                onClick={forgotPassword}
                disabled={loading}
              >
                Forgot password?
              </button>
            </div>
            <div className="input-wrap">
              <ShieldCheck size={17} />
              <input
                id="password"
                autoComplete="current-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                required
                minLength={12}
              />
              <button
                className="reveal-button"
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            <label className="remember-row">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(event) => setRememberMe(event.target.checked)}
              />{" "}
              <span>Keep me signed in for 30 days</span>
            </label>
            {error && (
              <div className="form-message error-message" role="alert">
                <CircleHelp size={16} />
                {error}
              </div>
            )}
            {notice && (
              <div className="form-message success-message" role="status">
                <CheckCircle2 size={16} />
                {notice}
              </div>
            )}
            <button
              className="primary-button sign-in-button"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner" /> Signing in…
                </>
              ) : (
                <>
                  Sign in securely <ArrowRight size={17} />
                </>
              )}
            </button>
          </form>
          <div className="auth-divider">
            <span />
            or
            <span />
          </div>
          <button
            className="demo-button"
            type="button"
            onClick={enterDemo}
            disabled={loading}
          >
            <Sparkles size={16} />{" "}
            {loading ? "Opening demo…" : "Explore the fictional demo"}
          </button>
          <p className="demo-note">
            <ShieldCheck size={14} /> No password needed. Demo uses entirely
            synthetic data.
          </p>
          <div className="auth-links">
            <span>
              <a href="mailto:people@example.test">Contact People Operations</a>
            </span>
            <span>
              <a href="#privacy">Privacy</a>
              <span className="link-dot">·</span>
              <a href="#terms">Terms</a>
            </span>
          </div>
        </section>
        <span className="auth-footer">
          This is an authorized employee portal. Access is monitored and
          protected.
        </span>
      </div>
    </main>
  );
}

function PageHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action && <div className="heading-action">{action}</div>}
    </div>
  );
}

function ProgressBar({
  value,
  color = "green",
}: {
  value: number;
  color?: string;
}) {
  return (
    <div
      className={`progress-track progress-${color}`}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <span style={{ width: `${value}%` }} />
    </div>
  );
}

function SectionLabel({
  children,
  action,
}: {
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="section-label">
      <h2>{children}</h2>
      {action}
    </div>
  );
}

function DownloadButton({
  title,
  demo = true,
}: {
  title: string;
  demo?: boolean;
}) {
  const [message, setMessage] = useState("");
  function download() {
    if (!demo) {
      setMessage("Private document storage is not configured yet.");
      window.setTimeout(() => setMessage(""), 3500);
      return;
    }
    const blob = new Blob(
      [
        `${title}\n\nFictional demo document. No real employee information is contained in this file.`,
      ],
      { type: "text/plain" },
    );
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-demo.txt`;
    link.click();
    URL.revokeObjectURL(url);
    setMessage("Demo document downloaded.");
    window.setTimeout(() => setMessage(""), 2800);
  }
  return (
    <>
      <button
        className="icon-button document-download"
        onClick={download}
        aria-label={`Download ${title}`}
        title={
          demo
            ? "Download fictional demo document"
            : "Document delivery needs a private storage provider"
        }
      >
        <Download size={16} />
      </button>
      {message && (
        <span className="sr-only" role="status">
          {message}
        </span>
      )}
    </>
  );
}

function AppPortal({
  user,
  onLogout,
}: {
  user: SessionUser;
  onLogout: () => void;
}) {
  const [activePage, setActivePage] = useState("Dashboard");
  const [mobileSidebar, setMobileSidebar] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [passwordDialog, setPasswordDialog] = useState(false);
  const [sessionCount, setSessionCount] = useState(1);
  const [loginActivity, setLoginActivity] = useState<
    { action: string; createdAt: string }[]
  >([]);
  const [profile, setProfile] = useState(
    user.demo ? initialPerson : emptyPerson,
  );
  const [saved, setSaved] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [toast, setToast] = useState("");
  const [timeOff, setTimeOff] = useState<TimeOff[]>(
    user.demo
      ? [
          {
            id: 1,
            category: "Vacation",
            start: "Oct 23, 2026",
            end: "Oct 24, 2026",
            days: 2,
            status: "Approved",
          },
          {
            id: 2,
            category: "Vacation",
            start: "Dec 28, 2026",
            end: "Dec 31, 2026",
            days: 4,
            status: "Pending",
          },
        ]
      : [],
  );
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>(
    user.demo ? announcementsSeed : [],
  );
  const [directoryQuery, setDirectoryQuery] = useState("");
  const [documentFilter, setDocumentFilter] = useState("All documents");
  const [showTimeOff, setShowTimeOff] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(9);
  const [trainingDone, setTrainingDone] = useState([true, false, false]);
  const [tax, setTax] = useState({
    federalFilingStatus: user.demo ? "SINGLE" : "",
    federalAllowances: user.demo ? "1" : "",
    stateCode: user.demo ? "OR" : "",
    stateFilingStatus: user.demo ? "Single" : "",
    stateAllowances: user.demo ? "1" : "",
  });
  const [directDepositForm, setDirectDepositForm] = useState({
    accountHolderName: "",
    bankName: "",
    accountType: "CHECKING",
    routingNumber: "",
    accountNumber: "",
    confirmAccountNumber: "",
    allocationPercent: "100",
    currentPassword: "",
  });
  const [savingDirectDeposit, setSavingDirectDeposit] = useState(false);
  const [payrollRecord, setPayrollRecord] = useState<Record<
    string,
    unknown
  > | null>(null);
  const [employeeBenefits, setEmployeeBenefits] = useState<
    Record<string, unknown>[]
  >([]);
  const [employeeDocuments, setEmployeeDocuments] = useState<
    typeof initialDocuments
  >(user.demo ? initialDocuments : []);
  const [employeeCoworkers, setEmployeeCoworkers] = useState(
    user.demo ? coworkers : [],
  );
  const [employeeAnnouncements, setEmployeeAnnouncements] = useState<AnnouncementItem[]>(
    user.demo ? announcementsSeed : [],
  );
  const [employment, setEmployment] = useState<EmploymentDetails | null>(
    user.demo
      ? {
          employeeNumber: "DEMO-1042",
          jobTitle: "Operations Coordinator",
          department: "Operations",
          manager: "Sam Rivera",
          employmentType: "Full-time · Exempt",
          status: "ACTIVE",
          hireDate: "2024-05-13",
          workLocation: "Remote · Portland, OR",
          workSchedule: "Monday – Friday",
          team: "People Operations",
        }
      : null,
  );

  useEffect(() => {
    if (user.demo) return;
    async function loadProfile() {
      try {
        const response = await fetch("/api/profile", { cache: "no-store" });
        const data = response.ok ? await response.json() : null;
        if (data?.profile) {
          setProfile((current) => ({ ...current, ...data.profile }));
          if (typeof data.profile.profileImage === "string") {
            setProfileImage(data.profile.profileImage || null);
          }
        }
        if (data?.employment) setEmployment(data.employment);
      } catch {
        // Ignore missing profile data and keep the secure portal state.
      }
    }
    void loadProfile();
  }, [user.demo]);

  useEffect(() => {
    if (user.demo) return;
    async function loadPortalData() {
      try {
        const [
          payrollResponse,
          benefitsResponse,
          documentsResponse,
          directoryResponse,
          announcementsResponse,
        ] = await Promise.all([
          fetch("/api/payroll", { cache: "no-store" }),
          fetch("/api/benefits", { cache: "no-store" }),
          fetch("/api/documents", { cache: "no-store" }),
          fetch("/api/directory", { cache: "no-store" }),
          fetch("/api/announcements", { cache: "no-store" }),
        ]);
        if (payrollResponse.ok) {
          const data = await payrollResponse.json();
          setPayrollRecord(data.payroll);
        }
        if (benefitsResponse.ok) {
          const data = await benefitsResponse.json();
          setEmployeeBenefits(data.benefits ?? []);
        }
        if (documentsResponse.ok) {
          const data = await documentsResponse.json();
          setEmployeeDocuments(
            (data.documents ?? []).map(
              (document: {
                title: string;
                category: string;
                issuedAt?: string | null;
                date?: string;
                status: string;
              }) => ({
                title: document.title,
                category: document.category,
                date: document.issuedAt
                  ? formatPortalDate(document.issuedAt)
                  : document.date
                    ? formatPortalDate(document.date)
                    : "Available",
                status: document.status,
              }),
            ),
          );
        }
        if (directoryResponse.ok) {
          const data = await directoryResponse.json();
          setEmployeeCoworkers(
            (data.colleagues ?? []).map(
              (person: {
                name: string;
                title: string;
                department: string;
                location: string;
                email: string;
              }) => ({
                name: person.name,
                role: person.title,
                dept: person.department,
                place: person.location,
                initials: person.name
                  .split(" ")
                  .map((part: string) => part[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase(),
              }),
            ),
          );
        }
        if (announcementsResponse.ok) {
          const data = await announcementsResponse.json();
          setEmployeeAnnouncements(
            (data.announcements ?? []).map(
              (
                announcement: {
                  id: string;
                  category: string;
                  publishedAt: string;
                  title: string;
                  body: string;
                  unread: boolean;
                },
                index: number,
              ) => ({
                id: index + 1,
                recordId: announcement.id,
                category: announcement.category,
                date: formatPortalDate(announcement.publishedAt),
                title: announcement.title,
                body: announcement.body,
                unread: announcement.unread,
                color: ["mint", "blue", "peach", "lavender"][index % 4],
              }),
            ),
          );
        }
      } catch {
        notify("Some employee services are temporarily unavailable.");
      }
    }
    void loadPortalData();
  }, [user.demo]);

  useEffect(() => {
    if (user.demo) {
      setLoginActivity([
        { action: "LOGIN", createdAt: new Date().toISOString() },
      ]);
      return;
    }
    Promise.all([
      fetch("/api/auth/sessions", { cache: "no-store" }),
      fetch("/api/auth/activity", { cache: "no-store" }),
    ])
      .then(async ([sessionsResponse, activityResponse]) => {
        const [sessionData, activityData] = await Promise.all([
          sessionsResponse.ok ? sessionsResponse.json() : null,
          activityResponse.ok ? activityResponse.json() : null,
        ]);
        if (sessionData?.sessions) setSessionCount(sessionData.sessions.length);
        if (activityData?.activity) setLoginActivity(activityData.activity);
      })
      .catch(() => {});
  }, [user.demo]);

  useEffect(() => {
    if (user.demo) return;
    fetch("/api/tax", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (data?.tax)
          setTax({
            federalFilingStatus: data.tax.federalFilingStatus ?? "SINGLE",
            federalAllowances: String(data.tax.federalAllowances ?? 1),
            stateCode: data.tax.stateCode ?? "OR",
            stateFilingStatus: data.tax.stateFilingStatus ?? "Single",
            stateAllowances: String(data.tax.stateAllowances ?? 1),
          });
      })
      .catch(() => notify("Tax information is temporarily unavailable."));
  }, [user.demo]);

  useEffect(() => {
    if (user.demo) return;
    fetch("/api/time-off", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (data?.requests)
          setTimeOff(
            data.requests.map(
              (item: {
                id: string;
                category: string;
                startDate: string;
                endDate: string;
                requestedDays: number | string;
                status: string;
                notes?: string;
              }) => ({
                id: item.id,
                category: item.category,
                start: formatPortalDate(item.startDate),
                end: formatPortalDate(item.endDate),
                days: Number(item.requestedDays),
                status: item.status[0] + item.status.slice(1).toLowerCase(),
                note: item.notes,
              }),
            ),
          );
      })
      .catch(() => notify("Time-off requests are temporarily unavailable."));
  }, [user.demo]);

  function notify(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 3200);
  }

  function handleProfileImageUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      notify("Please upload a valid image file for your profile photo.");
      event.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setProfileImage(String(reader.result));
    reader.readAsDataURL(file);
    event.target.value = "";
  }

  function removeProfileImage() {
    setProfileImage(null);
    notify("Profile photo removed from this session.");
  }

  async function updateProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaved(false);
    const payload = {
      ...profile,
      profileImage: profileImage ?? "",
    };
    if (!user.demo) {
      try {
        const token = await csrfToken();
        const response = await fetch("/api/profile", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "X-CSRF-Token": token,
          },
          body: JSON.stringify(payload),
        });
        const data = await response.json().catch(() => null);
        if (!response.ok) {
          throw new Error(data?.error ?? "Your profile couldn’t be saved.");
        }
        setSaved(true);
        notify("Your profile has been updated.");
      } catch (error) {
        notify(
          error instanceof Error && error.message
            ? error.message
            : "We couldn’t save your changes. Please try again.",
        );
      }
    } else {
      setSaved(true);
      notify("Demo profile updated for this session.");
    }
  }

  async function submitTimeOff(draft: {
    category: string;
    startDate: string;
    endDate: string;
    notes: string;
  }) {
    try {
      let days = Math.max(
        1,
        Math.round(
          (new Date(`${draft.endDate}T00:00:00`).getTime() -
            new Date(`${draft.startDate}T00:00:00`).getTime()) /
            86400000,
        ) + 1,
      );
      if (!user.demo) {
        const token = await csrfToken();
        const response = await fetch("/api/time-off", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-CSRF-Token": token,
          },
          body: JSON.stringify({
            category: draft.category,
            startDate: draft.startDate,
            endDate: draft.endDate,
            notes: draft.notes,
          }),
        });
        const data = await response.json();
        if (!response.ok)
          throw new Error(data.error ?? "This request couldn’t be submitted.");
        days = Number(data.request.requestedDays);
      }
      setTimeOff((items) => [
        ...items,
        {
          id: Date.now(),
          category: draft.category,
          start: formatPortalDate(draft.startDate),
          end: formatPortalDate(draft.endDate),
          days,
          status: "Pending",
          note: draft.notes,
        },
      ]);
      setShowTimeOff(false);
      notify(
        user.demo
          ? "Demo time-off request added for this session."
          : "Your time-off request has been submitted.",
      );
    } catch (cause) {
      notify(
        cause instanceof Error
          ? cause.message
          : "This request couldn’t be submitted.",
      );
    }
  }

  async function cancelTimeOff(id: number | string) {
    try {
      if (!user.demo) {
        const token = await csrfToken();
        const response = await fetch(`/api/time-off/${id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "X-CSRF-Token": token,
          },
          body: JSON.stringify({ status: "CANCELLED" }),
        });
        if (!response.ok)
          throw new Error("That request couldn’t be cancelled.");
      }
      setTimeOff((items) =>
        items.map((item) =>
          item.id === id ? { ...item, status: "Cancelled" } : item,
        ),
      );
      notify("Time-off request cancelled.");
    } catch (cause) {
      notify(
        cause instanceof Error
          ? cause.message
          : "That request couldn’t be cancelled.",
      );
    }
  }

  async function saveTax(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const payload = {
      federalFilingStatus: tax.federalFilingStatus,
      federalAllowances: Number(tax.federalAllowances),
      stateCode: tax.stateCode.toUpperCase(),
      stateFilingStatus: tax.stateFilingStatus,
      stateAllowances: Number(tax.stateAllowances),
    };
    if (user.demo) {
      notify("Demo withholding preferences saved for this session.");
      return;
    }
    try {
      const token = await csrfToken();
      const response = await fetch("/api/tax", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "X-CSRF-Token": token },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error();
      notify("Your withholding preferences have been updated.");
    } catch {
      notify("Tax information couldn’t be updated. Please try again.");
    }
  }

  async function confirmDirectDeposit() {
    notify("Demo direct-deposit details are fictional. No request was sent.");
  }

  async function saveDirectDeposit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (user.demo || savingDirectDeposit) return;
    setSavingDirectDeposit(true);
    try {
      const token = await csrfToken();
      const response = await fetch("/api/direct-deposit", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": token,
        },
        body: JSON.stringify({
          ...directDepositForm,
          allocationPercent: Number(directDepositForm.allocationPercent),
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok)
        throw new Error(data.error ?? "Direct-deposit details could not be saved.");
      setPayrollRecord((current) => ({
        ...(current ?? {}),
        accounts: data.directDeposit ? [data.directDeposit] : [],
      }));
      setDirectDepositForm({
        accountHolderName: "",
        bankName: "",
        accountType: "CHECKING",
        routingNumber: "",
        accountNumber: "",
        confirmAccountNumber: "",
        allocationPercent: "100",
        currentPassword: "",
      });
      notify(data.message ?? "Direct-deposit details were saved securely.");
    } catch (cause) {
      notify(
        cause instanceof Error
          ? cause.message
          : "Direct-deposit details could not be saved.",
      );
    } finally {
      setSavingDirectDeposit(false);
    }
  }

  async function logoutOtherSessions() {
    if (user.demo) {
      notify("Demo sessions can’t access a real account or device.");
      return;
    }
    try {
      const token = await csrfToken();
      const response = await fetch("/api/auth/sessions", {
        method: "POST",
        headers: { "X-CSRF-Token": token },
      });
      if (!response.ok) throw new Error();
      setSessionCount(1);
      notify("Other sessions have been signed out.");
    } catch {
      notify("Other sessions couldn’t be signed out. Please try again.");
    }
  }

  function changePassword() {
    if (user.demo) {
      notify("Password changes are unavailable for fictional demo accounts.");
      return;
    }
    setPasswordDialog(true);
  }

  const current = navigation.find((item) => item.label === activePage);
  const shownName = user.name || "Alex Morgan";
  const formatEmployeeId = (value?: string) => {
    const raw = (value || "CH-8890").trim();
    if (!raw) return "CH-8890";
    const upper = raw.toUpperCase();
    if (upper.startsWith("CH-")) return upper;
    if (/^EMP-/.test(upper)) return upper.replace(/^EMP-/, "CH-");
    if (/^\d{1,}$/.test(raw)) return `CH-${raw}`;
    return `CH-${raw.replace(/^CH-?/i, "")}`;
  };
  const userInitials = shownName.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
  const visibleCoworkers = useMemo(
    () =>
      (user.demo ? coworkers : employeeCoworkers).filter((person) =>
        `${person.name} ${person.role} ${person.dept} ${person.place}`
          .toLowerCase()
          .includes(directoryQuery.toLowerCase()),
      ),
    [directoryQuery, employeeCoworkers, user.demo],
  );
  const visibleDocuments = (
    user.demo ? initialDocuments : employeeDocuments
  ).filter(
    (document) =>
      documentFilter === "All documents" ||
      document.category === documentFilter,
  );
  const portalAnnouncements = user.demo ? announcements : employeeAnnouncements;

  function employeeOverviewPage() {
    const data = payrollRecord as {
      nextPayday?: string;
      payFrequency?: string;
      status?: string;
    } | null;
    return (
      <>
        <section className="greeting-row">
          <div>
            <div className="eyebrow">
              <Sun size={14} /> YOUR EMPLOYEE WORKSPACE
            </div>
            <h1>
              Welcome back, {shownName.split(" ")[0]}
              <span className="greeting-period">.</span>
            </h1>
            <p>Your secure employee services, gathered in one place.</p>
          </div>
          <div className="greeting-meta">
            <Avatar
              initials={shownName
                .split(" ")
                .map((part) => part[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
              size="large"
            />
            <span>
              <strong>{user.title}</strong>
              <small>
                {user.department} · {user.employeeId}
              </small>
            </span>
          </div>
        </section>
        <div className="metric-grid">
          <article className="metric-card">
            <div className="metric-top">
              <span className="metric-icon blue-icon">
                <WalletCards size={17} />
              </span>
              <span className="metric-kicker">PAYROLL</span>
            </div>
            <div className="metric-value">
              {data?.nextPayday ? formatPortalDate(data.nextPayday) : "Set up"}
            </div>
            <p>{data?.payFrequency ?? "Payroll information unavailable"}</p>
            <div className="metric-foot">
              <span className="status-inline">
                {data?.status ?? "Payroll information unavailable"}
              </span>
              <button
                className="inline-link"
                onClick={() => setActivePage("Payroll")}
              >
                View payroll <ArrowRight size={14} />
              </button>
            </div>
          </article>
          <article className="metric-card">
            <div className="metric-top">
              <span className="metric-icon mint-icon">
                <CalendarDays size={17} />
              </span>
              <span className="metric-kicker">TIME OFF</span>
            </div>
            <div className="metric-value">
              {timeOff.filter((item) => item.status === "Pending").length}{" "}
              <span>pending</span>
            </div>
            <p>Your requests and upcoming leave</p>
            <div className="metric-foot">
              <span>Balance from your HR provider</span>
              <button
                className="inline-link"
                onClick={() => setActivePage("Time off")}
              >
                Open calendar <ArrowRight size={14} />
              </button>
            </div>
          </article>
          <article className="metric-card">
            <div className="metric-top">
              <span className="metric-icon lilac-icon">
                <HeartPulse size={17} />
              </span>
              <span className="metric-kicker">BENEFITS</span>
            </div>
            <div className="metric-value">
              {employeeBenefits.length
                ? `${employeeBenefits.length} plans`
                : "Set up"}
            </div>
            <p>
              {employeeBenefits.length
                ? "Connected to your employee record"
                : "Plan elections are not configured"}
            </p>
            <div className="metric-foot">
              <span>Provider-managed enrollment</span>
              <button
                className="inline-link"
                onClick={() => setActivePage("Benefits")}
              >
                View benefits <ArrowRight size={14} />
              </button>
            </div>
          </article>
        </div>
        <div className="dashboard-grid">
          <section className="panel task-panel">
            <SectionLabel>Your profile</SectionLabel>
            <div className="live-account-message">
              <ShieldCheck size={20} />
              <div>
                <strong>
                  {user.employeeId} · {user.title}
                </strong>
                <p>
                  Your profile details are available to you and authorized HR
                  administrators. Update personal details or your emergency
                  contact.
                </p>
                <button
                  className="read-link"
                  onClick={() => setActivePage("My profile")}
                >
                  Review your profile <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </section>
          <section className="panel calendar-panel">
            <SectionLabel>People Operations</SectionLabel>
            <div className="live-account-message">
              <CircleHelp size={19} />
              <div>
                <strong>Need a hand?</strong>
                <p>
                  Contact People Operations about your employee account, payroll
                  provider or benefits.
                </p>
                <a href="mailto:people@example.test" className="read-link">
                  Send a message <ArrowUpRight size={14} />
                </a>
              </div>
            </div>
          </section>
        </div>
      </>
    );
  }

  function securePayrollPage() {
    const data = payrollRecord as {
      payFrequency?: string;
      nextPayday?: string;
      lastPayday?: string;
      ytdEarningsCents?: number;
      accounts?: {
        bankName: string;
        accountType: string;
        accountLast4: string;
        allocationPercent?: string;
        isPrimary: boolean;
      }[];
    } | null;
    const account =
      data?.accounts?.find((item) => item.isPrimary) ?? data?.accounts?.[0];
    return (
      <>
        <PageHeading
          eyebrow="PAY & TAXES"
          title="Payroll"
          description="Payroll information associated with your employee account."
          action={
            <span className="secure-caption">
              <ShieldCheck size={14} /> Private to you
            </span>
          }
        />
        <div className="payroll-summary-grid">
          <article className="payroll-summary-card payroll-summary-dark">
            <span className="event-kicker">NEXT PAYDAY</span>
            <strong>
              {data?.nextPayday
                ? formatPortalDate(data.nextPayday)
                : "Not available"}
            </strong>
            <small>
              {data?.payFrequency ??
                "Payroll information unavailable."}
            </small>
            <span className="payroll-card-foot">
              <ShieldCheck size={13} /> Payroll information
            </span>
          </article>
          <article className="payroll-summary-card">
            <span className="event-kicker">LAST PAYDAY</span>
            <strong>
              {data?.lastPayday
                ? formatPortalDate(data.lastPayday)
                : "Not available"}
            </strong>
            <small>From your payroll profile</small>
          </article>
          <article className="payroll-summary-card">
            <span className="event-kicker">YEAR-TO-DATE EARNINGS</span>
            <strong>
              {Number.isInteger(data?.ytdEarningsCents)
                ? new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                  }).format((data?.ytdEarningsCents ?? 0) / 100)
                : "Not available"}
            </strong>
            <small>From your payroll profile</small>
          </article>
        </div>
        <section className="panel data-panel">
          <SectionLabel>Pay statements</SectionLabel>
          <DocumentRows
            documents={employeeDocuments.filter(
              (item) => item.category === "Pay statements",
            )}
            demo={false}
          />
        </section>
        <section className="panel data-panel">
          <SectionLabel>Tax documents</SectionLabel>
          <DocumentRows
            documents={employeeDocuments.filter(
              (item) => item.category === "Tax documents",
            )}
            demo={false}
          />
        </section>
        <form
          className="panel data-panel tax-form-panel direct-deposit-panel"
          onSubmit={saveDirectDeposit}
        >
          <SectionLabel>Direct deposit</SectionLabel>
          {account ? (
            <div className="bank-row">
              <span className="bank-icon">
                <WalletCards size={19} />
              </span>
              <div className="bank-detail">
                <strong>{account.bankName}</strong>
                <small>
                  {account.accountType} account ···· {account.accountLast4}
                </small>
                <small>
                  Allocation: {account.allocationPercent ?? "Not available"}
                  {account.allocationPercent ? "%" : ""}
                </small>
              </div>
              {account.isPrimary && (
                <span className="status-chip status-enrolled">
                  Primary account
                </span>
              )}
            </div>
          ) : (
            <div className="live-account-message">
              <ShieldCheck size={19} />
              <div>
                <strong>No direct-deposit account on file.</strong>
                <p>Account details are currently unavailable.</p>
              </div>
            </div>
          )}
          <div className="tax-fields">
            <label className="profile-field">
              <span>Account holder</span>
              <input
                autoComplete="name"
                required
                maxLength={120}
                value={directDepositForm.accountHolderName}
                onChange={(event) =>
                  setDirectDepositForm({
                    ...directDepositForm,
                    accountHolderName: event.target.value,
                  })
                }
              />
            </label>
            <label className="profile-field">
              <span>Bank name</span>
              <input
                required
                maxLength={120}
                value={directDepositForm.bankName}
                onChange={(event) =>
                  setDirectDepositForm({
                    ...directDepositForm,
                    bankName: event.target.value,
                  })
                }
              />
            </label>
            <label className="profile-field">
              <span>Account type</span>
              <select
                value={directDepositForm.accountType}
                onChange={(event) =>
                  setDirectDepositForm({
                    ...directDepositForm,
                    accountType: event.target.value,
                  })
                }
              >
                <option value="CHECKING">Checking</option>
                <option value="SAVINGS">Savings</option>
              </select>
            </label>
            <label className="profile-field">
              <span>Routing number</span>
              <input
                autoComplete="off"
                inputMode="numeric"
                maxLength={9}
                pattern="[0-9]{9}"
                required
                value={directDepositForm.routingNumber}
                onChange={(event) =>
                  setDirectDepositForm({
                    ...directDepositForm,
                    routingNumber: event.target.value,
                  })
                }
              />
            </label>
            <label className="profile-field">
              <span>Account number</span>
              <input
                autoComplete="off"
                inputMode="numeric"
                maxLength={17}
                minLength={4}
                pattern="[0-9]{4,17}"
                required
                value={directDepositForm.accountNumber}
                onChange={(event) =>
                  setDirectDepositForm({
                    ...directDepositForm,
                    accountNumber: event.target.value,
                  })
                }
              />
            </label>
            <label className="profile-field">
              <span>Confirm account number</span>
              <input
                autoComplete="off"
                inputMode="numeric"
                maxLength={17}
                minLength={4}
                pattern="[0-9]{4,17}"
                required
                value={directDepositForm.confirmAccountNumber}
                onChange={(event) =>
                  setDirectDepositForm({
                    ...directDepositForm,
                    confirmAccountNumber: event.target.value,
                  })
                }
              />
            </label>
            <label className="profile-field">
              <span>Allocation percent</span>
              <input
                type="number"
                min="1"
                max="100"
                required
                value={directDepositForm.allocationPercent}
                onChange={(event) =>
                  setDirectDepositForm({
                    ...directDepositForm,
                    allocationPercent: event.target.value,
                  })
                }
              />
            </label>
            <label className="profile-field">
              <span>Current password</span>
              <input
                type="password"
                autoComplete="current-password"
                required
                value={directDepositForm.currentPassword}
                onChange={(event) =>
                  setDirectDepositForm({
                    ...directDepositForm,
                    currentPassword: event.target.value,
                  })
                }
              />
            </label>
          </div>
          <div className="tax-form-footer">
            <span>
              Telegram receives no banking details.
            </span>
            <button className="outline-button" type="submit" disabled={savingDirectDeposit}>
              <Check size={14} /> {savingDirectDeposit ? "Saving…" : "Confirm"}
            </button>
          </div>
        </form>
      </>
    );
  }

  async function logout() {
    try {
      const response = await fetch("/api/auth/csrf", { cache: "no-store" });
      const { csrfToken } = await response.json();
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: { "X-CSRF-Token": csrfToken },
      });
    } catch {
      /* The local demo view remains safe to exit if the service is unavailable. */
    }
    onLogout();
  }

  function field(
    label: string,
    key: keyof Person,
    type = "text",
    full = false,
  ) {
    return (
      <label className={`profile-field ${full ? "field-full" : ""}`} key={key}>
        <span>{label}</span>
        <input
          type={type}
          value={profile[key]}
          readOnly={key === "workEmail"}
          onChange={(event) =>
            setProfile({ ...profile, [key]: event.target.value })
          }
        />
      </label>
    );
  }

  function dashboard() {
    return (
      <>
        <section className="greeting-row">
          <div>
            <div className="eyebrow">
              <Sun size={14} /> MONDAY, SEPTEMBER 29, 2026
            </div>
            <h1>
              Good morning, {shownName.split(" ")[0]}
              <span className="greeting-period">.</span>
            </h1>
            <p>Here’s what’s happening in your world today.</p>
          </div>
          <div className="greeting-meta">
            <span className="avatar-large-wrap">
              <Avatar initials="AM" size="large" />
            </span>
            <span>
              <strong>{user.title || "Operations Coordinator"}</strong>
              <small>{user.department || "Operations"} · Employee</small>
            </span>
          </div>
        </section>
        <div className="metric-grid">
          <article className="metric-card metric-pto">
            <div className="metric-top">
              <span className="metric-icon mint-icon">
                <Sun size={17} />
              </span>
              <span className="metric-kicker">TIME OFF</span>
              <MoreHorizontal size={17} className="muted-icon" />
            </div>
            <div className="metric-value">
              14.5 <span>days</span>
            </div>
            <p>Available paid time off</p>
            <div className="metric-foot">
              <span>
                <ArrowUpRight size={14} /> 2 days accrued this month
              </span>
              <button
                className="inline-link"
                onClick={() => setActivePage("Time off")}
              >
                View balance <ArrowRight size={14} />
              </button>
            </div>
          </article>
          <article className="metric-card">
            <div className="metric-top">
              <span className="metric-icon blue-icon">
                <WalletCards size={17} />
              </span>
              <span className="metric-kicker">NEXT PAYDAY</span>
              <MoreHorizontal size={17} className="muted-icon" />
            </div>
            <div className="metric-value">Oct 02</div>
            <p>Friday · Direct deposit</p>
            <div className="metric-foot">
              <span className="status-inline">
                <i className="status-dot" /> Payroll on track
              </span>
              <button
                className="inline-link"
                onClick={() => setActivePage("Payroll")}
              >
                View payroll <ArrowRight size={14} />
              </button>
            </div>
          </article>
          <article className="metric-card">
            <div className="metric-top">
              <span className="metric-icon lilac-icon">
                <HeartPulse size={17} />
              </span>
              <span className="metric-kicker">YOUR BENEFITS</span>
              <MoreHorizontal size={17} className="muted-icon" />
            </div>
            <div className="metric-value status-value">
              <span className="status-chip status-enrolled">Enrolled</span>
            </div>
            <p>Health, vision & dental active</p>
            <div className="metric-foot">
              <span>3 plans in your portfolio</span>
              <button
                className="inline-link"
                onClick={() => setActivePage("Benefits")}
              >
                View benefits <ArrowRight size={14} />
              </button>
            </div>
          </article>
        </div>
        <div className="dashboard-grid">
          <section className="panel task-panel">
            <SectionLabel
              action={
                <button
                  className="subtle-link"
                  onClick={() => setActivePage("Documents")}
                >
                  View all <ArrowRight size={14} />
                </button>
              }
            >
              Your to-dos <span className="count-pill">2</span>
            </SectionLabel>
            <div className="task-list">
              <button
                className="task-row"
                onClick={() => setActivePage("Benefits")}
              >
                <span className="task-icon task-green">
                  <HeartPulse size={17} />
                </span>
                <span className="task-copy">
                  <strong>Explore open enrollment</strong>
                  <small>Your window opens in 15 days</small>
                </span>
                <span className="task-date">OCT 14</span>
                <ChevronRight size={16} className="task-chevron" />
              </button>
              <button
                className="task-row"
                onClick={() => setActivePage("Performance")}
              >
                <span className="task-icon task-amber">
                  <Sparkles size={17} />
                </span>
                <span className="task-copy">
                  <strong>Write your self-review</strong>
                  <small>Share a few reflections with Sam</small>
                </span>
                <span className="task-date task-date-soon">OCT 09</span>
                <ChevronRight size={16} className="task-chevron" />
              </button>
            </div>
            <div className="profile-reminder">
              <span className="reminder-icon">
                <UserRound size={16} />
              </span>
              <div>
                <strong>A little more about you</strong>
                <small>
                  Your profile is <b>80%</b> complete
                </small>
                <ProgressBar value={80} />
              </div>
              <button
                className="icon-button"
                onClick={() => setActivePage("My profile")}
                aria-label="Complete your profile"
              >
                <ArrowRight size={17} />
              </button>
            </div>
          </section>
          <section className="panel calendar-panel">
            <SectionLabel
              action={
                <button
                  className="subtle-link"
                  onClick={() => setActivePage("Time off")}
                >
                  Full calendar <ArrowRight size={14} />
                </button>
              }
            >
              Coming up
            </SectionLabel>
            <div className="upcoming-holiday">
              <div className="holiday-date">
                <span>OCT</span>
                <strong>12</strong>
              </div>
              <div>
                <span className="event-kicker">COMPANY HOLIDAY</span>
                <strong>Indigenous Peoples’ Day</strong>
                <small>Monday · Office closed</small>
              </div>
              <PartyPopper size={19} className="holiday-spark" />
            </div>
            <div className="upcoming-leave">
              <div className="event-dot" />
              <div className="upcoming-leave-copy">
                <span className="event-kicker">YOUR UPCOMING LEAVE</span>
                <strong>Fall long weekend</strong>
                <small>Oct 23 – 24 · 2 days off</small>
              </div>
              <span className="status-chip status-approved">Approved</span>
            </div>
            <button
              className="calendar-add"
              onClick={() => setShowTimeOff(true)}
            >
              <Plus size={16} /> Request time off
            </button>
          </section>
          <section className="panel announcement-panel">
            <SectionLabel
              action={
                <button
                  className="subtle-link"
                  onClick={() => setActivePage("Announcements")}
                >
                  All updates <ArrowRight size={14} />
                </button>
              }
            >
              A note from the team
            </SectionLabel>
            <div className="announcement-feature">
              <div className="announcement-art">
                <span className="leaf leaf-one" />
                <span className="leaf leaf-two" />
                <span className="leaf leaf-three" />
                <span className="leaf leaf-four" />
                <span className="art-sun" />
              </div>
              <div className="feature-content">
                <span className="event-kicker">
                  PEOPLE & CULTURE <i /> SEP 26
                </span>
                <h3>
                  A note from our
                  <br />
                  leadership team
                </h3>
                <p>Some words on what we’re building together this quarter.</p>
                <button
                  className="read-link"
                  onClick={() => setActivePage("Announcements")}
                >
                  Read the update <ArrowRight size={15} />
                </button>
              </div>
            </div>
          </section>
          <section className="panel payroll-panel">
            <SectionLabel
              action={
                <button className="icon-button" aria-label="Payroll options">
                  <MoreHorizontal size={18} />
                </button>
              }
            >
              Recent pay
            </SectionLabel>
            <div className="pay-period">
              <div>
                <span className="event-kicker">LAST PAY PERIOD</span>
                <strong>Sep 01 – 15, 2026</strong>
                <small>Paid Sep 18 · Direct deposit</small>
              </div>
              <span className="pay-status">
                <Check size={13} /> Paid
              </span>
            </div>
            <div className="pay-breakdown">
              <span>Net pay</span>
              <strong>$2,846.30</strong>
            </div>
            <div className="pay-rule" />
            <div className="pay-foot">
              <span>
                <span className="pay-secure">
                  <ShieldCheck size={13} />
                </span>{" "}
                Secure payroll
              </span>
              <button
                className="subtle-link"
                onClick={() => setActivePage("Payroll")}
              >
                Pay statements <ArrowRight size={14} />
              </button>
            </div>
          </section>
        </div>
      </>
    );
  }

  function profilePage() {
    return (
      <>
        <PageHeading
          eyebrow="YOUR DETAILS"
          title="My profile"
          description="The important details that help us support you at work."
        />
        <div className="profile-top panel">
          <Avatar
            initials={(profile.preferred || profile.first || "AM").slice(0, 2).toUpperCase()}
            size="large"
            imageUrl={profileImage}
          />
          <div className="profile-identity">
            <h2>
              {profile.preferred || profile.first} {profile.last}
            </h2>
            <p>
              {user.title || "Operations Coordinator"} <span>·</span>{" "}
              {user.department || "Operations"}
            </p>
            <div className="profile-meta-stack">
              <span className="employee-tag">
                <span className="status-dot" /> Active employee
              </span>
              <span className="employee-number-inline">
                EMPLOYEE ID: <strong>{formatEmployeeId(user.employeeId)}</strong>
              </span>
            </div>
          </div>
        </div>
        <form
          id="profile-form"
          className="profile-form"
          onSubmit={updateProfile}
        >
          <div className="form-section panel">
            <SectionLabel>Profile photo</SectionLabel>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                flexWrap: "wrap",
              }}
            >
              <div
                style={{
                  width: 96,
                  height: 96,
                  borderRadius: 999,
                  overflow: "hidden",
                  background: "#eef1f3",
                  border: "1px solid rgba(17, 24, 39, 0.1)",
                }}
              >
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Selected profile"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                      color: "#44526a",
                    }}
                  >
                    {(profile.preferred || profile.first || "A").charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <label
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "10px 14px",
                  borderRadius: 10,
                  border: "1px solid rgba(17, 24, 39, 0.15)",
                  background: "#fff",
                  cursor: "pointer",
                  fontWeight: 600,
                  color: "#183153",
                }}
              >
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  hidden
                  onChange={handleProfileImageUpload}
                />
                <Plus size={15} /> Upload passport photo
              </label>
              {profileImage && (
                <button
                  type="button"
                  className="outline-button small-outline"
                  onClick={removeProfileImage}
                >
                  Remove
                </button>
              )}
            </div>
            <p
              style={{
                marginTop: 12,
                marginBottom: 0,
                color: "#52657a",
                fontSize: 14,
              }}
            >
              Use a clear, passport-style photo for identification records.
            </p>
          </div>
          <div className="form-section panel">
            <SectionLabel>Personal information</SectionLabel>
            <div className="profile-fields">
              {field("Legal first name", "first")}
              {field("Preferred first name", "preferred")}
              {field("Middle name", "middle")}
              {field("Last name", "last")}
              {field("Date of birth", "birth", "date")}
              {field("Pronouns", "pronouns")}
              {field("Personal email", "personalEmail", "email")}
              {field(
                "Work email · managed by People Ops",
                "workEmail",
                "email",
              )}
              {field("Phone number", "phone", "tel")}
            </div>
          </div>
          <div className="form-section panel">
            <SectionLabel>Home address</SectionLabel>
            <div className="profile-fields">
              {field("Street address", "address", "text", true)}
              {field("City", "city")}
              {field("State", "state")}
              {field("ZIP code", "zip")}
              {field("Country", "country")}
            </div>
          </div>
          <div className="form-section panel">
            <SectionLabel>
              Work details{" "}
              <span className="read-only-tag">
                <ShieldCheck size={12} /> Managed by People Ops
              </span>
            </SectionLabel>
            <div className="employment-fields">
              <StaticField
                label="Job title"
                value={user.title || "Operations Coordinator"}
              />
              <StaticField
                label="Department"
                value={user.department || "Operations"}
              />
              <StaticField label="Manager" value="Sam Rivera" />
              <StaticField label="Employment type" value="Full-time · Exempt" />
              <StaticField label="Hire date" value="May 13, 2024" />
              <StaticField
                label="Work location"
                value="Remote · Portland, OR"
              />
              <StaticField label="Schedule" value="Monday – Friday" />
              <StaticField label="Team" value="People Operations" />
            </div>
          </div>
          <div className="form-section panel">
            <SectionLabel>
              Emergency contact{" "}
              <button
                className="small-icon-link"
                type="button"
                onClick={() =>
                  notify(
                    "Additional contacts can be added by People Operations.",
                  )
                }
              >
                <Plus size={14} /> Add contact
              </button>
            </SectionLabel>
            <p className="form-section-copy">
              Who should we reach in case of an emergency?
            </p>
            <div className="profile-fields">
              {
                <label className="profile-field">
                  <span>Contact name</span>
                  <input
                    value={profile.contact}
                    onChange={(event) =>
                      setProfile({ ...profile, contact: event.target.value })
                    }
                  />
                </label>
              }
              <label className="profile-field">
                <span>Relationship</span>
                <select
                  value={profile.relationship}
                  onChange={(event) =>
                    setProfile({ ...profile, relationship: event.target.value })
                  }
                >
                  <option>Sibling</option>
                  <option>Parent</option>
                  <option>Partner</option>
                  <option>Spouse</option>
                  <option>Friend</option>
                  <option>Other</option>
                </select>
              </label>
              <label className="profile-field">
                <span>Phone</span>
                <input
                  type="tel"
                  value={profile.contactPhone}
                  onChange={(event) =>
                    setProfile({ ...profile, contactPhone: event.target.value })
                  }
                />
              </label>
              <label className="profile-field">
                <span>Email</span>
                <input
                  type="email"
                  value={profile.contactEmail}
                  onChange={(event) =>
                    setProfile({ ...profile, contactEmail: event.target.value })
                  }
                />
              </label>
            </div>
            <span className="primary-contact">
              <CheckCircle2 size={14} /> Primary emergency contact
            </span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginTop: 16,
              marginBottom: 14,
            }}
          >
            <button className="primary-button" type="submit">
              <Check size={16} /> Confirm
            </button>
          </div>
        </form>
      </>
    );
  }

  function payrollPage() {
    if (!user.demo) return securePayrollPage();
    return (
      <>
        <PageHeading
          eyebrow="PAY & TAXES"
          title="Payroll"
          description="Your pay, pay statements and tax documents, all in one place."
          action={
            <button
              className="outline-button"
              onClick={() => notify("Payroll support: payroll@example.test")}
            >
              <CircleHelp size={16} /> Payroll help
            </button>
          }
        />
        <div className="payroll-summary-grid">
          <article className="payroll-summary-card payroll-summary-dark">
            <span className="event-kicker">NEXT PAYDAY</span>
            <strong>Friday, October 02</strong>
            <small>Biweekly · Direct deposit to ···· 4821</small>
            <span className="payroll-card-foot">
              <span className="status-dot" /> On schedule
            </span>
          </article>
          <article className="payroll-summary-card">
            <span className="event-kicker">LAST PAYCHECK</span>
            <strong>$2,846.30</strong>
            <small>Paid Sep 18, 2026</small>
            <span className="payroll-card-foot">Net pay · Biweekly</span>
          </article>
          <article className="payroll-summary-card">
            <span className="event-kicker">YEAR-TO-DATE EARNINGS</span>
            <strong>$51,233.40</strong>
            <small>As of September 18, 2026</small>
            <span className="payroll-card-foot">Gross pay · Demo figures</span>
          </article>
        </div>
        <section className="panel data-panel">
          <SectionLabel>
            Pay statements{" "}
            <span className="count-caption">PAID EVERY OTHER FRIDAY</span>
          </SectionLabel>
          <DocumentRows
            documents={initialDocuments.filter(
              (item) => item.category === "Pay statements",
            )}
          />
        </section>
        <section className="panel data-panel">
          <SectionLabel>Tax documents</SectionLabel>
          <DocumentRows
            documents={initialDocuments.filter(
              (item) => item.category === "Tax documents",
            )}
          />
        </section>
        <form className="panel data-panel tax-form-panel" onSubmit={saveTax}>
          <SectionLabel>
            Withholding preferences{" "}
            <span className="demo-caption">
              No tax advice · Demo values are fictional
            </span>
          </SectionLabel>
          <div className="tax-fields">
            <label className="profile-field">
              <span>Federal filing status</span>
              <select
                value={tax.federalFilingStatus}
                onChange={(event) =>
                  setTax({ ...tax, federalFilingStatus: event.target.value })
                }
              >
                <option value="SINGLE">Single</option>
                <option value="MARRIED_FILING_JOINTLY">
                  Married filing jointly
                </option>
                <option value="MARRIED_FILING_SEPARATELY">
                  Married filing separately
                </option>
                <option value="HEAD_OF_HOUSEHOLD">Head of household</option>
              </select>
            </label>
            <label className="profile-field">
              <span>Federal allowances</span>
              <input
                type="number"
                min="0"
                max="99"
                value={tax.federalAllowances}
                onChange={(event) =>
                  setTax({ ...tax, federalAllowances: event.target.value })
                }
              />
            </label>
            <label className="profile-field">
              <span>State</span>
              <input
                maxLength={2}
                value={tax.stateCode}
                onChange={(event) =>
                  setTax({
                    ...tax,
                    stateCode: event.target.value.toUpperCase(),
                  })
                }
              />
            </label>
            <label className="profile-field">
              <span>State withholding status</span>
              <input
                value={tax.stateFilingStatus}
                onChange={(event) =>
                  setTax({ ...tax, stateFilingStatus: event.target.value })
                }
              />
            </label>
            <label className="profile-field">
              <span>State allowances</span>
              <input
                type="number"
                min="0"
                max="99"
                value={tax.stateAllowances}
                onChange={(event) =>
                  setTax({ ...tax, stateAllowances: event.target.value })
                }
              />
            </label>
          </div>
          <div className="tax-form-footer">
            <span>
              Changes update your employee record. For tax guidance, talk to a
              qualified professional.
            </span>
            <button className="outline-button" type="submit">
              <Check size={14} /> Save withholding preferences
            </button>
          </div>
        </form>
        <section className="panel data-panel">
          <SectionLabel>Pay details</SectionLabel>
          <div className="employment-fields">
            <StaticField label="Pay frequency" value="Biweekly" />
            <StaticField label="Pay type" value="Salaried · Exempt" />
            <StaticField label="Payday" value="Every other Friday" />
            <StaticField label="Currency" value="USD · Demo account" />
          </div>
        </section>
        <section className="panel data-panel direct-deposit-panel">
          <SectionLabel>Direct deposit</SectionLabel>
          <div className="bank-row">
            <span className="bank-icon">
              <WalletCards size={19} />
            </span>
            <div className="bank-detail">
              <strong>{DEMO_PAYROLL.bankName}</strong>
              <small>
                Checking account ···· {DEMO_PAYROLL.accountLast4}
              </small>
              <small>Allocation: 100%</small>
            </div>
            <span className="status-chip status-enrolled">Primary account</span>
          </div>
          <div className="tax-form-footer">
            <span>Fictional demo details. Confirm does not send a request.</span>
            <button
              className="outline-button"
              type="button"
              onClick={() => void confirmDirectDeposit()}
            >
              <Check size={14} /> Confirm
            </button>
          </div>
        </section>
      </>
    );
  }

  function benefitsPage() {
    const demoPlans = [
      {
        name: "Medical",
        plan: "Example Choice PPO",
        coverage: "Employee + spouse",
        color: "benefit-mint",
        icon: HeartPulse,
      },
      {
        name: "Dental",
        plan: "Sample Dental Plus",
        coverage: "Employee only",
        color: "benefit-blue",
        icon: Sparkles,
      },
      {
        name: "Vision",
        plan: "Example Vision Standard",
        coverage: "Employee only",
        color: "benefit-lilac",
        icon: Sun,
      },
      {
        name: "Retirement",
        plan: "401(k) savings plan",
        coverage: "Contribution active",
        color: "benefit-amber",
        icon: WalletCards,
      },
    ];
    const benefits = user.demo
      ? demoPlans
      : employeeBenefits.map((benefit, index) => {
          const colors = [
            "benefit-mint",
            "benefit-blue",
            "benefit-lilac",
            "benefit-amber",
          ];
          const icons = [HeartPulse, Sparkles, Sun, WalletCards];
          const enrollment = benefit.enrollment as {
            status?: string;
            dependentCount?: number;
          } | null;
          return {
            name: String(benefit.category ?? "Benefits"),
            plan: String(benefit.name ?? "Plan"),
            coverage: enrollment?.status
              ? `Enrollment ${enrollment.status.toLowerCase()}`
              : "Not yet enrolled",
            color: colors[index % colors.length],
            icon: icons[index % icons.length],
          };
        });
    return (
      <>
        <PageHeading
          eyebrow="YOUR WELLBEING"
          title="Benefits"
          description="A snapshot of your coverage and the choices available to you."
          action={
            <span className="status-chip status-enrolled">
              <span className="status-dot" /> Enrollment active
            </span>
          }
        />
        <div className="benefit-deadline">
          <div className="deadline-icon">
            <CalendarDays size={19} />
          </div>
          <div>
            <span className="event-kicker">UP NEXT · ANNUAL ENROLLMENT</span>
            <strong>
              {user.demo
                ? "Enrollment opens October 14"
                : "Enrollment dates from your plan administrator"}
            </strong>
            <small>
              {user.demo
                ? "Review your options before the November 06 deadline."
                : "Your plan administrator will provide current enrollment dates and documents."}
            </small>
          </div>
          <button
            className="outline-button"
            onClick={() =>
              notify(
                user.demo
                  ? "Illustrative plan options only. No real employer offering is represented."
                  : "Contact your plan administrator for enrollment dates and provider materials.",
              )
            }
          >
            Explore plans <ArrowRight size={15} />
          </button>
        </div>
        <SectionLabel>
          Your coverage{" "}
          <span className="demo-caption">
            Illustrative plan names for demo purposes
          </span>
        </SectionLabel>
        <div className="benefits-grid">
          {benefits.map((benefit, index) => (
            <article className="benefit-card" key={benefit.name}>
              <div className={`benefit-icon ${benefit.color}`}>
                <benefit.icon size={19} />
              </div>
              <span className="status-chip status-enrolled">Active</span>
              <span className="event-kicker">{benefit.name.toUpperCase()}</span>
              <h3>{benefit.plan}</h3>
              <p>{benefit.coverage}</p>
              <div className="benefit-card-foot">
                <span>Plan year 2026</span>
                <button
                  aria-label={`View ${benefit.name} plan documents`}
                  onClick={() =>
                    notify("Sample plan documents are available in Documents.")
                  }
                >
                  <ArrowRight size={16} />
                </button>
              </div>
              {index === 0 && <span className="demo-tag">DEMO PLAN</span>}
            </article>
          ))}
        </div>
        <div className="benefit-lower-grid">
          <section className="panel data-panel">
            <SectionLabel>Dependents</SectionLabel>
            {user.demo ? (
              <>
                <div className="dependent-row">
                  <Avatar initials="RM" />
                  <div>
                    <strong>Riley Morgan</strong>
                    <small>Spouse · Medical coverage · Synthetic data</small>
                  </div>
                  <span className="status-chip status-enrolled">Covered</span>
                </div>
                <p className="data-footnote">
                  This contact exists only in the fictional demo.
                </p>
              </>
            ) : (
              <p className="data-footnote">
                Dependent details are managed securely by your benefits provider
                and are not stored in this portal.
              </p>
            )}
          </section>
          <section className="panel data-panel">
            <SectionLabel>Plan resources</SectionLabel>
            <DocumentRows
              documents={(user.demo
                ? initialDocuments
                : employeeDocuments
              ).filter((item) => item.category === "Benefits documents")}
              demo={user.demo}
            />
          </section>
        </div>
        <section className="panel data-panel">
          <SectionLabel>Other coverage</SectionLabel>
          <div className="coming-benefits">
            <span>
              <ShieldCheck size={17} />
            </span>
            <div>
              <strong>Life & disability coverage</strong>
              <small>
                Plan availability and eligibility are confirmed during
                enrollment.
              </small>
            </div>
            <span className="coming-soon">Details at enrollment</span>
          </div>
          <div className="coming-benefits">
            <span>
              <HeartPulse size={17} />
            </span>
            <div>
              <strong>HSA / FSA</strong>
              <small>
                Available options depend on your medical plan election.
              </small>
            </div>
            <span className="coming-soon">Details at enrollment</span>
          </div>
        </section>
      </>
    );
  }

  function timeOffPage() {
    const displayDate = new Intl.DateTimeFormat("en", {
      month: "long",
      year: "numeric",
    }).format(new Date(2026, currentMonth, 1));
    const daysInMonth = new Date(2026, currentMonth + 1, 0).getDate();
    const firstWeekday = new Date(2026, currentMonth, 1).getDay();
    const leaveDays = user.demo && currentMonth === 9 ? [23, 24] : [];
    const calendarCells = Array.from(
      { length: firstWeekday + daysInMonth },
      (_, i) => (i < firstWeekday ? null : i - firstWeekday + 1),
    );
    return (
      <>
        <PageHeading
          eyebrow="TIME TO RESET"
          title="Time off"
          description="Take the time you need. We’ll help keep the details simple."
          action={
            <button
              className="primary-button compact-button"
              onClick={() => setShowTimeOff(true)}
            >
              <Plus size={16} /> Request time off
            </button>
          }
        />
        {user.demo ? (
          <div className="leave-balances">
            <article className="leave-balance-card">
              <span className="metric-icon mint-icon">
                <Sun size={17} />
              </span>
              <span className="event-kicker">PAID TIME OFF</span>
              <strong>
                14.5 <small>days</small>
              </strong>
              <ProgressBar value={65} />
              <p>of 22.5 days available this year</p>
            </article>
            <article className="leave-balance-card">
              <span className="metric-icon blue-icon">
                <HeartPulse size={17} />
              </span>
              <span className="event-kicker">SICK LEAVE</span>
              <strong>
                8 <small>days</small>
              </strong>
              <ProgressBar value={80} color="blue" />
              <p>of 10 days available this year</p>
            </article>
            <article className="leave-balance-card">
              <span className="metric-icon lilac-icon">
                <BriefcaseBusiness size={17} />
              </span>
              <span className="event-kicker">PERSONAL LEAVE</span>
              <strong>
                2 <small>days</small>
              </strong>
              <ProgressBar value={100} color="lilac" />
              <p>of 2 days available this year</p>
            </article>
          </div>
        ) : (
          <section className="panel leave-provider-note">
            <ShieldCheck size={17} />
            <span>
              Leave balances are provided by your employer’s time-off system.
              Your requests below belong to your account.
            </span>
          </section>
        )}
        <div className="timeoff-grid">
          <section className="panel calendar-widget">
            <SectionLabel
              action={
                <div className="calendar-arrows">
                  <button
                    className="icon-button"
                    aria-label="Previous month"
                    onClick={() =>
                      setCurrentMonth((month) => (month + 11) % 12)
                    }
                  >
                    <ChevronLeft size={17} />
                  </button>
                  <button
                    className="icon-button"
                    aria-label="Next month"
                    onClick={() => setCurrentMonth((month) => (month + 1) % 12)}
                  >
                    <ChevronRight size={17} />
                  </button>
                </div>
              }
            >
              {displayDate}
            </SectionLabel>
            <div className="calendar-days">
              {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
                <span key={`${day}${i}`} className="calendar-weekday">
                  {day}
                </span>
              ))}
              {calendarCells.map((day, i) => (
                <span
                  key={i}
                  className={`calendar-date ${day === 29 && currentMonth === 8 ? "calendar-today" : ""} ${day && leaveDays.includes(day) ? "calendar-leave" : ""}`}
                >
                  {day ?? ""}
                </span>
              ))}
            </div>
            <div className="calendar-legend">
              <span>
                <i className="legend-today" /> Today
              </span>
              <span>
                <i className="legend-leave" /> Approved leave
              </span>
            </div>
          </section>
          <section className="panel requests-panel">
            <SectionLabel>
              My requests <span className="count-pill">{timeOff.length}</span>
            </SectionLabel>
            <div className="request-list">
              {timeOff.map((request) => (
                <div className="request-row" key={request.id}>
                  <div className="request-type-icon">
                    <CalendarDays size={16} />
                  </div>
                  <div className="request-info">
                    <strong>{request.category}</strong>
                    <small>
                      {request.start} – {request.end} · {request.days}{" "}
                      {request.days === 1 ? "day" : "days"}
                    </small>
                  </div>
                  <span
                    className={`status-chip ${request.status === "Approved" ? "status-approved" : request.status === "Denied" ? "status-denied" : request.status === "Cancelled" ? "" : "status-pending"}`}
                  >
                    {request.status}
                  </span>
                  {request.status === "Pending" && (
                    <button
                      className="cancel-link"
                      onClick={() => void cancelTimeOff(request.id)}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              ))}
              {timeOff.some((request) => request.status === "Cancelled") && (
                <p className="cancelled-note">
                  A request was cancelled. It remains in your history.
                </p>
              )}
            </div>
            <button
              className="outline-button history-button"
              onClick={() =>
                notify(
                  "Past time-off requests will appear here as they are submitted.",
                )
              }
            >
              View past requests <ArrowRight size={15} />
            </button>
          </section>
        </div>
        <section className="panel upcoming-leave-panel">
          <SectionLabel>Upcoming company holidays</SectionLabel>
          {user.demo ? (
            <>
              <HolidayRow
                day="12"
                month="OCT"
                title="Indigenous Peoples’ Day"
                detail="Monday · Office closed · Fictional demo"
              />
              <HolidayRow
                day="26"
                month="NOV"
                title="Thanksgiving Day"
                detail="Thursday · Office closed · Fictional demo"
              />
              <HolidayRow
                day="25"
                month="DEC"
                title="Christmas Day"
                detail="Friday · Office closed · Fictional demo"
              />
            </>
          ) : (
            <div className="empty-state">
              <CalendarDays size={20} />
              <strong>Company holidays haven’t been configured</strong>
              <p>Ask People Operations for your current holiday schedule.</p>
            </div>
          )}
        </section>
        {showTimeOff && (
          <TimeOffModal
            onClose={() => setShowTimeOff(false)}
            onSubmit={submitTimeOff}
          />
        )}
      </>
    );
  }

  function documentsPage() {
    const categories = [
      "All documents",
      "Employment documents",
      "Pay statements",
      "Tax documents",
      "Benefits documents",
      "Company policies",
      "Performance documents",
    ];
    return (
      <>
        <PageHeading
          eyebrow="YOUR FILES"
          title="Documents"
          description="Your important work documents, neatly in one place."
          action={
            <span className="secure-caption">
              <ShieldCheck size={14} /> Private to you
            </span>
          }
        />
        <div className="document-categories">
          {categories.map((category) => (
            <button
              key={category}
              className={`category-button ${documentFilter === category ? "category-active" : ""}`}
              onClick={() => setDocumentFilter(category)}
            >
              {category}
              {category === "All documents" && (
                <span>{initialDocuments.length}</span>
              )}
            </button>
          ))}
        </div>
        <section className="panel document-table">
          <div className="document-table-head">
            <span>DOCUMENT</span>
            <span>CATEGORY</span>
            <span>DATE ADDED</span>
            <span>STATUS</span>
            <span />
          </div>
          {visibleDocuments.length ? (
            visibleDocuments.map((document, index) => (
              <div className="document-row" key={document.title}>
                <span className="document-title">
                  <span className={`document-type-icon doc-color-${index % 4}`}>
                    <FileText size={17} />
                  </span>
                  <span>
                    <strong>{document.title}</strong>
                    <small>
                      {user.demo
                        ? "Fictional development placeholder"
                        : "Private employee document · provider access required"}
                    </small>
                  </span>
                </span>
                <span className="document-category-text">
                  {document.category}
                </span>
                <span className="document-date">{document.date}</span>
                <span className="status-chip status-enrolled">
                  {document.status}
                </span>
                <DownloadButton title={document.title} demo={user.demo} />
              </div>
            ))
          ) : (
            <div className="empty-state">
              <FileText size={24} />
              <strong>No documents are available</strong>
              <p>
                {user.demo
                  ? "Fictional placeholders appear here in demo mode."
                  : "Your People team hasn’t shared any documents with you."}
              </p>
            </div>
          )}
        </section>
        <div className="document-privacy">
          <ShieldCheck size={16} />
          <span>
            Your documents are private. Access is recorded for your protection.
          </span>
        </div>
      </>
    );
  }

  function performancePage() {
    if (!user.demo)
      return (
        <>
          <PageHeading
            eyebrow="GROWING TOGETHER"
            title="Performance"
            description="Your performance information is private to your employee account."
          />
          <section className="panel">
            <div className="empty-state">
              <Sparkles size={24} />
              <strong>No current review has been shared with you</strong>
              <p>
                Review schedules and feedback appear here when your manager
                shares them.
              </p>
            </div>
          </section>
        </>
      );
    return (
      <>
        <PageHeading
          eyebrow="GROWING TOGETHER"
          title="Performance"
          description="Make room for reflection, progress and what comes next."
          action={
            <span className="status-chip status-pending">
              <Clock3 size={13} /> Check-in due Oct 09
            </span>
          }
        />
        <div className="review-banner">
          <div className="review-banner-icon">
            <Sparkles size={20} />
          </div>
          <div>
            <span className="event-kicker">YOUR NEXT MOMENT TO REFLECT</span>
            <h2>Q3 self-review</h2>
            <p>Share what’s been going well and where you’d like to grow.</p>
          </div>
          <button
            className="primary-button compact-button"
            onClick={() => document.getElementById("self-review")?.focus()}
          >
            Start your review <ArrowRight size={16} />
          </button>
        </div>
        <SectionLabel>
          Your goals <span className="count-caption">2026 · 2 ACTIVE</span>
        </SectionLabel>
        <div className="goals-grid">
          <GoalCard
            title="Build a smoother onboarding experience"
            detail="Design a more welcoming first 30 days for new teammates."
            progress={72}
            color="green"
            due="Due Nov 30"
          />
          <GoalCard
            title="Grow cross-team partnerships"
            detail="Create clearer handoffs across People and Operations."
            progress={48}
            color="blue"
            due="Due Dec 15"
          />
        </div>
        <section className="panel self-review-panel">
          <SectionLabel>
            Your reflection{" "}
            <span className="demo-caption">
              Your draft stays private until you share it
            </span>
          </SectionLabel>
          <label className="review-prompt" htmlFor="self-review">
            What work are you most proud of this quarter?
          </label>
          <textarea
            id="self-review"
            rows={5}
            placeholder="Give yourself a moment to reflect…"
            onChange={() => setSaved(false)}
          />
          <div className="review-footer">
            <span>
              <ShieldCheck size={14} /> Only you can see your draft
            </span>
            <button
              className="primary-button compact-button"
              onClick={() => {
                setSaved(true);
                notify("Your reflection was saved privately.");
              }}
            >
              Save draft <Check size={15} />
            </button>
          </div>
        </section>
        <section className="panel data-panel">
          <SectionLabel>Review history</SectionLabel>
          <div className="review-history-row">
            <span className="review-year">2026</span>
            <div>
              <strong>Mid-year check-in</strong>
              <small>July 03 · Completed</small>
            </div>
            <span className="status-chip status-enrolled">Complete</span>
            <button
              className="icon-button"
              aria-label="View mid-year check-in"
              onClick={() =>
                notify("Your mid-year check-in document is in Documents.")
              }
            >
              <ArrowRight size={16} />
            </button>
          </div>
          <div className="review-history-row">
            <span className="review-year">2025</span>
            <div>
              <strong>Year-end review</strong>
              <small>January 17 · Completed</small>
            </div>
            <span className="status-chip status-enrolled">Complete</span>
            <button
              className="icon-button"
              aria-label="View year-end review"
              onClick={() =>
                notify("Your year-end review document is in Documents.")
              }
            >
              <ArrowRight size={16} />
            </button>
          </div>
        </section>
      </>
    );
  }

  function learningPage() {
    if (!user.demo)
      return (
        <>
          <PageHeading
            eyebrow="LEARNING & DEVELOPMENT"
            title="Keep growing"
            description="Your assigned training and courses."
          />
          <section className="panel">
            <div className="empty-state">
              <BookOpen size={24} />
              <strong>No courses have been assigned yet</strong>
              <p>
                Required training appears here when your People team assigns it.
              </p>
            </div>
          </section>
        </>
      );
    const courses = [
      {
        title: "Privacy & information security",
        category: "REQUIRED · COMPLIANCE",
        due: "Due Oct 10 · 12 min",
        done: trainingDone[0],
      },
      {
        title: "Supporting a culture of belonging",
        category: "RECOMMENDED · CULTURE",
        due: "Recommended · 25 min",
        done: trainingDone[1],
      },
      {
        title: "Your guide to giving feedback",
        category: "RECOMMENDED · LEADERSHIP",
        due: "Recommended · 18 min",
        done: trainingDone[2],
      },
    ];
    const completed = trainingDone.filter(Boolean).length;
    return (
      <>
        <PageHeading
          eyebrow="LEARNING & DEVELOPMENT"
          title="Keep growing"
          description="Little steps and new ideas have a way of adding up."
          action={
            <span className="status-chip status-enrolled">
              <CheckCircle2 size={14} /> {completed} of 3 complete
            </span>
          }
        />
        <section className="learning-progress panel">
          <div className="learning-progress-copy">
            <div className="eyebrow">YOUR LEARNING JOURNEY</div>
            <h2>A good start.</h2>
            <p>
              You’ve completed {completed} of your learning recommendations.
            </p>
            <ProgressBar value={Math.round((completed / 3) * 100)} />
            <span>{Math.round((completed / 3) * 100)}% complete</span>
          </div>
          <div
            className="learning-ring"
            style={
              {
                "--progress": `${Math.round((completed / 3) * 100)}%`,
              } as React.CSSProperties
            }
          >
            <div>
              <strong>
                {completed}
                <small> / 3</small>
              </strong>
              <span>COURSES</span>
            </div>
          </div>
          <div className="learning-decoration">
            <BookOpen size={31} />
            <span>
              Keep an
              <br />
              open mind.
            </span>
          </div>
        </section>
        <SectionLabel>
          Your learning list <span className="count-caption">2026</span>
        </SectionLabel>
        <div className="course-list">
          {courses.map((course, index) => (
            <article className="course-row" key={course.title}>
              <div className={`course-number course-${index}`}>
                <BookOpen size={19} />
              </div>
              <div className="course-copy">
                <span className="event-kicker">{course.category}</span>
                <h3>{course.title}</h3>
                <span>{course.due}</span>
              </div>
              {course.done ? (
                <span className="completed-label">
                  <CheckCircle2 size={16} /> Completed
                </span>
              ) : (
                <button
                  className="outline-button"
                  onClick={() =>
                    setTrainingDone((current) =>
                      current.map((done, position) =>
                        position === index ? true : done,
                      ),
                    )
                  }
                >
                  Mark complete <Check size={15} />
                </button>
              )}
            </article>
          ))}
        </div>
        <section className="learning-recommendation">
          <span className="recommendation-icon">
            <Sparkles size={17} />
          </span>
          <div>
            <span className="event-kicker">A READING FOR LATER</span>
            <strong>Making space for meaningful work</strong>
            <small>
              A short guide to thoughtful collaboration · 8 min read
            </small>
          </div>
          <button
            className="icon-button"
            aria-label="View recommended reading"
            onClick={() =>
              notify("This sample reading will be available in Learning soon.")
            }
          >
            <ArrowRight size={17} />
          </button>
        </section>
      </>
    );
  }

  function directoryPage() {
    const departments = Array.from(
      new Set(visibleCoworkers.map((person) => person.dept)),
    );
    return (
      <>
        <PageHeading
          eyebrow="YOUR PEOPLE"
          title="Company directory"
          description="Good work rarely happens in isolation."
          action={
            <span className="secure-caption">
              <ShieldCheck size={14} /> Work details only
            </span>
          }
        />
        <div className="directory-toolbar">
          <div className="directory-search">
            <Search size={18} />
            <input
              type="search"
              placeholder="Search people, roles or teams…"
              value={directoryQuery}
              onChange={(event) => setDirectoryQuery(event.target.value)}
            />
            <kbd>⌘ K</kbd>
          </div>
          <span className="directory-count">
            {visibleCoworkers.length} teammates
          </span>
        </div>
        <SectionLabel>
          Meet the team{" "}
          <span className="count-caption">
            {departments.length} DEPARTMENTS
          </span>
        </SectionLabel>
        <div className="directory-grid">
          {visibleCoworkers.map((person, index) => (
            <article className="directory-card" key={person.name}>
              <div className="directory-card-top">
                <Avatar initials={person.initials} />
                <button
                  className="icon-button"
                  aria-label={`Contact ${person.name}`}
                  onClick={() =>
                    notify(
                      `Work contact: ${person.name.toLowerCase().replace(" ", ".")}@charliehealth.example`,
                    )
                  }
                >
                  <MoreHorizontal size={18} />
                </button>
              </div>
              <h3>
                {person.name}
                {person.name === shownName && (
                  <span className="you-tag">YOU</span>
                )}
              </h3>
              <p>{person.role}</p>
              <span className="directory-department">{person.dept}</span>
              <div className="directory-card-foot">
                <span>
                  <span className="directory-location-dot" />
                  {person.place}
                </span>
                <button
                  aria-label={`Email ${person.name}`}
                  onClick={() =>
                    notify(
                      `Work email: ${person.name.toLowerCase().replace(" ", ".")}@charliehealth.example`,
                    )
                  }
                >
                  <ArrowUpRight size={15} />
                </button>
              </div>
            </article>
          ))}
          {visibleCoworkers.length === 0 && (
            <div className="empty-state directory-empty">
              <UsersRound size={24} />
              <strong>No teammates match that search</strong>
              <p>Try another name, team or location.</p>
              <button
                className="text-button"
                onClick={() => setDirectoryQuery("")}
              >
                Clear search
              </button>
            </div>
          )}
        </div>
        <div className="directory-privacy">
          <ShieldCheck size={15} /> Personal contact details are never included
          in the directory.
        </div>
      </>
    );
  }

  async function markAnnouncementRead(item: AnnouncementItem) {
    if (!user.demo) {
      try {
        const token = await csrfToken();
        const response = await fetch("/api/notifications", {
          method: "PATCH",
          headers: { "Content-Type": "application/json", "X-CSRF-Token": token },
          body: JSON.stringify({ title: item.title }),
        });
        if (!response.ok) throw new Error();
      } catch {
        notify("This announcement couldn’t be marked as read.");
        return;
      }
      setEmployeeAnnouncements((items) => items.map((entry) => entry.id === item.id ? { ...entry, unread: false } : entry));
    } else {
      setAnnouncements((items) => items.map((entry) => entry.id === item.id ? { ...entry, unread: false } : entry));
    }
  }

  async function markAllAnnouncementsRead() {
    if (!user.demo) {
      try {
        const token = await csrfToken();
        const response = await fetch("/api/notifications", {
          method: "PATCH",
          headers: { "Content-Type": "application/json", "X-CSRF-Token": token },
          body: JSON.stringify({ markAllRead: true }),
        });
        if (!response.ok) throw new Error();
      } catch {
        notify("Announcements couldn’t be updated.");
        return;
      }
      setEmployeeAnnouncements((items) => items.map((item) => ({ ...item, unread: false })));
    } else {
      setAnnouncements((items) => items.map((item) => ({ ...item, unread: false })));
    }
  }

  function announcementsPage() {
    const items = user.demo ? announcements : employeeAnnouncements;
    const unread = items.filter((item) => item.unread).length;
    return (
      <>
        <PageHeading
          eyebrow="FROM AROUND THE COMPANY"
          title="Announcements"
          description="The things worth a moment of your attention."
          action={
            unread > 0 ? (
              <button
                className="outline-button"
                onClick={() => void markAllAnnouncementsRead()}
              >
                Mark all as read <Check size={15} />
              </button>
            ) : undefined
          }
        />
        <div className="announcement-filter-row">
          <span className="count-pill">{unread} unread</span>
          <span>Latest updates from your people and teams</span>
        </div>
        <div className="announcements-list">
          {items.map((item) => (
            <article
              className={`announcement-row ${item.unread ? "announcement-unread" : ""}`}
              key={item.id}
            >
              <div className={`announcement-accent accent-${item.color}`}>
                <span>
                  {item.category === "People & culture" ? (
                    <UsersRound size={19} />
                  ) : item.category === "Company" ? (
                    <Sparkles size={19} />
                  ) : item.category === "Benefits" ? (
                    <HeartPulse size={19} />
                  ) : (
                    <BriefcaseBusiness size={19} />
                  )}
                </span>
              </div>
              <div className="announcement-row-content">
                <div className="announcement-meta">
                  <span>{item.category}</span>
                  <i />
                  {item.date}
                  {item.unread && <b>NEW</b>}
                </div>
                <h2>{item.title}</h2>
                <p>{item.body}</p>
                <button
                  className="read-link"
                  onClick={() => void markAnnouncementRead(item)}
                >
                  {item.unread ? "Mark as read" : "Read update"}
                  <ArrowRight size={15} />
                </button>
              </div>
              <button
                className="icon-button announcement-more"
                aria-label="Announcement options"
                onClick={() =>
                  notify(
                    "This announcement was posted by an authorized administrator.",
                  )
                }
              >
                <MoreHorizontal size={18} />
              </button>
            </article>
          ))}
        </div>
      </>
    );
  }

  function settingsPage() {
    return (
      <>
        <PageHeading
          eyebrow="MAKE IT YOURS"
          title="Settings"
          description="Your account, your preferences, your peace of mind."
        />
        <div className="settings-layout">
          <div className="settings-nav panel">
            <button className="settings-nav-active">
              <UserRound size={16} /> Account
            </button>
            <button
              onClick={() =>
                document
                  .getElementById("notifications-settings")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              <Bell size={16} /> Notifications
            </button>
            <button
              onClick={() =>
                document
                  .getElementById("security-settings")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              <ShieldCheck size={16} /> Security
            </button>
            <button
              onClick={() =>
                document
                  .getElementById("privacy-settings")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              <Fingerprint size={16} /> Privacy
            </button>
          </div>
          <div className="settings-sections">
            <section className="panel settings-card">
              <SectionLabel>Account details</SectionLabel>
              <div className="setting-row">
                <div>
                  <strong>Work email</strong>
                  <small>{profile.workEmail}</small>
                </div>
                <span className="status-chip status-enrolled">Verified</span>
              </div>
              <div className="setting-row">
                <div>
                  <strong>Password</strong>
                  <small>
                    Use a unique password with at least 12 characters, a number
                    and a symbol.
                  </small>
                </div>
                <button className="outline-button" onClick={changePassword}>
                  Change password <ArrowRight size={14} />
                </button>
              </div>
              <div className="setting-row">
                <div>
                  <strong>Remember this device</strong>
                  <small>Choose whether to keep this device signed in.</small>
                </div>
                <ToggleSwitch label="Remember this device" initial={false} />
              </div>
            </section>
            <section
              id="notifications-settings"
              className="panel settings-card"
            >
              <SectionLabel>Notification preferences</SectionLabel>
              <div className="setting-row">
                <div>
                  <strong>Company announcements</strong>
                  <small>Occasional notes from People and Culture.</small>
                </div>
                <ToggleSwitch label="Company announcements" initial />
              </div>
              <div className="setting-row">
                <div>
                  <strong>Time-off updates</strong>
                  <small>Request decisions and upcoming leave reminders.</small>
                </div>
                <ToggleSwitch label="Time-off updates" initial />
              </div>
              <div className="setting-row">
                <div>
                  <strong>Email notifications</strong>
                  <small>
                    Send important portal updates to your work email.
                  </small>
                </div>
                <ToggleSwitch label="Email notifications" initial />
              </div>
            </section>
            <section id="security-settings" className="panel settings-card">
              <SectionLabel>Security</SectionLabel>
              <div className="security-note">
                <span>
                  <ShieldCheck size={18} />
                </span>
                <div>
                  <strong>Your account is protected</strong>
                  <small>
                    {user.demo
                      ? "Fictional demo account · no password or codes are collected."
                      : "This session uses a secure, server-managed account."}
                  </small>
                </div>
                <span className="status-chip status-enrolled">Protected</span>
              </div>
              <div className="setting-row">
                <div>
                  <strong>Multi-factor authentication</strong>
                  <small>
                    Available in production once an organization configures its
                    identity provider.
                  </small>
                </div>
                <span className="coming-soon">Not enabled</span>
              </div>
              <div className="setting-row">
                <div>
                  <strong>Active sessions</strong>
                  <small>
                    {sessionCount} {sessionCount === 1 ? "session" : "sessions"}{" "}
                    for this account · This browser is signed in
                  </small>
                </div>
                <span className="status-chip status-enrolled">
                  Current session
                </span>
              </div>
              <div className="setting-row">
                <div>
                  <strong>Sign out of other sessions</strong>
                  <small>
                    End other portal sessions on devices you no longer use.
                  </small>
                </div>
                <button
                  className="outline-button"
                  onClick={() => void logoutOtherSessions()}
                >
                  Sign out other devices
                </button>
              </div>
              {loginActivity.slice(0, 4).map((activity, index) => (
                <div
                  className="setting-row setting-activity"
                  key={`${activity.action}${index}`}
                >
                  <div>
                    <strong>
                      {activity.action.replaceAll("_", " ").toLowerCase()}
                    </strong>
                    <small>
                      {new Intl.DateTimeFormat("en", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      }).format(new Date(activity.createdAt))}
                    </small>
                  </div>
                  <ShieldCheck size={15} className="setting-shield" />
                </div>
              ))}
            </section>
            <section id="privacy-settings" className="panel settings-card">
              <SectionLabel>Privacy & data</SectionLabel>
              <div className="setting-row">
                <div>
                  <strong>Your information</strong>
                  <small>
                    Private profile information is visible only to you and
                    authorized HR administrators.
                  </small>
                </div>
                <ShieldCheck size={18} className="setting-shield" />
              </div>
              <div className="setting-row">
                <div>
                  <strong>Privacy notice</strong>
                  <small>
                    Learn what information is stored and who can access it.
                  </small>
                </div>
                <button
                  className="subtle-link"
                  onClick={() =>
                    notify(
                      "For privacy questions, contact people@example.test.",
                    )
                  }
                >
                  View notice <ArrowRight size={14} />
                </button>
              </div>
            </section>
          </div>
        </div>
      </>
    );
  }

  const pageContent = () => {
    switch (activePage) {
      case "My profile":
        return profilePage();
      case "Payroll":
        return payrollPage();
      case "Benefits":
        return benefitsPage();
      case "Time off":
        return timeOffPage();
      case "Documents":
        return documentsPage();
      case "Performance":
        return performancePage();
      case "Learning":
        return learningPage();
      case "Directory":
        return directoryPage();
      case "Announcements":
        return announcementsPage();
      case "Settings":
        return settingsPage();
      default:
        return user.demo ? dashboard() : employeeOverviewPage();
    }
  };

  return (
    <div
      className={`portal-frame ${mobileSidebar ? "sidebar-mobile-open" : ""}`}
    >
      <aside className="sidebar">
        <div className="sidebar-brand">
          <Logo />
          <span className="sidebar-org">PEOPLE PORTAL</span>
        </div>
        <div className="sidebar-label">WORKSPACE</div>
        <nav className="sidebar-nav" aria-label="Main navigation">
          {navigation.map((item) => (
            <button
              key={item.label}
              className={`nav-item ${activePage === item.label ? "nav-active" : ""}`}
              onClick={() => {
                setActivePage(item.label);
                setMobileSidebar(false);
              }}
            >
              <item.icon size={18} strokeWidth={1.8} />
              <span>{item.label}</span>
              {item.label === "Announcements" &&
                portalAnnouncements.some((entry) => entry.unread) && (
                  <span className="nav-unread" />
                )}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <button
            className={`nav-item ${activePage === "Settings" ? "nav-active" : ""}`}
            onClick={() => {
              setActivePage("Settings");
              setMobileSidebar(false);
            }}
          >
            <Settings2 size={18} strokeWidth={1.8} />
            <span>Settings</span>
          </button>
          <button
            className="sidebar-help"
            onClick={() =>
              (window.location.href = "mailto:people@example.test")
            }
          >
            <CircleHelp size={17} />
            <span>People Ops support</span>
            <ArrowUpRight size={14} />
          </button>
          <a className="sidebar-shortcut" href="/onboarding"><FileCheck2 size={15} /> Onboarding checklist <ArrowUpRight size={13} /></a>
          {user.role !== "EMPLOYEE" && <a className="sidebar-shortcut" href="/admin"><ShieldCheck size={15} /> Administrator workspace <ArrowUpRight size={13} /></a>}
          <button
            className="sidebar-user"
            onClick={() => {
              setActivePage("My profile");
              setMobileSidebar(false);
            }}
          >
            <Avatar initials={userInitials} size="small" imageUrl={profileImage} />
            <span>
              <strong>{shownName}</strong>
              <small>{formatEmployeeId(user.employeeId)}</small>
            </span>
            <MoreHorizontal size={18} />
          </button>
        </div>
      </aside>
      <button
        className="mobile-scrim"
        aria-label="Close navigation"
        onClick={() => setMobileSidebar(false)}
      />
      <main className="main-column">
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="icon-button mobile-menu"
              onClick={() => setMobileSidebar(true)}
              aria-label="Open navigation"
            >
              <Menu size={19} />
            </button>
            <span className="breadcrumb">
              People portal <ChevronRight size={14} />{" "}
              <strong>{activePage}</strong>
            </span>
          </div>
          <div className="topbar-right">
            <DemoPill demo={user.demo} />
            <button
              className="icon-button topbar-help"
              aria-label="Contact help"
              title="People Operations support"
              onClick={() =>
                (window.location.href = "mailto:people@example.test")
              }
            >
              <CircleHelp size={19} />
            </button>
            <div className="popover-anchor">
              <button
                className={`icon-button topbar-notifications ${notificationsOpen ? "icon-button-selected" : ""}`}
                aria-label="Notifications"
                aria-expanded={notificationsOpen}
                onClick={() => {
                  setNotificationsOpen((value) => !value);
                  setAccountOpen(false);
                }}
              >
                <Bell size={19} />
                <span className="notification-badge" />
              </button>
              {notificationsOpen && (
                <div className="notification-popover">
                  <div className="popover-heading">
                    <strong>Notifications</strong>
                    <span>{portalAnnouncements.filter((item) => item.unread).length} new</span>
                  </div>
                  {portalAnnouncements.filter((item) => item.unread).slice(0, 3).map((item) => (
                    <button key={item.id} onClick={() => { setActivePage("Announcements"); setNotificationsOpen(false); }}>
                      <span className="notification-type type-benefit"><Bell size={15} /></span>
                      <span><strong>{item.title}</strong><small>{item.body}</small><em>{item.date}</em></span>
                    </button>
                  ))}
                  {portalAnnouncements.every((item) => !item.unread) && <p className="notification-empty">You’re all caught up.</p>}
                </div>
              )}
            </div>
            <div className="popover-anchor">
              <button
                className="topbar-profile"
                aria-expanded={accountOpen}
                onClick={() => {
                  setAccountOpen((value) => !value);
                  setNotificationsOpen(false);
                }}
              >
                <Avatar initials={userInitials} size="small" imageUrl={profileImage} />
                <ChevronDown size={14} />
              </button>
              {accountOpen && (
                <div className="account-popover">
                  <div className="account-popover-id">
                    <strong>{shownName}</strong>
                    <small>
                      {user.role === "EMPLOYEE" ? "Employee" : user.role}
                    </small>
                  </div>
                  <button
                    onClick={() => {
                      setActivePage("My profile");
                      setAccountOpen(false);
                    }}
                  >
                    <UserRound size={15} /> My profile
                  </button>
                  <button
                    onClick={() => {
                      setActivePage("Settings");
                      setAccountOpen(false);
                    }}
                  >
                    <Settings2 size={15} /> Settings
                  </button>
                  <button className="logout-option" onClick={logout}>
                    <LogOut size={15} /> Sign out securely
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
        <div className="page-scroll">
          <div className="page-container">
            {pageContent()}
            <footer className="portal-footer">
              <span>Charlie Health · Employee portal</span>
              <span>
                <ShieldCheck size={13} /> Secure, private and just for you
              </span>
            </footer>
          </div>
        </div>
      </main>
      {toast && (
        <div className="toast" role="status">
          <CheckCircle2 size={17} />
          {toast}
          <button
            className="toast-close"
            onClick={() => setToast("")}
            aria-label="Dismiss"
          >
            <X size={15} />
          </button>
        </div>
      )}
      {passwordDialog && (
        <PasswordChangeDialog
          onClose={() => setPasswordDialog(false)}
          onSuccess={() => {
            setPasswordDialog(false);
            notify(
              "Your password has been updated. Other sessions have been signed out.",
            );
          }}
        />
      )}
    </div>
  );
}

function StaticField({ label, value }: { label: string; value: string }) {
  return (
    <div className="static-field">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function HolidayRow({
  day,
  month,
  title,
  detail,
}: {
  day: string;
  month: string;
  title: string;
  detail: string;
}) {
  return (
    <div className="holiday-row">
      <div className="holiday-date">
        <span>{month}</span>
        <strong>{day}</strong>
      </div>
      <div>
        <strong>{title}</strong>
        <small>{detail}</small>
      </div>
    </div>
  );
}

function DocumentRows({
  documents,
  demo = true,
}: {
  documents: typeof initialDocuments;
  demo?: boolean;
}) {
  if (!documents.length)
    return (
      <p className="data-footnote">
        Your documents will appear here when available.
      </p>
    );
  return (
    <div className="simple-document-list">
      {documents.map((document) => (
        <div className="simple-document-row" key={document.title}>
          <span className="document-type-icon doc-color-0">
            <FileText size={16} />
          </span>
          <span>
            <strong>{document.title}</strong>
            <small>
              {demo
                ? `${document.date} · Fictional demo`
                : `${document.date} · Private employee record`}
            </small>
          </span>
          <DownloadButton title={document.title} demo={demo} />
        </div>
      ))}
    </div>
  );
}

function GoalCard({
  title,
  detail,
  progress,
  color,
  due,
}: {
  title: string;
  detail: string;
  progress: number;
  color: string;
  due: string;
}) {
  return (
    <article className="goal-card">
      <div className="goal-card-top">
        <span className="goal-icon">
          <Sparkles size={17} />
        </span>
        <span className="status-chip status-pending">In progress</span>
      </div>
      <h3>{title}</h3>
      <p>{detail}</p>
      <div className="goal-progress">
        <span>Progress</span>
        <strong>{progress}%</strong>
      </div>
      <ProgressBar value={progress} color={color} />
      <div className="goal-card-foot">
        <span>{due}</span>
        <button className="icon-button" aria-label={`View goal: ${title}`}>
          <ArrowRight size={15} />
        </button>
      </div>
    </article>
  );
}

function ToggleSwitch({ label, initial }: { label: string; initial: boolean }) {
  const [enabled, setEnabled] = useState(initial);
  return (
    <button
      className={`toggle-switch ${enabled ? "toggle-on" : ""}`}
      role="switch"
      aria-checked={enabled}
      aria-label={label}
      onClick={() => setEnabled((value) => !value)}
    >
      <span />
    </button>
  );
}

function TimeOffModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (request: {
    category: string;
    startDate: string;
    endDate: string;
    notes: string;
  }) => Promise<void>;
}) {
  const [category, setCategory] = useState("Vacation");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (end < start) {
      setError("Your end date must be the same as or after your start date.");
      return;
    }
    void onSubmit({ category, startDate: start, endDate: end, notes: note });
  }
  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="timeoff-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="request-title"
      >
        <div className="modal-top">
          <div className="modal-icon">
            <CalendarDays size={19} />
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Close">
            <X size={19} />
          </button>
        </div>
        <span className="eyebrow">MAKE SPACE TO RESET</span>
        <h2 id="request-title">Request time off</h2>
        <p>Give your team a little notice and we’ll take care of the rest.</p>
        <form onSubmit={submit}>
          <label>
            Type of leave
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              <option>Vacation</option>
              <option>Sick leave</option>
              <option>Personal leave</option>
              <option>Other leave</option>
            </select>
          </label>
          <div className="modal-date-row">
            <label>
              First day
              <input
                type="date"
                required
                value={start}
                onChange={(event) => setStart(event.target.value)}
              />
            </label>
            <label>
              Last day
              <input
                type="date"
                required
                value={end}
                onChange={(event) => setEnd(event.target.value)}
                min={start}
              />
            </label>
          </div>
          <label>
            Note for your manager{" "}
            <textarea
              rows={3}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Anything your manager should know?"
              maxLength={500}
            />
          </label>
          {error && (
            <span role="alert" className="modal-error">
              {error}
            </span>
          )}
          <div className="modal-footer">
            <button type="button" className="outline-button" onClick={onClose}>
              Not right now
            </button>
            <button type="submit" className="primary-button">
              Send request <ArrowRight size={15} />
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function PasswordChangeDialog({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (next !== confirmation) {
      setError("Your new passwords don’t match.");
      return;
    }
    setBusy(true);
    try {
      const token = await csrfToken();
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-CSRF-Token": token },
        body: JSON.stringify({ currentPassword: current, newPassword: next }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error ?? "Password could not be changed.");
      onSuccess();
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Password could not be changed.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="timeoff-modal password-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="password-change-heading"
      >
        <div className="modal-top">
          <div className="modal-icon">
            <ShieldCheck size={19} />
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Close">
            <X size={19} />
          </button>
        </div>
        <span className="eyebrow">ACCOUNT SECURITY</span>
        <h2 id="password-change-heading">Change password</h2>
        <p>Re-enter your current password to confirm it’s really you.</p>
        <form onSubmit={submit}>
          <label>
            Current password
            <input
              type="password"
              autoComplete="current-password"
              required
              maxLength={128}
              value={current}
              onChange={(event) => setCurrent(event.target.value)}
            />
          </label>
          <label>
            New password
            <input
              type="password"
              autoComplete="new-password"
              required
              minLength={12}
              maxLength={128}
              value={next}
              onChange={(event) => setNext(event.target.value)}
            />
          </label>
          <label>
            Confirm new password
            <input
              type="password"
              autoComplete="new-password"
              required
              minLength={12}
              maxLength={128}
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
            />
          </label>
          <span className="password-requirement">
            12+ characters, uppercase, lowercase, a number and a symbol.
          </span>
          {error && (
            <span className="modal-error" role="alert">
              {error}
            </span>
          )}
          <div className="modal-footer">
            <button
              className="outline-button"
              type="button"
              disabled={busy}
              onClick={onClose}
            >
              Cancel
            </button>
            <button className="primary-button" disabled={busy}>
              {busy ? "Saving…" : "Update password"}
              <ArrowRight size={15} />
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default function HomePage() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  useEffect(() => {
    fetch("/api/auth/me", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (data?.user) setUser(data.user);
      })
      .catch(() => {})
      .finally(() => setCheckingSession(false));
  }, []);
  async function logout() {
    try {
      const response = await fetch("/api/auth/csrf", { cache: "no-store" });
      const { csrfToken } = await response.json();
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: { "X-CSRF-Token": csrfToken },
      });
    } catch {
      /* The client still returns to the sign-in screen. */
    }
    setUser(null);
  }
  if (checkingSession)
    return (
      <main className="loading-screen">
        <span className="loading-mark">
          <span />
          <span />
          <span />
          <span />
        </span>
        <p>Getting your workspace ready…</p>
      </main>
    );
  if (!user) return <SignIn onSignIn={setUser} />;
  return <AppPortal user={user} onLogout={logout} />;
}
