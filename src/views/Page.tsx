import { useEffect, useState, useCallback } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Loader from "@/components/Loader";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Excalidraw, WelcomeScreen } from "@excalidraw/excalidraw";
import { NonDeletedExcalidrawElement } from "@excalidraw/excalidraw/element/types";
import { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { RefreshCcw } from "lucide-react";
import { getDrawData, setDrawData } from "@/db/draw";
import { drawDataStore } from "@/stores/drawDataStore";

type PageProps = {
  id: string;
};

export default function Page({ id }: PageProps) {
  const [excalidrawAPI, setExcalidrawAPI] =
    useState<ExcalidrawImperativeAPI | null>(null);
  const [name, setName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const { theme } = useTheme();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["page", id],
    queryFn: () => getDrawData(id),
  });

  const mutation = useMutation({
    mutationFn: (data: {
      elements: NonDeletedExcalidrawElement[];
      name: string;
    }) => setDrawData(id, data.elements, data.name),
    onSuccess: () => {
      setIsSaving(false);
      // Invalidate the pages cache to update the sidebar
      queryClient.invalidateQueries({ queryKey: ["pages"] });
      queryClient.invalidateQueries({ queryKey: ["folderPages"] });
      // REMOVED: queryClient.invalidateQueries({ queryKey: ["page", id] });
      // This was causing data loss by immediately refetching and overwriting user changes
    },
    onError: (error: Error) => {
      setIsSaving(false);
      toast("An error occurred while saving to the server", {
        description: error.message,
      });
    },
  });

  const { mutate } = mutation;

  async function updateScene() {
    if (data?.data && excalidrawAPI) {
      const dbElements = data.data[0].page_elements.elements;
      const dbUpdatedAt = data.data[0].updated_at;

      // Check if local data is newer than database data to prevent overwriting user changes
      const localData = drawDataStore.getState().getPageData(id);
      if (localData && new Date(localData.updatedAt) > new Date(dbUpdatedAt)) {
        console.log("Local data is newer than database, skipping update to preserve user changes");
        return;
      }

      // Only update if database data is actually newer or no local data exists
      excalidrawAPI.updateScene({
        elements: dbElements,
        appState: { theme: theme },
      });
      setName(data.data[0].name);
    }
    if (data?.error) {
      toast("An error occurred", { description: data.error.message });
    }
  }

  const setSceneData = useCallback(async () => {
    // Don't save if already saving to prevent race conditions
    if (excalidrawAPI && !isSaving) {
      const scene = excalidrawAPI.getSceneElements();
      const updatedAt = new Date().toISOString();

      const existingData = drawDataStore.getState().getPageData(id);

      // Only save if there are actual changes
      if (JSON.stringify(existingData?.elements) !== JSON.stringify(scene)) {
        setIsSaving(true);

        // Save locally first with current timestamp to establish precedence
        drawDataStore.getState().setPageData(id, scene, updatedAt, name);

        // Then push to API without invalidating cache (to prevent data loss)
        mutate(
          {
            elements: scene as NonDeletedExcalidrawElement[],
            name,
          },
          {
            onSettled() {
              setIsSaving(false);
            },
          },
        );
      }
    }
  }, [excalidrawAPI, id, name, mutate, isSaving]);

  useEffect(() => {
    // Only update scene if:
    // 1. Data is loaded and available
    // 2. Excalidraw API is ready
    // 3. User is not currently saving (to prevent overwriting during save)
    // 4. No local data exists OR database data is newer than local data
    if (!isLoading && data?.data && excalidrawAPI && !isSaving) {
      const localData = drawDataStore.getState().getPageData(id);
      const dbUpdatedAt = data.data[0].updated_at;

      // Only update if no local data exists or database data is actually newer
      if (!localData || new Date(dbUpdatedAt) > new Date(localData.updatedAt)) {
        setTimeout(updateScene, 1000);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, data, excalidrawAPI, isSaving, id]);

  useEffect(() => {
    const interval = setInterval(() => {
      setSceneData();
    }, 3000);

    return () => clearInterval(interval);
  }, [setSceneData]);

  useEffect(() => {
    // Load data from local storage if available (for immediate UI restoration)
    // This runs on component mount to restore the last known state quickly
    const localData = drawDataStore.getState().getPageData(id);
    if (localData && excalidrawAPI) {
      excalidrawAPI.updateScene({
        elements: localData.elements,
        appState: { theme: theme },
      });
      setName(localData.name);
    }
  }, [id, excalidrawAPI, theme]);

  return (
    <div className="flex w-full flex-col">
      <div className="h-full w-full excalidraw-container">
        {isLoading ? (
          <Loader />
        ) : (
          <>
            {/* Custom button positioned absolutely within the Excalidraw container */}
            {/* Removed custom star button */}

            <div className="excalidraw h-full w-full">
              <Excalidraw
                excalidrawAPI={(api) => setExcalidrawAPI(api)}
                initialData={{ appState: { theme: theme } }}
                renderTopRightUI={() => (
                  <div className="flex gap-2">
                    <Input
                      onChange={(e) => setName(e.target.value)}
                      value={name}
                      className="h-9 w-40 border shadow-sm placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      style={{
                        backgroundColor: '#23232A',
                        borderRadius: '8px',
                        color: '#E3E3E8',
                        borderColor: '#404040',
                        borderWidth: '1px'
                      }}
                      placeholder="Page Title"
                    />
                    <Button
                      variant="ghost"
                      onClick={setSceneData}
                      disabled={isSaving}
                      size="sm"
                      className="border-0 shadow-sm transition-colors rounded-lg px-4"
                      style={{
                        backgroundColor: '#23232A',
                        borderRadius: '8px',
                        color: '#E3E3E8',
                        height: '36px'
                      }}
                      onMouseEnter={(e) => {
                        if (!isSaving) {
                          e.currentTarget.style.backgroundColor = '#363541';
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#23232A';
                      }}
                    >
                      {isSaving ? "Saving..." : "Save"}
                    </Button>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={updateScene}
                            className="border-0 shadow-sm transition-colors rounded-lg h-9 w-9 p-0"
                            style={{
                              backgroundColor: '#23232A',
                              borderRadius: '8px'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#363541';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = '#23232A';
                            }}
                          >
                            <RefreshCcw className="h-4 w-4" style={{ color: '#E3E3E8' }} />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            Refreshes the page. This removes any unsaved changes.
                            Use with caution.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                )}
                theme={theme === "dark" ? "dark" : "light"}
                autoFocus
              >
                <WelcomeScreen />
              </Excalidraw>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
