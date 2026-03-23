export async function registerPush(user) {
  if (!("serviceWorker" in navigator) || typeof Notification === "undefined") {
    console.warn("❌ Push-уведомления не поддерживаются в этом браузере");
    return;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.warn("🔕 Пользователь не разрешил уведомления");
      return;
    }

    const publicVapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
    const API_URL = import.meta.env.VITE_API_URL;

    const reg = await navigator.serviceWorker.register("/sw.js");
    await navigator.serviceWorker.ready;

    const subscription = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
    });

    const res = await fetch(`${API_URL}/notifications/subscribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subscription,
        userId: user._id,
        userType: user.role || "mentor",
      }),
    });

    if (res.ok) console.log("✅ Подписка ментора сохранена на сервере");
    else console.error("❌ Не удалось сохранить подписку:", await res.text());
  } catch (err) {
    console.error("Ошибка при регистрации push:", err);
  }
}

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i)
    outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}
