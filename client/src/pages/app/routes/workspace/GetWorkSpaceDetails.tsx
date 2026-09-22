import LoadingBar from "@/components/LoadingBar";
import { useGetWorkspaceById } from "@/hooks/workspace/useWorkspace";
import { useParams } from "react-router-dom";
import { WorkspaceHeader } from "../../components/workspace/WorkspaceHeader";

const GetWorkSpaceDetails = () => {
  const { id } = useParams<{ id: string }>();

  const {
    data: workspace,
    isLoading,
    isError,
    error,
  } = useGetWorkspaceById(id as string);

  if (isLoading) return <LoadingBar />;

  if (isError || !workspace?.id) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-center">
        <h2 className="text-2xl font-semibold text-slate-900">
          Workspace not found
        </h2>
        <p className="max-w-md text-sm text-slate-600">
          {error instanceof Error
            ? error.message
            : "We couldn't load this workspace. It may have been deleted or you don't have access to it."}
        </p>
      </div>
    );
  }

  return (
    <>
      <WorkspaceHeader workspace={workspace} />
    </>
  );
};

export default GetWorkSpaceDetails;
