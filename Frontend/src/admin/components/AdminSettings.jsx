import { useState } from "react";
import { User, Mail, Lock, Save } from "react-feather";
import { toast } from "react-toastify";
import styles from "../styles/AdminSettings.module.css";

function AdminSettings() {
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [isUpdating, setIsUpdating] = useState(false);

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords don't match");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    setIsUpdating(true);

    try {
      // Get CSRF token
      const csrfResponse = await fetch('/Backend/admin_routes.php?action=get_csrf', {
        credentials: 'include'
      });
      const csrfData = await csrfResponse.json();
      const csrfToken = csrfData.data.csrf_token;

      const response = await fetch('/Backend/admin_routes.php?action=admin_update_password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken
        },
        credentials: 'include',
        body: JSON.stringify({
          current_password: passwordForm.currentPassword,
          new_password: passwordForm.newPassword
        })
      });

      const result = await response.json();
      
      if (result.success && result.data.success) {
        toast.success("Password updated successfully");
        setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        toast.error(result.data.message || "Failed to update password");
      }
    } catch (error) {
      console.error("Failed to update password:", error);
      toast.error("Failed to update password");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className={styles.adminSettings}>
      <div className={styles.pageHeader}>
        <h1>Admin Settings</h1>
        <p>Manage your admin account settings</p>
      </div>

      <div className={styles.settingsGrid}>
        <div className={styles.settingsCard}>
          <div className={styles.cardHeader}>
            <Lock size={24} />
            <h2>Change Password</h2>
          </div>
          
          <form onSubmit={handlePasswordUpdate}>
            <div className={styles.formGroup}>
              <label>Current Password</label>
              <input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                required
              />
            </div>
            
            <div className={styles.formGroup}>
              <label>New Password</label>
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                required
                minLength="6"
              />
            </div>
            
            <div className={styles.formGroup}>
              <label>Confirm New Password</label>
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                required
                minLength="6"
              />
            </div>
            
            <button
              type="submit"
              className={styles.updateButton}
              disabled={isUpdating}
            >
              <Save size={18} />
              {isUpdating ? "Updating..." : "Update Password"}
            </button>
          </form>
        </div>

        <div className={styles.settingsCard}>
          <div className={styles.cardHeader}>
            <User size={24} />
            <h2>Account Information</h2>
          </div>
          
          <div className={styles.infoSection}>
            <p>Manage your admin account settings and preferences here.</p>
            <div className={styles.infoItem}>
              <strong>Account Type:</strong> Administrator
            </div>
            <div className={styles.infoItem}>
              <strong>Permissions:</strong> Full Access
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminSettings;