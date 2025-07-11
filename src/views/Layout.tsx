import Sidebar from "@/components/Sidebar";
import { Outlet, useLocation } from "@tanstack/react-router";
import { FolderProvider } from "@/contexts/FolderContext";
import { ProfileOverlayProvider } from "@/contexts/ProfileOverlayContext";
import ProfileOverlay from "@/components/ProfileOverlay";

export default function Layout() {
  // Remove special handling for mermaid route
  const shouldHideSidebar = false;

  return (
    <ProfileOverlayProvider>
      <FolderProvider>
        <div className="flex h-full w-full flex-col">
          <div className="flex h-full w-full flex-row">
            {!shouldHideSidebar && (
              <div className="w-72 flex-shrink-0">
                <Sidebar />
              </div>
            )}
            <div className={`flex-1 flex justify-center ${shouldHideSidebar ? 'w-full' : ''}`}>
              <div className="flex h-full w-full flex-row justify-center overflow-clip bg-background-main">
                <Outlet />
              </div>
            </div>
          </div>
        </div>
        <ProfileOverlay />
      </FolderProvider>
    </ProfileOverlayProvider>
  );
}
