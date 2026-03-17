import React from "react";
import { NavLink } from "react-router-dom";
import { Home, Users, BookOpen, UserCircle } from "lucide-react";

const BottomNav = () => {
  const items = [
    { to: "/dashboard", icon: Home, label: "Главная" },
    { to: "/interns", icon: Users, label: "Стажёры" },
    { to: "/lessons", icon: BookOpen, label: "Уроки" },
    { to: "/profile", icon: UserCircle, label: "Профиль" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-area-pb">
      <div className="flex">
        {items.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors ${
                isActive ? "text-red-500" : "text-gray-400 hover:text-gray-600"
              }`
            }
          >
            <Icon className="w-5 h-5" />
            <span className="text-xs font-medium">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
