import { store } from "../store/index.js";

export const secureFetch = async (url, options = {}) => {
  let token = localStorage.getItem("token");
  const refreshToken = localStorage.getItem("refreshToken");
  
  // Подставляем токен
  options.headers = {
    ...(options.headers || {}),
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  let response = await fetch(url, options);

  // Если токен истёк
  if (response.status === 401 && refreshToken) {
    // Запрашиваем новый токен
    const refreshRes = await fetch(`${import.meta.env.VITE_API_URL}/api/mentors/refresh-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    const refreshData = await refreshRes.json();

    if (refreshRes.ok && refreshData.token) {
      // Сохраняем новый токен
      localStorage.setItem("token", refreshData.token);
      store.dispatch({ type: "auth/updateToken", payload: refreshData.token });

      // Повторяем оригинальный запрос
      options.headers.Authorization = `Bearer ${refreshData.token}`;
      response = await fetch(url, options);
    } else {
      // Всё плохо — выходим
      store.dispatch({ type: "auth/logout" });
      return response;
    }
  }

  return response;
};
