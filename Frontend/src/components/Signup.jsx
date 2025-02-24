

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, User, Phone } from "react-feather";
import Footer from "./Footer";
import "../styles/Auth.css";

function Signup() {
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    confirmEmail: "",
    telephone: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  };

  const validatePhoneNumber = (phone) => {
    const phoneRegex = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/;
    return phoneRegex.test(phone);
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nom.trim()) newErrors.nom = "Le nom est obligatoire";
    if (!formData.prenom.trim()) newErrors.prenom = "Le prénom est obligatoire";
    if (!formData.email.trim()) {
      newErrors.email = "L'adresse email est obligatoire";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Veuillez entrer un format d'email valide";
    }
    if (!formData.confirmEmail.trim()) newErrors.confirmEmail = "La confirmation de l'email est obligatoire";
    if (!formData.telephone.trim()) {
      newErrors.telephone = "Le numéro de téléphone est obligatoire";
    } else if (!validatePhoneNumber(formData.telephone)) {
      newErrors.telephone = "Format de numéro de téléphone invalide";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Le mot de passe est obligatoire";
    } else if (!validatePassword(formData.password)) {
      newErrors.password =
        "Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial";
    }

    if (formData.email !== formData.confirmEmail) {
      newErrors.confirmEmail = "Les adresses email ne correspondent pas";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Les mots de passe ne correspondent pas";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccess("");

    if (!validateForm()) return;

    try {
      const response = await fetch("http://localhost/IT_Repairs/Backend/routes.php?action=register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nom: formData.nom,
          prenom: formData.prenom,
          email: formData.email,
          password: formData.password,
          telephone: formData.telephone.replace(/\s+/g, ""), // Remove spaces from phone number
        }),
      });

      const data = await response.json();

      if (data.error) {
        switch (data.error) {
          case "EMAIL_EXISTS":
            setErrors({ email: "Cette adresse email est déjà utilisée" });
            break;
          case "PHONE_EXISTS":
            setErrors({ telephone: "Ce numéro de téléphone est déjà utilisé" });
            break;
          default:
            setErrors({ general: "Une erreur est survenue. Veuillez réessayer." });
        }
        return;
      }

      setSuccess("Inscription réussie ! Redirection...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setErrors({ general: "Une erreur est survenue. Veuillez réessayer." });
    }
  };

  return (
    <div className="page-container">
      <div className="content-wrap">
        <div className="auth-wrapper">
          <div className="auth-container">
            <h2 className="auth-title">S'inscrire</h2>

            {errors.general && <div className="error-message">{errors.general}</div>}
            {success && <div className="success-message">{success}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <User className="input-icon" size={20} />
                <input
                  type="text"
                  name="nom"
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  placeholder="Votre nom"
                  className={errors.nom ? "error" : ""}
                />
                {errors.nom && <div className="field-error">{errors.nom}</div>}
              </div>

              <div className="form-group">
                <User className="input-icon" size={20} />
                <input
                  type="text"
                  name="prenom"
                  value={formData.prenom}
                  onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                  placeholder="Votre prénom"
                  className={errors.prenom ? "error" : ""}
                />
                {errors.prenom && <div className="field-error">{errors.prenom}</div>}
              </div>

              <div className="form-group">
                <Mail className="input-icon" size={20} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Votre adresse email"
                  className={errors.email ? "error" : ""}
                  autoComplete="off"
                />
                {errors.email && <div className="field-error">{errors.email}</div>}
              </div>

              <div className="form-group">
                <Mail className="input-icon" size={20} />
                <input
                  type="email"
                  name="confirmEmail"
                  value={formData.confirmEmail}
                  onChange={(e) => setFormData({ ...formData, confirmEmail: e.target.value })}
                  placeholder="Confirmez votre adresse email"
                  className={errors.confirmEmail ? "error" : ""}
                
                  
                />
                {errors.confirmEmail && <div className="field-error">{errors.confirmEmail}</div>}
              </div>

              <div className="form-group">
                <Phone className="input-icon" size={20} />
                <input
                  type="tel"
                  name="telephone"
                  value={formData.telephone}
                  onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                  placeholder="Votre numéro de téléphone"
                  className={errors.telephone ? "error" : ""}
                />
                {errors.telephone && <div className="field-error">{errors.telephone}</div>}
              </div>

              <div className="form-group">
                <Lock className="input-icon" size={20} />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Entrez votre mot de passe"
                  className={errors.password ? "error" : ""}
                />
                {errors.password && <div className="field-error">{errors.password}</div>}
              </div>

              <div className="form-group">
                <Lock className="input-icon" size={20} />
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="Confirmez votre mot de passe"
                  className={errors.confirmPassword ? "error" : ""}
                />
                {errors.confirmPassword && <div className="field-error">{errors.confirmPassword}</div>}
              </div>

              <button type="submit" className="auth-button">
                Inscription
              </button>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Signup;