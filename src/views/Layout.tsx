import Sidebar from "@/components/Sidebar";
import { Outlet, useLocation } from "@tanstack/react-router";
import { FolderProvider } from "@/contexts/FolderContext";

export default function Layout() {
  const location = useLocation();

  // Hide sidebar only on mermaid route for full-screen experience
  const shouldHideSidebar = location.pathname === "/mermaid";

  return (
    <FolderProvider>
      <div className="flex h-full w-full flex-col">
        <div className="flex h-full w-full flex-row">
          {!shouldHideSidebar && <Sidebar />}
          <div className="flex-1 flex justify-center">
            <div className="flex h-full w-full flex-row justify-center overflow-clip bg-background-main">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </FolderProvider>
  );
}
