

import { useContext, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../App";
import "../styles/Navbar.css";

function Navbar() {
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user");
    navigate("/login");
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

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
      <div className="container">
        <div className="d-flex align-items-center w-100">
          {/* Mobile Toggle Button */}
          <button
            className="navbar-toggler border-0"
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          {/* Brand Logo */}
          <Link to="/" className="navbar-brand mx-3">
            <img
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSv2tLN_D9j7lMsuuDlkuY7bqNwGo1Pv3uiDw&s"
              alt="Logo"
              height="30"
            />
          </Link>

          {/* Navigation Links */}
          <div className={`collapse navbar-collapse ${isMenuOpen ? "show" : ""}`}>
            <ul className="navbar-nav">
              <li className="nav-item">
                <Link to="/" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                  Accueil
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/services" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                  Nos Services
                </Link>
              </li>
              {user ? (
                <li className="nav-item">
                  <button onClick={handleLogout} className="nav-link btn btn-link">
                    Déconnexion
                  </button>
                </li>
              ) : (
                <>
                  <li className="nav-item">
                    <Link to="/login" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                      Connexion
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link to="/signup" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                      Inscription
                    </Link>
                  </li>
                </>
              )}
            </ul>

            {/* Search Bar */}
            <div className="search-bar">
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button>
                <i className="fas fa-search"></i>
              </button>
            </div>
          </div>

          {/* Cart Icon */}
          <Link to="/cart" className="ms-3">
            <img
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRMvzlDcJLs01QYnyCmG8hszEoei_2Fhai-0UpjfJuyRz4bWVFZIEcsbJ5eklMtazLl8VY&usqp=CAU"
              alt="Cart"
              height="24"
            />
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;



