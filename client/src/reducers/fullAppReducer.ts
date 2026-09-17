import { createSlice } from "@reduxjs/toolkit";

export type FullAppState = {
  user: User | null;
  accessToken: string | null;
};

const initialState: FullAppState = {
  user: null,
  accessToken: null,
};

const fullAppReducer = createSlice({
  name: "fullAppReducer",
  initialState,
  reducers: {
    setUser: (state, { payload }: { payload: User }) => {
      state.user = payload;
    },
    setAccessToken: (state, { payload }: { payload: string | null }) => {
      state.accessToken = payload;
    },
  },
});

export const { setUser, setAccessToken } = fullAppReducer.actions;
export default fullAppReducer.reducer;
