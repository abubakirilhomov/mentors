import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Phone,
  RefreshCw,
  Send,
  MessageCircle,
  ShieldAlert,
} from "lucide-react";
import { toast } from "react-toastify";
import { api } from "../services/api";

const CATEGORY_STYLES = {
  green: "bg-emerald-100 text-emerald-800 border-emerald-300",
  yellow: "bg-amber-100 text-amber-800 border-amber-300",
  red: "bg-rose-100 text-rose-800 border-rose-300",
  black: "bg-slate-900 text-white border-slate-900",
};

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
      <div className="rounded-3xl bg-gradient-to-r from-orange-500 to-red-600 text-white px-6 py-5 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Стажёры филиала</h2>
            <p className="text-white/90 text-sm mt-1">
              Быстрая связь и жалобы по цветовым правилам
            </p>
          </div>
          <button className="btn btn-sm border-0 bg-white text-red-600 hover:bg-white/90" onClick={loadData}>
            <RefreshCw className="w-4 h-4" />
            Обновить
          </button>
        </div>
      </div>

      {interns.length === 0 ? (
        <div className="alert">Нет стажёров в филиале</div>
      ) : (
        <div className="grid gap-5">
          {interns.map((intern) => {
            const draft = drafts[intern._id] || { text: "", ruleIds: [] };
            const tgLink = normalizeTelegramLink(intern.telegram);
            const hasPhone = Boolean(intern.phoneNumber && intern.phoneNumber !== "—");

            return (
              <div
                key={intern._id}
                className="rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="p-5 space-y-4">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full overflow-hidden bg-slate-100 flex items-center justify-center font-bold text-slate-600">
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
                        <h3 className="text-xl font-semibold text-slate-900">
                          {intern.name} {intern.lastName}
                        </h3>
                        <p className="text-sm text-slate-600">
                          @{intern.username} • {intern.sphere || "—"} • {intern.grade}
                        </p>
                        <div className="mt-2 flex gap-2 flex-wrap">
                          <a
                            href={hasPhone ? `tel:${intern.phoneNumber}` : "#"}
                            className={`btn btn-sm ${hasPhone ? "btn-success" : "btn-disabled"}`}
                          >
                            <Phone className="w-4 h-4" />
                            Позвонить
                          </a>
                          <a
                            href={tgLink || "#"}
                            target="_blank"
                            rel="noreferrer"
                            className={`btn btn-sm ${tgLink ? "btn-info" : "btn-disabled"}`}
                          >
                            <MessageCircle className="w-4 h-4" />
                            Telegram
                          </a>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {intern.isPlanBlocked ? (
                        <span className="badge badge-error gap-1">
                          <AlertTriangle className="w-3 h-3" /> Заблокирован
                        </span>
                      ) : (
                        <span className="badge badge-success">Активен</span>
                      )}
                      {intern.manualActivation?.isEnabled && (
                        <span className="badge badge-warning">Ручная активация</span>
                      )}
                    </div>
                  </div>

                  <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
                    <h4 className="text-sm font-semibold text-slate-700 mb-2">Последние уроки</h4>
                    <div className="text-sm text-slate-700 space-y-1">
                      {(intern.lastLessons || []).length === 0 && <p>Уроков пока нет</p>}
                      {(intern.lastLessons || []).map((lesson) => (
                        <p key={lesson._id}>
                          {new Date(lesson.date).toLocaleDateString("ru-RU")} • {lesson.topic} •{" "}
                          {lesson.mentor?.name} {lesson.mentor?.lastName || ""}
                        </p>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-xl border border-red-200 bg-red-50/60 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <ShieldAlert className="w-4 h-4 text-red-600" />
                      <h4 className="font-semibold text-red-700">Жалоба по правилам</h4>
                    </div>

                    <div className="space-y-3">
                      {Object.entries(groupedRules).map(([category, categoryRules]) => (
                        <div key={category}>
                          <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">
                            {category}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {categoryRules.map((rule) => {
                              const selected = draft.ruleIds.includes(rule._id);
                              return (
                                <button
                                  key={rule._id}
                                  type="button"
                                  onClick={() => toggleRule(intern._id, rule._id)}
                                  className={`px-3 py-1 rounded-full border text-xs ${
                                    CATEGORY_STYLES[category]
                                  } ${selected ? "ring-2 ring-offset-1 ring-slate-400" : "opacity-85"}`}
                                  title={rule.title}
                                >
                                  {rule.title}
                                </button>
                              );
                            })}
                            {categoryRules.length === 0 && (
                              <span className="text-xs text-slate-400">Нет правил</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    <textarea
                      className="textarea textarea-bordered w-full mt-3"
                      placeholder="Комментарий к жалобе (необязательно)"
                      value={draft.text}
                      onChange={(e) => updateText(intern._id, e.target.value)}
                    />

                    <button
                      className="btn btn-error mt-3"
                      onClick={() => handleSendComplaint(intern._id)}
                      disabled={savingId === intern._id}
                    >
                      <Send className="w-4 h-4" />
                      Отправить жалобу
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BranchManagerDashboard;
