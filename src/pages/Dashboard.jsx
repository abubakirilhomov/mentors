import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../store/authSlice";
import { secureFetch } from "../utils/secureFetch";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import InternCard from "../components/InternCard";

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
  const { token, user } = useSelector((state) => state.auth);

  const mentorId = user?._id;
  const apiUrl = import.meta.env.VITE_API_URL;

  const [interns, setInterns] = useState([]);
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ----------------------
  // Push Notifications Setup
  // ----------------------
  useEffect(() => {
    if (!token || !user) return;

    (async () => {
      try {
        const reg = await navigator.serviceWorker.ready;
        const existingSub = await reg.pushManager.getSubscription();

        const subscription =
          existingSub ||
          (await reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: import.meta.env.VITE_VAPID_PUBLIC_KEY,
          }));

        await secureFetch(`${apiUrl}/api/notifications/subscribe`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            subscription,
            userId: user._id,
            userType: "mentor",
          }),
        });
      } catch (err) {
        console.error("Push подписка не удалась:", err);
      }
    })();
  }, [token, user]);

  // ----------------------
  // Fetch interns (pending lessons)
  // ----------------------
  const fetchInterns = async () => {
    if (!token) return;

    setLoading(true);
    setError(null);

    try {
      const response = await secureFetch(`${apiUrl}/api/lessons/pending`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Ошибка при загрузке");
      }

      setInterns(data);
    } catch (err) {
      console.error("Ошибка загрузки стажёров:", err);
      setError(err.message || "Ошибка при загрузке стажёров");
    } finally {
      setLoading(false);
    }
  };

  // ----------------------
  // Fetch rules
  // ----------------------
  const fetchRules = async () => {
    try {
      const response = await secureFetch(`${apiUrl}/api/rules`);
      const data = await response.json();

      setRules(data.data || []);
    } catch (err) {
      console.error("Ошибка загрузки правил:", err);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  useEffect(() => {
    fetchInterns();
  }, [token]);

  // ----------------------
  // Rate intern
  // ----------------------
  const handleRate = async (
    internId,
    stars,
    feedback,
    violations,
    lessonId
  ) => {
    try {
      const response = await secureFetch(
        `${apiUrl}/api/interns/${internId}/rate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            stars,
            feedback,
            violations,
            mentorId,
            lessonId,
          }),
        }
      );

      const updatedIntern = await response.json();

      if (!response.ok) throw new Error(updatedIntern.message);

      // Убираем оценённого стажёра
      setInterns((prev) =>
        prev.filter((i) => i._id !== internId)
      );
    } catch (err) {
      console.error("Ошибка при оценке:", err);
      throw err;
    }
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  // ----------------------
  // Rendering
  // ----------------------
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-red-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Загружаем стажёров...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
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
                <p className="text-sm text-gray-600">Панель ментора</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => fetchInterns()}
                className="p-2 text-gray-400 hover:text-gray-600"
                title="Обновить"
              >
                <RefreshCw className="w-5 h-5" />
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
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-6 h-6 text-red-500" />
            <h2 className="lg:text-2xl text-lg font-bold text-gray-900">
              Стажёры
            </h2>
          </div>
          <p className="text-gray-600 text-xs">
            Оцените работу стажёров за эту неделю.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
            <button
              onClick={() => fetchInterns()}
              className="ml-auto text-red-600 underline"
            >
              Повторить
            </button>
          </div>
        )}

        {/* Empty state */}
        {interns.length === 0 && !loading ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900">
              Стажёры не найдены
            </h3>
            <button
              onClick={() => fetchInterns()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg"
            >
              <RefreshCw className="w-4 h-4" /> Обновить
            </button>
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
