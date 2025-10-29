self.addEventListener("push", (event) => {
  let data = {};

  try {
    // Пробуем распарсить JSON (если это push от сервера)
    data = event.data.json();
  } catch (err) {
    // Если это просто текст (например, при тесте через DevTools)
    data = {
      title: "🔔 Push-тест",
      body: event.data.text() || "Test push message",
    };
  }

  console.log("📩 Push получен:", data);

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "https://cdn-icons-png.flaticon.com/512/190/190411.png",
      requireInteraction: true,
      badge: "https://cdn-icons-png.flaticon.com/512/190/190411.png",
      vibrate: [100, 50, 100],
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow("/"));
});
