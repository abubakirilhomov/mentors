import React, { useEffect, useState } from "react";
import { Bell, BellOff } from "lucide-react";
import { api } from "../services/api";

const notificationsSupported = typeof Notification !== "undefined";

const PushManager = ({ userId }) => {
    const [permission, setPermission] = useState(
        notificationsSupported ? Notification.permission : "denied"
    );
    const [isSubscribed, setIsSubscribed] = useState(false);

    useEffect(() => {
        // Check if subscription exists in SW
        if ("serviceWorker" in navigator) {
            navigator.serviceWorker.ready.then((reg) => {
                reg.pushManager.getSubscription().then((sub) => {
                    if (sub) setIsSubscribed(true);
                });
            });
        }
    }, []);

    if (!notificationsSupported) return null;

    const subscribe = async () => {
        try {
            const perm = await Notification.requestPermission();
            setPermission(perm);

            if (perm === "granted") {
                const reg = await navigator.serviceWorker.ready;
                const sub = await reg.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: import.meta.env.VITE_VAPID_PUBLIC_KEY,
                });

                await api.subscribeToPush(userId, sub);
                setIsSubscribed(true);
            }
        } catch (err) {
            console.error("Push Error:", err);
        }
    };

    if (permission === "granted" && isSubscribed) return null; // All good

    if (permission === "denied") {
        return (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-xl flex items-center gap-3 text-sm text-yellow-800">
                <BellOff className="w-5 h-5 text-yellow-600" />
                <div>
                    <p className="font-semibold">Уведомления выключены</p>
                    <p className="text-xs opacity-90">Включите их в настройках браузера, чтобы не пропускать уведомления об уроках.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Bell className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                    <p className="font-semibold text-blue-900">Включить уведомления</p>
                    <p className="text-xs text-blue-700">Получайте напоминания о фидбэках и уроках</p>
                </div>
            </div>
            <button
                onClick={subscribe}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
                Включить
            </button>
        </div>
    );
};

export default PushManager;
