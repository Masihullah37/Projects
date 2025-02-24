

import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock } from "react-feather";
import { AuthContext } from "../App";
import Footer from "./Footer";
import "../styles/Auth.css";

function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    if (!formData.email.trim() || !formData.password.trim()) {
      setErrors({ general: "Veuillez remplir tous les champs" });
      return;
    }

    try {
      const response = await fetch("http://localhost/IT_Repairs/Backend/routes.php?action=login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (data.error) {
        setErrors({ general: "Email ou mot de passe incorrect" });
        return;
      }

      setUser(data);
      localStorage.setItem("user", JSON.stringify(data));
      navigate("/cart");
    } catch (err) {
      setErrors({ general: "Une erreur est survenue. Veuillez réessayer." });
    }
  };

  return (
    <div className="page-container">
      <div className="content-wrap">
        <div className="auth-wrapper">
          <div className="auth-container">
            <h2 className="auth-title">Se connecter</h2>
            <p className="auth-subtitle">Accédez à votre compte pour continuer vos achats</p>

            {errors.general && <div className="error-message">{errors.general}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <Mail className="input-icon" size={20} />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Votre adresse email"
                  required
                />
              </div>

              <div className="form-group">
                <Lock className="input-icon" size={20} />
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Votre mot de passe"
                  required
                />
              </div>

              <div className="forgot-password">
                <span className="text-muted">Mot de passe oublié ?</span>
              </div>

              <button type="submit" className="auth-button">
                Se connecter
              </button>

              <div className="auth-links">
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







