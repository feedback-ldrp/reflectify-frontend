/**
 * @file src/components/layout/Sidebar.tsx
 * @description Clean sidebar navigation for admin users
 */

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Upload,
  FileText,
  BarChart3,
  Building2,
  BookOpen,
  Calendar,
  Users,
  Layers,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  requiredSuper?: boolean;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    title: "Overview",
    items: [
      {
        label: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
      },
      {
        label: "Analytics",
        href: "/analytics",
        icon: BarChart3,
        requiredSuper: true,
      },
    ],
  },
  {
    title: "Feedback",
    items: [
      {
        label: "Upload Data",
        href: "/upload",
        icon: Upload,
        requiredSuper: true,
      },
      {
        label: "Feedback Forms",
        href: "/feedback-forms",
        icon: FileText,
        requiredSuper: true,
      },
    ],
  },
  {
    title: "Manage",
    items: [
      {
        label: "Academic Years",
        href: "/years",
        icon: Calendar,
      },
      {
        label: "Departments",
        href: "/departments",
        icon: Building2,
      },
      {
        label: "Semesters",
        href: "/semesters",
        icon: BookOpen,
      },
      {
        label: "Divisions",
        href: "/divisions",
        icon: Layers,
      },
      {
        label: "Subjects",
        href: "/subjects",
        icon: BookOpen,
      },
      {
        label: "Faculty",
        href: "/faculties",
        icon: Users,
      },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Filter nav items based on user permissions
  const filteredNavGroups = navGroups
    .map((group) => ({
      ...group,
      items: group.items.filter(
        (item) => !item.requiredSuper || (item.requiredSuper && user?.isSuper),
      ),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <aside
      className={cn(
        "sticky top-[73px] h-[calc(100vh-73px)] bg-light-background dark:bg-dark-muted-background border-r border-light-secondary/50 dark:border-dark-secondary/50 transition-all duration-300 flex flex-col",
        isCollapsed ? "w-[68px]" : "w-56",
      )}
    >
      {/* Collapse Toggle */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-6 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-light-secondary dark:border-dark-secondary bg-light-background dark:bg-dark-background shadow-sm hover:bg-light-muted-background dark:hover:bg-dark-secondary transition-colors"
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {isCollapsed ? (
          <ChevronRight className="h-3.5 w-3.5 text-light-muted-text dark:text-dark-muted-text" />
        ) : (
          <ChevronLeft className="h-3.5 w-3.5 text-light-muted-text dark:text-dark-muted-text" />
        )}
      </button>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        {filteredNavGroups.map((group, groupIndex) => (
          <div key={group.title} className={cn(groupIndex > 0 && "mt-6")}>
            {!isCollapsed && (
              <h3 className="px-3 mb-2 text-[11px] font-semibold text-light-muted-text dark:text-dark-noisy-text uppercase tracking-wider">
                {group.title}
              </h3>
            )}
            {isCollapsed && groupIndex > 0 && (
              <div className="mx-3 mb-2 border-t border-light-secondary/50 dark:border-dark-secondary/50" />
            )}
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "group flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-150",
                        isActive
                          ? "bg-primary-main/10 dark:bg-primary-main/20 text-primary-main dark:text-primary-light font-semibold"
                          : "text-light-text/80 dark:text-dark-text/80 hover:bg-light-muted-background dark:hover:bg-dark-secondary/80 hover:text-light-text dark:hover:text-dark-text",
                        isCollapsed && "justify-center px-2",
                      )}
                      title={isCollapsed ? item.label : undefined}
                    >
                      <Icon
                        className={cn(
                          "h-[18px] w-[18px] flex-shrink-0 transition-colors",
                          isActive
                            ? "text-primary-main dark:text-primary-light"
                            : "text-light-muted-text dark:text-dark-muted-text group-hover:text-light-text dark:group-hover:text-dark-text",
                        )}
                      />
                      {!isCollapsed && (
                        <span
                          className={cn(
                            "text-sm font-medium truncate",
                            isActive && "font-semibold",
                          )}
                        >
                          {item.label}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer Link */}
      {!isCollapsed && (
        <div className="p-3 border-t border-light-secondary/50 dark:border-dark-secondary/50">
          <Link
            href="/docs"
            className="flex items-center gap-2 px-3 py-2 text-sm text-light-muted-text dark:text-dark-muted-text hover:text-light-text dark:hover:text-dark-text transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
            <span>Documentation</span>
          </Link>
        </div>
      )}
    </aside>
  );
}
