import Sidebar from "@/components/Sidebar";
import { Outlet } from "@tanstack/react-router";

export default function Layout() {
  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex h-full w-full flex-row">
        <Sidebar />
        <div className="flex-1 flex justify-center">
          <div className="flex h-full w-full flex-row justify-center overflow-clip bg-gray-200/60 dark:bg-gray-900">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
