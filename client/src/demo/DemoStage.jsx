import { Link } from "react-router-dom";
import { localizedPrice } from "../config/pricing.js";
import { Logo } from "../components/ui/Logo.jsx";
import { PageHeader } from "../components/ui/PageHeader.jsx";
import { StatusBadge } from "../components/ui/StatusBadge.jsx";
import { ProductMock } from "../pages/landing/ProductMock.jsx";
import { useI18n } from "../i18n/LanguageContext.jsx";
import { DEMO_BUSINESS, DEMO_CUSTOMERS, DEMO_JOBS, DEMO_REQUESTS, DEMO_STATS } from "./fixtures.js";

function SideLink({ active, children }) {
  return (
    <div className={`rounded-lg px-3 py-2 text-sm ${active ? "bg-white/10 font-medium text-white" : "text-zinc-500"}`}>
      {children}
    </div>
  );
}

function AppChrome({ view, children }) {
  const { t } = useI18n();
  return (
    <div className="demo-app">
      <aside className="demo-app-side">
        <div className="mb-5 text-xs font-semibold tracking-tight text-white">starywrld</div>
        <p className="mb-4 truncate px-1 text-[11px] text-zinc-500">{DEMO_BUSINESS.name}</p>
        <nav className="space-y-1">
          <SideLink active={view === "dashboard"}>{t("nav.home")}</SideLink>
          <SideLink active={view === "customers"}>{t("nav.customers")}</SideLink>
          <SideLink active={view === "jobs"}>{t("nav.jobs")}</SideLink>
          <SideLink active={view === "requests"}>{t("nav.requests")}</SideLink>
        </nav>
      </aside>
      <div className="demo-app-main">{children}</div>
    </div>
  );
}

function HeroStage() {
  const { t } = useI18n();
  return (
    <div className="grid h-full grid-cols-2 items-center gap-10 px-12">
      <div>
        <p className="text-sm font-medium tracking-wide text-zinc-400">{t("hero.kicker")}</p>
        <h1 className="display mt-3 text-5xl font-bold leading-[1.05] tracking-tight text-white">{t("hero.title")}</h1>
        <p className="mt-5 max-w-md text-lg leading-8 text-zinc-400">{t("hero.subtitle")}</p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link to="/signup" className="btn-cta" data-ai-target="hero-get-started">
            {t("common.getStarted")}
          </Link>
          <Link to="/login" className="btn-secondary px-8 py-3.5 text-base" data-ai-target="hero-login">
            {t("common.login")}
          </Link>
        </div>
        <p className="mt-4 text-sm text-zinc-500">{t("hero.trial", { price: localizedPrice(t) })}</p>
      </div>
      <div className="demo-hero-mock" data-ai-target="product-mock">
        <ProductMock />
      </div>
    </div>
  );
}

function ProblemStage() {
  const { t } = useI18n();
  return (
    <div className="flex h-full flex-col justify-center px-14 py-10">
      <h2 className="display text-center text-4xl font-semibold tracking-tight text-white">{t("compare.title")}</h2>
      <p className="mx-auto mt-3 max-w-2xl text-center text-lg text-muted">{t("compare.subtitle")}</p>
      <div className="mt-10 grid grid-cols-2 gap-6">
        <div className="rounded-2xl border border-white/10 bg-[#0f0f11] p-8" data-ai-target="compare-without">
          <h3 className="text-xl font-semibold text-zinc-300">{t("compare.without")}</h3>
          <p className="mt-1 text-sm text-muted">{t("compare.withoutSub")}</p>
          <ul className="mt-6 space-y-3 text-zinc-400">
            {[t("compare.w1"), t("compare.w2"), t("compare.w3"), t("compare.w4")].map((item) => (
              <li key={item} className="flex gap-3">
                <span className="mt-0.5 text-zinc-600">×</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-white/15 bg-surface p-8" data-ai-target="compare-with">
          <h3 className="text-xl font-semibold text-white">{t("compare.with")}</h3>
          <p className="mt-1 text-sm text-zinc-400">{t("compare.withSub")}</p>
          <ul className="mt-6 space-y-3 text-zinc-300">
            {[t("compare.a1"), t("compare.a2"), t("compare.a3"), t("compare.a4")].map((item) => (
              <li key={item} className="flex gap-3">
                <span className="mt-0.5 font-semibold text-white">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function HowStage() {
  const { t } = useI18n();
  const steps = [
    ["1", t("how.s1t"), t("how.s1d")],
    ["2", t("how.s2t"), t("how.s2d")],
    ["3", t("how.s3t"), t("how.s3d")],
    ["4", t("how.s4t"), t("how.s4d")],
  ];
  return (
    <div className="flex h-full flex-col justify-center px-12 py-10" data-ai-target="how">
      <p className="text-center text-sm font-semibold uppercase tracking-wider text-zinc-500">{t("how.eyebrow")}</p>
      <h2 className="display mx-auto mt-2 max-w-3xl text-center text-4xl font-semibold tracking-tight text-white">
        {t("how.title")}
      </h2>
      <p className="mx-auto mt-3 max-w-2xl text-center text-lg text-muted">{t("how.subtitle")}</p>
      <div className="mt-10 grid grid-cols-4 gap-5">
        {steps.map((item) => (
          <div
            key={item[0]}
            className="rounded-2xl border border-white/10 bg-surface p-5"
            data-ai-target={`how-${item[0]}`}
          >
            <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-full bg-white text-sm font-bold text-black">
              {item[0]}
            </div>
            <h3 className="text-base font-semibold text-white">{item[1]}</h3>
            <p className="mt-2 text-sm leading-6 text-muted">{item[2]}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function CustomersStage() {
  const { t } = useI18n();
  return (
    <AppChrome view="customers">
      <PageHeader
        title={t("customers.title")}
        description={t("customers.desc")}
        action={
          <button type="button" className="btn-primary" data-ai-target="add-customer">
            {t("customers.add")}
          </button>
        }
      />
      <div className="card overflow-hidden">
        <table className="data-table">
          <thead>
            <tr>
              <th>{t("common.name")}</th>
              <th>{t("common.email")}</th>
              <th>{t("common.phone")}</th>
            </tr>
          </thead>
          <tbody>
            {DEMO_CUSTOMERS.map((customer) => (
              <tr key={customer.id}>
                <td className="font-medium text-white">
                  {customer.firstName} {customer.lastName}
                </td>
                <td>{customer.email}</td>
                <td className="text-muted">{customer.phone}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppChrome>
  );
}

function JobsStage({ ui }) {
  const { t } = useI18n();
  const jobs = DEMO_JOBS.map((job) =>
    job.id === "j2" && ui.jobCompleted ? { ...job, status: "completed", completedAt: t("time.justNow") } : job
  );
  return (
    <AppChrome view="jobs">
      <PageHeader
        title={t("jobs.title")}
        description={t("jobs.desc")}
        action={
          <button type="button" className="btn-primary" data-ai-target="add-job">
            {t("jobs.add")}
          </button>
        }
      />
      {ui.notice || ui.jobCompleted ? <p className="alert-ok mb-4">{t("jobs.scheduled")}</p> : null}
      <div className="card overflow-hidden">
        <table className="data-table">
          <thead>
            <tr>
              <th>{t("common.customer")}</th>
              <th>{t("common.job")}</th>
              <th>{t("jobs.completed")}</th>
              <th>{t("common.status")}</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => (
              <tr key={job.id} data-ai-target={job.id === "j2" ? "demo-job-row" : undefined}>
                <td className="font-medium text-white">{job.customerName}</td>
                <td>{job.title}</td>
                <td className="text-muted">{job.completedAt}</td>
                <td>
                  <StatusBadge status={job.status} kind="job" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {ui.jobModal ? (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50 p-8">
          <div className="w-[28rem] rounded-2xl border border-white/10 bg-[#141416] p-5">
            <h3 className="text-lg font-semibold text-white">{t("jobs.add")}</h3>
            <div className="mt-4 space-y-3">
              <div>
                <label className="label">{t("common.customer")}</label>
                <input className="input" readOnly value={ui.jobFilled ? "Sarah Johnson" : ""} />
              </div>
              <div>
                <label className="label">{t("common.job")}</label>
                <input className="input" readOnly value={ui.jobFilled ? "Kitchen renovation" : ""} />
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </AppChrome>
  );
}

function RequestsStage({ variant }) {
  const { t } = useI18n();
  const sent = variant === "sent";
  const requests = DEMO_REQUESTS.map((request) => {
    if (request.id !== "r2") return request;
    return sent
      ? { ...request, status: "sent", sentAt: t("time.justNow") }
      : request;
  });
  return (
    <AppChrome view="requests">
      <PageHeader title={t("requests.title")} description={t("requests.desc")} />
      <div className="card overflow-hidden">
        <table className="data-table">
          <thead>
            <tr>
              <th>{t("common.customer")}</th>
              <th>{t("common.job")}</th>
              <th>{t("requests.scheduled")}</th>
              <th>{t("requests.sent")}</th>
              <th>{t("common.status")}</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((request) => (
              <tr
                key={request.id}
                data-ai-target={request.id === "r2" ? (sent ? "demo-request-sent" : "demo-request-row") : undefined}
              >
                <td className="font-medium text-white">{request.customerName}</td>
                <td>{request.jobTitle}</td>
                <td className="text-muted">{request.scheduledAt}</td>
                <td className="text-muted">{request.sentAt}</td>
                <td>
                  <StatusBadge status={request.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppChrome>
  );
}

function DashboardStage() {
  const { t } = useI18n();
  const labels = {
    sent: t("dash.sent"),
    clicks: t("dash.clicks"),
    conversion: t("dash.conversion"),
    reviews: t("dash.reviews"),
  };
  return (
    <AppChrome view="dashboard">
      <div className="mb-6 flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-zinc-500">{t("dash.welcome", { name: "Aron" })}</p>
          <h1 className="display mt-1 text-3xl font-semibold tracking-tight text-white">{t("dash.title")}</h1>
          <p className="mt-1 text-sm text-zinc-400">{t("dash.overview")}</p>
        </div>
        <button type="button" className="btn-primary" data-ai-target="new-job">
          {t("dash.newJob")}
        </button>
      </div>
      <div className="grid grid-cols-4 gap-4" data-ai-target="dashboard-stats">
        {DEMO_STATS.map((stat) => (
          <div key={stat.key} className="card p-5">
            <div className="flex items-center justify-between gap-2">
              <div className="text-sm text-zinc-500">{labels[stat.key]}</div>
              {stat.trend ? <span className="trend-up">{stat.trend}</span> : null}
            </div>
            <div className="display mt-2 text-3xl font-semibold tracking-tight text-white">{stat.value}</div>
          </div>
        ))}
      </div>
      <div className="card mt-6 overflow-hidden">
        <div className="px-4 py-3 text-sm font-semibold text-white">{t("dash.table")}</div>
        <table className="data-table">
          <thead>
            <tr>
              <th>{t("common.status")}</th>
              <th>{t("common.customer")}</th>
              <th>{t("common.channel")}</th>
              <th>{t("common.date")}</th>
            </tr>
          </thead>
          <tbody>
            {DEMO_REQUESTS.map((request) => (
              <tr key={request.id}>
                <td>
                  <StatusBadge status={request.status} />
                </td>
                <td className="font-medium text-white">{request.customerName}</td>
                <td className="text-zinc-400">{t("mock.email")}</td>
                <td className="text-zinc-500">{request.scheduledAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppChrome>
  );
}

function BenefitsStage() {
  const { t } = useI18n();
  const items = [
    { id: "demo-benefit-auto", title: t("features.f1t"), text: t("features.f1d") },
    { id: "demo-benefit-simple", title: t("features.f3t"), text: t("features.f3d") },
    { id: "demo-benefit-status", title: t("features.f5t"), text: t("features.f5d") },
    { id: "demo-benefit-guide", title: t("orb.name"), text: t("orb.empty") },
  ];
  return (
    <div className="flex h-full flex-col justify-center px-14 py-10" data-ai-target="features">
      <p className="text-center text-sm font-semibold uppercase tracking-wider text-zinc-500">{t("features.eyebrow")}</p>
      <h2 className="display mx-auto mt-2 max-w-3xl text-center text-4xl font-semibold tracking-tight text-white">
        {t("features.title")}
      </h2>
      <p className="mx-auto mt-3 max-w-2xl text-center text-lg text-muted">{t("features.subtitle")}</p>
      <div className="mt-10 grid grid-cols-2 gap-5">
        {items.map((item) => (
          <div key={item.id} className="rounded-2xl border border-white/10 bg-surface p-6" data-ai-target={item.id}>
            <h3 className="text-lg font-semibold text-white">{item.title}</h3>
            <p className="mt-2 text-sm leading-6 text-muted">{item.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function CtaStage() {
  const { t } = useI18n();
  return (
    <div className="flex h-full flex-col items-center justify-center px-12 text-center">
      <Logo to={null} variant="wordmark" />
      <h2 className="display mt-8 text-5xl font-semibold tracking-tight text-white">{t("cta.title")}</h2>
      <p className="mx-auto mt-4 max-w-xl text-lg text-zinc-400">{t("cta.subtitle")}</p>
      <Link to="/signup" className="btn-cta mt-8" data-ai-target="closing-cta">
        {t("common.getStarted")}
      </Link>
        <p className="mt-4 text-sm text-zinc-500">{t("cta.after", { price: localizedPrice(t) })}</p>
    </div>
  );
}

export function DemoStage({ scene, ui, scale, canvasRef }) {
  const stage = scene?.stage || "hero";
  let body = null;
  if (stage === "hero") body = <HeroStage />;
  else if (stage === "problem") body = <ProblemStage />;
  else if (stage === "how") body = <HowStage />;
  else if (stage === "customers") body = <CustomersStage />;
  else if (stage === "jobs") body = <JobsStage ui={ui} />;
  else if (stage === "requests") body = <RequestsStage variant={scene.variant} />;
  else if (stage === "dashboard") body = <DashboardStage />;
  else if (stage === "benefits") body = <BenefitsStage />;
  else if (stage === "cta") body = <CtaStage />;
  else body = <HeroStage />;

  return (
    <div
      ref={canvasRef}
      className={`demo-canvas${scene?.transition === "fade" ? " is-fade" : ""}`}
      style={{ transform: `translate(-50%, -50%) scale(${scale})` }}
    >
      {body}
    </div>
  );
}
