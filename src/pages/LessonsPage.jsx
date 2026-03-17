import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { api } from "../services/api";

const STATUS_TABS = [
  { key: "all", label: "Все" },
  { key: "pending", label: "Ожидают" },
  { key: "confirmed", label: "Подтверждены" },
];

const getMonthRange = (offset = 0) => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + offset;
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0);
  const pad = (n) => String(n).padStart(2, "0");
  const fmt = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  return { startDate: fmt(start), endDate: fmt(end) };
};

const formatDateTime = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const StatusBadge = ({ status }) => {
  if (status === "confirmed") {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
        Подтверждено
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
      Ожидает
    </span>
  );
};

const LessonCard = ({ lesson }) => {
  const internName = lesson.intern
    ? `${lesson.intern.name || ""} ${lesson.intern.lastName || ""}`.trim()
    : "—";

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 truncate">{internName}</p>
          <p className="text-sm text-gray-600 mt-0.5 truncate">{lesson.topic || "—"}</p>
        </div>
        <StatusBadge status={lesson.status} />
      </div>
      <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
        {lesson.date || lesson.time ? (
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {formatDateTime(lesson.date || lesson.time)}
          </span>
        ) : null}
        {lesson.group ? (
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" />
            </svg>
            {lesson.group}
          </span>
        ) : null}
      </div>
    </div>
  );
};

const LessonsPage = () => {
  const user = useSelector((state) => state.auth.user);

  const [activeTab, setActiveTab] = useState("all");
  const [periodOffset, setPeriodOffset] = useState(0); // 0 = current month, -1 = last month
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchLessons = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { startDate, endDate } = getMonthRange(periodOffset);
      const params = { startDate, endDate };
      if (activeTab !== "all") params.status = activeTab;

      const res = await api.getLessons(params);
      if (!res.ok) throw new Error("Ошибка загрузки уроков");
      const data = await res.json();

      // The endpoint returns all lessons; filter by current mentor on the client side
      const mentorId = user?._id || user?.id;
      const filtered = Array.isArray(data)
        ? data.filter((l) => {
            const lMentorId =
              typeof l.mentor === "object" ? l.mentor?._id : l.mentor;
            return String(lMentorId) === String(mentorId);
          })
        : [];

      setLessons(filtered);
    } catch (err) {
      setError(err.message || "Ошибка загрузки");
    } finally {
      setLoading(false);
    }
  }, [activeTab, periodOffset, user]);

  useEffect(() => {
    fetchLessons();
  }, [fetchLessons]);

  const periodLabel = periodOffset === 0 ? "Текущий месяц" : "Прошлый месяц";

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Header */}
      <div className="bg-white border-b px-4 py-4 sticky top-0 z-10">
        <h1 className="text-xl font-bold text-gray-900 mb-3">Уроки</h1>

        {/* Filter tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-1.5 text-sm font-medium rounded-lg transition-all duration-150 ${
                activeTab === tab.key
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Period selector */}
        <div className="flex items-center gap-2 mt-3">
          <button
            onClick={() => setPeriodOffset(0)}
            className={`flex-1 py-1.5 text-xs font-medium rounded-lg border transition-all duration-150 ${
              periodOffset === 0
                ? "bg-red-500 text-white border-red-500"
                : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
            }`}
          >
            Текущий месяц
          </button>
          <button
            onClick={() => setPeriodOffset(-1)}
            className={`flex-1 py-1.5 text-xs font-medium rounded-lg border transition-all duration-150 ${
              periodOffset === -1
                ? "bg-red-500 text-white border-red-500"
                : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
            }`}
          >
            Прошлый месяц
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-4 space-y-3">
        {loading && (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!loading && error && (
          <div className="bg-red-50 border border-red-100 rounded-2xl p-4 text-center">
            <p className="text-sm text-red-600">{error}</p>
            <button
              onClick={fetchLessons}
              className="mt-2 text-xs text-red-500 underline"
            >
              Повторить
            </button>
          </div>
        )}

        {!loading && !error && lessons.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-sm">Нет уроков за {periodLabel.toLowerCase()}</p>
          </div>
        )}

        {!loading && !error && lessons.length > 0 && (
          <>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
              {periodLabel} — {lessons.length} {lessons.length === 1 ? "урок" : "уроков"}
            </p>
            {lessons.map((lesson) => (
              <LessonCard key={lesson._id} lesson={lesson} />
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default LessonsPage;
