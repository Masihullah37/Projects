import { Routes, Route, Navigate } from "react-router-dom";
import { AdminAuthProvider } from "./context/AdminAuthContext";
import AdminLogin from "./components/AdminLogin";
import AdminDashboard from "./components/AdminDashboard";
import AdminLayout from "./components/AdminLayout";
import UserManagement from "./components/UserManagement";
import ProductManagement from "./components/ProductManagement";
import RepairManagement from "./components/RepairManagement";
import AdminSettings from "./components/AdminSettings";
import AdminForgotPassword from "./components/AdminForgotPassword";
import AdminResetPassword from "./components/AdminResetPassword";
import ProtectedRoute from "./components/ProtectedRoute";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import "./styles/AdminApp.css";

function AdminApp() {
  return (
    <AdminAuthProvider>
      <div className="admin-app">
        <ToastContainer position="top-right" />
        <Routes>
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/forgot-password" element={<AdminForgotPassword />} />
          <Route path="/admin/reset-password" element={<AdminResetPassword />} />
          
          <Route path="/admin" element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="products" element={<ProductManagement />} />
            <Route path="repairs" element={<RepairManagement />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
          
          <Route path="*" element={<Navigate to="/admin/login" replace />} />
        </Routes>
      </div>
    </AdminAuthProvider>
  );
}

export default AdminApp;