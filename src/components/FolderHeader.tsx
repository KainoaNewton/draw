import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit2, Check, X, ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { renameFolder, updateFolderIcon, type Folder } from "@/db/draw";
import { useNavigate } from "@tanstack/react-router";
import EmojiIconPicker from "./EmojiIconPicker";

interface FolderHeaderProps {
  folder: Folder;
  onCreatePage: () => void;
}

export default function FolderHeader({ folder, onCreatePage }: FolderHeaderProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(folder.name);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  useEffect(() => {
    if (isEditingName && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditingName]);

  const handleNameEdit = () => {
    setEditedName(folder.name);
    setIsEditingName(true);
  };

  const handleNameSave = async () => {
    if (editedName.trim() === "" || editedName === folder.name) {
      setIsEditingName(false);
      setEditedName(folder.name);
      return;
    }

    setIsUpdating(true);
    try {
      const result = await renameFolder(folder.folder_id, editedName.trim());
      
      if (result.error) {
        toast("Failed to rename folder", {
          description: result.error.message,
        });
        setEditedName(folder.name);
      } else {
        toast("Folder renamed successfully!");
        // Invalidate queries to refresh data
        queryClient.invalidateQueries({ queryKey: ["folders"] });
      }
    } catch (error) {
      toast("An error occurred while renaming the folder");
      setEditedName(folder.name);
    } finally {
      setIsUpdating(false);
      setIsEditingName(false);
    }
  };

  const handleNameCancel = () => {
    setEditedName(folder.name);
    setIsEditingName(false);
  };

  const handleIconChange = async (newIcon: string) => {
    setIsUpdating(true);
    try {
      const result = await updateFolderIcon(folder.folder_id, newIcon);
      
      if (result.error) {
        toast("Failed to update folder icon", {
          description: result.error.message,
        });
      } else {
        toast("Folder icon updated successfully!");
        // Invalidate queries to refresh data
        queryClient.invalidateQueries({ queryKey: ["folders"] });
      }
    } catch (error) {
      toast("An error occurred while updating the folder icon");
    } finally {
      setIsUpdating(false);
      setShowIconPicker(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleNameSave();
    } else if (e.key === "Escape") {
      handleNameCancel();
    }
  };

  return (
    <>
      {/* Folder Header - Top Left of Page */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate({ to: "/pages" })}
          className="text-text-secondary hover:text-text-primary transition-colors p-2"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* Folder Icon */}
        <button
          onClick={() => setShowIconPicker(true)}
          disabled={isUpdating}
          className="text-3xl hover:scale-110 transition-transform cursor-pointer disabled:cursor-not-allowed"
          title="Click to change icon"
        >
          {folder.icon || "📁"}
        </button>

        {/* Folder Name */}
        {isEditingName ? (
          <div className="flex items-center gap-2">
            <Input
              ref={inputRef}
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              onKeyDown={handleKeyPress}
              className="text-3xl font-bold bg-background-main border-border text-text-primary min-w-[300px]"
              disabled={isUpdating}
            />
            <Button
              size="sm"
              onClick={handleNameSave}
              disabled={isUpdating}
              className="h-8 w-8 p-0"
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleNameCancel}
              disabled={isUpdating}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2 group">
            <h1 className="text-3xl font-bold text-text-primary">
              {folder.name}
            </h1>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleNameEdit}
              className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* New Page button */}
        <Button
          variant="default"
          className="font-medium text-sm ml-4"
          onClick={onCreatePage}
        >
          + New Page
        </Button>
      </div>

      {/* Emoji/Icon Picker Modal */}
      {showIconPicker && (
        <EmojiIconPicker
          currentIcon={folder.icon || "📁"}
          onIconSelect={handleIconChange}
          onClose={() => setShowIconPicker(false)}
        />
      )}
    </>
  );
}
