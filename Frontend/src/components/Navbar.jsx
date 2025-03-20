


import { useContext, useState, useEffect } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { AuthContext } from "../App"
import { CartContext } from "../context/CartContext"
import styles from "../styles/Navbar.module.css"
import logo from "../assets/images/logo.png"
import cartIcon from "../assets/images/cart.png"

function Navbar() {
  const { user, setUser } = useContext(AuthContext)
  const { cartCount } = useContext(CartContext)
  const navigate = useNavigate()
  const location = useLocation()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem("user")
    navigate("/login")
    setIsMenuOpen(false)
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMenuOpen && !event.target.closest(".navbar")) {
        setIsMenuOpen(false)
      }
    }

    document.addEventListener("click", handleClickOutside)
    return () => document.removeEventListener("click", handleClickOutside)
  }, [isMenuOpen])

  return (
    <>
      <nav className={`navbar navbar-expand-lg navbar-dark bg-primary ${styles.navbar}`}>
        <div className={`container ${styles.navbarContainer}`}>
          <div className="d-flex align-items-center w-100">
            {/* Mobile Toggle Button */}
            <button className="navbar-toggler border-0" type="button" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              <span className="navbar-toggler-icon"></span>
            </button>

            {/* Brand Logo */}
            <Link to="/" className="navbar-brand mx-3">
              <img src={logo || "/vite.svg"} alt="Logo" height="30" />
            </Link>

            {/* Navigation Links */}
            <div className={`collapse navbar-collapse ${isMenuOpen ? "show" : ""} ${styles.navbarCollapse}`}>
              <ul className={styles.navbarNav}>
                <li className="nav-item">
                  <Link
                    to="/"
                    className={styles.navLink}
                    onClick={(e) => {
                      setIsMenuOpen(false)
                      // If already on home page, scroll to top
                      if (location.pathname === "/") {
                        e.preventDefault()
                        window.scrollTo({ top: 0, behavior: "smooth" })
                      }
                    }}
                  >
                    Accueil
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="/#services" className={styles.navLink} onClick={() => setIsMenuOpen(false)}>
                    Nos Services
                  </Link>
                </li>
                {user ? (
                  <li className="nav-item">
                    <button onClick={handleLogout} className={`btn btn-link ${styles.navLink}`}>
                      Déconnexion
                    </button>
                  </li>
                ) : (
                  <>
                    <li className="nav-item">
                      <Link to="/login" className={styles.navLink} onClick={() => setIsMenuOpen(false)}>
                        Connexion
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link to="/signup" className={styles.navLink} onClick={() => setIsMenuOpen(false)}>
                        Inscription
                      </Link>
                    </li>
                  </>
                )}
              </ul>

              {/* Search Bar */}
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

            {/* Cart Icon with Counter */}
            <Link to="/cart" className={styles.cartIcon}>
              <img src={cartIcon || "/vite.svg"} alt="Cart" style={{ height: "24px", width: "24px" }} />
              {cartCount > 0 && <span className={styles.cartCounter}>{cartCount}</span>}
            </Link>
          </div>
        </div>
      </nav>
      {/* Add a spacer to prevent content from hiding behind the fixed navbar */}
      <div className={styles.navbarSpacer}></div>
    </>
  )
}

export default Navbar

