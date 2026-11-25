
import { useLocation } from "react-router-dom";
import {
  Users,
  Package,
  CalendarDays,
  Activity,
  Bell,
  UserPlus,
  Clock,
  Settings
} from "lucide-react";

function ModulePage() {
  const location = useLocation();

  const modules = {
    "/employees": {
      title: "Employees",
      description: "Manage employee information and details.",
      icon: Users
    },
    "/items": {
      title: "Items",
      description: "Manage items and inventory.",
      icon: Package
    },
    "/calendar": {
      title: "Calendar",
      description: "View and manage scheduled activities.",
      icon: CalendarDays
    },
    "/activity-log": {
      title: "Activity Log",
      description: "Monitor system activities.",
      icon: Activity
    },
    "/reminder-log": {
      title: "Reminder Log",
      description: "View reminder history and status.",
      icon: Bell
    },
    "/recipients": {
      title: "Recipients",
      description: "Manage reminder recipients.",
      icon: UserPlus
    },
    "/scheduler": {
      title: "Scheduler",
      description: "Schedule and manage reminders.",
      icon: Clock
    },
    "/settings": {
      title: "Settings",
      description: "Manage application settings.",
      icon: Settings
    }
  };

  const currentModule = modules[location.pathname];
  const Icon = currentModule?.icon;

  if (!currentModule) {
    return <h2>Page not found</h2>;
  }

  return (
    <div>
      <div style={{
        background: "white",
        padding: "30px",
        borderRadius: "12px"
      }}>
        <Icon size={35} color="#2563eb" />

        <h1 style={{
          fontSize: "28px",
          fontWeight: "bold",
          marginTop: "15px"
        }}>
          {currentModule.title}
        </h1>

        <p style={{ color: "#64748b", marginTop: "10px" }}>
          {currentModule.description}
        </p>
      </div>
    </div>
  );
}

export default ModulePage;
