import React, { useEffect, useState } from "react";
import { AlertTriangle, RefreshCw, Send } from "lucide-react";
import { toast } from "react-toastify";
import { api } from "../services/api";

const BranchManagerDashboard = () => {
  const [interns, setInterns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [complaints, setComplaints] = useState({});

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await api.getBranchManagerInterns();
      setInterns(data);
    } catch (error) {
      toast.error(error.message || "Ошибка загрузки данных");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSendComplaint = async (internId) => {
    const text = (complaints[internId] || "").trim();
    if (!text) {
      toast.error("Введите текст жалобы");
      return;
    }

    setSavingId(internId);
    try {
      await api.createComplaint(internId, text);
      setComplaints((prev) => ({ ...prev, [internId]: "" }));
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Стажёры филиала</h2>
        <button className="btn btn-outline btn-sm" onClick={loadData}>
          <RefreshCw className="w-4 h-4" /> Обновить
        </button>
      </div>

      {interns.length === 0 ? (
        <div className="alert">Нет стажёров в филиале</div>
      ) : (
        <div className="grid gap-4">
          {interns.map((intern) => (
            <div key={intern._id} className="card bg-white shadow border border-gray-200">
              <div className="card-body">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center">
                      {intern.profilePhoto ? (
                        <img
                          src={intern.profilePhoto}
                          alt={`${intern.name} ${intern.lastName}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="font-semibold text-gray-600">
                          {intern.name?.[0]}
                          {intern.lastName?.[0]}
                        </span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">
                        {intern.name} {intern.lastName}
                      </h3>
                      <p className="text-sm text-gray-600">
                        @{intern.username} • {intern.sphere || "—"}
                      </p>
                      <p className="text-xs text-gray-500">
                        Тел: {intern.phoneNumber || "—"} • TG: {intern.telegram || "—"}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className="badge badge-outline">{intern.grade}</span>
                    {intern.isPlanBlocked && (
                      <span className="badge badge-error gap-1">
                        <AlertTriangle className="w-3 h-3" /> Заблокирован
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Последние уроки</h4>
                  <div className="text-sm text-gray-700 space-y-1">
                    {(intern.lastLessons || []).length === 0 && <p>Уроков пока нет</p>}
                    {(intern.lastLessons || []).map((lesson) => (
                      <p key={lesson._id}>
                        {new Date(lesson.date).toLocaleDateString("ru-RU")} • {lesson.topic} •{" "}
                        {lesson.mentor?.name} {lesson.mentor?.lastName || ""}
                      </p>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-2">
                  <textarea
                    className="textarea textarea-bordered w-full"
                    placeholder="Текст жалобы по стажёру"
                    value={complaints[intern._id] || ""}
                    onChange={(e) =>
                      setComplaints((prev) => ({ ...prev, [intern._id]: e.target.value }))
                    }
                  />
                  <button
                    className="btn btn-warning md:self-end"
                    onClick={() => handleSendComplaint(intern._id)}
                    disabled={savingId === intern._id}
                  >
                    <Send className="w-4 h-4" />
                    Отправить жалобу
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BranchManagerDashboard;
