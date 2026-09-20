import { store } from "@/store/store";
import axios from "axios";
let url = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080/api/v1";

const createProtectedApi = (basePath: string) => {
  const api = axios.create({
    baseURL: `${url}${basePath}`,
    withCredentials: true,
  });

  api.interceptors.request.use((config) => {
    const token = store.getState().fullAppReducer.accessToken;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  });

  return api;
};

const authApi = createProtectedApi("/auth");
const workspaceApi = createProtectedApi("/workspace");

export { authApi, workspaceApi };
