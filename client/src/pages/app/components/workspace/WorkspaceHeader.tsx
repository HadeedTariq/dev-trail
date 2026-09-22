import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Trash2, Building2, User, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useDeleteWorkspace } from "@/hooks/workspace/useWorkspace";

interface WorkspaceHeaderProps {
  workspace: MyWorkSpaces;
  canEdit?: boolean;
}

export function WorkspaceHeader({
  workspace,
  canEdit = false,
}: WorkspaceHeaderProps) {
  const navigate = useNavigate();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { mutate: deleteWorkspace, isPending: isDeleting } = useDeleteWorkspace(
    workspace.id
  );

  const initials = workspace.name
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const createdDate = new Date(workspace.created_at).toLocaleDateString(
    "en-US",
    { year: "numeric", month: "long", day: "numeric" }
  );

  return (
    <>
      <div className="w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {/* Cover */}
        <div className="relative h-40 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 sm:h-48">
          {workspace.image && (
            <img
              src={workspace.image}
              alt={`${workspace.name} cover`}
              className="h-full w-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-black/10" />
        </div>

        {/* Profile row */}
        <div className="relative px-4 pb-6 sm:px-6">
          <div className="-mt-12 flex items-end justify-between sm:-mt-14">
            <Avatar className="h-24 w-24 rounded-xl border-4 border-white shadow-md sm:h-28 sm:w-28">
              {workspace.image ? (
                <AvatarImage
                  src={workspace.image}
                  alt={workspace.name}
                  className="object-cover"
                />
              ) : null}
              <AvatarFallback className="rounded-xl bg-slate-900 text-2xl font-semibold text-white">
                {initials || <Building2 className="h-8 w-8" />}
              </AvatarFallback>
            </Avatar>

            {canEdit && (
              <div className="mb-1 flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => navigate(`/w/${workspace.id}/settings`)}
                >
                  <Pencil className="h-4 w-4" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 text-red-600 hover:bg-red-50 hover:text-red-700"
                  onClick={() => setConfirmOpen(true)}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </div>
            )}
          </div>

          {/* Name + meta */}
          <div className="mt-4 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                {workspace.name}
              </h1>
              <Badge variant="secondary" className="text-xs">
                Workspace
              </Badge>
            </div>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-600">
              <div className="flex items-center gap-1.5">
                <User className="h-4 w-4 text-slate-400" />
                <span className="font-mono text-xs">
                  {workspace.created_by.slice(0, 8)}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-slate-400" />
                <span>Created {createdDate}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirm delete dialog */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{workspace.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. All boards, issues, comments, and
              member data inside this workspace will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                deleteWorkspace();
              }}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {isDeleting ? "Deleting..." : "Delete workspace"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
