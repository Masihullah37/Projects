

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Mail } from "react-feather";
import Footer from "./Footer";
import styles from "../styles/Auth.module.css"; // Updated import
import { fetchApi } from '../config/api';

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState({ type: "", text: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Add useEffect to clear messages after a timeout
  useEffect(() => {
    // Only set a timeout if there's a message
    if (message.text) {
      const timer = setTimeout(() => {
        setMessage({ type: "", text: "" });
      }, 2000); // 2 seconds timeout

      // Clear the timeout if the component unmounts or message changes
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setMessage({ type: "", text: "" });

    // Frontend validation remains
    if (!email.trim()) {
        setErrors({ email: "Veuillez remplir le champ email" });
        return;
    }

    setIsSubmitting(true);

    try {
        // const response = await fetch("http://localhost/IT_Repairs/Backend/routes.php?action=forgot_password"
         const response = await fetchApi('forgot_password', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
        });

        const data = await response.json();

        if (data.error) {
            switch(data.error) {
                case "EMPTY_EMAIL":
                    setErrors({ email: "Veuillez remplir le champ email" });
                    break;
                case "EMAIL_NOT_FOUND":
                    setMessage({ type: "error", text: "Cette adresse email n'est pas enregistrée" });
                    break;
                case "RESET_ALREADY_SENT":
                    setMessage({ type: "error", text: "Un lien a déjà été envoyé. Veuillez vérifier votre email." });
                    break;
                case "EMAIL_SEND_FAILED":
                case "EMAIL_SEND_ERROR":
                case "TOKEN_CREATION_FAILED":
                default:
                    setMessage({ type: "error", text: "Une erreur est survenue. Veuillez réessayer." });
            }
        } else if (data.success) {
            setMessage({ 
                type: "success", 
                text: "Un email de réinitialisation a été envoyé à votre adresse" 
            });
            setEmail("");
        }
    } catch (err) {
        setMessage({ type: "error", text: "Erreur de connexion. Veuillez réessayer." });
    } finally {
        setIsSubmitting(false);
    }
};

  return (
    <div className={styles.pageContainer}>
      <div className={styles.contentWrap}>
        <div className={styles.authWrapper}>
          <div className={styles.authContainer}>
            <h2 className={styles.authTitle}>Mot de passe oublié</h2>
            <p className={styles.authSubtitle}>Entrez votre adresse email pour recevoir un lien de réinitialisation</p>

            {message.text && (
              <div className={`${message.type === "error" ? styles.errorMessage : styles.successMessage}`}>
                {message.text}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <Mail className={styles.inputIcon} size={20} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Votre adresse email"
                />
                {errors.email && <div className={styles.fieldError}>{errors.email}</div>}
              </div>

              <button type="submit" className={styles.authButton} disabled={isSubmitting}>
                {isSubmitting ? "Envoi en cours..." : "Envoyer le lien"}
              </button>

              <div className={styles.authLinks}>
                <span>Retour à la page de connexion ?</span>
                <Link to="/login">Se connecter</Link>
              </div>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default ForgotPassword;