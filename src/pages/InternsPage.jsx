import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { api } from "../services/api";

const GRADE_COLORS = {
  junior: "bg-green-100 text-green-700",
  strongJunior: "bg-blue-100 text-blue-700",
  middle: "bg-yellow-100 text-yellow-700",
  strongMiddle: "bg-orange-100 text-orange-700",
  senior: "bg-red-100 text-red-700",
};

const GRADE_LABELS = {
  junior: "Junior",
  strongJunior: "Strong Junior",
  middle: "Middle",
  strongMiddle: "Strong Middle",
  senior: "Senior",
};

function getLessonsThisMonth(intern) {
  if (!Array.isArray(intern.lessonsVisited) || intern.lessonsVisited.length === 0) {
    return 0;
  }
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  return intern.lessonsVisited.reduce((total, lv) => {
    if (!lv.date) return total + (lv.count || 0);
    const d = new Date(lv.date);
    if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
      return total + (lv.count || 0);
    }
    return total;
  }, 0);
}

function getInitials(name, lastName) {
  return `${name?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();
}

function InternListCard({ intern }) {
  const isPlanBlocked = intern.isPlanBlocked;
  const branchName =
    intern.branches?.[0]?.branch?.name ||
    intern.branch?.name ||
    "—";
  const lessonsThisMonth = getLessonsThisMonth(intern);
  const gradeColor = GRADE_COLORS[intern.grade] || "bg-gray-100 text-gray-700";
  const gradeLabel = GRADE_LABELS[intern.grade] || intern.grade || "—";

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center gap-3">
      {/* Avatar */}
      <div className="flex-shrink-0 w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-red-400 to-orange-400 flex items-center justify-center">
        {intern.profilePhoto ? (
          <img
            src={intern.profilePhoto}
            alt={`${intern.name} ${intern.lastName}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-white font-bold text-sm">
            {getInitials(intern.name, intern.lastName)}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-gray-900 text-sm truncate">
            {intern.name} {intern.lastName}
          </span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${gradeColor}`}>
            {gradeLabel}
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-0.5 truncate">{branchName}</p>
        <p className="text-xs text-gray-400 mt-0.5">
          Уроков в этом месяце: <span className="font-medium text-gray-600">{lessonsThisMonth}</span>
        </p>
      </div>

      {/* Plan status */}
      <div className="flex-shrink-0 flex items-center gap-1">
        {isPlanBlocked ? (
          <span className="flex items-center gap-1 text-xs text-red-600 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />
            Блок
          </span>
        ) : (
          <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" />
            Активен
          </span>
        )}
      </div>
    </div>
  );
}

export default function InternsPage() {
  const user = useSelector((state) => state.auth.user);
  const [allInterns, setAllInterns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all"); // "all" | "blocked" | "active"

  useEffect(() => {
    let cancelled = false;
    async function fetchInterns() {
      setLoading(true);
      setError(null);
      try {
        const res = await api.getAllInterns();
        if (!res.ok) throw new Error("Ошибка загрузки стажёров");
        const data = await res.json();
        if (!cancelled) {
          setAllInterns(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchInterns();
    return () => { cancelled = true; };
  }, []);

  const myInterns = allInterns.filter((intern) => {
    if (!Array.isArray(intern.branches)) return false;
    return intern.branches.some((b) => {
      const mentorId = b.mentor?._id || b.mentor;
      return String(mentorId) === String(user?.id) || String(mentorId) === String(user?._id);
    });
  });

  const filtered = myInterns.filter((intern) => {
    const fullName = `${intern.name} ${intern.lastName}`.toLowerCase();
    const matchesSearch = !search || fullName.includes(search.toLowerCase());

    let matchesFilter = true;
    if (filter === "blocked") matchesFilter = intern.isPlanBlocked === true;
    if (filter === "active") matchesFilter = !intern.isPlanBlocked;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Header */}
      <div className="bg-white border-b px-4 py-4 sticky top-0 z-10">
        <h1 className="text-xl font-bold text-gray-900 mb-3">Мои стажёры</h1>

        {/* Search */}
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Поиск по имени..."
          className="w-full px-4 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent mb-3"
        />

        {/* Filter tabs */}
        <div className="flex gap-2">
          {[
            { key: "all", label: "Все" },
            { key: "blocked", label: "Заблокированы" },
            { key: "active", label: "Активные" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`flex-1 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                filter === tab.key
                  ? "bg-red-500 text-white shadow-sm"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-4 space-y-3">
        {loading && (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-red-400 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!loading && error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 text-sm text-red-700 text-center">
            {error}
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400 text-sm">
            {search || filter !== "all"
              ? "Стажёры не найдены"
              : "У вас пока нет стажёров"}
          </div>
        )}

        {!loading &&
          !error &&
          filtered.map((intern) => (
            <InternListCard key={intern._id} intern={intern} />
          ))}
      </div>
    </div>
  );
}
