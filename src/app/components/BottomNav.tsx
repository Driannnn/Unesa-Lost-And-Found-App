import { Home, MessageCircle, BarChart2 } from "lucide-react";
import { useNavigate, useLocation } from "react-router";

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { icon: Home, label: "Home", path: "/home" },
    { icon: BarChart2, label: "Dashboard", path: "/dashboard" },
    { icon: MessageCircle, label: "Chat", path: "/chat/1" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-border shadow-lg">
      <div className="flex justify-around items-center h-16 px-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + "/");

          return (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className="flex flex-col items-center justify-center gap-1 px-6 py-2 rounded-xl transition-all"
              style={{
                color: isActive ? "#003366" : "#6c757d",
                backgroundColor: isActive ? "#E6F2FF" : "transparent",
              }}
            >
              <Icon
                className="h-5 w-5 transition-all"
                style={{ color: isActive ? "#003366" : "#9ca3af", strokeWidth: isActive ? 2.5 : 1.8 }}
              />
              <span
                className="text-xs transition-all"
                style={{
                  color: isActive ? "#003366" : "#9ca3af",
                  fontWeight: isActive ? 600 : 400,
                }}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
