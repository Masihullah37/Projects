

import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Lock } from "react-feather";
import Footer from "./Footer";
import styles from "../styles/Auth.module.css"; // Updated import

function ResetPassword() {
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState({ type: "", text: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tokenValid, setTokenValid] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();

  // Extract token and email from URL query parameters
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get("token");
  const email = queryParams.get("email");

  // Validate token on component mount
  useEffect(() => {
    const validateToken = async () => {
      if (!token || !email) {
        setMessage({
          type: "error",
          text: "Lien de réinitialisation invalide ou expiré.",
        });
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `http://localhost/IT_Repairs/Backend/routes.php?action=validate_reset_token&token=${token}&email=${email}`,
        );

        const data = await response.json();

        if (data.valid) {
          setTokenValid(true);
        } else {
          setMessage({
            type: "error",
            text: "Lien de réinitialisation invalide ou expiré.",
          });
        }
      } catch (err) {
        setMessage({
          type: "error",
          text: "Une erreur est survenue. Veuillez réessayer.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    validateToken();
  }, [token, email]);

  // Password validation function
  const validatePassword = (password) => {
    const errors = [];

    if (password.length < 8) {
      errors.push("Le mot de passe doit contenir au moins 8 caractères");
    }

    if (!/[A-Z]/.test(password)) {
      errors.push("Le mot de passe doit contenir au moins une majuscule");
    }

    if (!/[a-z]/.test(password)) {
      errors.push("Le mot de passe doit contenir au moins une minuscule");
    }

    if (!/[0-9]/.test(password)) {
      errors.push("Le mot de passe doit contenir au moins un chiffre");
    }

    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
      errors.push("Le mot de passe doit contenir au moins un caractère spécial");
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clear previous errors
    setErrors({});
    setMessage({ type: "", text: "" });

    // Validate passwords
    const newErrors = {};

    const passwordErrors = validatePassword(formData.password);
    if (passwordErrors.length > 0) {
      newErrors.password = passwordErrors;
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = ["Les mots de passe ne correspondent pas"];
    }

    // If there are errors, update the state and stop further execution
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("http://localhost/IT_Repairs/Backend/routes.php?action=reset_password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (data.error) {
        setMessage({ type: "error", text: data.error });
      } else if (data.success) {
        setMessage({ type: "success", text: data.success });
        // Redirect to login page after 2 seconds
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      }
    } catch (err) {
      setMessage({
        type: "error",
        text: "Une erreur est survenue. Veuillez réessayer.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.contentWrap}>
          <div className={styles.authWrapper}>
            <div className={styles.authContainer}>
              <h2 className={styles.authTitle}>Chargement...</h2>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!tokenValid && !isLoading) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.contentWrap}>
          <div className={styles.authWrapper}>
            <div className={styles.authContainer}>
              <h2 className={styles.authTitle}>Réinitialisation du mot de passe</h2>
              <div className={styles.errorMessage}>{message.text || "Lien de réinitialisation invalide ou expiré."}</div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.contentWrap}>
        <div className={styles.authWrapper}>
          <div className={styles.authContainer}>
            <h2 className={styles.authTitle}>Réinitialisation du mot de passe</h2>
            <p className={styles.authSubtitle}>Créez un nouveau mot de passe pour votre compte</p>

            {message.text && (
              <div className={`${message.type === "error" ? styles.errorMessage : styles.successMessage}`}>
                {message.text}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <div className={styles.inputWrapper}>
                  <Lock className={styles.inputIcon} size={20} />
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Nouveau mot de passe"
                  />
                </div>
                {errors.password && (
                  <div className={styles.passwordRequirements}>
                    <ul>
                      {errors.password.map((error, index) => (
                        <li key={index} className={styles.fieldError}>
                          {error}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className={styles.formGroup}>
                <Lock className={styles.inputIcon} size={20} />
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="Confirmer le mot de passe"
                />
                {errors.confirmPassword && <div className={styles.fieldError}>{errors.confirmPassword[0]}</div>}
              </div>

              <div className={styles.passwordRequirements}>
                <p>Le mot de passe doit contenir :</p>
                <ul>
                  <li>Au moins 8 caractères</li>
                  <li>Au moins une lettre majuscule</li>
                  <li>Au moins une lettre minuscule</li>
                  <li>Au moins un chiffre</li>
                  <li>Au moins un caractère spécial</li>
                </ul>
              </div>

              <button type="submit" className={styles.authButton} disabled={isSubmitting}>
                {isSubmitting ? "Traitement en cours..." : "Réinitialiser le mot de passe"}
              </button>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default ResetPassword;