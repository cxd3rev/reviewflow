import { Link } from "react-router-dom";
import icon from "../../assets/icon.png";
import logo from "../../assets/logo.png";
import { APP_NAME } from "../../config/brand.js";

export function BrandMark({ className = "h-9 w-9" }) {
  return <img src={icon} alt="" className={`object-contain ${className}`} />;
}

export function Logo({ to = "/", variant = "wordmark" }) {
  const content =
    variant === "mark" ? (
      <BrandMark className="h-8 w-8" />
    ) : (
      <img src={logo} alt={APP_NAME} className="h-8 w-auto md:h-9" />
    );

  if (!to) return content;
  return <Link to={to}>{content}</Link>;
}
