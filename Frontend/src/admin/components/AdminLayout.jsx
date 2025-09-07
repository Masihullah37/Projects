import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import styles from "../styles/AdminLayout.module.css";

function AdminLayout() {
  return (
    <div className={styles.adminLayout}>
      <AdminSidebar />
      <div className={styles.mainContent}>
        <AdminHeader />
        <div className={styles.pageContent}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default AdminLayout;