import { secureFetch } from "../utils/secureFetch";

const API_URL = import.meta.env.VITE_API_URL;

export const api = {
    // --- Auth ---
    login: async (name, password) => {
        const res = await fetch(`${API_URL}/mentors/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, password }),
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.message || "Ошибка входа");
        }
        return res.json();
    },

    // --- Lessons / Interns ---
    getPendingInterns: async () => {
        const res = await secureFetch(`${API_URL}/lessons/pending`);
        if (!res.ok) throw new Error("Ошибка загрузки стажёров");
        return res.json();
    },
    getBranchManagerInterns: async () => {
        const res = await secureFetch(`${API_URL}/interns/branch-manager/interns`);
        if (!res.ok) throw new Error("Ошибка загрузки стажёров филиала");
        return res.json();
    },
    createComplaint: async (internId, payload) => {
        const res = await secureFetch(`${API_URL}/interns/${internId}/complaints`, {
            method: "POST",
            body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Ошибка при отправке жалобы");
        return res.json();
    },

    rateIntern: async (internId, data) => {
        const res = await secureFetch(`${API_URL}/interns/${internId}/rate`, {
            method: "POST",
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error("Ошибка при оценке");
        return res.json();
    },

    getAllInterns: async () => {
        return secureFetch(`${API_URL}/interns`);
    },

    // --- Location ---
    getMyInternsLocations: async () => {
        const res = await secureFetch(`${API_URL}/locations/my-interns`);
        if (!res.ok) throw new Error("Ошибка загрузки геопозиций");
        const json = await res.json();
        return json.data || [];
    },

    // --- Mentor Stats ---
    getStats: async (mentorId) => {
        const res = await secureFetch(`${API_URL}/mentors/${mentorId}/stats`);
        if (!res.ok) throw new Error("Ошибка загрузки статистики");
        const json = await res.json();
        return json.data; // { monthLessons, monthFeedbacks, totalDebt, debtDetails }
    },

    getLessons: async (params = {}) => {
        const q = new URLSearchParams();
        if (params.status) q.set("status", params.status);
        if (params.startDate) q.set("startDate", params.startDate);
        if (params.endDate) q.set("endDate", params.endDate);
        return secureFetch(`${API_URL}/lessons?${q.toString()}`);
    },

    // --- Rules ---
    getRules: async () => {
        const res = await secureFetch(`${API_URL}/rules?limit=1000`);
        if (!res.ok) throw new Error("Ошибка загрузки правил");
        const json = await res.json();
        return json.data || [];
    },

    // --- Notifications ---
    subscribeToPush: async (userId, subscription) => {
        return secureFetch(`${API_URL}/notifications/subscribe`, {
            method: "POST",
            body: JSON.stringify({
                subscription,
                userId,
                userType: "mentor",
            }),
        });
    },
};
