import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, Link } from "react-router-dom";
import { setSession } from "../store/authSlice";
import { AlertCircle, Lock, User, Loader, Link as LinkIcon } from "lucide-react";

const APP_KEY = "mentors";
const API_URL = import.meta.env.VITE_API_URL;

const parseFragment = () => {
  const hash = window.location.hash.replace(/^#/, "");
  const params = new URLSearchParams(hash);
  const out = {};
  for (const [k, v] of params.entries()) out[k] = v;
  return out;
};

const MarsIdReturn = () => {
  const dispatch = useDispatch();
  const { isAuth } = useSelector((s) => s.auth);
  const [linkage, setLinkage] = useState(null);
  const [error, setError] = useState(null);
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fragment = useMemo(() => parseFragment(), []);

  useEffect(() => {
    // Clear hash so creds aren't kept in URL
    if (window.location.hash) {
      window.history.replaceState(null, "", window.location.pathname);
    }
    if (fragment.marsIdError) {
      setError(decodeURIComponent(fragment.marsIdError));
      return;
    }
    if (fragment.token && fragment.user) {
      try {
        const user = JSON.parse(fragment.user);
        // Refresh cookie was set on the redirect response from the API
        // origin; we only need the access token and user payload here.
        dispatch(setSession({
          token: fragment.token,
          user,
        }));
      } catch {
        setError("Не удалось разобрать ответ Mars ID");
      }
      return;
    }
    if (fragment.linkageToken) {
      setLinkage({
        token: fragment.linkageToken,
        handle: fragment.handle || "",
        kind: fragment.kind || "mentor",
      });
      return;
    }
    setError("Mars ID не вернул ни сессию, ни запрос на привязку");
  }, [dispatch, fragment]);

  const handleLink = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/auth/marsid/link`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          linkageToken: linkage.token,
          name: name.trim(),
          lastName: lastName.trim(),
          password,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.message || "Не удалось привязать Mars ID");
        return;
      }
      dispatch(setSession(data));
    } catch {
      setError("Ошибка сети при привязке");
    } finally {
      setSubmitting(false);
    }
  };

  if (isAuth) return <Navigate to="/dashboard" replace />;

  if (linkage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
          <div className="text-center mb-6">
            <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <LinkIcon className="w-7 h-7 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Привяжите Mars ID</h2>
            <p className="text-gray-500 text-sm mt-1">
              Mars ID {linkage.handle && <strong>@{linkage.handle}</strong>} ещё не привязан к
              вашему аккаунту. Введите имя, фамилию и текущий пароль ментора, чтобы выполнить привязку — это разовое действие.
            </p>
          </div>
          <form onSubmit={handleLink} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Имя</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Фамилия</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Текущий пароль</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-red-500 text-white py-3 rounded-lg font-medium hover:bg-red-600 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Привязываем...
                </>
              ) : (
                "Привязать и войти"
              )}
            </button>
            <Link to="/login" className="block text-center text-sm text-gray-500 hover:text-gray-700">
              Отмена
            </Link>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 text-center">
        {error ? (
          <>
            <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <AlertCircle className="w-7 h-7 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Ошибка Mars ID</h2>
            <p className="text-gray-600 text-sm mb-6">{error}</p>
            <Link to="/login" className="inline-block px-5 py-2.5 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600">
              Вернуться ко входу
            </Link>
          </>
        ) : (
          <>
            <Loader className="w-8 h-8 text-red-500 animate-spin mx-auto mb-3" />
            <p className="text-gray-600">Завершаем вход через Mars ID…</p>
          </>
        )}
      </div>
    </div>
  );
};

export default MarsIdReturn;
