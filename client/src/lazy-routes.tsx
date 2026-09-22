import React from "react";

export const HomePage = React.lazy(() => import("./pages/app/routes/HomePage"));
export const CreateWorkSpace = React.lazy(
  () => import("./pages/app/routes/workspace/CreateWorkSpace")
);
export const UpdateWorkSpace = React.lazy(
  () => import("./pages/app/routes/workspace/UpdateWorkSpace")
);
export const GetWorkSpaceDetails = React.lazy(
  () => import("./pages/app/routes/workspace/GetWorkSpaceDetails")
);
export const Layout = React.lazy(() => import("./pages/app/components/Layout"));
export const AuthProtector = React.lazy(
  () => import("./pages/auth/components/AuthProtector")
);

export const RegisterUser = React.lazy(
  () => import("./pages/auth/routes/RegisterUser")
);
export const LoginUser = React.lazy(
  () => import("./pages/auth/routes/LoginUser")
);

export const AuthLayout = React.lazy(
  () => import("./pages/app/components/AuthLayout")
);
