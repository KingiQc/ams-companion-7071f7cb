import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard, TrendingUp, CalendarDays, Users, FileText,
  DollarSign, MessageSquare, MessagesSquare, FolderOpen, BarChart3,
  Building2, Package, ChevronLeft, ChevronRight, Shield, UserCog, LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

const navGroups = [
  {
    label: "Overview",
    items: [{ to: "/", icon: LayoutDashboard, label: "Dashboard" }],
  },
  {
    label: "Sales",
    items: [
      { to: "/pipeline", icon: TrendingUp, label: "Deals Pipeline" },
      { to: "/schedule", icon: CalendarDays, label: "My Schedule" },
    ],
  },
  {
    label: "Clients",
    items: [
      { to: "/clients", icon: Users, label: "All Clients" },
      { to: "/policies", icon: FileText, label: "Policies & Renewals" },
      { to: "/commissions", icon: DollarSign, label: "Commissions" },
    ],
  },
  {
    label: "Communication",
    items: [
      { to: "/messages", icon: MessageSquare, label: "Messages" },
      { to: "/team-chat", icon: MessagesSquare, label: "Team Chat" },
    ],
  },
  {
    label: "Resources",
    items: [
      { to: "/documents", icon: FolderOpen, label: "Documents" },
      { to: "/reports", icon: BarChart3, label: "Reports" },
    ],
  },
  {
    label: "Admin",
    items: [
      { to: "/carriers", icon: Building2, label: "Carrier Access" },
      { to: "/products", icon: Package, label: "Products" },
      { to: "/user-management", icon: UserCog, label: "User Management", superadminOnly: true },
    ],
  },
];

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { role, signOut, user } = useAuth();

  return (
    <aside
      className={cn(
        "flex flex-col h-screen sticky top-0 transition-all duration-300 z-30",
        collapsed ? "w-[72px]" : "w-[260px]"
      )}
      style={{ background: "hsl(228, 40%, 16%)" }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-white/10 shrink-0">
          <Shield className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <span className="text-white font-semibold text-[17px] tracking-tight font-poppins">InsuraOS</span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
        {navGroups.map((group) => (
          <div key={group.label}>
            {!collapsed && (
              <p className="text-[11px] font-semibold uppercase tracking-wider text-white/40 px-3 mb-2">{group.label}</p>
            )}
            <div className="space-y-0.5">
              {group.items.map((item: any) => {
                if (item.superadminOnly && role !== "superadmin") return null;
                const isActive = location.pathname === item.to;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14.5px] font-medium transition-all duration-150",
                      isActive ? "bg-white/12 text-white" : "text-white/60 hover:text-white hover:bg-white/8"
                    )}
                    style={isActive ? { background: "rgba(255,255,255,0.12)" } : undefined}
                  >
                    <item.icon className="w-[18px] h-[18px] shrink-0" />
                    {!collapsed && <span>{item.label}</span>}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User + Sign out */}
      <div className="border-t border-white/10 px-3 py-3">
        {!collapsed && user && (
          <p className="text-white/50 text-[12px] px-3 mb-2 truncate">{user.email}</p>
        )}
        <button
          onClick={signOut}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14.5px] font-medium text-white/60 hover:text-white hover:bg-white/8 transition-all w-full"
        >
          <LogOut className="w-[18px] h-[18px] shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-center py-4 border-t border-white/10 text-white/50 hover:text-white transition-colors"
      >
        {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
      </button>
    </aside>
  );
}
