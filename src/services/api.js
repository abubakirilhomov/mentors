import { secureFetch } from "../utils/secureFetch";

const API_URL = import.meta.env.VITE_API_URL;

export const api = {
    // --- Auth ---
    login: async (name, password) => {
        const res = await fetch(`${API_URL}/api/mentors/login`, {
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
        const res = await secureFetch(`${API_URL}/api/lessons/pending`);
        if (!res.ok) throw new Error("Ошибка загрузки стажёров");
        return res.json();
    },
    getBranchManagerInterns: async () => {
        const res = await secureFetch(`${API_URL}/api/interns/branch-manager/interns`);
        if (!res.ok) throw new Error("Ошибка загрузки стажёров филиала");
        return res.json();
    },
    createComplaint: async (internId, text) => {
        const res = await secureFetch(`${API_URL}/api/interns/${internId}/complaints`, {
            method: "POST",
            body: JSON.stringify({ text }),
        });
        if (!res.ok) throw new Error("Ошибка при отправке жалобы");
        return res.json();
    },

    rateIntern: async (internId, data) => {
        const res = await secureFetch(`${API_URL}/api/interns/${internId}/rate`, {
            method: "POST",
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error("Ошибка при оценке");
        return res.json();
    },

    // --- Mentor Stats ---
    getStats: async (mentorId) => {
        const res = await secureFetch(`${API_URL}/api/mentors/${mentorId}/stats`);
        if (!res.ok) throw new Error("Ошибка загрузки статистики");
        const json = await res.json();
        return json.data; // { monthLessons, monthFeedbacks, totalDebt, debtDetails }
    },

    // --- Rules ---
    getRules: async () => {
        const res = await secureFetch(`${API_URL}/api/rules`);
        if (!res.ok) throw new Error("Ошибка загрузки правил");
        const json = await res.json();
        return json.data || [];
    },

    // --- Notifications ---
    subscribeToPush: async (userId, subscription) => {
        return secureFetch(`${API_URL}/api/notifications/subscribe`, {
            method: "POST",
            body: JSON.stringify({
                subscription,
                userId,
                userType: "mentor",
            }),
        });
    },
};
