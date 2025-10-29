import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { loginMentor } from "../store/authSlice";
import { User, Lock, AlertCircle, Loader } from "lucide-react";

const LoginPage = () => {
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState(""); // добавлено
  const [password, setPassword] = useState("");

  const dispatch = useDispatch();
  const { isAuth, loading, error } = useSelector((state) => state.auth);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim() && password.trim()) {
      const credentials = lastName.trim()
        ? { name: name.trim(), lastName: lastName.trim(), password }
        : { name: name.trim(), password };

      dispatch(loginMentor(credentials));
    }
  };

  if (isAuth) {
    return <Navigate to="/dashboard" replace />;
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
          <p className="text-gray-600">Вход для менторов</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
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
                required
              />
            </div>
          </div>

          {/* Фамилия (необязательное поле) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Фамилия (если есть)
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                placeholder="Введите фамилию (если есть)"
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
