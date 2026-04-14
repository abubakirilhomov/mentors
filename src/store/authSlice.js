import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { registerPush } from "../utils/registerPush";

const PENDING_LOGIN_KEY = "pendingLoginData";

const readPendingLogin = () => {
  try {
    const raw = sessionStorage.getItem(PENDING_LOGIN_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const initialPending = readPendingLogin();

const initialState = {
  isAuth: false,
  needsBranchSelect: Boolean(initialPending),
  pendingLoginData: initialPending,
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
      const trimmedName = String(name || "").trim();
      const trimmedLastName = String(lastName || "").trim();

      if (!trimmedName || !trimmedLastName || !password) {
        return rejectWithValue("Заполните имя, фамилию и пароль");
      }

      const response = await fetch(`${apiUrl}/mentors/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmedName,
          lastName: trimmedLastName,
          password,
        }),
      });

      const data = await response.json().catch(() => ({}));
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
      sessionStorage.removeItem(PENDING_LOGIN_KEY);
    },
    selectBranch: (state, action) => {
      const branchId = action.payload;
      localStorage.setItem("activeBranchId", branchId);
      const data = state.pendingLoginData;
      localStorage.setItem("token", data.token);
      localStorage.setItem("refreshToken", data.refreshToken);
      localStorage.setItem("user", JSON.stringify({ ...data.user, activeBranchId: branchId }));
      sessionStorage.removeItem(PENDING_LOGIN_KEY);
      state.isAuth = true;
      state.needsBranchSelect = false;
      state.user = { ...data.user, activeBranchId: branchId };
      state.token = data.token;
      state.refreshToken = data.refreshToken;
      state.pendingLoginData = null;
    },
    cancelBranchSelect: (state) => {
      sessionStorage.removeItem(PENDING_LOGIN_KEY);
      state.needsBranchSelect = false;
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
          // Multi-branch: pause and ask user to choose.
          // Persist to sessionStorage so reload on the branch-picker keeps the flow.
          state.needsBranchSelect = true;
          state.pendingLoginData = data;
          try {
            sessionStorage.setItem(PENDING_LOGIN_KEY, JSON.stringify(data));
          } catch {}
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

export const {
  logout,
  loadFromStorage,
  clearError,
  selectBranch,
  cancelBranchSelect,
} = authSlice.actions;
export default authSlice.reducer;
