import { z } from "zod";

export const createWorkspaceSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Workspace name must be at least 2 characters")
    .max(100, "Workspace name must be less than 100 characters"),
});

export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>;

export const workspaceRoles = ["ADMIN", "MEMBER", "VIEWER"] as const;

export type WorkspaceRole = (typeof workspaceRoles)[number];

export const inviteMemberSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),

  role: z.enum(workspaceRoles, {
    errorMap: () => ({ message: "Please select a role" }),
  }),
});

export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;
