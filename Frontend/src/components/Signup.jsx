/* eslint-disable react/no-unescaped-entities */
/* eslint-disable react/jsx-no-comment-textnodes */


// Import des dépendances nécessaires
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, User, Phone } from "react-feather";
import Footer from "./Footer";
import styles from "../styles/Auth.module.css"; // Import des styles CSS
import { fetchApi } from "../config/api";

function Signup() {
  // État pour stocker les données du formulaire
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    confirmEmail: "",
    telephone: "",
    password: "",
    confirmPassword: "",
  });

  // État pour gérer les erreurs de validation
  const [errors, setErrors] = useState({});
  // État pour gérer le message de succès
  const [success, setSuccess] = useState("");
  // Hook pour la navigation
  const navigate = useNavigate();

  // Fonction pour valider le mot de passe
  // const validatePassword = (password) => {
  //   // Regex: 8 caractères, majuscule, minuscule, chiffre et caractère spécial
  //   const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  //   return passwordRegex.test(password);
  // };

  const validatePassword = (password) => {
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{6,}$/;
  return passwordRegex.test(password);
  };


  // Fonction pour valider le numéro de téléphone (format français)
  const validatePhoneNumber = (phone) => {
    const phoneRegex = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/;
    return phoneRegex.test(phone);
  };

  // Fonction pour valider l'email
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Fonction pour valider l'ensemble du formulaire
  const validateForm = () => {
    const newErrors = {};

    // Validation des champs obligatoires
    if (!formData.nom.trim()) newErrors.nom = "Le nom est obligatoire";
    if (!formData.prenom.trim()) newErrors.prenom = "Le prénom est obligatoire";
    
    // Validation de l'email
    if (!formData.email.trim()) {
      newErrors.email = "L'adresse email est obligatoire";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Veuillez entrer un format d'email valide";
    }
    
    // Validation de la confirmation d'email
    if (!formData.confirmEmail.trim()) newErrors.confirmEmail = "La confirmation de l'email est obligatoire";
    
    // Validation du téléphone
    if (!formData.telephone.trim()) {
      newErrors.telephone = "Le numéro de téléphone est obligatoire";
    } else if (!validatePhoneNumber(formData.telephone)) {
      newErrors.telephone = "Format de numéro de téléphone invalide";
    }

    // Validation du mot de passe
    if (!formData.password.trim()) {
      newErrors.password = "Le mot de passe est obligatoire";
    } else if (!validatePassword(formData.password)) {
      newErrors.password =
        "Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial";
    }

    // Vérification que les emails correspondent
    if (formData.email !== formData.confirmEmail) {
      newErrors.confirmEmail = "Les adresses email ne correspondent pas";
    }

    // Vérification que les mots de passe correspondent
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Les mots de passe ne correspondent pas";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Gestion de la soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccess("");

    if (!validateForm()) {
      // Small delay to show client-side validation errors before clearing
      setTimeout(() => setErrors({}), 2000); 
      return;
    }

    try {
      // fetchApi now returns the full JSON response, even for logical errors (200 OK status)
      const responseJson = await fetchApi('register', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nom: formData.nom,
          prenom: formData.prenom,
          email: formData.email,
          password: formData.password,
          telephone: formData.telephone.replace(/\s+/g, ""), // Remove spaces for backend
        }),
      });

      console.log("Signup API raw response:", responseJson); 

      // Check the nested 'success' flag from the backend's data
      if (responseJson.success && responseJson.data && responseJson.data.success) {
        setSuccess(responseJson.data.message || "Inscription réussie ! Redirection...");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        // Handle logical errors from the backend (e.g., email/phone exists)
        const backendError = responseJson.data.error; // Get the specific error code from backend
        const backendMessage = responseJson.data.message || "Une erreur est survenue lors de l'inscription.";

        const errorMap = {
          "EMAIL_EXISTS": { email: backendMessage },
          "PHONE_EXISTS": { telephone: backendMessage },
          "MISSING_PHONE": { telephone: backendMessage },
          "MISSING_PASSWORD": { password: backendMessage },
          "REGISTRATION_FAILED": { general: backendMessage }
        };
        
        // Apply specific field error if mapped, otherwise use general message
        setErrors({ 
          ...(errorMap[backendError] || {}), 
          general: backendMessage 
        });
      }

    } catch (err) {
      // This catch block will only be hit for true HTTP errors (e.g., 400, 500)
      console.error("Network or unexpected error during signup:", err); 
      setErrors({ general: err.message || "Erreur réseau. Veuillez réessayer." });
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.contentWrap}>
        <div className={styles.authWrapper}>
          <div className={styles.authContainer}>
            // eslint-disable-next-line react/no-unescaped-entities
            <h2 className={styles.authTitle}>S'inscrire</h2>

            {/* Affichage des messages d'erreur/succès */}
            {errors.general && <div className={styles.errorMessage}>{errors.general}</div>}
            {success && <div className={styles.successMessage}>{success}</div>}

            <form onSubmit={handleSubmit}>
              {/* Champ Nom */}
              <div className={styles.formGroup}>
                <User className={styles.inputIcon} size={20} />
                <input
                  type="text"
                  name="nom"
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  placeholder="Votre nom"
                  className={errors.nom ? styles.error : ""}
                />
                {errors.nom && <div className={styles.fieldError}>{errors.nom}</div>}
              </div>

              {/* Champ Prénom */}
              <div className={styles.formGroup}>
                <User className={styles.inputIcon} size={20} />
                <input
                  type="text"
                  name="prenom"
                  value={formData.prenom}
                  onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                  placeholder="Votre prénom"
                  className={errors.prenom ? styles.error : ""}
                />
                {errors.prenom && <div className={styles.fieldError}>{errors.prenom}</div>}
              </div>

              {/* Champ Email */}
              <div className={styles.formGroup}>
                <Mail className={styles.inputIcon} size={20} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Votre adresse email"
                  className={errors.email ? styles.error : ""}
                  autoComplete="username"
                />
                {errors.email && <div className={styles.fieldError}>{errors.email}</div>}
              </div>

              {/* Champ Confirmation Email */}
              <div className={styles.formGroup}>
                <Mail className={styles.inputIcon} size={20} />
                <input
                  type="email"
                  name="confirmEmail"
                  value={formData.confirmEmail}
                  onChange={(e) => setFormData({ ...formData, confirmEmail: e.target.value })}
                  placeholder="Confirmez votre adresse email"
                  className={errors.confirmEmail ? styles.error : ""}
                />
                {errors.confirmEmail && <div className={styles.fieldError}>{errors.confirmEmail}</div>}
              </div>

              {/* Champ Téléphone */}
              <div className={styles.formGroup}>
                <Phone className={styles.inputIcon} size={20} />
                <input
                  type="tel"
                  name="telephone"
                  value={formData.telephone}
                  onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                  placeholder="Votre numéro de téléphone"
                  className={errors.telephone ? styles.error : ""}
                />
                {errors.telephone && <div className={styles.fieldError}>{errors.telephone}</div>}
              </div>

              {/* Champ Mot de passe */}
              <div className={styles.formGroup}>
                <Lock className={styles.inputIcon} size={20} />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Entrez votre mot de passe"
                  className={errors.password ? styles.error : ""}
                />
                {errors.password && <div className={styles.fieldError}>{errors.password}</div>}
              </div>

              {/* Champ Confirmation Mot de passe */}
              <div className={styles.formGroup}>
                <Lock className={styles.inputIcon} size={20} />
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="Confirmez votre mot de passe"
                  className={errors.confirmPassword ? styles.error : ""}
                />
                {errors.confirmPassword && <div className={styles.fieldError}>{errors.confirmPassword}</div>}
              </div>

              {/* Bouton de soumission */}
              <button type="submit" className={styles.authButton}>
                Inscription
              </button>
            </form>
          </div>
        </div>
      </div>
      {/* Pied de page */}
      <Footer />
    </div>
  );
}

export default Signup;