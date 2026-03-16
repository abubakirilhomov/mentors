import React, { useEffect, useMemo, useState } from "react";
import { AlertTriangle, MessageCircle, Phone, RefreshCw, Send } from "lucide-react";
import { toast } from "react-toastify";
import { api } from "../services/api";

const normalizeTelegramLink = (handle = "") => {
  const normalized = String(handle).replace(/^@/, "").trim();
  if (!normalized) return "";
  return `https://t.me/${normalized}`;
};

const BranchManagerDashboard = () => {
  const [interns, setInterns] = useState([]);
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [drafts, setDrafts] = useState({});
  const [selectedIntern, setSelectedIntern] = useState(null);
  const [search, setSearch] = useState("");

  const groupedRules = useMemo(() => {
    const groups = { green: [], yellow: [], red: [], black: [] };
    rules.forEach((rule) => {
      if (groups[rule.category]) groups[rule.category].push(rule);
    });
    return groups;
  }, [rules]);

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

  const filteredInterns = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return interns;
    return interns.filter((intern) =>
      `${intern.name} ${intern.lastName} ${intern.username} ${intern.phoneNumber || ""} ${
        intern.telegram || ""
      }`
        .toLowerCase()
        .includes(q)
    );
  }, [interns, search]);

  const toggleRule = (internId, ruleId) => {
    setDrafts((prev) => {
      const current = prev[internId] || { text: "", ruleIds: [] };
      const isSelected = current.ruleIds.includes(ruleId);
      return {
        ...prev,
        [internId]: {
          ...current,
          ruleIds: isSelected
            ? current.ruleIds.filter((id) => id !== ruleId)
            : [...current.ruleIds, ruleId],
        },
      };
    });
  };

  const updateText = (internId, text) => {
    setDrafts((prev) => ({
      ...prev,
      [internId]: {
        text,
        ruleIds: prev[internId]?.ruleIds || [],
      },
    }));
  };

  const handleSendComplaint = async (internId) => {
    const draft = drafts[internId] || { text: "", ruleIds: [] };
    const cleanText = (draft.text || "").trim();
    if (!cleanText && draft.ruleIds.length === 0) {
      toast.error("Выберите правило или напишите комментарий");
      return;
    }

    setSavingId(internId);
    try {
      await api.createComplaint(internId, {
        text: cleanText,
        ruleIds: draft.ruleIds,
      });
      setDrafts((prev) => ({ ...prev, [internId]: { text: "", ruleIds: [] } }));
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
      <div className="min-h-[40vh] flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Стажёры филиала</h2>
            <p className="text-slate-500 text-sm mt-1">Список, контакты и отправка жалоб</p>
          </div>
          <div className="flex gap-2">
            <input
              className="input input-bordered w-72"
              placeholder="Поиск: ФИО, username, телефон"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button className="btn btn-outline btn-sm" onClick={loadData}>
              <RefreshCw className="w-4 h-4" />
              Обновить
            </button>
          </div>
        </div>
      </div>

      {filteredInterns.length === 0 ? (
        <div className="alert">Нет стажёров в филиале</div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="grid grid-cols-12 gap-2 px-4 py-3 bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase">
            <div className="col-span-4">Стажёр</div>
            <div className="col-span-2">Контакты</div>
            <div className="col-span-2">Статус</div>
            <div className="col-span-3">Последние уроки</div>
            <div className="col-span-1 text-right">Действия</div>
          </div>
          {filteredInterns.map((intern) => {
            const tgLink = normalizeTelegramLink(intern.telegram);
            const hasPhone = Boolean(intern.phoneNumber && intern.phoneNumber !== "—");

            return (
              <div
                key={intern._id}
                className="grid grid-cols-12 gap-2 px-4 py-4 border-b border-slate-100 items-start"
              >
                <div className="col-span-4 flex gap-3">
                  <div className="w-11 h-11 rounded-full overflow-hidden bg-slate-100 flex items-center justify-center font-bold text-slate-600 shrink-0">
                    {intern.profilePhoto ? (
                      <img
                        src={intern.profilePhoto}
                        alt={`${intern.name} ${intern.lastName}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <>
                        {intern.name?.[0]}
                        {intern.lastName?.[0]}
                      </>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">
                      {intern.name} {intern.lastName}
                    </p>
                    <p className="text-sm text-slate-600">@{intern.username}</p>
                    <p className="text-xs text-slate-500">{intern.sphere || "—"} • {intern.grade}</p>
                  </div>
                </div>

                <div className="col-span-2 space-y-2">
                  <a
                    href={hasPhone ? `tel:${intern.phoneNumber}` : "#"}
                    className={`btn btn-xs w-full ${hasPhone ? "btn-success" : "btn-disabled"}`}
                  >
                    <Phone className="w-3 h-3" /> Позвонить
                  </a>
                  <a
                    href={tgLink || "#"}
                    target="_blank"
                    rel="noreferrer"
                    className={`btn btn-xs w-full ${tgLink ? "btn-info" : "btn-disabled"}`}
                  >
                    <MessageCircle className="w-3 h-3" /> Telegram
                  </a>
                </div>

                <div className="col-span-2 pt-1">
                  {intern.isPlanBlocked ? (
                    <span className="badge badge-error gap-1">
                      <AlertTriangle className="w-3 h-3" /> Заблокирован
                    </span>
                  ) : (
                    <span className="badge badge-success">Активен</span>
                  )}
                  {intern.manualActivation?.isEnabled && (
                    <div className="mt-2">
                      <span className="badge badge-warning">Ручная активация</span>
                    </div>
                  )}
                </div>

                <div className="col-span-3 text-sm text-slate-700">
                  {(intern.lastLessons || []).length === 0 && <p className="text-slate-400">Уроков пока нет</p>}
                  {(intern.lastLessons || []).slice(0, 2).map((lesson) => (
                    <p key={lesson._id} className="leading-5">
                      {new Date(lesson.date).toLocaleDateString("ru-RU")} • {lesson.topic}
                    </p>
                  ))}
                </div>

                <div className="col-span-1 flex justify-end">
                  <button className="btn btn-error btn-sm" onClick={() => setSelectedIntern(intern)}>
                    Жалоба
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedIntern && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">
                Жалоба: {selectedIntern.name} {selectedIntern.lastName}
              </h3>
              <button className="btn btn-sm btn-ghost" onClick={() => setSelectedIntern(null)}>
                ✕
              </button>
            </div>

            <div className="space-y-3">
              {Object.entries(groupedRules).map(([category, categoryRules]) => (
                <div key={category}>
                  <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">{category}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {categoryRules.map((rule) => {
                      const draft = drafts[selectedIntern._id] || { text: "", ruleIds: [] };
                      const checked = draft.ruleIds.includes(rule._id);
                      return (
                        <label
                          key={rule._id}
                          className={`flex items-start gap-2 border rounded-lg p-2 cursor-pointer ${
                            checked ? "border-slate-700 bg-slate-50" : "border-slate-200"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleRule(selectedIntern._id, rule._id)}
                            className="checkbox checkbox-sm mt-0.5"
                          />
                          <span className="text-sm">{rule.title}</span>
                        </label>
                      );
                    })}
                    {categoryRules.length === 0 && (
                      <p className="text-sm text-slate-400">Нет правил в этой категории</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <textarea
              className="textarea textarea-bordered w-full mt-4"
              placeholder="Комментарий к жалобе (необязательно)"
              value={(drafts[selectedIntern._id] || { text: "" }).text}
              onChange={(e) => updateText(selectedIntern._id, e.target.value)}
            />

            <div className="flex justify-end gap-2 mt-4">
              <button className="btn btn-ghost" onClick={() => setSelectedIntern(null)}>
                Отмена
              </button>
              <button
                className="btn btn-error"
                onClick={async () => {
                  await handleSendComplaint(selectedIntern._id);
                  setSelectedIntern(null);
                }}
                disabled={savingId === selectedIntern._id}
              >
                <Send className="w-4 h-4" />
                Отправить жалобу
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BranchManagerDashboard;
