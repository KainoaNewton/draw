import { useState, useEffect } from "react";
import { Command } from "cmdk";
import { useNavigate } from "@tanstack/react-router";
import { usePages } from "@/hooks/usePages";
import { useFolders } from "@/hooks/useFolders";
import { useFolderContext } from "@/contexts/FolderContext";
import { Search, FileText, Folder } from "lucide-react";
import { cn } from "@/lib/utils";
import dayjs from "dayjs";

interface SearchCommandProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchCommand({ open, onOpenChange }: SearchCommandProps) {
  const [search, setSearch] = useState("");
  const { pages } = usePages();
  const { folders } = useFolders();
  const { setSelectedFolderId } = useFolderContext();
  const navigate = useNavigate();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, onOpenChange]);

  const handlePageSelect = (pageId: string) => {
    onOpenChange(false);
    navigate({ to: "/page/$id", params: { id: pageId } });
  };

  const handleFolderSelect = (folderId: string) => {
    onOpenChange(false);
    setSelectedFolderId(folderId);
    navigate({ to: "/pages" });
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
      onClick={() => onOpenChange(false)}
    >
      <div
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <Command
          className="rounded-card border border-border-subtle bg-background-card"
          style={{ boxShadow: 'var(--card-shadow)' }}
          shouldFilter={false}
        >
          <div className="flex items-center border-b border-border-subtle px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 text-text-muted" />
            <Command.Input
              value={search}
              onValueChange={setSearch}
              placeholder="Search pages and folders..."
              className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-text-muted disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <Command.List className="max-h-[300px] overflow-y-auto overflow-x-hidden p-1">
            <Command.Empty className="py-6 text-center text-sm text-text-muted">
              No results found.
            </Command.Empty>

            {/* Folders Section */}
            {folders
              ?.filter((folder) =>
                folder.name.toLowerCase().includes(search.toLowerCase())
              )
              .map((folder) => (
                <Command.Item
                  key={`folder-${folder.folder_id}`}
                  value={`folder-${folder.folder_id}`}
                  onSelect={() => handleFolderSelect(folder.folder_id)}
                  className={cn(
                    "relative flex cursor-pointer select-none items-center rounded-md px-2 py-2 text-sm outline-none",
                    "hover:bg-background-hover hover:text-text-primary",
                    "data-[selected]:bg-background-hover data-[selected]:text-text-primary"
                  )}
                >
                  <Folder className="mr-2 h-4 w-4 text-accent-blue" />
                  <div className="flex-1">
                    <div className="font-medium">{folder.name}</div>
                    <div className="text-xs text-text-muted">Folder</div>
                  </div>
                </Command.Item>
              ))}

            {/* Pages Section */}
            {pages
              ?.filter((page) =>
                (page.name || "Untitled")
                  .toLowerCase()
                  .includes(search.toLowerCase())
              )
              .map((page) => (
                <Command.Item
                  key={`page-${page.page_id}`}
                  value={`page-${page.page_id}`}
                  onSelect={() => handlePageSelect(page.page_id)}
                  className={cn(
                    "relative flex cursor-pointer select-none items-center rounded-md px-2 py-2 text-sm outline-none",
                    "hover:bg-background-hover hover:text-text-primary",
                    "data-[selected]:bg-background-hover data-[selected]:text-text-primary"
                  )}
                >
                  <FileText className="mr-2 h-4 w-4 text-text-muted" />
                  <div className="flex-1">
                    <div className="font-medium">
                      {page.name || "Untitled"}
                    </div>
                    <div className="text-xs text-text-muted">
                      Updated {dayjs(page.updated_at).format("MMM DD, YYYY")}
                    </div>
                  </div>
                </Command.Item>
              ))}
          </Command.List>
        </Command>
      </div>
    </div>
  );
}
