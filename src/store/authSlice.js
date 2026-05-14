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

// Snappy boot UX: rehydrate non-credential user from localStorage so the UI
// can render while silentRefresh runs in the background. authInitialized
// only flips after refresh resolves (or fails), so PrivateRoute won't trust
// stale user until then.
const readCachedUser = () => {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const initialState = {
  isAuth: false,
  authInitialized: false,
  needsBranchSelect: Boolean(initialPending),
  pendingLoginData: initialPending,
  user: readCachedUser(),
  token: null,
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
        credentials: "include",
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

// Cold-boot rehydration: fire one POST /mentors/refresh-token with the
// httpOnly cookie. On 200 we have a fresh access token in memory; on 401
// the user has to log in again.
//
// Migration shim: pre-cutover sessions still have refreshToken in
// localStorage. Pass it as body fallback so the backend can rotate it
// into the cookie. Cleanup legacy keys after a successful round-trip.
export const silentRefresh = createAsyncThunk(
  "auth/silentRefresh",
  async (_, { rejectWithValue }) => {
    const legacy = localStorage.getItem("refreshToken");
    try {
      const response = await fetch(`${apiUrl}/mentors/refresh-token`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(legacy ? { refreshToken: legacy } : {}),
      });
      if (legacy) {
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("token");
      }
      if (!response.ok) return rejectWithValue(response.status);
      const data = await response.json().catch(() => ({}));
      if (!data?.token) return rejectWithValue(204);
      return { token: data.token, user: data.user || null };
    } catch {
      if (legacy) {
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("token");
      }
      return rejectWithValue("network");
    }
  }
);

export const logoutMentor = createAsyncThunk(
  "auth/logoutMentor",
  async (_, { getState }) => {
    const { auth } = getState();
    try {
      await fetch(`${apiUrl}/mentors/logout`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(auth.token ? { Authorization: `Bearer ${auth.token}` } : {}),
        },
        body: "{}",
      });
    } catch {
      // Network may be down; the server blacklist won't get the jti, but the
      // user is leaving anyway. Always proceed to clear state.
    }
  }
);

const clearLocalSession = (state) => {
  state.isAuth = false;
  state.needsBranchSelect = false;
  state.pendingLoginData = null;
  state.user = null;
  state.token = null;
  state.error = null;
  localStorage.removeItem("user");
  localStorage.removeItem("activeBranchId");
  sessionStorage.removeItem(PENDING_LOGIN_KEY);
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Forced local logout for the unauthorized-refresh path. Does NOT call
    // /logout — used when the server has already rejected us.
    forceLogout: (state) => {
      clearLocalSession(state);
      state.authInitialized = true;
    },
    selectBranch: (state, action) => {
      const branchId = action.payload;
      localStorage.setItem("activeBranchId", branchId);
      const data = state.pendingLoginData;
      localStorage.setItem("user", JSON.stringify({ ...data.user, activeBranchId: branchId }));
      sessionStorage.removeItem(PENDING_LOGIN_KEY);
      state.isAuth = true;
      state.authInitialized = true;
      state.needsBranchSelect = false;
      state.user = { ...data.user, activeBranchId: branchId };
      state.token = data.token;
      state.pendingLoginData = null;
    },
    cancelBranchSelect: (state) => {
      sessionStorage.removeItem(PENDING_LOGIN_KEY);
      state.needsBranchSelect = false;
      state.pendingLoginData = null;
    },
    // Runtime branch switch (post-login). Caller is expected to reload the
    // page after dispatch so all components refetch with the new
    // X-Active-Branch header. Silently rejected if the id is not in the
    // user's allowed list — server's resolveActiveBranch.js would 403 anyway.
    switchActiveBranch: (state, action) => {
      const branchId = String(action.payload);
      const allowed = (state.user?.branchIds || []).map(String);
      if (!allowed.includes(branchId)) return;
      localStorage.setItem("activeBranchId", branchId);
      state.user = { ...state.user, activeBranchId: branchId };
      try {
        localStorage.setItem("user", JSON.stringify(state.user));
      } catch {}
    },
    updateToken: (state, action) => {
      state.token = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    setSession: (state, action) => {
      const data = action.payload || {};
      const branchIds = data.user?.branchIds || [];
      if (branchIds.length > 1) {
        state.needsBranchSelect = true;
        state.pendingLoginData = data;
        try {
          sessionStorage.setItem(PENDING_LOGIN_KEY, JSON.stringify(data));
        } catch {}
        return;
      }
      const branchId = data.user?.branchId || branchIds[0] || null;
      if (branchId) localStorage.setItem("activeBranchId", String(branchId));
      localStorage.setItem("user", JSON.stringify(data.user));
      state.isAuth = true;
      state.authInitialized = true;
      state.user = data.user;
      state.token = data.token;
      state.error = null;
      try { registerPush(data.user); } catch {}
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
          // Multi-branch: pause and ask user to choose. Refresh cookie is
          // already set by the server; we just need to remember which branch
          // they pick.
          state.needsBranchSelect = true;
          state.pendingLoginData = data;
          try {
            sessionStorage.setItem(PENDING_LOGIN_KEY, JSON.stringify(data));
          } catch {}
        } else {
          const branchId = data.user?.branchId || branchIds[0] || null;
          if (branchId) localStorage.setItem("activeBranchId", String(branchId));
          localStorage.setItem("user", JSON.stringify(data.user));
          state.isAuth = true;
          state.authInitialized = true;
          state.user = data.user;
          state.token = data.token;
          registerPush(data.user);
        }
      })
      .addCase(loginMentor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(silentRefresh.fulfilled, (state, action) => {
        const payload = action.payload || {};
        state.token = payload.token || null;
        if (payload.user) {
          // Refresh the cached user blob so existing sessions pick up new
          // fields (e.g. populated `branches` for the runtime switcher).
          state.user = { ...(state.user || {}), ...payload.user };
          try {
            localStorage.setItem("user", JSON.stringify(state.user));
          } catch {}
        }
        state.isAuth = Boolean(state.user);
        state.authInitialized = true;
      })
      .addCase(silentRefresh.rejected, (state) => {
        // Cookie missing / expired / revoked: stay logged out and clear any
        // stale cached user so the login screen isn't lying to us.
        clearLocalSession(state);
        state.authInitialized = true;
      })
      .addCase(logoutMentor.fulfilled, (state) => {
        clearLocalSession(state);
        state.authInitialized = true;
      })
      .addCase(logoutMentor.rejected, (state) => {
        clearLocalSession(state);
        state.authInitialized = true;
      });
  },
});

export const {
  forceLogout,
  clearError,
  selectBranch,
  cancelBranchSelect,
  switchActiveBranch,
  setSession,
  updateToken,
} = authSlice.actions;

// Legacy alias — some files (secureFetch) dispatch the bare "auth/logout"
// action type string. Map it to forceLogout so the existing call sites keep
// working without per-file rewrites.
export const logout = forceLogout;

export default authSlice.reducer;
