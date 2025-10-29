/// <reference lib="webworker" />
import { precacheAndRoute } from 'workbox-precaching';

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
      icon: "/icon.png",
      badge: "/icon.png",
      requireInteraction: true,
    })
  );
});

// 🔗 Клик по уведомлению
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow("/dashboard")
  );
});
