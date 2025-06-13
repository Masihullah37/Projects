


// Import des dépendances nécessaires
import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock } from "react-feather";
import { AuthContext } from "../App"; // Contexte d'authentification
import Footer from "./Footer"; // Composant Footer réutilisable
import styles from "../styles/Auth.module.css"; // Styles CSS Modules

function Login() {
  // État pour stocker les données du formulaire
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // État pour gérer les erreurs de validation
  const [errors, setErrors] = useState({});
  // Hook pour la navigation entre pages
  const navigate = useNavigate();
  // Contexte d'authentification pour gérer l'utilisateur connecté
  const { setUser } = useContext(AuthContext);

  // Fonction de soumission du formulaire
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    // Validation frontend 
    let hasErrors = false;
    const newErrors = {};
    
    if (!formData.email.trim()) {
        newErrors.email = "Veuillez remplir le champ email";
        hasErrors = true;
    }
    if (!formData.password.trim()) {
        newErrors.password = "Veuillez remplir le champ mot de passe";
        hasErrors = true;
    }
    if (hasErrors) {
        setErrors(newErrors);
        return;
    }

    try {
        const response = await fetch("http://localhost/IT_Repairs/Backend/routes.php?action=login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: formData.email,
                password: formData.password
            }),
        });

        const data = await response.json();

        if (data.error) {
            switch(data.error) {
                case "EMPTY_EMAIL":
                    setErrors({ email: "Veuillez remplir le champ email" });
                    break;
                case "EMPTY_PASSWORD":
                    setErrors({ password: "Veuillez remplir le champ mot de passe" });
                    break;
                case "INVALID_CREDENTIALS":
                    setErrors({ general: "Email ou mot de passe incorrect" });
                    break;
                default:
                    setErrors({ general: "Une erreur est survenue. Veuillez réessayer." });
            }
            return;
        }

        // Connexion réussie
        setUser(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
        navigate("/cart");
    } catch (err) {
        setErrors({ general: "Erreur réseau. Veuillez réessayer." });
    }
};

  // Rendu du composant
  return (
    <div className={styles.pageContainer}>
      <div className={styles.contentWrap}>
        <div className={styles.authWrapper}>
          <div className={styles.authContainer}>
            {/* Titre et sous-titre */}
            <h2 className={styles.authTitle}>Se connecter</h2>
            <p className={styles.authSubtitle}>Accédez à votre compte pour continuer vos achats</p>

            {/* Message d'erreur général */}
            {errors.general && <div className={styles.errorMessage}>{errors.general}</div>}

            {/* Formulaire de connexion */}
            <form onSubmit={handleSubmit}>
              {/* Champ Email */}
              <div className={styles.formGroup}>
                <Mail className={styles.inputIcon} size={20} />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Votre adresse email"
                />
                {errors.email && <div className={styles.fieldError}>{errors.email}</div>}
              </div>

              {/* Champ Mot de passe */}
              <div className={styles.formGroup}>
                <Lock className={styles.inputIcon} size={20} />
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Votre mot de passe"
                />
                {errors.password && <div className={styles.fieldError}>{errors.password}</div>}
              </div>

              {/* Lien mot de passe oublié */}
              <div className={styles.forgotPassword}>
                <Link to="/forgot-password">Mot de passe oublié ?</Link>
              </div>

              {/* Bouton de soumission */}
              <button type="submit" className={styles.authButton}>
                Se connecter
              </button>

              {/* Lien vers l'inscription */}
              <div className={styles.authLinks}>
                <span>Créer un compte ?</span>
                <Link to="/signup">Inscription</Link>
              </div>
            </form>
          </div>
        </div>
      </div>
      {/* Pied de page */}
      <Footer />
    </div>
  );
}

export default Login;




