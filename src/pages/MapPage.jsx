import { useState, useEffect, useRef, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { secureFetch } from "../utils/secureFetch";
import { RefreshCw, MapPin, Users } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

const GRADE_COLORS = {
  junior: "#16a34a",
  strongJunior: "#2563eb",
  middle: "#ca8a04",
  strongMiddle: "#ea580c",
  senior: "#dc2626",
};

const GRADE_LABELS = {
  junior: "Junior",
  strongJunior: "Strong Junior",
  middle: "Middle",
  strongMiddle: "Strong Middle",
  senior: "Senior",
};

const GRADE_BG = {
  junior: "bg-green-100 text-green-700",
  strongJunior: "bg-blue-100 text-blue-700",
  middle: "bg-yellow-100 text-yellow-700",
  strongMiddle: "bg-orange-100 text-orange-700",
  senior: "bg-red-100 text-red-700",
};

const branchIcon = L.divIcon({
  html: `
    <div style="
      width:36px;height:36px;border-radius:50%;
      background:#1e3a8a;border:3px solid white;
      box-shadow:0 2px 8px rgba(0,0,0,0.4);
      display:flex;align-items:center;justify-content:center;
      font-size:18px;
    ">🏢</div>
  `,
  className: '',
  iconSize: [36, 36],
  iconAnchor: [18, 18],
  popupAnchor: [0, -20],
});

function createMarkerIcon(color, photoUrl, name) {
  const initials = name
    ? name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  const inner = photoUrl
    ? `<img src="${photoUrl}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" />`
    : `<span style="font-size:11px;font-weight:700;color:white;">${initials}</span>`;

  const html = `
    <div style="
      width:40px;height:40px;border-radius:50%;
      border:3px solid ${color};
      background:${photoUrl ? "transparent" : color};
      display:flex;align-items:center;justify-content:center;
      box-shadow:0 2px 6px rgba(0,0,0,0.3);
      overflow:hidden;
    ">${inner}</div>
    <div style="
      width:0;height:0;
      border-left:6px solid transparent;
      border-right:6px solid transparent;
      border-top:8px solid ${color};
      margin:0 auto;
    "></div>
  `;

  return L.divIcon({
    html,
    className: "",
    iconSize: [40, 50],
    iconAnchor: [20, 50],
    popupAnchor: [0, -52],
  });
}

function formatMinutesAgo(updatedAt) {
  const diff = Math.floor((Date.now() - new Date(updatedAt).getTime()) / 60000);
  if (diff < 1) return "только что";
  if (diff === 1) return "1 мин назад";
  if (diff < 5) return `${diff} мин назад`;
  if (diff < 21) return `${diff} мин назад`;
  return `${diff} мин назад`;
}

// Fits map bounds to all markers on first load
function FitBounds({ locations, branches, fitted }) {
  const map = useMap();
  useEffect(() => {
    if (fitted.current) return;
    const points = [
      ...locations.map((l) => [l.lat, l.lng]),
      ...branches.map((b) => [b.location.lat, b.location.lng]),
    ];
    if (points.length > 0) {
      map.fitBounds(L.latLngBounds(points), { padding: [48, 48], maxZoom: 15 });
      fitted.current = true;
    }
  }, [locations, branches, map, fitted]);
  return null;
}

const MapPage = () => {
  const [locations, setLocations] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const fittedRef = useRef(false);

  const fetchLocations = useCallback(async () => {
    try {
      const res = await secureFetch(`${API_URL}/locations/my-interns`);
      if (!res.ok) throw new Error();
      const json = await res.json();
      setLocations(json.data || []);
      setLastUpdated(new Date());
    } catch {
      // Keep last known state on error
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchBranches = useCallback(async () => {
    try {
      const res = await secureFetch(`${API_URL}/branches`);
      if (!res.ok) return;
      const json = await res.json();
      const list = Array.isArray(json) ? json : json.data || [];
      setBranches(
        list.filter(
          (b) =>
            b.location &&
            Number.isFinite(b.location.lat) &&
            Number.isFinite(b.location.lng)
        )
      );
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    fetchLocations();
    fetchBranches();
    const interval = setInterval(fetchLocations, 30000);
    return () => clearInterval(interval);
  }, [fetchLocations, fetchBranches]);

  const handleRefresh = () => {
    fittedRef.current = false;
    fetchLocations();
  };

  return (
    <div className="flex flex-col bg-gray-50" style={{ height: "calc(100dvh - 56px)" }}>
      {/* Header */}
      <div className="sticky top-0 z-[1000] bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-red-500" />
          <div>
            <h1 className="text-base font-bold text-gray-900">Карта стажёров</h1>
            <p className="text-xs text-gray-500">
              {loading
                ? "Загрузка..."
                : locations.length === 0
                ? "Нет онлайн"
                : `${locations.length} онлайн`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="text-xs text-gray-400 hidden sm:block">
              Обновлено в {lastUpdated.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Обновить
          </button>
        </div>
      </div>

      {/* Map area */}
      <div className="flex-1 relative">
        {locations.length === 0 && !loading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-gray-400 z-10 pointer-events-none">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
              <Users className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-sm text-center max-w-xs px-4">
              Нет интернов онлайн — они появятся здесь когда включат шаринг
            </p>
          </div>
        ) : null}

        <MapContainer
          center={[41.2995, 69.2401]} // Tashkent default
          zoom={12}
          style={{ height: "100%", width: "100%" }}
          zoomControl={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <FitBounds locations={locations} branches={branches} fitted={fittedRef} />

          {branches.map((branch) => (
            <Marker
              key={`branch-${branch._id}`}
              position={[branch.location.lat, branch.location.lng]}
              icon={branchIcon}
            >
              <Popup>
                <div className="min-w-[160px]">
                  <p className="font-semibold text-gray-900 text-sm mb-1">{branch.name}</p>
                  {branch.city && <p className="text-xs text-gray-500">{branch.city}</p>}
                  {branch.address && <p className="text-xs text-gray-400 mt-1">{branch.address}</p>}
                  <a
                    href={`https://yandex.com/maps/?ll=${branch.location.lng},${branch.location.lat}&z=17&pt=${branch.location.lng},${branch.location.lat}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 mt-2 text-xs font-medium text-red-600 hover:text-red-700 hover:underline"
                  >
                    Открыть в Яндексе →
                  </a>
                </div>
              </Popup>
            </Marker>
          ))}

          {locations.map((loc) => {
            const color = GRADE_COLORS[loc.grade] || "#6b7280";
            const icon = createMarkerIcon(color, loc.profilePhoto, loc.name);
            const fullName = `${loc.name} ${loc.lastName || ""}`.trim();
            return (
              <Marker key={loc.internId} position={[loc.lat, loc.lng]} icon={icon}>
                <Popup>
                  <div className="min-w-[160px]">
                    <div className="flex items-center gap-2 mb-2">
                      {loc.profilePhoto ? (
                        <img
                          src={loc.profilePhoto}
                          alt={fullName}
                          className="w-9 h-9 rounded-full object-cover border-2"
                          style={{ borderColor: color }}
                        />
                      ) : (
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold"
                          style={{ background: color }}
                        >
                          {fullName
                            .split(" ")
                            .map((w) => w[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2)}
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-gray-900 text-sm leading-tight">{fullName}</p>
                        <span
                          className={`text-xs px-1.5 py-0.5 rounded font-medium ${GRADE_BG[loc.grade] || "bg-gray-100 text-gray-600"}`}
                        >
                          {GRADE_LABELS[loc.grade] || loc.grade}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400">{formatMinutesAgo(loc.updatedAt)}</p>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
};

export default MapPage;
