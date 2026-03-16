import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { registerPush } from "../utils/registerPush";

const initialState = {
  isAuth: false,
  needsBranchSelect: false,  // true when mentor has multiple branches
  pendingLoginData: null,    // holds login response until branch is chosen
  user: null,
  token: null,
  refreshToken: null,
  loading: false,
  error: null,
};
const apiUrl = import.meta.env.VITE_API_URL;

export const loginMentor = createAsyncThunk(
  "auth/loginMentor",
  async ({ name, lastName, password }, { rejectWithValue }) => {
    try {
      const payload = lastName?.trim()
        ? { name, lastName: lastName.trim(), password }
        : { name, password };

      const response = await fetch(`${apiUrl}/mentors/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        return rejectWithValue(data.message || "Ошибка авторизации");
      }

      return data;
    } catch (error) {
      return rejectWithValue("Ошибка сети");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.isAuth = false;
      state.needsBranchSelect = false;
      state.pendingLoginData = null;
      state.user = null;
      state.token = null;
      state.error = null;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("activeBranchId");
    },
    selectBranch: (state, action) => {
      const branchId = action.payload;
      localStorage.setItem("activeBranchId", branchId);
      const data = state.pendingLoginData;
      localStorage.setItem("token", data.token);
      localStorage.setItem("refreshToken", data.refreshToken);
      localStorage.setItem("user", JSON.stringify({ ...data.user, activeBranchId: branchId }));
      state.isAuth = true;
      state.needsBranchSelect = false;
      state.user = { ...data.user, activeBranchId: branchId };
      state.token = data.token;
      state.refreshToken = data.refreshToken;
      state.pendingLoginData = null;
    },
    updateToken: (state, action) => {
      state.token = action.payload;
    },
    loadFromStorage: (state) => {
      const token = localStorage.getItem("token");
      const refreshToken = localStorage.getItem("refreshToken");
      const userStr = localStorage.getItem("user");

      if (token && refreshToken && userStr) {
        try {
          const user = JSON.parse(userStr);
          state.isAuth = true;
          state.user = user;
          state.token = token;
          state.refreshToken = refreshToken;
        } catch (error) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }
      }
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginMentor.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginMentor.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        const data = action.payload;
        const branchIds = data.user?.branchIds || [];

        if (branchIds.length > 1) {
          // Multi-branch: pause and ask user to choose
          state.needsBranchSelect = true;
          state.pendingLoginData = data;
        } else {
          // Single branch — log in immediately
          const branchId = data.user?.branchId || branchIds[0] || null;
          if (branchId) localStorage.setItem("activeBranchId", String(branchId));
          localStorage.setItem("token", data.token);
          localStorage.setItem("refreshToken", data.refreshToken);
          localStorage.setItem("user", JSON.stringify(data.user));
          state.isAuth = true;
          state.user = data.user;
          state.token = data.token;
          state.refreshToken = data.refreshToken;
          registerPush(data.user);
        }
      })
      .addCase(loginMentor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout, loadFromStorage, clearError, selectBranch } = authSlice.actions;
export default authSlice.reducer;
