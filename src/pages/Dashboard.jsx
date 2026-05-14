import React, { useEffect, useState, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { logoutMentor } from "../store/authSlice";
import { api } from "../services/api";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import InternCard from "../components/InternCard";
import StatsCard from "../components/StatsCard";
import PushManager from "../components/PushManager";
import InstallPrompt from "../components/InstallPrompt";
import BranchManagerDashboard from "../components/BranchManagerDashboard";
import BranchSwitcher from "../components/BranchSwitcher";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import { Link } from "react-router-dom";
import {
  LogOut,
  RefreshCw,
  Users,
  AlertCircle,
  UserCircle,
  ChevronRight,
} from "lucide-react";

// ── helpers ───────────────────────────────────────────────────────────────────

const GRADE_LABELS = {
  junior: "Junior",
  strongJunior: "Strong Junior",
  middle: "Middle",
  strongMiddle: "Strong Middle",
  senior: "Senior",
};

const GRADE_COLORS = {
  junior: "bg-green-100 text-green-700",
  strongJunior: "bg-blue-100 text-blue-700",
  middle: "bg-yellow-100 text-yellow-700",
  strongMiddle: "bg-orange-100 text-orange-700",
  senior: "bg-red-100 text-red-700",
};

// ── Desktop intern list item ──────────────────────────────────────────────────

const InternListItem = ({ intern, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
      isActive
        ? "bg-red-50 border border-red-200 shadow-sm"
        : "hover:bg-gray-50 border border-transparent"
    }`}
  >
    {/* Avatar */}
    <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-red-400 to-orange-400 flex-shrink-0 flex items-center justify-center">
      {intern.profilePhoto ? (
        <img src={intern.profilePhoto} alt="" className="w-full h-full object-cover" />
      ) : (
        <span className="text-sm font-bold text-white">
          {intern.name?.[0]}{intern.lastName?.[0]}
        </span>
      )}
    </div>

    {/* Info */}
    <div className="flex-1 min-w-0">
      <p className={`text-sm font-semibold truncate ${isActive ? "text-red-700" : "text-gray-900"}`}>
        {intern.name} {intern.lastName}
      </p>
      <p className="text-xs text-gray-500 truncate">{intern.topic || "—"}</p>
    </div>

    {/* Grade + arrow */}
    <div className="flex items-center gap-1.5 flex-shrink-0">
      <span className={`text-xs px-1.5 py-0.5 rounded-md font-medium ${GRADE_COLORS[intern.grade] || "bg-gray-100 text-gray-600"}`}>
        {GRADE_LABELS[intern.grade] || intern.grade}
      </span>
      <ChevronRight className={`w-4 h-4 ${isActive ? "text-red-400" : "text-gray-300"}`} />
    </div>
  </button>
);

const Dashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const mentorId = user?._id;
  const isBranchManager = user?.role === "branchManager";

  const [interns, setInterns] = useState([]);
  const [stats, setStats] = useState(null);
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeIdx, setActiveIdx] = useState(0); // desktop: selected intern index

  const loadData = useCallback(async () => {
    if (!mentorId || isBranchManager) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const [internsData, statsData, rulesData] = await Promise.all([
        api.getPendingInterns(),
        api.getStats(mentorId),
        api.getRules()
      ]);

      setInterns(internsData);
      setStats(statsData);
      setRules(rulesData);
    } catch (err) {
      console.error("Data load error:", err);
      setError(err.message || "Ошибка загрузки данных");
    } finally {
      setLoading(false);
    }
  }, [mentorId, isBranchManager]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRate = async (
    internId,
    stars,
    feedback,
    violations,
    lessonId
  ) => {
    try {
      await api.rateIntern(internId, {
        stars,
        feedback,
        violations,
        mentorId,
        lessonId
      });

      // Update local state: remove ONLY this specific lesson (not all lessons with this intern)
      setInterns((prev) => {
        const next = prev.filter((i) => i.lessonId !== lessonId);
        // keep activeIdx in bounds
        setActiveIdx((idx) => Math.min(idx, Math.max(0, next.length - 1)));
        return next;
      });

      // Update stats locally to reflect change instantly
      setStats(prev => prev ? ({
        ...prev,
        monthFeedbacks: prev.monthFeedbacks + 1,
        totalDebt: Math.max(0, prev.totalDebt - 1),
        debtDetails: Array.isArray(prev.debtDetails)
          ? prev.debtDetails.filter((d) => String(d.lessonId) !== String(lessonId))
          : prev.debtDetails,
      }) : null);

    } catch (err) {
      console.error("Ошибка при оценке:", err);
      throw err; // InternCard will handle showing toast
    }
  };

  const handleLogout = () => {
    dispatch(logoutMentor());
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">M</span>
              </div>
              <div>
                <h1 className="text-md lg:text-xl font-bold text-gray-900">
                  Mars IT School
                </h1>
                <p className="text-sm text-gray-600">
                  {isBranchManager ? "Панель branch manager" : "Панель ментора"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <BranchSwitcher />

              <button
                onClick={loadData}
                disabled={loading}
                className={`p-2 text-gray-400 hover:text-gray-600 ${loading ? 'opacity-50' : ''}`}
                title="Обновить"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>

              <Link
                to="/profile"
                className="p-2 text-gray-400 hover:text-gray-600"
                title="Профиль"
              >
                <UserCircle className="w-5 h-5" />
              </Link>

              <button
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-red-600"
                title="Выйти"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Push & Install Prompts */}
        <div className="max-w-3xl mx-auto">
          <PushManager userId={mentorId} />
        </div>
        <InstallPrompt />

        {isBranchManager ? (
          <BranchManagerDashboard />
        ) : (
          <>
            {/* Greeting */}
            <div className="max-w-4xl mx-auto mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                Привет, {user?.name}{user?.lastName ? ` ${user.lastName}` : ""}!
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                Вот что происходит в этом месяце.
              </p>
            </div>

            {/* Stats Section */}
            <div className="max-w-4xl mx-auto">
              <StatsCard stats={stats} loading={loading && !stats} />
            </div>

            <div className="mb-8 max-w-4xl mx-auto">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-6 h-6 text-red-500" />
                <h2 className="lg:text-2xl text-lg font-bold text-gray-900">
                  Стажёры на оценку
                </h2>
              </div>
              <p className="text-gray-600 text-xs">
                {interns.length > 0
                  ? `У вас ${interns.length} неоценённых занятий. Пожалуйста, оставьте фидбэк.`
                  : "Отличная работа! Все стажёры оценены."}
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700 max-w-4xl mx-auto">
                <AlertCircle className="w-5 h-5" />
                <span>{error}</span>
                <button
                  onClick={loadData}
                  className="ml-auto text-red-600 underline"
                >
                  Повторить
                </button>
              </div>
            )}

        {/* Empty state */}
        {interns.length === 0 && !loading ? (
          <div className="max-w-4xl mx-auto px-4 py-12 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">✅</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-1">Всё оценено!</h3>
            <p className="text-sm text-gray-400">Нет стажёров, ожидающих оценки</p>
          </div>
        ) : (
          <>
            {/* ── Mobile: Swiper (< md) ─────────────────────────── */}
            <div className="md:hidden">
              <Swiper
                modules={[Navigation, Pagination]}
                spaceBetween={20}
                slidesPerView={1}
                pagination={{
                  clickable: true,
                  bulletClass: "swiper-pagination-bullet-custom",
                  bulletActiveClass: "swiper-pagination-bullet-active-custom",
                }}
                className="pb-12"
              >
                {interns.map((intern, index) => (
                  <SwiperSlide key={index}>
                    <InternCard
                      intern={intern}
                      mentorId={mentorId}
                      rules={rules}
                      onRate={handleRate}
                    />
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>

            {/* ── Desktop: master-detail (≥ md) ────────────────── */}
            <div className="hidden md:flex gap-6 max-w-5xl mx-auto items-start">
              {/* Left: intern list */}
              <div className="w-72 flex-shrink-0 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-700">Ожидают оценки</span>
                  <span className="text-xs bg-red-100 text-red-600 font-semibold px-2 py-0.5 rounded-full">
                    {interns.length}
                  </span>
                </div>
                <div className="p-2 max-h-[70vh] overflow-y-auto space-y-0.5">
                  {interns.map((intern, idx) => (
                    <InternListItem
                      key={intern.lessonId || idx}
                      intern={intern}
                      isActive={activeIdx === idx}
                      onClick={() => setActiveIdx(idx)}
                    />
                  ))}
                </div>
              </div>

              {/* Right: rating panel */}
              <div className="flex-1 sticky top-24">
                {interns[activeIdx] ? (
                  <InternCard
                    key={interns[activeIdx].lessonId || activeIdx}
                    intern={interns[activeIdx]}
                    mentorId={mentorId}
                    rules={rules}
                    onRate={handleRate}
                  />
                ) : null}
              </div>
            </div>
          </>
        )}
          </>
        )}
      </main>

      <style>{`
        .swiper-pagination-bullet-custom {
          width: 12px;
          height: 12px;
          background: #d1d5db;
          transition: all 0.2s ease;
        }
        .swiper-pagination-bullet-active-custom {
          background: #ef4444;
          transform: scale(1.25);
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
