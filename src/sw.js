/// <reference lib="webworker" />
import { precacheAndRoute } from "workbox-precaching";

// Workbox кэширование
precacheAndRoute(self.__WB_MANIFEST || []);

// 🔔 Обработка push-уведомлений
self.addEventListener("push", (event) => {
  let data = {};

  try {
    data = event.data.json();
  } catch {
    data = { title: "🔔 Push-тест", body: event.data.text() };
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "https://cdn-icons-png.flaticon.com/512/190/190411.png", // ✅ иконка обязательна в некоторых ОС
      badge: "https://cdn-icons-png.flaticon.com/512/190/190411.png",
      requireInteraction: true,
      vibrate: [100, 50, 100],
    })
  );
});

// 🔗 Клик по уведомлению
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow("/dashboard"));
});

self.addEventListener("pushsubscriptionchange", async (event) => {
  const applicationServerKey = urlBase64ToUint8Array(
    import.meta.env.VITE_VAPID_PUBLIC_KEY // твой VAPID public key
  );

  const newSubscription = await self.registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey,
  });

  // Отправляем новую подписку на сервер
  await fetch("https://mentor-server.onrender.com/api/notifications/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      subscription: newSubscription,
      userType: "mentor",
    }),
  });
});

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

