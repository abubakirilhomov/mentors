import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { loginMentor, selectBranch } from "../store/authSlice";
import { User, Lock, AlertCircle, Loader, Building } from "lucide-react";

const LoginPage = () => {
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [branchNames, setBranchNames] = useState({});

  const dispatch = useDispatch();
  const { isAuth, loading, error, needsBranchSelect, pendingLoginData } = useSelector((state) => state.auth);

  // Load branch names for the selector screen
  useEffect(() => {
    if (needsBranchSelect && pendingLoginData?.user?.branchIds?.length) {
      const API = import.meta.env.VITE_API_URL;
      fetch(`${API}/branches`, {
        headers: { Authorization: `Bearer ${pendingLoginData.token}` },
      })
        .then((r) => r.json())
        .then((data) => {
          const map = {};
          (Array.isArray(data) ? data : data.data || []).forEach((b) => {
            map[b._id] = b.name;
          });
          setBranchNames(map);
        })
        .catch(() => {});
    }
  }, [needsBranchSelect, pendingLoginData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedLastName = lastName.trim();
    if (!trimmedName || !trimmedLastName || !password) return;
    dispatch(
      loginMentor({
        name: trimmedName,
        lastName: trimmedLastName,
        password,
      })
    );
  };

  if (isAuth) {
    return <Navigate to="/dashboard" replace />;
  }

  // Branch selector screen
  if (needsBranchSelect && pendingLoginData) {
    const branchIds = pendingLoginData.user?.branchIds || [];
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
          <div className="text-center mb-6">
            <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Building className="w-7 h-7 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Выберите филиал</h2>
            <p className="text-gray-500 text-sm mt-1">
              Вы работаете в нескольких филиалах. Выберите активный для этой сессии.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            {branchIds.map((id) => (
              <button
                key={id}
                onClick={() => dispatch(selectBranch(String(id)))}
                className="w-full py-4 px-5 rounded-xl border-2 border-gray-200 hover:border-red-400 hover:bg-red-50 text-left transition-all font-medium text-gray-700"
              >
                {branchNames[id] || id}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <div className="text-white font-bold text-2xl">M</div>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Mars IT School
          </h1>
          <p className="text-gray-600">Вход для менторов и branch manager</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6" autoComplete="on">
          {/*
            Hidden composite "username" field so browser password managers can
            store the credential as a single (fullName + password) pair. We
            keep it visually hidden but accessible to the autofill engine,
            and split the autofilled value back into name/lastName on change.
          */}
          <input
            type="text"
            name="username"
            autoComplete="username"
            tabIndex={-1}
            aria-hidden="true"
            value={`${name} ${lastName}`.trim()}
            onChange={(e) => {
              const parts = e.target.value.trim().split(/\s+/);
              setName(parts[0] || "");
              setLastName(parts.slice(1).join(" "));
            }}
            style={{
              position: "absolute",
              left: "-10000px",
              width: "1px",
              height: "1px",
              opacity: 0,
              pointerEvents: "none",
            }}
          />
          {/* Имя */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Имя
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                placeholder="Введите имя"
                autoComplete="given-name"
                required
              />
            </div>
          </div>

          {/* Фамилия */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Фамилия
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                placeholder="Введите фамилию"
                autoComplete="family-name"
                required
              />
            </div>
          </div>

          {/* Пароль */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Пароль
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                placeholder="Введите пароль"
                autoComplete="current-password"
                required
              />
            </div>
          </div>

          {/* Ошибка */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Кнопка */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-500 text-white py-3 rounded-lg font-medium hover:bg-red-600 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Входим...
              </>
            ) : (
              "Войти"
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-500">
          Mars IT School © 2025
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
