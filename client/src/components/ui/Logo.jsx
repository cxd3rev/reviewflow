import { Link } from "react-router-dom";

export function BrandMark({ className = "h-9 w-9" }) {
  return (
    <img
      src="/icon.png"
      alt=""
      className={`rounded-xl object-cover shadow-sm ring-1 ring-black/10 ${className}`}
    />
  );
}

export function Logo({ to = "/", variant = "lockup" }) {
  const content =
    variant === "wordmark" ? (
      <img src="/logo.png" alt="ReviewFlow" className="h-8 w-auto md:h-9" />
    ) : (
      <span className="inline-flex items-center gap-2.5">
        <BrandMark className="h-8 w-8" />
        <span className="text-[15px] font-semibold tracking-tight text-ink">ReviewFlow</span>
      </span>
    );

  if (!to) return content;
  return <Link to={to}>{content}</Link>;
}
