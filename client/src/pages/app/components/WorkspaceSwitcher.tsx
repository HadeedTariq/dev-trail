import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Check, ChevronsUpDown, Plus, Building2 } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useGetMyWorkSpaces } from "@/hooks/workspace/useWorkspace";

export function WorkspaceSwitcher() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { workspaceId } = useParams<{ workspaceId: string }>();

  const { data: workspaces, isLoading, isError } = useGetMyWorkSpaces();

  const selectedWorkspace = workspaces?.find((w) => w.id === workspaceId);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2">
        <Skeleton className="h-8 w-8 rounded-md" />
        <Skeleton className="h-4 w-28" />
      </div>
    );
  }

  // Error state
  if (isError || !workspaces) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="w-full justify-start gap-2 text-muted-foreground"
        onClick={() => window.location.reload()}
      >
        <Building2 className="h-4 w-4" />
        <span className="text-sm">Failed to load</span>
      </Button>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          role="combobox"
          aria-expanded={open}
          aria-label="Select a workspace"
          className="w-full justify-between px-2 hover:bg-accent"
        >
          <div className="flex items-center gap-2 overflow-hidden">
            <WorkspaceAvatar
              name={selectedWorkspace?.name ?? "Select workspace"}
              image={selectedWorkspace?.image}
            />
            <span className="truncate text-sm font-medium">
              {selectedWorkspace?.name ?? "Select workspace"}
            </span>
          </div>
          <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-[260px] p-0"
        align="start"
        side="right"
        sideOffset={8}
      >
        <Command>
          <CommandInput placeholder="Search workspace..." />
          <CommandList>
            <CommandEmpty>No workspace found.</CommandEmpty>
            <CommandGroup heading="Workspaces">
              {workspaces.map((workspace) => (
                <CommandItem
                  key={workspace.id}
                  value={workspace.name}
                  onSelect={() => {
                    setOpen(false);
                    navigate(`/workspaces/${workspace.id}`);
                  }}
                  className="flex items-center gap-2"
                >
                  <WorkspaceAvatar
                    name={workspace.name}
                    image={workspace.image}
                    size="sm"
                  />
                  <span className="flex-1 truncate">{workspace.name}</span>
                  <Check
                    className={cn(
                      "h-4 w-4",
                      workspaceId === workspace.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>

            <CommandSeparator />

            <CommandGroup>
              <CommandItem
                onSelect={() => {
                  setOpen(false);
                  navigate("/create-workspace");
                }}
                className="flex items-center gap-2 cursor-pointer"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-md border border-dashed">
                  <Plus className="h-3.5 w-3.5" />
                </div>
                <span>Create workspace</span>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// ---------- Internal helper ----------

interface WorkspaceAvatarProps {
  name: string;
  image?: string | null;
  size?: "sm" | "md";
}

function WorkspaceAvatar({ name, image, size = "md" }: WorkspaceAvatarProps) {
  const dimension = size === "sm" ? "h-6 w-6" : "h-8 w-8";
  const textSize = size === "sm" ? "text-[10px]" : "text-xs";

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <Avatar className={cn(dimension, "rounded-md shrink-0")}>
      {image ? (
        <AvatarImage src={image} alt={name} className="object-cover" />
      ) : null}
      <AvatarFallback className={cn("rounded-md font-semibold", textSize)}>
        {initials || <Building2 className="h-4 w-4" />}
      </AvatarFallback>
    </Avatar>
  );
}
