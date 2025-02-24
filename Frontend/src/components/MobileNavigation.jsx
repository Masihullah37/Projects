

import { Link, useLocation } from "react-router-dom";
import { Home, Grid, ShoppingCart, User, UserPlus } from "react-feather";
import "../styles/MobileNavigation.css";

function MobileNavigation() {
  const location = useLocation();

  return (
    <nav className="mobile-nav">
      <Link to="/" className={`nav-item ${location.pathname === "/" ? "active" : ""}`}>
        <Home size={20} />
        <span>Accueil</span>
      </Link>

      <Link to="/services" className={`nav-item ${location.pathname === "/services" ? "active" : ""}`}>
        <Grid size={20} />
        <span>Nos services</span>
      </Link>

      <Link to="/cart" className={`nav-item ${location.pathname === "/cart" ? "active" : ""}`}>
        <ShoppingCart size={20} />
        <span>Panier</span>
      </Link>

      <Link to="/login" className={`nav-item ${location.pathname === "/login" ? "active" : ""}`}>
        <User size={20} />
        <span>Se connecter</span>
      </Link>

      <Link to="/signup" className={`nav-item ${location.pathname === "/signup" ? "active" : ""}`}>
        <UserPlus size={20} />
        <span>Inscription</span>
      </Link>
    </nav>
  );
}

export default MobileNavigation;


