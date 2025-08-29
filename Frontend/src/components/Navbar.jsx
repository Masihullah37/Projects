
import { useContext, useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { CartContext } from "../context/CartContext";
import styles from "../styles/Navbar.module.css";
import logo from "../assets/images/logo.png";
import cartIcon from "../assets/images/cart.png";
import { fetchApi } from "../config/api";
import { toast } from "react-toastify"; // ✅ toast for messages

function Navbar() {
  // Use the 'logout' function from AuthContext, not 'setUser'
  const { user, logout } = useContext(AuthContext);
  const { cartCount } = useContext(CartContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleLogout = async () => {
    try {
      // Call the backend logout route
      const data = await fetchApi('logout', {
        method: "GET",
        // credentials: "include", // Important for session cookies
      });

      if (data.success) {
        // Use the logout function from AuthContext
        logout(); 
        
        // The AuthContext now handles cleaning up its own state.
        // We can just clear the cart data.
        Object.keys(localStorage).forEach((key) => {
          if (key.startsWith("cart_")) {
            localStorage.removeItem(key);
          }
        });
        toast.success("Déconnexion réussie");
        navigate("/login");
      } else {
        toast.error(data.message || "Erreur lors de la déconnexion");
      }
    } catch (error) {
      console.error("Erreur lors de la déconnexion", error);
      toast.error("Erreur de connexion lors de la déconnexion.");
    }

    setIsMenuOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMenuOpen && !event.target.closest(".navbar")) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [isMenuOpen]);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname, location.hash]);

  return (
    <>
      <nav className={`navbar navbar-expand-lg navbar-dark bg-primary ${styles.navbar}`}>
        <div className={`container ${styles.navbarContainer}`}>
          <div className="d-flex align-items-center w-100">
            <button
              className="navbar-toggler border-0"
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon"></span>
            </button>

            <Link to="/" className="navbar-brand mx-3">
              <img src={logo || "/vite.svg"} alt="Logo" height="30" />
            </Link>

            <div className={`collapse navbar-collapse ${isMenuOpen ? "show" : ""} ${styles.navbarCollapse}`}>
              <ul className={styles.navbarNav}>
                <li className="nav-item">
                  <Link
                    to="/"
                    className={styles.navLink}
                    onClick={(e) => {
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
                      if (location.pathname === "/") {
                        e.preventDefault();
                        const contactSection = document.getElementById("contact");
                        if (contactSection) {
                          const yOffset = -120;
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
            <Link to="/cart" className={styles.cartIcon}>
              <img src={cartIcon || "/vite.svg"} alt="Cart" style={{ height: "24px", width: "24px" }} />
              {cartCount > 0 && <span className={styles.cartCounter}>{cartCount}</span>}
            </Link>
          </div>
        </div>
      </nav>
      <div className={styles.navbarSpacer}></div>
    </>
  );
}

export default Navbar;

