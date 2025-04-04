


import { Link, useLocation } from "react-router-dom";
import { Home, Grid, ShoppingCart, User, UserPlus } from "react-feather";
import styles from "../styles/MobileNavigation.module.css";

function MobileNavigation() {
  const location = useLocation(); // Suivi de l'URL active

  return (
    <nav className={styles.mobileNav}>
      {/* Bouton Accueil */}
      <Link to="/" className={`${styles.navItem} ${location.pathname === "/" ? styles.navItemActive : ""}`}>
        <Home size={20} />
        <span>Accueil</span>
      </Link>

      {/* Bouton Services */}
      <Link to="/services" className={`${styles.navItem} ${location.pathname === "/services" ? styles.navItemActive : ""}`}>
        <Grid size={20} />
        <span>Nos services</span>
      </Link>

      {/* Bouton Panier */}
      <Link to="/cart" className={`${styles.navItem} ${location.pathname === "/cart" ? styles.navItemActive : ""}`}>
        <ShoppingCart size={20} />
        <span>Panier</span>
      </Link>

      {/* Bouton Connexion */}
      <Link to="/login" className={`${styles.navItem} ${location.pathname === "/login" ? styles.navItemActive : ""}`}>
        <User size={20} />
        <span>Se connecter</span>
      </Link>

      {/* Bouton Inscription */}
      <Link to="/signup" className={`${styles.navItem} ${location.pathname === "/signup" ? styles.navItemActive : ""}`}>
        <UserPlus size={20} />
        <span>Inscription</span>
      </Link>
    </nav>
  );
}

export default MobileNavigation;