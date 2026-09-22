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
