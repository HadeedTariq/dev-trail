type User = {
  id: string;
  user_name?: string;
  email: string;
  role: string;
  gender: "male" | "female" | "other";
};

type ErrResponse = {
  response: {
    data: {
      error: {
        message: string;
        otpType?: string;
        code?: string;
      };
    };
  };
};

type MyWorkSpaces = {
  id: string;
  name: string;
  created_by: string;
  image: string | null;
  created_at: string;
  updated_at: string;
};

type InviteMemberResponse = {
  added_directly: boolean;
  invitation_id: string | null;
};

type InvitationPreview = {
  valid: boolean;
  email: string;
  role: WorkspaceRole;
  workspace_name: string;
  workspace_image: string | null;
  expires_at: string;
};
