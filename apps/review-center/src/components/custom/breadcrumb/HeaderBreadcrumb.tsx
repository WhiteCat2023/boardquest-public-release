import React from "react";
import { useLocation, Link } from "react-router-dom";
import { Home } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export function HeaderBreadcrumb() {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  const routeNameMap: Record<string, string> = {
    dashboard: "Dashboard",
    candidates: "Enrolled Students",
    students: "Enrolled Students",
    add: "Add Students",
    calendar: "Calendar",
    schedules: "Calendar",
    settings: "Portal Settings",
    scores: "Scores & Grades",
    subject: "Subject",
    assessment: "Assessment",
    "clinical-chemistry": "Clinical Chemistry",
    "microbiology-parasitology": "Microbiology & Parasitology",
    hematology: "Hematology",
    "immunology-serology": "Immunology & Serology",
    "clinical-microscopy": "Clinical Microscopy",
    "histopathology-medtech-laws": "Histopathology & MedTech Laws",
  };

  return (
    <Breadcrumb className="text-xs font-sans font-medium">
      <BreadcrumbList className="gap-1.5 text-xs text-muted-foreground">
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link
              to="/dashboard"
              className="flex items-center gap-1 hover:text-foreground transition-colors"
            >
              <Home className="size-3.5 text-muted-foreground" />
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>

        {pathnames.map((value, index) => {
          const to = `/${pathnames.slice(0, index + 1).join("/")}`;
          const isLast = index === pathnames.length - 1;
          const displayName =
            routeNameMap[value.toLowerCase()] ||
            (/^[0-9a-fA-F]{24}$/.test(value)
              ? "Scores & Roster"
              : /^\d{4}-\d{4}$/.test(value)
              ? `S.Y. ${value}`
              : decodeURIComponent(value));

          return (
            <React.Fragment key={to}>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage className="font-bold text-foreground capitalize text-xs">
                    {displayName}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link
                      to={to}
                      className="hover:text-foreground transition-colors capitalize text-xs"
                    >
                      {displayName}
                    </Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

export default HeaderBreadcrumb;
