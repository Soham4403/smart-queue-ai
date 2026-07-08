import { Link } from "react-router-dom";
import Button from "./button";

export default function ProtectedAction({
  children,
  to = "/doctors",
  className = "",
  variant = "primary",
}) {
  const token = localStorage.getItem("token");

  if (token) {
    return (
      <Link to={to} className={className}>
        <Button variant={variant}>{children}</Button>
      </Link>
    );
  }

  return (
    <div className={`flex flex-wrap items-center justify-center gap-3 ${className}`}>
      <Link to="/register">
        <Button variant={variant}>{children}</Button>
      </Link>
      <Link to="/login" className="text-sm font-semibold text-blue-200 hover:text-white">
        Login first
      </Link>
    </div>
  );
}
