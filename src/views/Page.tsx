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
import { RefreshCcw, Star } from "lucide-react";
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
  const [customButtonPosition, setCustomButtonPosition] = useState({ left: '60px', top: '16px' });
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
      // Also invalidate the current page cache to ensure consistency
      queryClient.invalidateQueries({ queryKey: ["page", id] });
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
      const elements = data.data[0].page_elements.elements;
      excalidrawAPI.updateScene({
        elements: elements,
        appState: { theme: theme },
      });
      setName(data.data[0].name);
    }
    if (data?.error) {
      toast("An error occurred", { description: data.error.message });
    }
  }

  const setSceneData = useCallback(async () => {
    if (excalidrawAPI) {
      const scene = excalidrawAPI.getSceneElements();
      const updatedAt = new Date().toISOString();

      const existingData = drawDataStore.getState().getPageData(id);

      if (JSON.stringify(existingData?.elements) !== JSON.stringify(scene)) {
        setIsSaving(true);
        // Save locally first
        drawDataStore.getState().setPageData(id, scene, updatedAt, name);

        // Then push to API
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
  }, [excalidrawAPI, id, name, mutate]);

  useEffect(() => {
    if (!isLoading && data?.data && excalidrawAPI) {
      setTimeout(updateScene, 1000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, data, excalidrawAPI]);

  useEffect(() => {
    const interval = setInterval(() => {
      setSceneData();
    }, 3000);

    return () => clearInterval(interval);
  }, [setSceneData]);

  useEffect(() => {
    // Load data from local storage if available
    const localData = drawDataStore.getState().getPageData(id);
    if (localData && excalidrawAPI) {
      excalidrawAPI.updateScene({
        elements: localData.elements,
        appState: { theme: theme },
      });
      setName(localData.name);
    }
  }, [id, excalidrawAPI, theme]);

  useEffect(() => {
    // Set a fixed position for our custom button since we're shifting the hamburger menu with CSS
    const adjustButtonPosition = () => {
      // Since we're shifting the hamburger menu 48px to the right with CSS,
      // we can position our button at a fixed location that will be to its left
      setCustomButtonPosition({
        left: '16px', // Fixed position at left edge
        top: '16px'
      });
    };

    // Set position after Excalidraw loads
    const timer = setTimeout(adjustButtonPosition, 500);

    return () => {
      clearTimeout(timer);
    };
  }, [excalidrawAPI]);

  return (
    <div className="flex w-full flex-col">
      <div className="h-full w-full excalidraw-container">
        {isLoading ? (
          <Loader />
        ) : (
          <>
            {/* Custom button positioned absolutely within the Excalidraw container */}
            <div
              className="custom-excalidraw-button absolute"
              style={{
                position: 'absolute',
                left: customButtonPosition.left,
                top: customButtonPosition.top,
                zIndex: 1000
              }}
            >
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        // Placeholder functionality - replace with your custom action
                        console.log("Custom button clicked!");
                        toast("Custom button clicked! Add your functionality here.");
                      }}
                      className="h-9 w-9 p-0 border-0 shadow-sm transition-colors rounded-lg"
                      style={{
                        height: '36px',
                        width: '36px',
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
                      <Star className="h-4 w-4" style={{ color: '#E3E3E8' }} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Custom Button - Add your functionality here</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

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
                        color: '#E3E3E8'
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
