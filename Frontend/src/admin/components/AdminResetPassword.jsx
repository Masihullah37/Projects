import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Lock, ArrowLeft } from "react-feather";
import { toast } from "react-toastify";
import styles from "../styles/AdminAuth.module.css";

function AdminResetPassword() {
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tokenValid, setTokenValid] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get("token");
  const email = queryParams.get("email");

  useEffect(() => {
    if (!token || !email) {
      toast.error("Invalid reset link");
      setIsLoading(false);
      return;
    }

    // For admin, we'll assume the token is valid if both token and email are present
    // You can add a validation endpoint if needed
    setTokenValid(true);
    setIsLoading(false);
  }, [token, email]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    setIsSubmitting(true);

    try {
      // Get CSRF token
      const csrfResponse = await fetch('/Backend/admin_routes.php?action=get_csrf', {
        credentials: 'include'
      });
      const csrfData = await csrfResponse.json();
      const csrfToken = csrfData.data.csrf_token;

      const response = await fetch('/Backend/admin_routes.php?action=admin_reset_password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken
        },
        credentials: 'include',
        body: JSON.stringify({
          token,
          email,
          password: formData.password
        })
      });

      const result = await response.json();
      
      if (result.success && result.data.success) {
        toast.success("Password reset successfully");
        navigate("/admin/login");
      } else {
        toast.error(result.data.message || "Failed to reset password");
      }
    } catch (error) {
      console.error("Reset password error:", error);
      toast.error("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.authContainer}>
        <div className={styles.authCard}>
          <div className={styles.loadingMessage}>Validating reset link...</div>
        </div>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className={styles.authContainer}>
        <div className={styles.authCard}>
          <div className={styles.errorMessage}>
            Invalid or expired reset link
          </div>
          <Link to="/admin/login" className={styles.backLink}>
            <ArrowLeft size={18} />
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <div className={styles.authHeader}>
          <h1 className={styles.authTitle}>Reset Password</h1>
          <p className={styles.authSubtitle}>Enter your new password</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.authForm}>
          <div className={styles.formGroup}>
            <Lock className={styles.inputIcon} size={20} />
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="New password"
              required
              minLength="6"
            />
          </div>

          <div className={styles.formGroup}>
            <Lock className={styles.inputIcon} size={20} />
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              placeholder="Confirm new password"
              required
              minLength="6"
            />
          </div>

          <button
            type="submit"
            className={styles.authButton}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Resetting..." : "Reset Password"}
          </button>

          <div className={styles.authLinks}>
            <Link to="/admin/login">
              <ArrowLeft size={16} />
              Back to Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AdminResetPassword;