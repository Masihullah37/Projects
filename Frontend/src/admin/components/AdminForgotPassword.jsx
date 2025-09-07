import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft } from "react-feather";
import { toast } from "react-toastify";
import styles from "../styles/AdminAuth.module.css";

function AdminForgotPassword() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error("Email is required");
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

      const response = await fetch('/Backend/admin_routes.php?action=admin_forgot_password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken
        },
        credentials: 'include',
        body: JSON.stringify({ email })
      });

      const result = await response.json();
      
      if (result.success && result.data.success) {
        setEmailSent(true);
        toast.success(result.data.message);
      } else {
        toast.error(result.data.message || "Failed to send reset email");
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      toast.error("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (emailSent) {
    return (
      <div className={styles.authContainer}>
        <div className={styles.authCard}>
          <div className={styles.successMessage}>
            <Mail size={48} />
            <h2>Email Sent!</h2>
            <p>We've sent a password reset link to your email address.</p>
            <Link to="/admin/login" className={styles.backLink}>
              <ArrowLeft size={18} />
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <div className={styles.authHeader}>
          <h1 className={styles.authTitle}>Forgot Password</h1>
          <p className={styles.authSubtitle}>Enter your email to receive a reset link</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.authForm}>
          <div className={styles.formGroup}>
            <Mail className={styles.inputIcon} size={20} />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Admin email address"
              required
            />
          </div>

          <button
            type="submit"
            className={styles.authButton}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Sending..." : "Send Reset Link"}
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

export default AdminForgotPassword;