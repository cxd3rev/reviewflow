import { Link } from "react-router-dom";
import { APP_NAME } from "../../config/brand.js";

const bust = "20260912d";
const file = (name) => `${import.meta.env.BASE_URL}${name}?v=${bust}`;
const LOGO_SRC = file("starywrld-logo.png");
const ICON_SRC = file("starywrld-icon.png");

export function BrandMark({ className = "h-9 w-9" }) {
  return <img src={ICON_SRC} alt="" className={`object-contain ${className}`} />;
}

export function Logo({ to = "/", variant = "wordmark" }) {
  const content =
    variant === "mark" ? (
      <BrandMark className="h-9 w-9" />
    ) : (
      <img src={LOGO_SRC} alt={APP_NAME} className="h-10 w-auto md:h-12" />
    );

  if (!to) return content;
  return (
    <Link to={to} className="inline-flex items-center">
      {content}
    </Link>
  );
}
