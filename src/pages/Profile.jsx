import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { logout } from "../store/authSlice";
import { secureFetch } from "../utils/secureFetch";
import { ArrowLeft, LogOut, Lock, Eye, EyeOff, ChevronRight, ShieldCheck, UserCircle } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

const ROLE_LABELS = {
  mentor: "Ментор",
  admin: "Администратор",
  branchManager: "Branch Manager",
};

const Profile = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordLoading, setPasswordLoading] = useState(false);

  const initials =
    `${user?.name?.[0] || ""}${user?.lastName?.[0] || ""}`.toUpperCase() || "M";
  const roleLabel = ROLE_LABELS[user?.role] || user?.role || "Ментор";
  const branchCount = user?.branchIds?.length || (user?.branchId ? 1 : 0);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (passwordForm.newPassword.length < 6) {
      toast.error("Новый пароль должен содержать минимум 6 символов");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Пароли не совпадают");
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
        toast.error(data.message || data.error || "Ошибка при смене пароля");
        return;
      }

      toast.success("Пароль успешно изменён");
      setIsChangingPassword(false);
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch {
      toast.error("Ошибка сети. Попробуйте ещё раз.");
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleCancel = () => {
    setIsChangingPassword(false);
    setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="flex items-center h-14 px-4 gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-semibold text-gray-900">Профиль</h1>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 pt-6 space-y-4">

        {/* Avatar + name hero */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center text-center">
          {user?.profilePhoto ? (
            <img
              src={user.profilePhoto}
              alt={user.name}
              className="w-24 h-24 rounded-full object-cover shadow-md mb-4"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-red-400 to-orange-400 flex items-center justify-center shadow-md mb-4">
              <span className="text-white text-3xl font-bold">{initials}</span>
            </div>
          )}
          <h2 className="text-xl font-bold text-gray-900">
            {user?.name} {user?.lastName}
          </h2>
          <span className="mt-1.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-100">
            <UserCircle className="w-3.5 h-3.5" />
            {roleLabel}
          </span>
        </div>

        {/* Info rows */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50 last:border-0">
            <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-0.5">Имя</p>
            <p className="text-sm font-medium text-gray-900">{user?.name || "—"}</p>
          </div>
          {user?.lastName && (
            <div className="px-5 py-4 border-b border-gray-50 last:border-0">
              <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-0.5">Фамилия</p>
              <p className="text-sm font-medium text-gray-900">{user.lastName}</p>
            </div>
          )}
          <div className="px-5 py-4 border-b border-gray-50 last:border-0">
            <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-0.5">Роль</p>
            <p className="text-sm font-medium text-gray-900">{roleLabel}</p>
          </div>
          {branchCount > 0 && (
            <div className="px-5 py-4">
              <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-0.5">Филиалы</p>
              <p className="text-sm font-medium text-gray-900">
                {branchCount} {branchCount === 1 ? "филиал" : branchCount < 5 ? "филиала" : "филиалов"}
              </p>
            </div>
          )}
        </div>

        {/* Security section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-semibold text-gray-700">Безопасность</span>
            </div>
          </div>

          {!isChangingPassword ? (
            <button
              onClick={() => setIsChangingPassword(true)}
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center">
                  <Lock className="w-4 h-4 text-orange-500" />
                </div>
                <span className="text-sm font-medium text-gray-800">Изменить пароль</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-300" />
            </button>
          ) : (
            <form onSubmit={handlePasswordSubmit} className="p-5 space-y-4">
              <PasswordField
                label="Текущий пароль"
                name="currentPassword"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                show={showCurrent}
                onToggle={() => setShowCurrent((v) => !v)}
                required
              />
              <PasswordField
                label="Новый пароль"
                name="newPassword"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                show={showNew}
                onToggle={() => setShowNew((v) => !v)}
                hint="Минимум 6 символов"
                required
              />
              <PasswordField
                label="Подтвердите пароль"
                name="confirmPassword"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                show={showConfirm}
                onToggle={() => setShowConfirm((v) => !v)}
                required
              />

              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {passwordLoading ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : "Сохранить"}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200 transition-colors"
                >
                  Отмена
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-red-200 text-red-600 bg-white hover:bg-red-50 transition-colors text-sm font-medium shadow-sm"
        >
          <LogOut className="w-4 h-4" />
          Выйти из аккаунта
        </button>
      </div>
    </div>
  );
};

const PasswordField = ({ label, name, value, onChange, show, onToggle, hint, required }) => (
  <div className="space-y-1">
    <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">{label}</label>
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full px-4 py-2.5 pr-11 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent"
      />
      <button
        type="button"
        onClick={onToggle}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
      >
        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
    {hint && <p className="text-xs text-gray-400">{hint}</p>}
  </div>
);

export default Profile;
