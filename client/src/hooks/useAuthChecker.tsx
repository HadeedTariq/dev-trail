import { authApi } from "@/lib/axios";
import { setAccessToken, setUser } from "@/reducers/fullAppReducer";
import { Dispatch, UnknownAction } from "@reduxjs/toolkit";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useDispatch } from "react-redux";

export const useAuthChecker = (dispatch: Dispatch<UnknownAction>) => {
  const authChecker = useMutation({
    mutationKey: ["authenticateUser-refresh"],
    mutationFn: async () => {
      const { data } = await authApi.get("/");
      dispatch(setUser(data));
    },
    onError: async () => {
      const refreshToken = localStorage.getItem("refreshToken");

      const { status, data: authData } = await authApi.post(
        "/refreshAccessToken",
        { refreshToken: String(refreshToken) },
      );
      if (status < 400) {
        dispatch(setAccessToken(authData.accessToken));
        localStorage.setItem("refreshToken", authData.refreshToken);
        const { data } = await authApi.get("/");
        dispatch(setUser(data));
      }
    },
  });
  return authChecker;
};

export const useAuthHandler = () => {
  const dispatch = useDispatch();
  const authChecker = useQuery({
    queryKey: ["authenticateUser"],
    queryFn: async () => {
      const { data } = await authApi.get("/");
      dispatch(setUser(data));
      return data;
    },
    retry: 2,
  });
  return authChecker;
};
