import { toast } from "@/hooks/use-toast";
import { workspaceApi } from "@/lib/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

export const useCreateWorkspace = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationKey: ["create-workspace"],

    mutationFn: async (formData: FormData) => {
      const { data } = await workspaceApi.post("/create", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return data;
    },

    onSuccess: () => {
      toast({
        title: "Workspace created",
        description: "The workspace has been created successfully.",
      });

      // Invalidate workspaces list so it refetches
      queryClient.invalidateQueries({ queryKey: ["get-my-workspaces"] });
    },

    onError: (error: ErrResponse) => {
      toast({
        title: "Workspace creation failed",
        description:
          error.response?.data?.error?.message ||
          "Unable to create workspace. Please try again.",
        variant: "destructive",
      });
    },
  });

  return mutation;
};

export const useGetMyWorkSpaces = () => {
  const queryKey = `get-my-workspaces`;
  let url = `/`;
  const result = useQuery({
    queryKey: [queryKey],
    queryFn: async () => {
      const { data } = await workspaceApi.get(url);
      return data.data as MyWorkSpaces[];
    },
    refetchOnWindowFocus: false,
    retry: 2,
    refetchOnMount: true,
    refetchInterval: 300000,
  });

  return result;
};

export const useGetWorkspaceById = (workspaceId: string) => {
  const queryKey = ["get-workspace-by-id", workspaceId];
  const url = `/${workspaceId}`;

  const result = useQuery({
    queryKey,
    queryFn: async () => {
      const { data } = await workspaceApi.get(url);
      return data.data as MyWorkSpaces;
    },
    enabled: !!workspaceId, // don't fire when id is missing
    refetchOnWindowFocus: false,
    retry: 2,
    refetchOnMount: true,
    staleTime: 5 * 60 * 1000, // 5 min — workspace metadata doesn't change often
    // no refetchInterval here — a single workspace isn't as "hot" as the list
  });

  return result;
};

export const useUpdateWorkspace = (workspaceId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["update-workspace", workspaceId],
    mutationFn: async (formData: FormData) => {
      const { data } = await workspaceApi.put(
        `/update/${workspaceId}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Workspace updated",
        description: "Your changes have been saved.",
      });
      // refresh list and this specific workspace
      queryClient.invalidateQueries({ queryKey: ["get-my-workspaces"] });
      queryClient.invalidateQueries({
        queryKey: ["get-workspace-by-id", workspaceId],
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update failed",
        description:
          error.response?.data?.error?.message ??
          "Unable to update workspace. Please try again.",
        variant: "destructive",
      });
    },
  });
};

export const useDeleteWorkspace = (workspaceId: string) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationKey: ["delete-workspace", workspaceId],

    mutationFn: async () => {
      const { data } = await workspaceApi.delete(`/delete/${workspaceId}`);
      return data;
    },

    onSuccess: () => {
      toast({
        title: "Workspace deleted",
        description: "The workspace has been permanently removed.",
      });

      // Remove this workspace from cache so it disappears immediately
      queryClient.removeQueries({
        queryKey: ["get-workspace-by-id", workspaceId],
      });

      // Refresh the sidebar list
      queryClient.invalidateQueries({ queryKey: ["get-my-workspaces"] });

      // Navigate away — user can't stay on a deleted workspace
      navigate("/");
    },

    onError: (error: ErrResponse) => {
      toast({
        title: "Delete failed",
        description:
          error.response?.data?.error?.message ??
          "Unable to delete workspace. Please try again.",
        variant: "destructive",
      });
    },
  });
};
