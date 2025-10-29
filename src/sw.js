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

  console.log("📩 Push получен:", data);

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
