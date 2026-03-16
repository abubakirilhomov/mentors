import React, { useEffect, useState, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../store/authSlice";
import { api } from "../services/api";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import InternCard from "../components/InternCard";
import StatsCard from "../components/StatsCard";
import PushManager from "../components/PushManager";
import InstallPrompt from "../components/InstallPrompt";
import BranchManagerDashboard from "../components/BranchManagerDashboard";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import {
  LogOut,
  RefreshCw,
  Users,
  AlertCircle,
} from "lucide-react";

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
      setInterns((prev) => prev.filter((i) => i.lessonId !== lessonId));

      // Update stats locally to reflect change instantly
      setStats(prev => prev ? ({
        ...prev,
        monthFeedbacks: prev.monthFeedbacks + 1,
        totalDebt: Math.max(0, prev.totalDebt - 1)
      }) : null);

    } catch (err) {
      console.error("Ошибка при оценке:", err);
      throw err; // InternCard will handle showing toast
    }
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <div className="min-h-screen bg-gray-50">
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
              <button
                onClick={loadData}
                disabled={loading}
                className={`p-2 text-gray-400 hover:text-gray-600 ${loading ? 'opacity-50' : ''}`}
                title="Обновить"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>

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
            {/* Stats Section */}
        <div className="max-w-4xl mx-auto">
          <StatsCard stats={stats} loading={loading && !stats} />
        </div>

        <div className="mb-8">
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
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700">
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
          <div className="text-center py-12 bg-white rounded-3xl shadow-sm border border-gray-100 max-w-2xl mx-auto">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Все чисто!
            </h3>
            <p className="text-gray-500 max-w-sm mx-auto">
              У вас нет долгов по фидбэкам. Можете отдохнуть или провести еще одно занятие.
            </p>
          </div>
        ) : (
          <Swiper
            modules={[Navigation, Pagination]}
            spaceBetween={30}
            slidesPerView={1}
            navigation={{
              nextEl: ".swiper-button-next-custom",
              prevEl: ".swiper-button-prev-custom",
            }}
            pagination={{
              clickable: true,
              bulletClass: "swiper-pagination-bullet-custom",
              bulletActiveClass: "swiper-pagination-bullet-active-custom",
            }}
            breakpoints={{
              768: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
            className="pb-16"
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

// Missing import fix
import { CheckCircle } from "lucide-react";

export default Dashboard;
