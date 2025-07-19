





import { useContext, useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../App";
import { CartContext } from "../context/CartContext";
import styles from "../styles/Navbar.module.css";
import logo from "../assets/images/logo.png";
import cartIcon from "../assets/images/cart.png";
import { fetchApi } from "../config/api";
import { toast } from "react-toastify"; // ✅ toast for messages

function Navbar() {
  // États et contextes
  const { user, setUser } = useContext(AuthContext); // Gestion de l'utilisateur
  const { cartCount } = useContext(CartContext); // Nombre d'articles dans le panier
  const navigate = useNavigate(); // Navigation programmatique
  const location = useLocation(); // Localisation actuelle
  const [isMenuOpen, setIsMenuOpen] = useState(false); // État du menu mobile
  const [searchQuery, setSearchQuery] = useState(""); // Requête de recherche


  const handleLogout = async () => {
  try {
    // Call the backend logout route
    const response = await fetchApi('logout', {
      method: "GET", // or "POST" if you prefer
      credentials: "include", // Important for session cookies
    });

    const data = await response.json();

    if (data.success) {
      setUser(null); // Clear user from context
      localStorage.removeItem("user"); // Remove local storage copy
      // Clean up cart data stored as cart_{userId}
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith("cart_")) {
          localStorage.removeItem(key);
        }
      });
      toast.success("Déconnexion réussie"); // ✅ Success toast
      navigate("/login"); // Redirect
    } else {
        toast.error(data.error || "Erreur lors de la déconnexion");
    }
  } catch (error) {
    console.error("Erreur lors de la déconnexion", error);
  }

  setIsMenuOpen(false); // Close menu
};


  // Effet pour fermer le menu en cliquant à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMenuOpen && !event.target.closest(".navbar")) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [isMenuOpen]);

  // Effet pour fermer le menu lors du changement de route
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname, location.hash]);

  return (
    <>
      <nav className={`navbar navbar-expand-lg navbar-dark bg-primary ${styles.navbar}`}>
        <div className={`container ${styles.navbarContainer}`}>
          <div className="d-flex align-items-center w-100">
            {/* Bouton de bascule pour mobile */}
            <button
              className="navbar-toggler border-0"
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon"></span>
            </button>

            {/* Logo de la marque */}
            <Link to="/" className="navbar-brand mx-3">
              <img src={logo || "/vite.svg"} alt="Logo" height="30" />
            </Link>

            {/* Liens de navigation */}
            <div className={`collapse navbar-collapse ${isMenuOpen ? "show" : ""} ${styles.navbarCollapse}`}>
              <ul className={styles.navbarNav}>
                <li className="nav-item">
                  <Link
                    to="/"
                    className={styles.navLink}
                    onClick={(e) => {
                      // Si déjà sur la page d'accueil, fait défiler vers le haut
                      if (location.pathname === "/") {
                        e.preventDefault();
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }
                    }}
                  >
                    Accueil
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="/#services" className={styles.navLink}>
                    Nos Services
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    to="/#contact"
                    className={styles.navLink}
                    onClick={(e) => {
                      // Si déjà sur la page d'accueil, fait défiler vers la section contact
                      if (location.pathname === "/") {
                        e.preventDefault();
                        const contactSection = document.getElementById("contact");
                        if (contactSection) {
                          const yOffset = -120; // Ajustement pour afficher correctement
                          const y = contactSection.getBoundingClientRect().top + window.pageYOffset + yOffset;
                          window.scrollTo({ top: y, behavior: "smooth" });
                        }
                      }
                    }}
                  >
                    Contact
                  </Link>
                </li>
                {user ? (
                  <>
                    <li className="nav-item">
                      <Link to="/purchase-history" className={styles.navLink}>
                        Mes commandes
                      </Link>
                    </li>
                    <li className="nav-item">
                      <button onClick={handleLogout} className={`btn btn-link ${styles.navLink}`}>
                        Déconnexion
                      </button>
                    </li>
                  </>
                ) : (
                  <>
                    <li className="nav-item">
                      <Link to="/login" className={styles.navLink}>
                        Connexion
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link to="/signup" className={styles.navLink}>
                        Inscription
                      </Link>
                    </li>
                  </>
                )}
              </ul>

              {/* Barre de recherche */}
              <div className={styles.searchBar}>
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button className={styles.searchButton}>
                  <i className="fas fa-search"></i>
                </button>
              </div>
            </div>

            {/* Icône du panier avec compteur */}
            <Link to="/cart" className={styles.cartIcon}>
              <img src={cartIcon || "/vite.svg"} alt="Cart" style={{ height: "24px", width: "24px" }} />
              {cartCount > 0 && <span className={styles.cartCounter}>{cartCount}</span>}
            </Link>
          </div>
        </div>
      </nav>
      {/* Espaceur pour éviter que le contenu ne soit caché derrière la navbar fixe */}
      <div className={styles.navbarSpacer}></div>
    </>
  );
}

export default Navbar;