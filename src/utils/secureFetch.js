import { store } from "../store/index.js";

// Access token now lives only in Redux state; refresh token rides the
// httpOnly cookie set by the server. All requests pass credentials:include
// so the cookie is sent on /refresh-token (cross-origin SPA → SameSite=None).
export const secureFetch = async (url, options = {}) => {
  const buildHeaders = (token) => {
    const activeBranch = localStorage.getItem("activeBranchId");
    return {
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      "Content-Type": "application/json",
      ...(activeBranch ? { "X-Active-Branch": activeBranch } : {}),
    };
  };

  let token = store.getState().auth.token;
  let response = await fetch(url, {
    ...options,
    credentials: "include",
    headers: buildHeaders(token),
  });

  if (response.status === 401) {
    const refreshRes = await fetch(`${import.meta.env.VITE_API_URL}/mentors/refresh-token`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: "{}",
    });

    if (refreshRes.ok) {
      const refreshData = await refreshRes.json().catch(() => ({}));
      if (refreshData?.token) {
        store.dispatch({ type: "auth/updateToken", payload: refreshData.token });
        response = await fetch(url, {
          ...options,
          credentials: "include",
          headers: buildHeaders(refreshData.token),
        });
      } else {
        store.dispatch({ type: "auth/forceLogout" });
      }
    } else {
      store.dispatch({ type: "auth/forceLogout" });
    }
  }

  return response;
};
