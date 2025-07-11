import { toast } from "sonner";
import { Button } from "@/components/ui/button";

import { parseMermaidToExcalidraw } from "@excalidraw/mermaid-to-excalidraw";
import {
  convertToExcalidrawElements,
  Excalidraw,
} from "@excalidraw/excalidraw";
import { useEffect, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import { useTheme } from "@/components/theme-provider";
import TitleBar from "@/components/TitleBar";
import { useNavigate } from "@tanstack/react-router";
import { Tooltip, TooltipContent } from "@/components/ui/tooltip";
import { TooltipTrigger } from "@radix-ui/react-tooltip";
import { ExternalLink } from "lucide-react";
import { createNewPage } from "@/db/draw";
import { useQueryClient } from "@tanstack/react-query";

export default function Mermaid() {
  const [mermaidSyntax, setMermaidSyntax] = useState("");
  const [converting, setConverting] = useState(false);
  const [canSave, setCanSave] = useState(false);
  const [excalidrawAPI, setExcalidrawAPI] = useState<ExcalidrawImperativeAPI>();

  const { theme } = useTheme();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  async function generateExcalidraw() {
    if (mermaidSyntax.length > 0) {
      setConverting(true);
      try {
        const { elements, files } =
          await parseMermaidToExcalidraw(mermaidSyntax);

        const convertedElements = convertToExcalidrawElements(elements);

        excalidrawAPI?.updateScene({
          elements: convertedElements,
          appState: { fileHandle: files },
        });

        setConverting(false);
        setCanSave(true);
      } catch (e) {
        toast("An error occured", {
          description: `Error: ${e}`,
        });
        setConverting(false);
      }
      setConverting(false);
    }
  }

  function goToPage(id: string) {
    navigate({ to: "/page/$id", params: { id: id } });
  }

  async function handleSaveAsNewPage() {
    const elements = excalidrawAPI?.getSceneElements();
    const data = await createNewPage(elements);

    if (data.data && data.data[0]?.page_id) {
      // Invalidate pages cache to update sidebar immediately
      queryClient.invalidateQueries({ queryKey: ["pages"] });
      goToPage(data.data[0].page_id);
      toast("Successfully created a new page!");
    }

    if (data.error) {
      toast("An error occured", {
        description: `Error: ${data.error.message}`,
      });
    }
  }

  useEffect(() => {
    setTimeout(
      () =>
        excalidrawAPI?.updateScene({
          appState: {
            viewBackgroundColor: "transparent",
          },
        }),
      10,
    );
  }, [excalidrawAPI]);

  return (
    <div className="flex h-full w-full flex-col p-3" style={{ backgroundColor: '#23232A' }}>
      <TitleBar
        title="MERMAID"
        ctaLabel="Save As New Page"
        ctaAction={handleSaveAsNewPage}
        isCtaVisible
        isCtaDisabled={!canSave}
        titleExtra={
          <Tooltip>
            <TooltipTrigger>
              <a href="https://mermaid.js.org/" target="_blank">
                <div className="flex flex-row items-center gap-2 p-1 text-sm" style={{ color: '#E3E3E8' }}>
                  Learn more
                  <ExternalLink className="mr-1 h-4 w-4" style={{ color: '#E3E3E8' }} />
                </div>
              </a>
            </TooltipTrigger>
            <TooltipContent>
              <p>Click to learn more about Mermaid and mermaid.js.</p>
            </TooltipContent>
          </Tooltip>
        }
      />
      <div className="flex h-full w-full flex-row gap-3">
        <div
          className="flex h-full w-full flex-col gap-1 p-3 sm:w-1/3"
          style={{
            backgroundColor: '#23232A',
            borderColor: '#404040',
            borderWidth: '1px',
            borderRadius: '8px'
          }}
        >
          <Textarea
            onChange={(e) => setMermaidSyntax(e.target.value)}
            className="h-full"
            placeholder="Enter your Mermaid diagram syntax here..."
            style={{
              backgroundColor: '#23232A',
              borderColor: '#404040',
              color: '#E3E3E8'
            }}
          />
          <Button
            size="lg"
            className="w-full"
            onClick={generateExcalidraw}
            isLoading={converting}
            loadingText="Converting..."
            disabled={mermaidSyntax.length === 0}
          >
            Convert to Excalidraw
          </Button>
        </div>
        <div
          className="h-full w-full sm:w-2/3"
          style={{
            backgroundColor: '#23232A',
            borderColor: '#404040',
            borderWidth: '1px',
            borderRadius: '8px'
          }}
        >
          <Excalidraw
            excalidrawAPI={(api) => setExcalidrawAPI(api)}
            theme={theme === "dark" ? "dark" : "light"}
            autoFocus
          />
        </div>
      </div>
    </div>
  );
}
