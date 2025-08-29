


import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock } from "react-feather";
import { AuthContext } from "../context/AuthContext";
import Footer from "./Footer";
import styles from "../styles/Auth.module.css";
import { fetchApi } from "../config/api";

function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  // Changed setUser to login, as that's what's provided by the context
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
  e.preventDefault();
  setErrors({});
  setIsLoading(true);

  // Client-side validation
  const newErrors = {};
  if (!formData.email.trim()) newErrors.email = "Veuillez remplir le champ email";
  if (!formData.password.trim()) newErrors.password = "Veuillez remplir le champ mot de passe";

  if (Object.keys(newErrors).length > 0) {
    setErrors(newErrors);
    setIsLoading(false);
    return;
  }

  try {
    const result = await fetchApi("login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    console.log("Login API response:", result); // Keep debug log

    if (result.success && result.data?.user) {
      // Use the login function from the context instead of setUser
      login(result.data.user);
      // Removed redundant localStorage call, this is now handled by AuthProvider
      navigate("/cart");
    } else {
      const errorMap = {
        EMPTY_EMAIL: { email: "Veuillez remplir le champ email" },
        EMPTY_PASSWORD: { password: "Veuillez remplir le champ mot de passe" },
        INVALID_CREDENTIALS: { general: "Email ou mot de passe incorrect" },
        UNKNOWN_ERROR: { general: "Erreur de connexion" }
      };

      // Handle both status-based and error-code-based errors
      const backendError = result.status === 400 ? 'INVALID_CREDENTIALS' : 
                          (result.error || result.data?.error || 'UNKNOWN_ERROR');
      
      setErrors(
        errorMap[backendError] || {
          general: result.data?.message || result.message || "Erreur de connexion"
        }
      );
    }
  } catch (err) {
    console.error("Login error:", err);
    setErrors({
      general: err.message || "Erreur réseau. Veuillez réessayer.",
    });
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div className={styles.pageContainer}>
      <div className={styles.contentWrap}>
        <div className={styles.authWrapper}>
          <div className={styles.authContainer}>
            <h2 className={styles.authTitle}>Se connecter</h2>
            <p className={styles.authSubtitle}>Accédez à votre compte pour continuer vos achats</p>

            {errors.general && <div className={styles.errorMessage}>{errors.general}</div>}

            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <Mail className={styles.inputIcon} size={20} />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Votre adresse email"
                  className={errors.email ? styles.error : ""}
                />
                {errors.email && <div className={styles.fieldError}>{errors.email}</div>}
              </div>

              <div className={styles.formGroup}>
                <Lock className={styles.inputIcon} size={20} />
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Votre mot de passe"
                  className={errors.password ? styles.error : ""}
                />
                {errors.password && <div className={styles.fieldError}>{errors.password}</div>}
              </div>

              <div className={styles.forgotPassword}>
                <Link to="/forgot-password">Mot de passe oublié ?</Link>
              </div>

              <button 
                type="submit" 
                className={styles.authButton}
                disabled={isLoading}
              >
                {isLoading ? "Connexion en cours..." : "Se connecter"}
              </button>

              <div className={styles.authLinks}>
                <span>Créer un compte ?</span>
                <Link to="/signup">Inscription</Link>
              </div>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Login;
