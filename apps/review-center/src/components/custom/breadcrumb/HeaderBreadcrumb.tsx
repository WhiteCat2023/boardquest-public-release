import { useLocation, Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

export function HeaderBreadcrumb() {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  const routeNameMap: Record<string, string> = {
    dashboard: "Dashboard",
    candidates: "Enrolled Students",
    students: "Enrolled Students",
    add: "Add Students",
    schedules: "Evaluation Schedules",
    settings: "Portal Settings",
  };

  return (
    <nav className="flex items-center gap-1.5 text-xs text-muted-foreground font-sans font-medium">
      <Link
        to="/dashboard"
        className="flex items-center gap-1 hover:text-foreground transition-colors"
      >
        <Home className="size-3.5 text-muted-foreground" />
      </Link>

      {pathnames.map((value, index) => {
        const to = `/${pathnames.slice(0, index + 1).join("/")}`;
        const isLast = index === pathnames.length - 1;
        const displayName =
          routeNameMap[value.toLowerCase()] ||
          (/^\d{4}-\d{4}$/.test(value) ? `S.Y. ${value}` : decodeURIComponent(value));

        return (
          <div key={to} className="flex items-center gap-1.5">
            <ChevronRight className="size-3 text-muted-foreground/60 shrink-0" />
            {isLast ? (
              <span className="font-bold text-foreground capitalize">
                {displayName}
              </span>
            ) : (
              <Link
                to={to}
                className="hover:text-foreground transition-colors capitalize"
              >
                {displayName}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}

export default HeaderBreadcrumb;
