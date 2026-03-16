import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  MessageCircle,
  Phone,
  RefreshCw,
  Send,
  Search,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  ChevronDown,
  X,
} from "lucide-react";
import { toast } from "react-toastify";
import { api } from "../services/api";

const normalizeTelegramLink = (handle = "") => {
  const normalized = String(handle).replace(/^@/, "").trim();
  if (!normalized) return "";
  return `https://t.me/${normalized}`;
};

const CATEGORY_META = {
  green:  { label: "Зелёные",  bg: "bg-green-50",  border: "border-green-200",  text: "text-green-700",  dot: "bg-green-500",  activeBg: "bg-green-100",  activeBorder: "border-green-400" },
  yellow: { label: "Жёлтые",  bg: "bg-yellow-50", border: "border-yellow-200", text: "text-yellow-700", dot: "bg-yellow-400", activeBg: "bg-yellow-100", activeBorder: "border-yellow-400" },
  red:    { label: "Красные",  bg: "bg-red-50",    border: "border-red-200",    text: "text-red-700",    dot: "bg-red-500",    activeBg: "bg-red-100",    activeBorder: "border-red-500" },
  black:  { label: "Чёрные",  bg: "bg-gray-100",  border: "border-gray-300",  text: "text-gray-800",  dot: "bg-gray-700",  activeBg: "bg-gray-200",  activeBorder: "border-gray-600" },
};

const StatPill = ({ icon: Icon, label, value, color }) => (
  <div className={`flex items-center gap-3 bg-white rounded-2xl px-4 py-3 shadow-sm border border-slate-100 flex-1 min-w-[120px]`}>
    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
      <Icon className="w-4 h-4 text-white" />
    </div>
    <div>
      <p className="text-xl font-bold text-slate-900 leading-none">{value}</p>
      <p className="text-xs text-slate-500 mt-0.5">{label}</p>
    </div>
  </div>
);

const Avatar = ({ intern, size = "md" }) => {
  const dim = size === "lg" ? "w-14 h-14 text-lg" : "w-10 h-10 text-sm";
  return (
    <div className={`${dim} rounded-full overflow-hidden bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center font-bold text-slate-600 shrink-0`}>
      {intern.profilePhoto ? (
        <img src={intern.profilePhoto} alt={`${intern.name} ${intern.lastName}`} className="w-full h-full object-cover" />
      ) : (
        <span>{intern.name?.[0]}{intern.lastName?.[0]}</span>
      )}
    </div>
  );
};

const InternCard = ({ intern, onComplaint }) => {
  const tgLink = normalizeTelegramLink(intern.telegram);
  const hasPhone = Boolean(intern.phoneNumber && intern.phoneNumber !== "—");
  const isBlocked = intern.isPlanBlocked;
  const isManual = intern.manualActivation?.isEnabled;

  return (
    <div className={`bg-white rounded-2xl border shadow-sm flex flex-col transition-shadow hover:shadow-md ${isBlocked ? "border-red-200" : "border-slate-100"}`}>
      {/* Card header */}
      <div className="p-4 flex items-start gap-3">
        <Avatar intern={intern} />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-900 truncate">
            {intern.name} {intern.lastName}
          </p>
          <p className="text-sm text-slate-500 truncate">@{intern.username}</p>
          <p className="text-xs text-slate-400 mt-0.5 truncate">
            {intern.sphere || "—"} · {intern.grade || "—"}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          {isBlocked ? (
            <span className="flex items-center gap-1 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-full px-2 py-0.5">
              <XCircle className="w-3 h-3" /> Заблокирован
            </span>
          ) : (
            <span className="flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 border border-green-200 rounded-full px-2 py-0.5">
              <CheckCircle className="w-3 h-3" /> Активен
            </span>
          )}
          {isManual && (
            <span className="text-xs font-medium text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">
              Ручная активация
            </span>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-slate-100 mx-4" />

      {/* Last lessons */}
      <div className="px-4 py-3 flex-1">
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">Последние уроки</p>
        {(intern.lastLessons || []).length === 0 ? (
          <p className="text-sm text-slate-400 italic">Уроков пока нет</p>
        ) : (
          <ul className="space-y-1">
            {(intern.lastLessons || []).slice(0, 2).map((lesson) => (
              <li key={lesson._id} className="flex items-start gap-2 text-sm text-slate-700">
                <Clock className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                <span>
                  <span className="text-slate-500">{new Date(lesson.date).toLocaleDateString("ru-RU")}</span>
                  {" · "}
                  <span className="truncate">{lesson.topic}</span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Actions */}
      <div className="px-4 pb-4 flex gap-2">
        <a
          href={hasPhone ? `tel:${intern.phoneNumber}` : undefined}
          className={`flex-1 flex items-center justify-center gap-1.5 text-sm font-medium rounded-xl py-2 transition-colors ${
            hasPhone
              ? "bg-green-50 text-green-700 hover:bg-green-100 border border-green-200"
              : "bg-slate-50 text-slate-400 border border-slate-200 cursor-not-allowed"
          }`}
        >
          <Phone className="w-3.5 h-3.5" /> Звонок
        </a>
        <a
          href={tgLink || undefined}
          target="_blank"
          rel="noreferrer"
          className={`flex-1 flex items-center justify-center gap-1.5 text-sm font-medium rounded-xl py-2 transition-colors ${
            tgLink
              ? "bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200"
              : "bg-slate-50 text-slate-400 border border-slate-200 cursor-not-allowed"
          }`}
        >
          <MessageCircle className="w-3.5 h-3.5" /> Telegram
        </a>
        <button
          onClick={() => onComplaint(intern)}
          className="flex items-center justify-center gap-1.5 text-sm font-medium rounded-xl py-2 px-3 bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 transition-colors"
        >
          <AlertTriangle className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

const ComplaintModal = ({ intern, rules, draft, onToggleRule, onTextChange, onSend, onClose, isSaving }) => {
  const groupedRules = useMemo(() => {
    const groups = { green: [], yellow: [], red: [], black: [] };
    rules.forEach((rule) => {
      if (groups[rule.category]) groups[rule.category].push(rule);
    });
    return groups;
  }, [rules]);

  const selectedCount = draft.ruleIds.length;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <div
        className="bg-white w-full sm:rounded-2xl sm:max-w-2xl max-h-[92vh] flex flex-col rounded-t-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <Avatar intern={intern} size="lg" />
            <div>
              <p className="text-xs text-slate-500 font-medium">Жалоба на стажёра</p>
              <h3 className="text-lg font-bold text-slate-900">
                {intern.name} {intern.lastName}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">
          {Object.entries(groupedRules).map(([category, categoryRules]) => {
            if (categoryRules.length === 0) return null;
            const meta = CATEGORY_META[category];
            return (
              <div key={category}>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`w-2 h-2 rounded-full ${meta.dot}`} />
                  <p className={`text-xs font-semibold uppercase tracking-wide ${meta.text}`}>{meta.label}</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {categoryRules.map((rule) => {
                    const checked = draft.ruleIds.includes(rule._id);
                    return (
                      <label
                        key={rule._id}
                        className={`flex items-start gap-2.5 rounded-xl p-3 cursor-pointer border transition-all ${
                          checked
                            ? `${meta.activeBg} ${meta.activeBorder}`
                            : `${meta.bg} ${meta.border} hover:brightness-95`
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => onToggleRule(rule._id)}
                          className="mt-0.5 w-4 h-4 rounded accent-red-500 shrink-0"
                        />
                        <span className="text-sm text-slate-800 leading-snug">{rule.title}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })}

          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Комментарий</p>
            <textarea
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-400 resize-none"
              rows={3}
              placeholder="Опишите ситуацию (необязательно)"
              value={draft.text}
              onChange={(e) => onTextChange(e.target.value)}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-between gap-3">
          <div className="text-sm text-slate-500">
            {selectedCount > 0 ? (
              <span className="text-red-600 font-medium">Выбрано правил: {selectedCount}</span>
            ) : (
              <span>Выберите правила или напишите комментарий</span>
            )}
          </div>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
              Отмена
            </button>
            <button
              onClick={onSend}
              disabled={isSaving || (selectedCount === 0 && !draft.text.trim())}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Отправить
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const FILTERS = [
  { key: "all", label: "Все" },
  { key: "active", label: "Активные" },
  { key: "blocked", label: "Заблокированные" },
];

const BranchManagerDashboard = () => {
  const [interns, setInterns] = useState([]);
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [drafts, setDrafts] = useState({});
  const [selectedIntern, setSelectedIntern] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const loadData = async () => {
    setLoading(true);
    try {
      const [internsData, rulesData] = await Promise.all([
        api.getBranchManagerInterns(),
        api.getRules(),
      ]);
      setInterns(internsData);
      setRules(rulesData);
    } catch (error) {
      toast.error(error.message || "Ошибка загрузки данных");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const stats = useMemo(() => ({
    total: interns.length,
    active: interns.filter((i) => !i.isPlanBlocked).length,
    blocked: interns.filter((i) => i.isPlanBlocked).length,
    manual: interns.filter((i) => i.manualActivation?.isEnabled).length,
  }), [interns]);

  const filteredInterns = useMemo(() => {
    const q = search.trim().toLowerCase();
    return interns
      .filter((intern) => {
        if (filter === "active") return !intern.isPlanBlocked;
        if (filter === "blocked") return intern.isPlanBlocked;
        return true;
      })
      .filter((intern) => {
        if (!q) return true;
        return `${intern.name} ${intern.lastName} ${intern.username} ${intern.phoneNumber || ""} ${intern.telegram || ""}`
          .toLowerCase()
          .includes(q);
      });
  }, [interns, search, filter]);

  const getDraft = (internId) => drafts[internId] || { text: "", ruleIds: [] };

  const toggleRule = (internId, ruleId) => {
    setDrafts((prev) => {
      const current = prev[internId] || { text: "", ruleIds: [] };
      const isSelected = current.ruleIds.includes(ruleId);
      return {
        ...prev,
        [internId]: {
          ...current,
          ruleIds: isSelected ? current.ruleIds.filter((id) => id !== ruleId) : [...current.ruleIds, ruleId],
        },
      };
    });
  };

  const updateText = (internId, text) => {
    setDrafts((prev) => ({
      ...prev,
      [internId]: { text, ruleIds: prev[internId]?.ruleIds || [] },
    }));
  };

  const handleSendComplaint = async (internId) => {
    const draft = getDraft(internId);
    const cleanText = (draft.text || "").trim();
    if (!cleanText && draft.ruleIds.length === 0) {
      toast.error("Выберите правило или напишите комментарий");
      return;
    }

    setSavingId(internId);
    try {
      await api.createComplaint(internId, { text: cleanText, ruleIds: draft.ruleIds });
      setDrafts((prev) => ({ ...prev, [internId]: { text: "", ruleIds: [] } }));
      setSelectedIntern(null);
      toast.success("Жалоба отправлена");
      await loadData();
    } catch (error) {
      toast.error(error.message || "Ошибка отправки жалобы");
    } finally {
      setSavingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 text-slate-400">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-red-500 rounded-full animate-spin" />
        <p className="text-sm">Загрузка данных...</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Stats row */}
      <div className="flex flex-wrap gap-3">
        <StatPill icon={Users} label="Всего стажёров" value={stats.total} color="bg-slate-500" />
        <StatPill icon={CheckCircle} label="Активных" value={stats.active} color="bg-green-500" />
        <StatPill icon={XCircle} label="Заблокированных" value={stats.blocked} color="bg-red-500" />
        {stats.manual > 0 && (
          <StatPill icon={Clock} label="Ручная активация" value={stats.manual} color="bg-amber-500" />
        )}
      </div>

      {/* Search & filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-400 shadow-sm"
            placeholder="Поиск по имени, username, телефону..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                filter === f.key
                  ? "bg-red-500 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <button
          onClick={loadData}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 shadow-sm transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          <span className="hidden sm:inline">Обновить</span>
        </button>
      </div>

      {/* Results count */}
      <p className="text-sm text-slate-500">
        {filteredInterns.length === 0
          ? "Нет стажёров"
          : `Показано: ${filteredInterns.length} из ${interns.length}`}
      </p>

      {/* Grid */}
      {filteredInterns.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
          <Users className="w-12 h-12 mb-3 opacity-30" />
          <p className="text-lg font-medium text-slate-500">Стажёры не найдены</p>
          <p className="text-sm mt-1">Попробуйте изменить фильтр или поисковый запрос</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredInterns.map((intern) => (
            <InternCard key={intern._id} intern={intern} onComplaint={setSelectedIntern} />
          ))}
        </div>
      )}

      {/* Complaint modal */}
      {selectedIntern && (
        <ComplaintModal
          intern={selectedIntern}
          rules={rules}
          draft={getDraft(selectedIntern._id)}
          onToggleRule={(ruleId) => toggleRule(selectedIntern._id, ruleId)}
          onTextChange={(text) => updateText(selectedIntern._id, text)}
          onSend={() => handleSendComplaint(selectedIntern._id)}
          onClose={() => setSelectedIntern(null)}
          isSaving={savingId === selectedIntern._id}
        />
      )}
    </div>
  );
};

export default BranchManagerDashboard;
