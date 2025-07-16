import { useQueryClient } from "@tanstack/react-query";
import { createNewPage, deletePage, updateFolder } from "../db/draw";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import Loader from "@/components/Loader";
import NoData from "./NoData";
import { Button } from "@/components/ui/button";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);
import { useNavigate } from "@tanstack/react-router";
import { useFolderPages } from "@/hooks/useFolders";
import { useFolderContext } from "@/contexts/FolderContext";
import { Trash2, Edit2 } from "lucide-react";
import EmojiPicker from "@/components/EmojiPicker";
import { useState } from "react";

function NewPageOptionDropdown({
  createPageFn,
}: {
  createPageFn: () => void;
}) {
  return (
    <Button
      variant="default"
      className="font-medium text-sm bg-accent-blue hover:bg-accent-blue/80 text-white px-4 py-2 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2"
      onClick={createPageFn}
    >
      <span className="text-lg">+</span>
      New drawing
    </Button>
  );
}

export default function Pages() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { selectedFolderId, folders, isLoading: foldersLoading } = useFolderContext();
  const { pages, isLoading: pagesLoading } = useFolderPages(selectedFolderId);

  const [isEditingName, setIsEditingName] = useState(false);
  const [editingName, setEditingName] = useState("");
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);

  const selectedFolder = folders?.find(f => f.folder_id === selectedFolderId);

  if (foldersLoading) return <Loader />;

  function goToPage(id: string) {
    navigate({ to: "/page/$id", params: { id: id } });
  }

  async function createPage() {
    if (!selectedFolderId) return;

    const data = await createNewPage(undefined, selectedFolderId);

    if (data.data && data.data[0]?.page_id) {
      // Invalidate caches to update sidebar immediately
      queryClient.invalidateQueries({ queryKey: ["pages"] });
      queryClient.invalidateQueries({ queryKey: ["folderPages"] });
      goToPage(data.data[0].page_id);
      toast("Successfully created a new page!");
    }

    if (data.error) {
      toast("An error occurred", {
        description: `Error: ${data.error.message}`,
      });
    }
  }

  async function handlePageDelete(id: string) {
    const data = await deletePage(id);

    if (data.data === null) {
      toast("Successfully deleted the page!");
      // Invalidate caches to update sidebar immediately
      queryClient.invalidateQueries({ queryKey: ["pages"] });
      queryClient.invalidateQueries({ queryKey: ["folderPages"] });
    }
    if (data.error) {
      toast("An error occurred", {
        description: `Error: ${data.error.message}`,
      });
    }
  }

  async function handleFolderNameUpdate(newName: string) {
    if (!selectedFolderId || !newName.trim() || newName === selectedFolder?.name) {
      setIsEditingName(false);
      return;
    }

    const data = await updateFolder(selectedFolderId, { name: newName.trim() });

    if (data.data) {
      toast("Folder name updated!");
      queryClient.invalidateQueries({ queryKey: ["folders"] });
    } else if (data.error) {
      toast("Failed to update folder name", {
        description: `Error: ${data.error.message}`,
      });
    }

    setIsEditingName(false);
  }

  async function handleEmojiSelect(emoji: string) {
    if (!selectedFolderId) return;

    const data = await updateFolder(selectedFolderId, { icon: emoji });

    if (data.data) {
      toast("Folder icon updated!");
      queryClient.invalidateQueries({ queryKey: ["folders"] });
    } else if (data.error) {
      toast("Failed to update folder icon", {
        description: `Error: ${data.error.message}`,
      });
    }
  }

  function startEditingName() {
    setEditingName(selectedFolder?.name || "");
    setIsEditingName(true);
  }

  function handleNameKeyPress(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      handleFolderNameUpdate(editingName);
    } else if (e.key === 'Escape') {
      setIsEditingName(false);
    }
  }

  return (
    <div className="mx-4 my-4 h-full w-full">
      {/* Enhanced Folder Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Folder Icon - Same height as name */}
          <button
            onClick={() => setIsEmojiPickerOpen(true)}
            className="flex items-center justify-center h-12 px-3 text-3xl transition-all duration-200 cursor-pointer rounded-lg hover:bg-background-hover"
            title="Click to change folder icon"
          >
            {selectedFolder?.icon || "📁"}
          </button>

          {/* Folder Name - Same height as icon */}
          {isEditingName ? (
            <div className="relative">
              <input
                type="text"
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                onBlur={() => handleFolderNameUpdate(editingName)}
                onKeyDown={handleNameKeyPress}
                className="bg-background-input border border-accent-blue rounded-md px-3 py-2 h-12 text-xl font-bold text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-blue/50 min-w-[200px]"
                autoFocus
                placeholder="Folder name..."
              />
              <div className="absolute -bottom-6 left-0 text-xs text-text-muted">
                Press Enter to save, Esc to cancel
              </div>
            </div>
          ) : (
            <button
              onClick={startEditingName}
              className="flex items-center h-12 px-3 text-2xl font-bold text-text-primary hover:text-accent-blue hover:bg-background-hover transition-all duration-200 cursor-pointer rounded-lg"
              title="Click to edit folder name"
            >
              {selectedFolder?.name || "PAGES"}
            </button>
          )}
        </div>

        {/* New Drawing Button */}
        <NewPageOptionDropdown createPageFn={createPage} />
      </div>

      <div className="flex flex-wrap gap-4 py-2">
        {pagesLoading ? (
          <Loader />
        ) : pages && pages.length > 0 ? (
          pages?.map((page) => (
            <Card
              key={page.page_id}
              className="group h-fit max-h-32 w-fit max-w-80 cursor-pointer transition-all duration-200 hover:bg-background-hover"
            >
              <div onClick={() => goToPage(page.page_id)}>
                <CardContent className="flex w-full flex-col justify-end gap-2 p-4 text-sm">
                  <CardTitle className="line-clamp-1 font-virgil text-base">
                    {page.name || "Untitled"}
                  </CardTitle>
                  <span className="text-xs text-text-secondary">
                    Last updated: {dayjs(page.updated_at).format("MMM DD, YYYY")}
                  </span>
                </CardContent>
              </div>
              <div className="flex w-full items-end justify-end p-2">
                <Trash2
                  className="invisible h-4 w-4 cursor-pointer rounded-button text-text-muted transition-all hover:bg-background-hover hover:text-red-400 group-hover:visible p-1"
                  strokeWidth={2}
                  onClick={() => handlePageDelete(page.page_id)}
                />
              </div>
            </Card>
          ))
        ) : (
          <NoData name="Pages" />
        )}
      </div>

      {/* Emoji Picker Modal */}
      <EmojiPicker
        isOpen={isEmojiPickerOpen}
        onClose={() => setIsEmojiPickerOpen(false)}
        onEmojiSelect={handleEmojiSelect}
        currentEmoji={selectedFolder?.icon}
      />
    </div>
  );
}
