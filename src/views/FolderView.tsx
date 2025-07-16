import { useQueryClient } from "@tanstack/react-query";
import { createNewPage, deletePage } from "../db/draw";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import Loader from "@/components/Loader";
import NoData from "./NoData";
import { Button } from "@/components/ui/button";
import dayjs from "dayjs";
import { useNavigate } from "@tanstack/react-router";
import { useFolderPages, useFolders } from "@/hooks/useFolders";
import { Trash2 } from "lucide-react";
import FolderHeader from "@/components/FolderHeader";

interface FolderViewProps {
  folderId: string;
}



export default function FolderView({ folderId }: FolderViewProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { folders, isLoading: foldersLoading } = useFolders();
  const { pages, isLoading: pagesLoading } = useFolderPages(folderId);

  const currentFolder = folders?.find(f => f.folder_id === folderId);

  if (foldersLoading) return <Loader />;

  if (!currentFolder) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-text-primary mb-2">Folder Not Found</h1>
          <p className="text-text-secondary">The folder you're looking for doesn't exist.</p>
          <Button 
            onClick={() => navigate({ to: "/pages" })} 
            className="mt-4"
          >
            Back to Folders
          </Button>
        </div>
      </div>
    );
  }

  function goToPage(id: string) {
    navigate({ to: "/page/$id", params: { id: id } });
  }

  async function createPage() {
    const data = await createNewPage(undefined, folderId);

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
    <div className="h-full w-full">
      {/* Folder Header in Top-Left of Page */}
      <div className="p-4 border-b border-border">
        <FolderHeader
          folder={currentFolder}
          onCreatePage={createPage}
        />
      </div>

      {/* Main Content Area */}
      <div className="p-4 h-full overflow-auto">
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
                    className="h-4 w-4 cursor-pointer text-text-muted opacity-0 transition-opacity group-hover:opacity-100 hover:text-red-500"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePageDelete(page.page_id);
                    }}
                  />
                </div>
              </Card>
            ))
          ) : (
            <NoData />
          )}
        </div>
      </div>
    </div>
  );
}
