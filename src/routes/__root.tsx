import * as React from "react";
import { Outlet, createRootRoute } from "@tanstack/react-router";
import NotFound from "@/views/NotFound";
import { TooltipProvider } from "@/components/ui/tooltip";

export const Route = createRootRoute({
  component: () => (
    <React.Fragment>
      <main
        className="h-screen max-h-screen w-screen bg-background-main text-text-primary"
      >
        <TooltipProvider>
          <Outlet />
        </TooltipProvider>
      </main>
    </React.Fragment>
  ),
  notFoundComponent: NotFound,
});
