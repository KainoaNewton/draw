import FolderView from "@/views/FolderView";
import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/_authenticated/pages/$folderId")({
  component: FolderViewComponent,
});

function FolderViewComponent() {
  const { folderId } = Route.useParams();
  return <FolderView folderId={folderId} />;
}
