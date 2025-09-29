import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../store/authSlice";
import axios from "axios";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import InternCard from "../components/InternCard";
import { LogOut, RefreshCw, Users, AlertCircle, Trophy } from "lucide-react";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const Dashboard = () => {
  const dispatch = useDispatch();
  const { token, user } = useSelector((state) => state.auth);
  const mendorId = user?._id;
  const [interns, setInterns] = useState([]);
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const apiUrl = import.meta.env.VITE_API_URL1;

  const fetchInterns = async () => {
    if (!token) return;

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`${apiUrl}/api/lessons/pending`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(response.data);
      setInterns(response.data);
    } catch (err) {
      console.error("Ошибка при загрузке интернов:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Ошибка при загрузке стажёров"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchRules = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/rules`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log(response.data.data);
        setRules(response.data.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchRules();
  }, []);

  useEffect(() => {
    fetchInterns();
  }, [token]);

  const handleRate = async (
    internId,
    stars,
    feedback,
    violations,
    lessonId
  ) => {
    if (!token) return;
    console.log(lessonId);
    try {
      const { data: updatedIntern } = await axios.post(
        `${apiUrl}/api/interns/${internId}/rate`,
        {
          stars,
          feedback,
          violations, // <--- новое поле
          mentorId: mendorId,
          lessonId: lessonId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setInterns((prev) => {
        const copy = [...prev];
        const index = copy.findIndex((intern) => intern._id === internId);
        if (index !== -1) {
          copy.splice(index, 1); // убираем только первую найденную карточку
        }
        return copy;
      });
    } catch (err) {
      console.error("Ошибка при оценке:", err);
      throw err;
    }
  };

  const handleLogout = () => {
    dispatch(logout());
  };

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
  console.log(interns);
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
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900"></p>
                <p className="text-xs text-gray-500">Ментор</p>
              </div>

              <button
                onClick={() => fetchInterns()}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                title="Обновить"
              >
                <RefreshCw className="w-5 h-5" />
              </button>

              <button
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-red-600 transition-colors duration-200"
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
            <h2 className="lg:text-2xl text-lg font-bold text-gray-900">Стажёры</h2>
          </div>
          <p className="text-gray-600 text-xs ">
            Оцените работу стажёров за эту неделю. Свайпайте для перехода между
            карточками.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
            <button
              onClick={() => fetchInterns()}
              className="ml-auto text-red-600 hover:text-red-800 underline"
            >
              Повторить
            </button>
          </div>
        )}

        {interns.length === 0 && !loading && !error ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              Стажёры не найдены
            </h3>
            <p className="text-gray-600 mb-4">
              В вашем филиале пока нет зарегистрированных стажёров.
            </p>
            <button
              onClick={() => fetchInterns()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200"
            >
              <RefreshCw className="w-4 h-4" />
              Обновить
            </button>
          </div>
        ) : (
          <div className="relative">
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
                640: { slidesPerView: 1 },
                768: { slidesPerView: 2 },
                1024: { slidesPerView: 3 },
              }}
              className="pb-16"
            >
              {interns.map((intern) => (
                <SwiperSlide key={intern._id}>
                  <InternCard
                    intern={intern}
                    onRate={handleRate}
                    mentorId={user?._id}
                    rules={rules}
                  />
                </SwiperSlide>
              ))}
            </Swiper>

            {/* Отдельный контейнер для кнопок навигации */}
            {interns.length > 1 && (
              <div className="absolute top-[10%] lg:top-[10%] inset-0 pointer-events-none z-10">
                <div className="relative h-80 flex items-center justify-between px-4">
                  <button className="swiper-button-prev-custom pointer-events-auto w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:text-red-500 transition-colors duration-200">
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </button>

                  <button className="swiper-button-next-custom pointer-events-auto w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:text-red-500 transition-colors duration-200">
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Custom Swiper Styles */}
      <style>{`
        .swiper-pagination-bullet-custom {
          width: 12px;
          height: 12px;
          background: #d1d5db;
          opacity: 1;
          transition: all 0.2s ease;
        }
        .swiper-pagination-bullet-active-custom {
          background: #ef4444;
          transform: scale(1.2);
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
