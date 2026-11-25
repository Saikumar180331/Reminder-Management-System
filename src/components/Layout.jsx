
import { Outlet, NavLink, useNavigate } from "react-router-dom";

import {
  LayoutDashboard,
  Users,
  Package,
  CalendarDays,
  Activity,
  Bell,
  UserPlus,
  Clock,
  Settings,
  LogOut,
  Zap
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import "../styles/layout.css";

function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Sidebar navigation items
  const menuItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard
    },
    {
      name: "Employees",
      path: "/employees",
      icon: Users
    },
    {
      name: "Items",
      path: "/items",
      icon: Package
    },
    {
      name: "Calendar",
      path: "/calendar",
      icon: CalendarDays
    },
    {
      name: "Activity Log",
      path: "/activity-log",
      icon: Activity
    },
    {
      name: "Reminder Log",
      path: "/reminder-log",
      icon: Bell
    },
    {
      name: "Recipients",
      path: "/recipients",
      icon: UserPlus
    },
    {
      name: "Scheduler",
      path: "/scheduler",
      icon: Clock
    },
    {
      name: "Settings",
      path: "/settings",
      icon: Settings
    }
  ];

  // Logout functionality
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="admin-layout">

      {/* HEADER */}
      <header className="top-header">

        <div className="header-left">
          <Zap size={27} />
          <span>RMS</span>
        </div>

        <div className="header-title">
          <h1>Reminder Management System</h1>
          <p>Smart Employee & Reminder Administration</p>
        </div>

        <div className="header-right">

          <div className="admin-info">
            <span className="admin-label">Admin Panel</span>

            <span className="admin-email">
              {user?.email || "Admin"}
            </span>
          </div>

          <button
            className="logout-btn"
            onClick={handleLogout}
          >
            <LogOut size={17} />
            Logout
          </button>

        </div>

      </header>

      {/* SIDEBAR AND MAIN CONTENT */}
      <div className="main-layout">

        {/* SIDEBAR */}
        <aside className="sidebar">

          <div className="sidebar-heading">
            MAIN MENU
          </div>

          <nav className="sidebar-nav">

            {menuItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end
                  className={({ isActive }) =>
                    isActive
                      ? "nav-item active"
                      : "nav-item"
                  }
                >
                  <Icon size={19} />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}

          </nav>

          {/* SIDEBAR FOOTER */}
          <div className="sidebar-footer">
            <p>Reminder Management System</p>
            <small>Admin Dashboard v1.0</small>
          </div>

        </aside>

        {/* PAGE CONTENT */}
        <main className="content-area">
          <Outlet />
        </main>

      </div>

    </div>
  );
}

export default Layout;
