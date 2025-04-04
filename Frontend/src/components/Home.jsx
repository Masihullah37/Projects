


import { useState, useEffect, useContext, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../App";
import { CartContext } from "../context/CartContext";
import { Carousel } from "react-bootstrap";
import Footer from "./Footer";
import RepairRequestForm from "./RepairRequestForm";
import ServicesSection from "./ServicesSection";
import ContactSection from "./ContactSection";
import styles from "../styles/Home.module.css";

function Home() {
  // États pour gérer les produits, le chargement et les erreurs
  const [products, setProducts] = useState([]); // Stocke la liste des produits
  const [loading, setLoading] = useState(true); // Indique si les produits sont en cours de chargement
  const [error, setError] = useState(null); // Stocke les erreurs éventuelles
  const [activeIndex, setActiveIndex] = useState(0); // Index actif du carrousel
  const [notification, setNotification] = useState({ show: false, message: "", count: 0 }); // Notification pour le panier
  
  // Contexte d'authentification et de panier
  const { user } = useContext(AuthContext); // Utilisateur connecté
  const { addToCart, cartCount } = useContext(CartContext); // Fonctions du panier
  
  // Navigation et localisation
  const navigate = useNavigate(); // Pour rediriger l'utilisateur
  const location = useLocation(); // Pour gérer les changements d'URL
  
  // Référence pour le défilement vers le formulaire de réparation
  const repairFormRef = useRef(null); // Permet de faire défiler jusqu'au formulaire
  
  // Fonction pour récupérer les produits depuis le backend
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost/IT_Repairs/Backend/routes.php?action=get_products");

      if (!response.ok) {
        throw new Error(`Erreur HTTP ! Statut : ${response.status}`);
      }

      const data = await response.json();

      // Vérifie si la réponse est un tableau
      if (Array.isArray(data)) {
        setProducts(data); // Met à jour la liste des produits
      } else {
        throw new Error("Format de réponse invalide : un tableau de produits était attendu");
      }
    } catch (err) {
      console.error("Erreur lors de la récupération des produits:", err);
      setError("Une erreur est survenue lors du chargement des produits.");
    } finally {
      setLoading(false); // Arrête le chargement
    }
  }, []);

  // Effet pour charger les produits au montage du composant
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Effet pour gérer le défilement vers les sections via l'URL (#services, #contact, etc.)
  useEffect(() => {
    if (location.hash) {
      setTimeout(() => {
        const id = location.hash.replace("#", "");
        const element = document.getElementById(id);
        if (element) {
          const yOffset = -80; // Ajuste pour la hauteur de la navbar
          const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({ top: y, behavior: "smooth" }); // Défilement fluide
        }
      }, 300); // Petit délai pour assurer le chargement complet
    }
  }, [location]);

  // Effet pour masquer la notification après 3 secondes
  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification({ show: false, message: "", count: 0 });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification.show]);

  // Fonction pour ajouter un produit au panier
  const handleAddToCart = async (product) => {
    if (!user) {
      navigate("/login"); // Redirige vers la page de connexion si l'utilisateur n'est pas connecté
      return;
    }

    try {
      addToCart(product); // Ajoute le produit au panier via le contexte

      // Affiche une notification
      setNotification({
        show: true,
        message: "Produit ajouté au panier avec succès !",
        count: cartCount + 1,
      });

      // Envoie la requête au backend pour enregistrer l'achat
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
      });
    } catch (err) {
      console.error("Erreur lors de l'ajout au panier:", err);
      setNotification({
        show: true,
        message: "Erreur lors de l'ajout au panier.",
        count: cartCount,
      });
    }
  };

  // Fonction pour obtenir le chemin de l'image d'un produit
  const getImagePath = useCallback((product) => {
    if (product.image) {
      return `/images/${product.image}`; // Utilise l'image depuis la base de données
    }
    return "/images/default-product.png"; // Image par défaut
  }, []);

  // Fonction pour grouper les produits en fonction de la largeur de l'écran (responsive)
  const groupProducts = useCallback(() => {
    const groups = [];
    const productsArray = [...products];

    let groupSize = 4; // Par défaut pour les grands écrans
    if (window.innerWidth < 768) {
      groupSize = 2; // Mobile
    } else if (window.innerWidth < 992) {
      groupSize = 2; // Tablette
    } else if (window.innerWidth < 1200) {
      groupSize = 3; // Bureau
    }

    for (let i = 0; i < productsArray.length; i += groupSize) {
      groups.push(productsArray.slice(i, i + groupSize));
    }

    return groups;
  }, [products]);

  // Gestion du redimensionnement de la fenêtre (responsive)
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const resizeTimeoutRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }

      resizeTimeoutRef.current = setTimeout(() => {
        setWindowWidth(window.innerWidth);
      }, 200);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
    };
  }, []);

  // Fonction pour faire défiler jusqu'à la section des services
  const scrollToServices = () => {
    const servicesElement = document.getElementById("services");
    if (servicesElement) {
      const yOffset = -100; // Ajuste la position pour éviter la superposition avec la navbar
      const y = servicesElement.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  // Affichage pendant le chargement
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Chargement des produits...</p>
      </div>
    );
  }

  // Affichage en cas d'erreur
  if (error) {
    return (
      <div className={styles.errorContainer}>
        <p className={styles.errorMessage}>{error}</p>
        <button className={styles.retryButton} onClick={fetchProducts}>
          Réessayer
        </button>
      </div>
    );
  }

  // Affichage si aucun produit n'est disponible
  if (products.length === 0) {
    return (
      <div className={styles.emptyContainer}>
        <p>Aucun produit disponible pour le moment.</p>
      </div>
    );
  }

  // Groupement des produits pour le carrousel
  const productGroups = groupProducts();

  // Rendu principal de la page d'accueil
  return (
    <div className={styles.pageWrapper}>
      <div className={styles.homeContainer}>
        {/* Notification pour le panier */}
        {notification.show && (
          <div className={styles.notification}>
            {notification.message}
            {notification.count > 0 && <span className={styles.notificationCount}>{notification.count}</span>}
          </div>
        )}

        {/* Section Hero (bannière principale) */}
        <section className={styles.heroSection}>
          <div className={styles.heroContent}>
            <h1>Solutions Informatiques Professionnelles</h1>
            <h2>Experts en réparation et services IT depuis 2010</h2>
            <p>
              Nous résolvons vos problèmes techniques avec précision et rapidité pour que vous puissiez vous concentrer
              sur l'essentiel.
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

        {/* Section des produits */}
        <section className={styles.productsSection}>
          <h2 className={styles.sectionTitle}>Nos Produits</h2>

          {/* Carrousel Bootstrap pour afficher les produits */}
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
                            e.target.src = "/images/logo.png"; // Image de secours
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

        {/* Section des services */}
        <ServicesSection repairFormRef={repairFormRef} />

        {/* Conteneur pour le formulaire de réparation et la section de contact */}
        <div className={styles.contactContainer}>
          {/* Formulaire de demande de réparation */}
          <section ref={repairFormRef} id="repair-form" className={styles.repairSection}>
            <h2 className={styles.sectionTitle}>Demander un service de réparation</h2>
            <RepairRequestForm />
          </section>

          {/* Section de contact */}
          <section id="contact" className={styles.contactSectionContainer}>
            <ContactSection />
          </section>
        </div>
      </div>

      {/* Pied de page */}
      <Footer />
    </div>
  );
}

export default Home;
