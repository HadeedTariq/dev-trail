import { toast } from "@/hooks/use-toast";
import { workspaceApi } from "@/lib/axios";
import { InviteMemberInput } from "@/pages/app/validators/workspace.validator";
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

export const useInviteMember = (workspaceId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["invite-workspace-member", workspaceId],

    mutationFn: async (values: InviteMemberInput) => {
      const { data } = await workspaceApi.post(
        `/${workspaceId}/members/invite`,
        values // JSON body, no FormData here
      );
      return data.data as InviteMemberResponse;
    },

    onSuccess: (result) => {
      toast({
        title: result.added_directly ? "Member added" : "Invitation sent",
        description: result.added_directly
          ? "The user has been added to the workspace."
          : "They'll receive an email invitation shortly.",
      });

      // Refresh the members list so the new member/invite appears
      queryClient.invalidateQueries({
        queryKey: ["get-workspace-members", workspaceId],
      });
      queryClient.invalidateQueries({
        queryKey: ["get-pending-invitations", workspaceId],
      });
    },

    onError: (error: ErrResponse) => {
      const message =
        error.response?.data?.error?.message ??
        "Unable to send invitation. Please try again.";

      toast({
        title: "Invitation failed",
        description: message,
        variant: "destructive",
      });
    },
  });
};

export const useVerifyInvitation = (token: string | null) => {
  return useQuery({
    queryKey: ["verify-invitation", token],
    queryFn: async () => {
      const { data } = await workspaceApi.get(`/invitations/verify/${token}`);
      return data.data as InvitationPreview;
    },
    enabled: !!token,
    retry: false, // don't retry invalid tokens
    refetchOnWindowFocus: false,
    staleTime: 60_000, // 1 min — enough for the page
  });
};

export const useAcceptInvitation = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationKey: ["accept-invitation"],

    mutationFn: async (token: string) => {
      const { data } = await workspaceApi.post(`/invitations/accept`, {
        token,
      });
      return data.data as { workspace_id: string };
    },

    onSuccess: ({ workspace_id }) => {
      toast({
        title: "Welcome!",
        description: "You've joined the workspace.",
      });

      queryClient.invalidateQueries({ queryKey: ["get-my-workspaces"] });
      queryClient.invalidateQueries({
        queryKey: ["get-workspace-members", workspace_id],
      });
      queryClient.invalidateQueries({
        queryKey: ["get-pending-invitations", workspace_id],
      });

      navigate(`/w/${workspace_id}`, { replace: true });
    },

    onError: (error: ErrResponse) => {
      toast({
        title: "Could not accept invitation",
        description:
          error.response?.data?.error?.message ??
          "The invitation may have expired. Ask an admin to send a new one.",
        variant: "destructive",
      });
    },
  });
};
