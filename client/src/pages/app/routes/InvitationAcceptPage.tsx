import { useSearchParams, useNavigate, Link } from "react-router-dom";
import {
  Mail,
  Shield,
  Building2,
  Loader2,
  CheckCircle2,
  XCircle,
  LogIn,
  UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useFullApp } from "@/store/hooks/useFullApp";
import {
  useAcceptInvitation,
  useVerifyInvitation,
} from "@/hooks/workspace/useWorkspace";

export default function InvitationAcceptPage() {
  const [params] = useSearchParams();
  const token = params.get("token");
  const navigate = useNavigate();
  const { user } = useFullApp();
  const isAuthenticated = user && user.email != "";

  const {
    data: invitation,
    isLoading,
    isError,
    error,
  } = useVerifyInvitation(token);

  const { mutate: accept, isPending: isAccepting } = useAcceptInvitation();

  // ---------- state: no token in URL ----------
  if (!token) {
    return (
      <InviteShell>
        <InviteError
          title="Invalid link"
          description="This invitation link is missing its token. Ask the sender to re-share it."
        />
      </InviteShell>
    );
  }

  // ---------- state: loading ----------
  if (isLoading) {
    return (
      <InviteShell>
        <div className="flex flex-col items-center gap-3 py-10">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
          <p className="text-sm text-slate-500">Checking your invitation…</p>
        </div>
      </InviteShell>
    );
  }

  // ---------- state: invalid / expired token ----------
  if (isError || !invitation?.valid) {
    return (
      <InviteShell>
        <InviteError
          title="Invitation no longer valid"
          description={
            (error as any)?.response?.data?.error?.message ??
            "This invitation has expired, been revoked, or already accepted."
          }
        />
      </InviteShell>
    );
  }

  const emailMatches =
    isAuthenticated &&
    user?.email?.toLowerCase() === invitation.email.toLowerCase();

  // ---------- state: logged in but wrong email ----------
  if (isAuthenticated && !emailMatches) {
    return (
      <InviteShell>
        <InviteError
          title="Wrong account"
          description={`This invitation was sent to ${invitation.email}. You're currently logged in as ${user?.email}. Please log in with the correct account.`}
          action={
            <Button
              onClick={() => navigate(`/login?invite=${token}`)}
              className="gap-2"
            >
              <LogIn className="h-4 w-4" />
              Log in with another account
            </Button>
          }
        />
      </InviteShell>
    );
  }

  // ---------- main render: valid invite ----------
  return (
    <InviteShell>
      <Card className="w-full max-w-md border-slate-200 shadow-lg">
        <CardHeader className="space-y-4 pb-4">
          {/* Workspace identity */}
          <div className="flex flex-col items-center gap-3">
            <Avatar className="h-16 w-16 rounded-xl border border-slate-200">
              {invitation.workspace_image ? (
                <AvatarImage
                  src={invitation.workspace_image}
                  alt={invitation.workspace_name}
                  className="object-cover"
                />
              ) : null}
              <AvatarFallback className="rounded-xl bg-slate-900 text-xl font-semibold text-white">
                {invitation.workspace_name.slice(0, 2).toUpperCase() || (
                  <Building2 className="h-6 w-6" />
                )}
              </AvatarFallback>
            </Avatar>

            <CardTitle className="text-center text-xl">
              Join {invitation.workspace_name}
            </CardTitle>
          </div>
        </CardHeader>

        <CardContent className="space-y-5">
          {/* Invite details */}
          <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm">
            <DetailRow
              icon={<Mail className="h-4 w-4 text-slate-400" />}
              label="Invited email"
              value={invitation.email}
            />
            <DetailRow
              icon={<Shield className="h-4 w-4 text-slate-400" />}
              label="Role"
              value={
                <Badge variant="secondary" className="capitalize">
                  {invitation.role.toLowerCase()}
                </Badge>
              }
            />
          </div>

          {/* Action buttons — change based on auth state */}
          {emailMatches ? (
            <Button
              onClick={() => accept(token)}
              disabled={isAccepting}
              className="w-full gap-2"
              size="lg"
            >
              {isAccepting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Accepting…
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Accept invitation
                </>
              )}
            </Button>
          ) : (
            <div className="space-y-3">
              <Button asChild className="w-full gap-2" size="lg">
                <Link to={`/authenticate/register?invite=${token}`}>
                  <UserPlus className="h-4 w-4" />
                  Sign up to join
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                className="w-full gap-2"
                size="lg"
              >
                <Link to={`/authenticate/login?invite=${token}`}>
                  <LogIn className="h-4 w-4" />I already have an account
                </Link>
              </Button>

              <p className="text-center text-xs text-slate-500">
                Sign up with{" "}
                <span className="font-medium text-slate-700">
                  {invitation.email}
                </span>{" "}
                to join this workspace.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </InviteShell>
  );
}

// ---------- small internal helpers ----------

function InviteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      {children}
    </div>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="flex items-center gap-2 text-slate-500">
        {icon}
        {label}
      </span>
      <span className="truncate font-medium text-slate-900">{value}</span>
    </div>
  );
}

function InviteError({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <Card className="w-full max-w-md border-slate-200 shadow-lg">
      <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
        <div className="rounded-full bg-red-100 p-3">
          <XCircle className="h-8 w-8 text-red-600" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          <p className="text-sm text-slate-600">{description}</p>
        </div>
        {action}
      </CardContent>
    </Card>
  );
}
