import { LoaderIcon } from "lucide-react";

export default function Loader() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="flex flex-row gap-2 items-center">
        <LoaderIcon className="animate-spin h-4 w-4 text-text-secondary" />
        <span className="text-sm text-text-secondary">Loading...</span>
      </div>
    </div>
  );
}
