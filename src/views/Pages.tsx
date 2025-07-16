import { useQueryClient } from "@tanstack/react-query";
import { createNewPage, deletePage, updateFolder } from "../db/draw";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import Loader from "@/components/Loader";
import NoData from "./NoData";
import { Button } from "@/components/ui/button";
import dayjs from "dayjs";
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
    <Button variant="default" className="font-medium text-sm" onClick={createPageFn}>
      + New drawing
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
      {/* Custom Folder Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Folder Icon - Clickable */}
          <button
            onClick={() => setIsEmojiPickerOpen(true)}
            className="text-2xl hover:scale-110 transition-transform cursor-pointer"
            title="Change folder icon"
          >
            {selectedFolder?.icon || "📁"}
          </button>

          {/* Folder Name - Editable */}
          {isEditingName ? (
            <input
              type="text"
              value={editingName}
              onChange={(e) => setEditingName(e.target.value)}
              onBlur={() => handleFolderNameUpdate(editingName)}
              onKeyDown={handleNameKeyPress}
              className="bg-transparent border-b border-accent-blue text-xl font-bold text-text-primary focus:outline-none"
              autoFocus
            />
          ) : (
            <div className="group flex items-center gap-2">
              <h1 className="text-xl font-bold text-text-primary">
                {selectedFolder?.name || "PAGES"}
              </h1>
              <button
                onClick={startEditingName}
                className="opacity-0 group-hover:opacity-100 hover:opacity-100 p-1 hover:bg-background-hover rounded transition-all"
                title="Edit folder name"
              >
                <Edit2 className="h-4 w-4 text-text-muted" />
              </button>
            </div>
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
