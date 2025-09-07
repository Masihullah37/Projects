import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, User } from "react-feather";
import { AdminAuthContext } from "../context/AdminAuthContext";
import { toast } from "react-toastify";
import styles from "../styles/AdminHeader.module.css";

function AdminHeader() {
  const { admin, logout } = useContext(AdminAuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const response = await fetch('/Backend/admin_routes.php?action=admin_logout', {
        credentials: 'include'
      });

      if (response.ok) {
        logout();
        toast.success("Logged out successfully");
        navigate("/admin/login");
      }
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Logout failed");
    }
  };

  return (
    <header className={styles.adminHeader}>
      <div className={styles.headerContent}>
        <h1 className={styles.pageTitle}>Admin Dashboard</h1>
        
        <div className={styles.headerActions}>
          <div className={styles.adminInfo}>
            <User size={20} />
            <span>{admin?.username}</span>
          </div>
          
          <button onClick={handleLogout} className={styles.logoutButton}>
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}

export default AdminHeader;