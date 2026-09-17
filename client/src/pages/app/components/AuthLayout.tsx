import { Navigate } from "react-router-dom";

import { useAuthHandler } from "@/hooks/useAuthChecker";
import PageLoadingBar from "@/components/PageLoadingBar";

export interface AuthProtectorProps {
  children: React.ReactNode;
}

const AuthLayout = ({ children }: AuthProtectorProps) => {
  const { isError, isPending } = useAuthHandler();

  if (isPending) return <PageLoadingBar />;
  if (isError) return <Navigate to="/" />;

  return <>{children}</>;
};

export default AuthLayout;
