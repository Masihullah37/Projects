import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Users,
  Package,
  Tool,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "react-feather";
import styles from "../styles/AdminSidebar.module.css";

function AdminSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  const menuItems = [
    { path: "/admin/dashboard", icon: Home, label: "Dashboard" },
    { path: "/admin/users", icon: Users, label: "Users" },
    { path: "/admin/products", icon: Package, label: "Products" },
    { path: "/admin/repairs", icon: Tool, label: "Repairs" },
    { path: "/admin/settings", icon: Settings, label: "Settings" },
  ];

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ""}`}>
      <div className={styles.sidebarHeader}>
        <div className={styles.logo}>
          <Shield size={32} />
          {!isCollapsed && <span>Admin Panel</span>}
        </div>
        <button onClick={toggleSidebar} className={styles.toggleButton}>
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      <nav className={styles.sidebarNav}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`${styles.navItem} ${isActive ? styles.active : ""}`}
              title={isCollapsed ? item.label : ""}
            >
              <Icon size={20} />
              {!isCollapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

// Import Shield icon
import { Shield } from "react-feather";

export default AdminSidebar;