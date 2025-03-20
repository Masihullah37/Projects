


import { useState, useEffect, useContext, useCallback, useRef } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { AuthContext } from "../App"
import { CartContext } from "../context/CartContext"
import { Carousel } from "react-bootstrap"
import Footer from "./Footer"
import RepairRequestForm from "./RepairRequestForm"
import ServicesSection from "./ServicesSection"
import styles from "../styles/Home.module.css"

function Home() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [notification, setNotification] = useState({ show: false, message: "", count: 0 })
  const { user } = useContext(AuthContext)
  const { addToCart, cartCount } = useContext(CartContext)
  const navigate = useNavigate()
  const location = useLocation()

  // Refs for scrolling
  const repairFormRef = useRef(null)
  const servicesSectionRef = useRef(null)

  // Fetch products from the backend
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch("http://localhost/IT_Repairs/Backend/routes.php?action=get_products")

      if (!response.ok) {
        throw new Error("Failed to fetch products")
      }

      const data = await response.json()
      setProducts(data)
    } catch (err) {
      console.error("Error fetching products:", err)
      setError("Une erreur est survenue lors du chargement des produits.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  // Handle scrolling to sections based on URL hash
  useEffect(() => {
    // Check if there's a hash in the URL
    if (location.hash) {
      setTimeout(() => {
        const id = location.hash.replace("#", "")
        const element = document.getElementById(id)
        if (element) {
          element.scrollIntoView({ behavior: "smooth" })
        }
      }, 500) // Small delay to ensure the page is fully loaded
    }
  }, [location])

  // Clear notification after 3 seconds
  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification({ show: false, message: "", count: 0 })
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [notification.show])

  // Handle adding a product to the cart
  const handleAddToCart = async (product) => {
    if (!user) {
      navigate("/login")
      return
    }

    try {
      addToCart(product)

      setNotification({
        show: true,
        message: "Produit ajouté au panier avec succès!",
        count: cartCount + 1,
      })

      await fetch("http://localhost/IT_Repairs/Backend/routes.php?action=add_purchase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: user.id,
          product_id: product.id,
          quantity: 1,
        }),
      })
    } catch (err) {
      console.error("Error adding to cart:", err)
      setNotification({
        show: true,
        message: "Erreur lors de l'ajout au panier.",
        count: cartCount,
      })
    }
  }

  // Get the image path for a product
  const getImagePath = useCallback((product) => {
    if (product.image) {
      return `/images/${product.image}` // Use the image name from the database
    }
    return "/images/default-product.png" // Fallback image
  }, [])

  // Group products based on screen width
  const groupProducts = useCallback(() => {
    const groups = []
    const productsArray = [...products]

    let groupSize = 4 // Default for large desktop
    if (window.innerWidth < 768) {
      groupSize = 2 // Mobile - changed from 1 to 2
    } else if (window.innerWidth < 992) {
      groupSize = 2 // Tablet
    } else if (window.innerWidth < 1200) {
      groupSize = 3 // Desktop
    }

    for (let i = 0; i < productsArray.length; i += groupSize) {
      groups.push(productsArray.slice(i, i + groupSize))
    }

    return groups
  }, [products])

  // Handle window resize for responsive design
  const [windowWidth, setWindowWidth] = useState(window.innerWidth)
  const resizeTimeoutRef = useRef(null)

  useEffect(() => {
    const handleResize = () => {
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current)
      }

      resizeTimeoutRef.current = setTimeout(() => {
        setWindowWidth(window.innerWidth)
      }, 200)
    }

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current)
      }
    }
  }, [])

  // Function to scroll to services section
  const scrollToServices = () => {
    const servicesElement = document.getElementById("services")
    if (servicesElement) {
      const yOffset = -100 // Adjust this value as needed
      const y = servicesElement.getBoundingClientRect().top + window.pageYOffset + yOffset
      window.scrollTo({ top: y, behavior: "smooth" })
    }
  }

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Chargement des produits...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <p className={styles.errorMessage}>{error}</p>
        <button className={styles.retryButton} onClick={fetchProducts}>
          Réessayer
        </button>
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className={styles.emptyContainer}>
        <p>Aucun produit disponible pour le moment.</p>
      </div>
    )
  }

  const productGroups = groupProducts()

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.homeContainer}>
        {/* Notification */}
        {notification.show && (
          <div className={styles.notification}>
            {notification.message}
            {notification.count > 0 && <span className={styles.notificationCount}>{notification.count}</span>}
          </div>
        )}

        {/* Hero Section */}
        <section className={styles.heroSection}>
          <div className={styles.heroContent}>
            <h1>Solutions Informatiques Professionnelles</h1>
            <h2>Experts en réparation et services IT depuis 2019</h2>
            <p>
            Réparations rapides, solutions fiables, et les meilleurs équipements high-tech au meilleur prix.
            </p>
            <div className={styles.heroButtons}>
              <button
                className={styles.primaryButton}
                onClick={() => repairFormRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
              >
                Demander une réparation
              </button>
              <button className={styles.primaryButton} onClick={scrollToServices}>
                Découvrir nos services
              </button>
            </div>
          </div>
        </section>

        {/* Products Section */}
        <section className={styles.productsSection}>
          <h2 className={styles.sectionTitle}>Nos Produits</h2>

          <Carousel
            activeIndex={activeIndex}
            onSelect={(selectedIndex) => setActiveIndex(selectedIndex)}
            className={styles.productCarousel}
            indicators={true}
            controls={true}
            interval={null}
          >
            {productGroups.map((group, groupIndex) => (
              <Carousel.Item key={groupIndex}>
                <div className={styles.productGroup}>
                  {group.map((product) => (
                    <div key={product.id} className={styles.productCard}>
                      <div className={styles.productImageContainer}>
                        <img
                          src={getImagePath(product) || "/placeholder.svg"}
                          alt={product.nom}
                          className={styles.productImage}
                          onError={(e) => {
                            e.target.src = "/images/ordinateur.png" // Fallback image
                          }}
                        />
                      </div>
                      <div className={styles.productInfo}>
                        <h3 className={styles.productTitle}>{product.nom}</h3>
                        <p className={styles.productDescription}>
                          {product.description || "Aucune description disponible"}
                        </p>
                        <div className={styles.productFooter}>
                          <span className={styles.productPrice}>
                            {product.prix ? `${product.prix} €` : "Prix non disponible"}
                          </span>
                          <button className={styles.addToCartButton} onClick={() => handleAddToCart(product)}>
                            Ajouter au panier
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Carousel.Item>
            ))}
          </Carousel>
        </section>

        {/* Services Section */}
        <ServicesSection repairFormRef={repairFormRef} />

        {/* Repair Service Request Form */}
        <section ref={repairFormRef} id="repair-form" className={styles.repairSection}>
          <h2 className={styles.sectionTitle}>Demander un service de réparation</h2>
          <RepairRequestForm />
        </section>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  )
}

export default Home




