import { usePages, PageData } from "@/hooks/usePages";
import { Link, useLocation } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import dayjs from "dayjs";
import Loader from "./Loader";
import { FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProfileDropdown from "./ProfileDropdown";

interface SidebarProps {
  className?: string;
}

interface SidebarItemProps {
  page: PageData;
  isActive: boolean;
}

const routes = [
  {
    label: "Home",
    to: "/pages",
  },
  {
    label: "Mermaid",
    to: "/mermaid",
  },
];

function SidebarItem({ page, isActive }: SidebarItemProps) {
  return (
    <Link
      to="/page/$id"
      params={{ id: page.page_id }}
      className={cn(
        "group flex w-full flex-col gap-1 rounded-lg border p-3 text-left transition-all hover:bg-gray-100 dark:hover:bg-gray-800",
        isActive
          ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20"
          : "border-gray-200 dark:border-gray-700"
      )}
    >
      <div className="flex items-center gap-2">
        <FileText className="h-4 w-4 text-gray-500" />
        <span
          className={cn(
            "truncate text-sm font-medium",
            isActive ? "text-blue-700 dark:text-blue-300" : "text-gray-900 dark:text-gray-100"
          )}
        >
          {page.name || "Untitled"}
        </span>
      </div>
      <span className="text-xs text-gray-500 dark:text-gray-400">
        {dayjs(page.updated_at).format("MMM DD, YYYY")}
      </span>
    </Link>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center p-6 text-center">
      <FileText className="h-12 w-12 text-gray-400 mb-4" />
      <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
        No pages yet
      </h3>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
        Create your first drawing to get started
      </p>
      <Link to="/pages">
        <Button size="sm" variant="outline" className="gap-2">
          <Plus className="h-4 w-4" />
          Create Page
        </Button>
      </Link>
    </div>
  );
}

export default function Sidebar({ className }: SidebarProps) {
  const { pages, isLoading } = usePages();
  const location = useLocation();

  // Extract page ID from current location pathname
  const currentPageId = location.pathname.startsWith('/page/')
    ? location.pathname.split('/page/')[1]
    : null;

  // TODO: Add collapsible functionality in the future
  // This sidebar is currently always visible/open by default
  // Future enhancement: Add toggle button and state management for collapse/expand

  return (
    <div
      className={cn(
        "flex h-full w-64 flex-col bg-white dark:bg-gray-900",
        className
      )}
    >
      {/* Header with Draw Logo */}
      <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700">
        <Link to="/pages" className="flex items-center">
          <h1 className="font-virgil text-2xl font-bold text-gray-900 dark:text-gray-100">Draw</h1>
        </Link>
        <Link to="/pages">
          <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
            <Plus className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      {/* Pages Content */}
      <div className="flex-1 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center p-6">
            <Loader />
          </div>
        ) : pages.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="h-full overflow-y-auto">
            <div className="space-y-2 p-4">
              {pages.map((page) => (
                <SidebarItem
                  key={page.page_id}
                  page={page}
                  isActive={currentPageId === page.page_id}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="border-t border-gray-200 p-4 dark:border-gray-700">
        <div className="space-y-2 mb-4">
          {routes.map(({ label, to }) => (
            <Link to={to} key={to}>
              {({ isActive }) => (
                <Button
                  className={cn(
                    "flex h-10 w-full items-center justify-center gap-3 text-sm font-light hover:font-bold",
                    isActive ? "font-bold" : "font-medium",
                  )}
                  variant="outline"
                >
                  {label}
                </Button>
              )}
            </Link>
          ))}
        </div>
        <div className="flex justify-center">
          <ProfileDropdown />
        </div>
      </div>
    </div>
  );
}
