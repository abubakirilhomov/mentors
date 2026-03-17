import React, { useState } from "react";
import { useSelector } from "react-redux";
import { secureFetch } from "../utils/secureFetch";

const API_URL = import.meta.env.VITE_API_URL;

const Profile = () => {
  const { user } = useSelector((state) => state.auth);

  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handlePasswordChange = (e) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (passwordForm.newPassword.length < 6) {
      setPasswordError("Новый пароль должен содержать минимум 6 символов");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("Пароли не совпадают");
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await secureFetch(`${API_URL}/mentors/me/password`, {
        method: "PATCH",
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setPasswordError(data.message || data.error || "Ошибка при смене пароля");
        return;
      }

      setPasswordSuccess("Пароль успешно изменён");
      setIsChangingPassword(false);
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch {
      setPasswordError("Ошибка сети. Попробуйте ещё раз.");
    } finally {
      setPasswordLoading(false);
    }
  };

  const handlePasswordCancel = () => {
    setIsChangingPassword(false);
    setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setPasswordError("");
    setPasswordSuccess("");
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16 gap-4">
            <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">M</span>
            </div>
            <div>
              <h1 className="text-md lg:text-xl font-bold text-gray-900">
                Mars IT School
              </h1>
              <p className="text-sm text-gray-600">Профиль</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Profile Info Card */}
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {user?.name?.[0]?.toUpperCase()}
                {user?.lastName?.[0]?.toUpperCase()}
              </div>
              <div>
                <h2 className="text-xl font-bold text-base-content">
                  {user?.name} {user?.lastName}
                </h2>
                <p className="text-base-content/70 text-sm capitalize">
                  {user?.role || "Ментор"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {user?.name && (
                <div>
                  <h3 className="text-sm font-medium text-base-content/70 uppercase tracking-wide">
                    Имя
                  </h3>
                  <p className="text-base-content mt-1">{user.name}</p>
                </div>
              )}
              {user?.lastName && (
                <div>
                  <h3 className="text-sm font-medium text-base-content/70 uppercase tracking-wide">
                    Фамилия
                  </h3>
                  <p className="text-base-content mt-1">{user.lastName}</p>
                </div>
              )}
              {user?.role && (
                <div>
                  <h3 className="text-sm font-medium text-base-content/70 uppercase tracking-wide">
                    Роль
                  </h3>
                  <p className="text-base-content mt-1 capitalize">{user.role}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Security Card */}
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <h3 className="card-title text-lg mb-4">Безопасность</h3>

            {passwordSuccess && !isChangingPassword && (
              <div className="alert alert-success text-sm py-2 mb-3">
                <span>{passwordSuccess}</span>
              </div>
            )}

            {!isChangingPassword ? (
              <button
                onClick={() => {
                  setIsChangingPassword(true);
                  setPasswordSuccess("");
                }}
                className="btn btn-outline btn-warning w-full"
              >
                Изменить пароль
              </button>
            ) : (
              <form onSubmit={handlePasswordSubmit} className="space-y-3">
                {passwordError && (
                  <div className="alert alert-error text-sm py-2">
                    <span>{passwordError}</span>
                  </div>
                )}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Текущий пароль</span>
                  </label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordChange}
                    className="input input-bordered input-primary"
                    required
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Новый пароль</span>
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordChange}
                    className="input input-bordered input-primary"
                    required
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Подтвердите пароль</span>
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordChange}
                    className="input input-bordered input-primary"
                    required
                  />
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm flex-1"
                    disabled={passwordLoading}
                  >
                    {passwordLoading ? (
                      <span className="loading loading-spinner loading-xs" />
                    ) : (
                      "Сохранить"
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handlePasswordCancel}
                    className="btn btn-ghost btn-sm flex-1"
                  >
                    Отмена
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
