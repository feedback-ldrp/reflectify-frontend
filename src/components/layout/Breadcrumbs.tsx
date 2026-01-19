/**
 * @file src/components/layout/Breadcrumbs.tsx
 * @description Breadcrumb navigation component for better wayfinding
 */

"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

// Human-readable labels for routes
const routeLabels: Record<string, string> = {
  dashboard: "Dashboard",
  upload: "Upload Data",
  "feedback-forms": "Feedback Forms",
  analytics: "Analytics",
  years: "Academic Years",
  departments: "Departments",
  semesters: "Semesters",
  divisions: "Divisions",
  subjects: "Subjects",
  faculties: "Faculty",
  me: "My Profile",
  about: "About",
  create: "Create New",
  edit: "Edit",
};

export function Breadcrumbs() {
  const pathname = usePathname();

  // Split path and create breadcrumb items
  const pathSegments = pathname.split("/").filter(Boolean);

  // Don't show breadcrumbs on dashboard (home)
  if (pathSegments.length <= 1 && pathSegments[0] === "dashboard") {
    return null;
  }

  const breadcrumbs = pathSegments.map((segment, index) => {
    const href = "/" + pathSegments.slice(0, index + 1).join("/");
    const isLast = index === pathSegments.length - 1;

    // Get human-readable label
    let label = routeLabels[segment] || segment;

    // If it looks like an ID (UUID or number), show a generic label
    if (
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        segment,
      ) ||
      /^\d+$/.test(segment)
    ) {
      label = "Details";
    }

    return {
      label,
      href,
      isLast,
    };
  });

  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center gap-1 text-sm text-light-muted-text dark:text-dark-muted-text mb-4"
    >
      <Link
        href="/dashboard"
        className="flex items-center gap-1 hover:text-light-highlight dark:hover:text-dark-highlight transition-colors"
      >
        <Home className="h-4 w-4" />
        <span className="sr-only">Home</span>
      </Link>

      {breadcrumbs.map((crumb, index) => (
        <React.Fragment key={crumb.href}>
          <ChevronRight className="h-4 w-4 flex-shrink-0" />
          {crumb.isLast ? (
            <span
              className="font-medium text-light-text dark:text-dark-text truncate max-w-[200px]"
              aria-current="page"
            >
              {crumb.label}
            </span>
          ) : (
            <Link
              href={crumb.href}
              className="hover:text-light-highlight dark:hover:text-dark-highlight transition-colors truncate max-w-[150px]"
            >
              {crumb.label}
            </Link>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}
