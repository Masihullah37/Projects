import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { User, Lock, Shield } from "react-feather";
import { AdminAuthContext } from "../context/AdminAuthContext";
import { toast } from "react-toastify";
import styles from "../styles/AdminAuth.module.css";

function AdminLogin() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useContext(AdminAuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    // Client-side validation
    const newErrors = {};
    if (!formData.username.trim()) newErrors.username = "Username is required";
    if (!formData.password.trim()) newErrors.password = "Password is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    try {
      // Get CSRF token
      const csrfResponse = await fetch('/Backend/admin_routes.php?action=get_csrf', {
        credentials: 'include'
      });
      const csrfData = await csrfResponse.json();
      const csrfToken = csrfData.data.csrf_token;

      const response = await fetch('/Backend/admin_routes.php?action=admin_login', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken
        },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success && result.data.success) {
        login(result.data.admin);
        toast.success("Login successful");
        navigate("/admin/dashboard");
      } else {
        setErrors({ general: result.data.message || "Login failed" });
        toast.error(result.data.message || "Login failed");
      }
    } catch (err) {
      console.error("Login error:", err);
      setErrors({ general: "Network error. Please try again." });
      toast.error("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <div className={styles.authHeader}>
          <Shield className={styles.authIcon} size={48} />
          <h1 className={styles.authTitle}>Admin Panel</h1>
          <p className={styles.authSubtitle}>Sign in to access the admin dashboard</p>
        </div>

        {errors.general && (
          <div className={styles.errorMessage}>{errors.general}</div>
        )}

        <form onSubmit={handleSubmit} className={styles.authForm}>
          <div className={styles.formGroup}>
            <User className={styles.inputIcon} size={20} />
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              placeholder="Username"
              className={errors.username ? styles.inputError : ""}
            />
            {errors.username && (
              <div className={styles.fieldError}>{errors.username}</div>
            )}
          </div>

          <div className={styles.formGroup}>
            <Lock className={styles.inputIcon} size={20} />
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Password"
              className={errors.password ? styles.inputError : ""}
            />
            {errors.password && (
              <div className={styles.fieldError}>{errors.password}</div>
            )}
          </div>

          <button
            type="submit"
            className={styles.authButton}
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </button>

          <div className={styles.authLinks}>
            <Link to="/admin/forgot-password">Forgot Password?</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AdminLogin;