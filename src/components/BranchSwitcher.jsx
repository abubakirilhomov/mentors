import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { MapPin, Check, ChevronDown } from "lucide-react";
import { switchActiveBranch } from "../store/authSlice";

// Reads branches from the cached user blob. Mentor login response now
// includes `user.branches: [{_id, name}]` (server-side populate in
// mentorController.loginMentor / refreshMentorToken /
// marsIdAuthController.issueInternalSession).
const readActiveBranch = () => {
  try {
    return localStorage.getItem("activeBranchId");
  } catch {
    return null;
  }
};

const BranchSwitcher = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const branches = (user?.branches || [])
    .map((b) => (b && typeof b === "object" && b._id ? { _id: String(b._id), name: b.name || "—" } : null))
    .filter(Boolean);

  const activeId = String(user?.activeBranchId || readActiveBranch() || branches[0]?._id || "");
  const active = branches.find((b) => b._id === activeId);

  useEffect(() => {
    const onClickAway = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onEsc = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClickAway);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onClickAway);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  if (branches.length <= 1) return null;

  const handlePick = (id) => {
    if (id === activeId) {
      setOpen(false);
      return;
    }
    dispatch(switchActiveBranch(id));
    setOpen(false);
    window.location.reload();
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
        title="Сменить филиал"
      >
        <MapPin className="w-4 h-4 text-gray-500" />
        <span className="hidden sm:inline max-w-[140px] truncate">
          {active?.name || "Филиал"}
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 z-30 bg-white rounded-xl shadow-lg border border-gray-100 py-1 min-w-[200px]">
          <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider text-gray-400 font-semibold">
            Сменить филиал
          </div>
          {branches.map((b) => {
            const isActive = b._id === activeId;
            return (
              <button
                key={b._id}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePick(b._id);
                }}
                className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-sm text-left transition-colors ${
                  isActive
                    ? "bg-red-50 text-red-700 font-semibold"
                    : "hover:bg-gray-50 text-gray-800"
                }`}
              >
                <span className="flex-1 truncate">{b.name}</span>
                {isActive && <Check className="w-4 h-4 flex-shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BranchSwitcher;
