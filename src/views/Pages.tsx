import { useQueryClient } from "@tanstack/react-query";
import { createNewPage, deletePage } from "../db/draw";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import Loader from "@/components/Loader";
import NoData from "./NoData";
import { Button } from "@/components/ui/button";
import dayjs from "dayjs";
import { useNavigate } from "@tanstack/react-router";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Trash2 } from "lucide-react";
import TitleBar from "@/components/TitleBar";
import { useFolderPages } from "@/hooks/useFolders";
import { useFolderContext } from "@/contexts/FolderContext";

function NewPageOptionDropdown({
  createPageFn,
}: {
  createPageFn: () => void;
}) {
  return (
    <Button variant="default" className="font-medium text-sm" onClick={createPageFn}>
      + New Page
    </Button>
  );
}

export default function Pages() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { selectedFolderId, folders, isLoading: foldersLoading } = useFolderContext();
  const { pages, isLoading: pagesLoading } = useFolderPages(selectedFolderId);

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

  return (
    <div className="mx-4 my-4 h-full w-full">
      <TitleBar
        title={selectedFolder ? selectedFolder.name.toUpperCase() : "PAGES"}
        extra={
          <NewPageOptionDropdown
            createPageFn={createPage}
          />
        }
      />
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
    </div>
  );
}
