import { Route, Routes, useSearchParams } from "react-router-dom";

import { useDispatch } from "react-redux";

import { Suspense, useEffect } from "react";

import { useAuthChecker } from "./hooks/useAuthChecker";
import { useFullApp } from "./store/hooks/useFullApp";
import * as R from "@/lazy-routes";
import { setAccessToken } from "./reducers/fullAppReducer";
import PageLoadingBar from "./components/PageLoadingBar";

function App() {
  const [params] = useSearchParams();
  const { user, accessToken } = useFullApp();

  const dispatch = useDispatch();
  const { isPending, mutate: authUser } = useAuthChecker(dispatch);

  useEffect(() => {
    const accessToken = params.get("accessToken");
    const refreshToken = params.get("refreshToken");

    if (accessToken && refreshToken) {
      dispatch(setAccessToken(accessToken));
      localStorage.setItem("refreshToken", refreshToken);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  useEffect(() => {
    if (!user) {
      authUser();
    }
    const lng = localStorage.getItem("lng");
    if (lng) {
      document.documentElement.lang = lng;
    }
  }, [accessToken, user]);

  if (isPending) return <PageLoadingBar />;
  return (
    <Suspense fallback={<PageLoadingBar />}>
      <Routes>
        <Route path="/" element={<R.Layout />}>
          <Route index element={<R.HomePage />} />
        </Route>

        <Route
          path="/authenticate"
          element={
            <R.AuthProtector>
              <R.Layout />
            </R.AuthProtector>
          }
        >
          <Route path="login" element={<R.LoginUser />} />
          <Route path="register" element={<R.RegisterUser />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;
