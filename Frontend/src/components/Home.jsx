// /* eslint-disable react/jsx-no-comment-textnodes */
// /* eslint-disable react/no-unescaped-entities */


// import { useState, useEffect, useContext, useCallback, useRef, useMemo } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// // import { AuthContext } from "../App";
// import { AuthContext } from "../context/AuthContext";
// import { CartContext } from "../context/CartContext";
// import { Carousel } from "react-bootstrap";
// import Footer from "./Footer";
// import RepairRequestForm from "./RepairRequestForm";
// import ServicesSection from "./ServicesSection";
// import ContactSection from "./ContactSection";
// import styles from "../styles/Home.module.css";
// import {fetchApi } from '../config/api';

// function Home() {
//   // États pour gérer les produits, le chargement et les erreurs
//   const [products, setProducts] = useState([]); // Stocke la liste des produits
//   const [loading, setLoading] = useState(true); // Indique si les produits sont en cours de chargement
//   const [error, setError] = useState(null); // Stocke les erreurs éventuelles
//   const [activeIndex, setActiveIndex] = useState(0); // Index actif du carrousel
//   const [notification, setNotification] = useState({ show: false, message: "", count: 0 }); // Notification pour le panier
  
//   // Contexte d'authentification et de panier
//   const { user } = useContext(AuthContext); // Utilisateur connecté
//   const { addToCart, cartCount } = useContext(CartContext); // Fonctions du panier
  
//   // Navigation et localisation
//   const navigate = useNavigate(); // Pour rediriger l'utilisateur
//   const location = useLocation(); // Pour gérer les changements d'URL
  
//   // Référence pour le défilement vers le formulaire de réparation
//   const repairFormRef = useRef(null); // Permet de faire défiler jusqu'au formulaire
  
//   const fetchProducts = useCallback(async () => {
//     try {
//       setLoading(true);
//       setError(null); // Clear previous errors

//       // fetchApi now returns the full JSON response, including 'success' and 'data' properties.
//       const responseJson = await fetchApi('get_products', { 
//         method: "GET",
//         credentials: "include",
//       });

//       console.log("get_products API raw response:", responseJson);

//       // Check if the overall API call was successful and if the 'data' property exists
//       if (responseJson.success && responseJson.data) {
//         // Now, access the 'products' array from within the 'data' property
//         if (Array.isArray(responseJson.data.products)) { 
//           setProducts(responseJson.data.products); // Access the nested products array
//         } else {
//           // This case handles if 'data' exists but 'products' is not an array (unexpected backend structure)
//           throw new Error("Format de réponse invalide : un tableau de produits était attendu dans la propriété 'data'.");
//         }
//       } else {
//         // This handles cases where responseJson.success is false or responseJson.data is missing
//         throw new Error(responseJson.message || "Échec de la récupération des produits : " + (responseJson.data && responseJson.data.message));
//       }

//     } catch (err) {
//       console.error("Erreur lors de la récupération des produits:", err);
//       setError(err.message || "Une erreur est survenue lors du chargement des produits.");
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   // Effet pour charger les produits au montage du composant
//   useEffect(() => {
//     fetchProducts();
//   }, [fetchProducts]);

//   // Effet pour gérer le défilement vers les sections via l'URL (#services, #contact, etc.)
//   useEffect(() => {
//     if (location.hash) {
//       setTimeout(() => {
//         const id = location.hash.replace("#", "");
//         const element = document.getElementById(id);
//         if (element) {
//           const yOffset = -80; // Ajuste pour la hauteur de la navbar
//           const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
//           window.scrollTo({ top: y, behavior: "smooth" }); // Défilement fluide
//         }
//       }, 300); // Petit délai pour assurer le chargement complet
//     }
//   }, [location]);

//   // Effet pour masquer la notification après 3 secondes
//   useEffect(() => {
//     if (notification.show) {
//       const timer = setTimeout(() => {
//         setNotification({ show: false, message: "", count: 0 });
//       }, 3000);
//       return () => clearTimeout(timer);
//     }
//   }, [notification.show]);

//   // Fonction pour ajouter un produit au panier
//   const handleAddToCart = async (product) => {
//     if (!user) {
//       navigate("/login"); // Redirige vers la page de connexion si l'utilisateur n'est pas connecté
//       return;
//     }

//   try {
//         // Optimistically add to local cart state (consider removing this if backend is strict about stock)
//         // For a more robust solution, you might only update local cart *after* successful backend confirmation
//         // addToCart(product); // You might want to remove this line or defer it

//         // Then sync with backend
//         const responseJson = await fetchApi('add_purchase', {
//             method: "POST",
//             headers: {
//                 "Content-Type": "application/json",
//             },
//             // credentials: 'include',
//             body: JSON.stringify({
//                 product_id: product.id,
//                 quantity: 1, // Always send 1 for adding a single unit to cart
//                 // csrf_token: user.csrf_token
//             }),
//         });

//         console.log("add_purchase API raw response:", responseJson);

//         if (responseJson.success && responseJson.data && responseJson.data.success) {
//             // Only add to local cart if backend confirms success
//             addToCart(product); // Add here
//             setNotification({
//                 show: true,
//                 message: responseJson.data.message || "Produit ajouté au panier !",
//                 count: cartCount + 1, // Update count only on success
//             });
//         } else if (responseJson.data && responseJson.data.error === "INSUFFICIENT_STOCK") {
//             // Specific handling for insufficient stock
//             setNotification({
//                 show: true,
//                 message: responseJson.data.message, // Use the detailed message from backend
//                 count: cartCount, // Do not increment cart count
//             });
//         } else {
//             // General error from backend response
//             throw new Error(responseJson.data.message || "Erreur lors de l'ajout au panier.");
//         }

//     } catch (err) {
//         console.error("Erreur lors de l'ajout au panier:", err);
//         setNotification({
//             show: true,
//             message: err.message || "Erreur lors de l'ajout au panier.",
//             count: cartCount,
//         });
//     }
// };

//   const getImagePath = useCallback((product) => {
//     if (!product?.image) return '/images/default-product.png';
    
//     // For production
//     if (window.location.hostname !== 'localhost') {
//       return `https://test.icvinformatique.com/images/${product.image}`;
//     }
//     // For development
//     return `/images/${product.image}`;
//   }, []);

//   // Fonction pour grouper les produits en fonction de la largeur de l'écran (responsive)
//   const groupProducts = useCallback(() => {
//     const groups = [];
//     const productsArray = [...products];

//     let groupSize = 4; // Par défaut pour les grands écrans
//     if (window.innerWidth < 768) {
//       groupSize = 2; // Mobile
//     } else if (window.innerWidth < 992) {
//       groupSize = 2; // Tablette
//     } else if (window.innerWidth < 1200) {
//       groupSize = 3; // Bureau
//     }

//     for (let i = 0; i < productsArray.length; i += groupSize) {
//       groups.push(productsArray.slice(i, i + groupSize));
//     }

//     return groups;
//   }, [products]);
//   const productGroups = useMemo(() => groupProducts(), [groupProducts]);
//   // Use a useEffect hook to log the product groups only when they change
//     useEffect(() => {
//         console.log("Product Groups:", productGroups);
//     }, [productGroups]);

//   // Gestion du redimensionnement de la fenêtre (responsive)
//   // eslint-disable-next-line no-unused-vars
//   const [windowWidth, setWindowWidth] = useState(window.innerWidth);
//   const resizeTimeoutRef = useRef(null);

//   useEffect(() => {
//     const handleResize = () => {
//       if (resizeTimeoutRef.current) {
//         clearTimeout(resizeTimeoutRef.current);
//       }

//       resizeTimeoutRef.current = setTimeout(() => {
//         setWindowWidth(window.innerWidth);
//       }, 200);
//     };

//     window.addEventListener("resize", handleResize);

//     return () => {
//       window.removeEventListener("resize", handleResize);
//       if (resizeTimeoutRef.current) {
//         clearTimeout(resizeTimeoutRef.current);
//       }
//     };
//   }, []);

//   // Fonction pour faire défiler jusqu'à la section des services
//   const scrollToServices = () => {
//     const servicesElement = document.getElementById("services");
//     if (servicesElement) {
//       const yOffset = -100; // Ajuste la position pour éviter la superposition avec la navbar
//       const y = servicesElement.getBoundingClientRect().top + window.pageYOffset + yOffset;
//       window.scrollTo({ top: y, behavior: "smooth" });
//     }
//   };

//   // Affichage pendant le chargement
//   if (loading) {
//     return (
//       <div className={styles.loadingContainer}>
//         <div className={styles.spinner}></div>
//         <p>Chargement des produits...</p>
//       </div>
//     );
//   }

//   // Affichage en cas d'erreur
//   if (error) {
//     return (
//       <div className={styles.errorContainer}>
//         <p className={styles.errorMessage}>{error}</p>
//         <button className={styles.retryButton} onClick={fetchProducts}>
//           Réessayer
//         </button>
//       </div>
//     );
//   }

//   // Affichage si aucun produit n'est disponible
//   if (products.length === 0) {
//     return (
//       <div className={styles.emptyContainer}>
//         <p>Aucun produit disponible pour le moment.</p>
//       </div>
//     );
//   }

//   // Groupement des produits pour le carrousel
//   // const productGroups = groupProducts();
//   // const productGroups = useMemo(() => groupProducts(), [groupProducts]);
//   // // Use a useEffect hook to log the product groups only when they change
//   //   useEffect(() => {
//   //       console.log("Product Groups:", productGroups);
//   //   }, [productGroups]);
//   // console.log("Product Groups:", productGroups); 

//   // Rendu principal de la page d'accueil
//   return (
//     <div className={styles.pageWrapper}>
//       <div className={styles.homeContainer}>
//         {/* Notification pour le panier */}
//         {notification.show && (
//           <div className={styles.notification}>
//             {notification.message}
//             {notification.count > 0 && <span className={styles.notificationCount}>{notification.count}</span>}
//           </div>
//         )}

//         {/* Section Hero (bannière principale) */}
//         <section className={styles.heroSection}>
//           <div className={styles.heroContent}>
//             <h1>Solutions Informatiques Professionnelles</h1>
//             <h2>Experts en réparation et services IT depuis 2010</h2>
//             <p>
//               Nous résolvons vos problèmes techniques avec précision et rapidité pour que vous puissiez vous concentrer
//               // eslint-disable-next-line react/no-unescaped-entities
//               sur l'essentiel.
//             </p>
//             <div className={styles.heroButtons}>
//               <button
//                 className={styles.primaryButton}
//                 onClick={() => repairFormRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
//               >
//                 Demander une réparation
//               </button>
//               <button className={styles.primaryButton} onClick={scrollToServices}>
//                 Découvrir nos services
//               </button>
//             </div>
//           </div>
//         </section>

//         {/* Section des produits */}
//         <section className={styles.productsSection}>
//           <h2 className={styles.sectionTitle}>Nos Produits</h2>

//           {/* Carrousel Bootstrap pour afficher les produits */}
//           <Carousel
//             activeIndex={activeIndex}
//             onSelect={(selectedIndex) => setActiveIndex(selectedIndex)}
//             className={styles.productCarousel}
//             indicators={true}
//             controls={true}
//             interval={null}
//           >
//             {productGroups.map((group, groupIndex) => (
//               <Carousel.Item key={groupIndex}>
//                 <div className={styles.productGroup}>
//                   {group.map((product) => (
//                     <div key={product.id} className={styles.productCard}>
//                       <div className={styles.productImageContainer}>
//                         {/* Added onClick handler to the image */}
//                         <img
//                           src={getImagePath(product)}
//                           alt={product.nom}
//                           className={styles.productImage}
//                           onClick={() => handleAddToCart(product)} 
//                           onError={(e) => {
//                             e.target.src = 'https://test.icvinformatique.com/images/default-product.png';
//                             e.target.style.objectFit = 'contain';
//                           }}
//                         />
//                       </div>
//                       <div className={styles.productInfo}>
//                         <h3 className={styles.productTitle}>{product.nom}</h3>
//                         <p className={styles.productDescription}>
//                           {product.description || "Aucune description disponible"}
//                         </p>
//                         <div className={styles.productFooter}>
//                           <span className={styles.productPrice}>
//                             {product.prix ? `${product.prix} €` : "Prix non disponible"}
//                           </span>
//                           <button className={styles.addToCartButton} onClick={() => handleAddToCart(product)}>
//                             Ajouter au panier
//                           </button>
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </Carousel.Item>
//             ))}
//           </Carousel>
//         </section>

//         {/* Section des services */}
//         <ServicesSection repairFormRef={repairFormRef} />

//         {/* Conteneur pour le formulaire de réparation et la section de contact */}
//         <div className={styles.contactContainer}>
//           {/* Formulaire de demande de réparation */}
//           <section ref={repairFormRef} id="repair-form" className={styles.repairSection}>
//             <h2 className={styles.sectionTitle}>Demander un service de réparation</h2>
//             <RepairRequestForm />
//           </section>

//           {/* Section de contact */}
//           <section id="contact" className={styles.contactSectionContainer}>
//             <ContactSection />
//           </section>
//         </div>
//       </div>

//       {/* Pied de page */}
//       <Footer />
//     </div>
//   );
// }

// export default Home;

/* eslint-disable react/jsx-no-comment-textnodes */
/* eslint-disable react/no-unescaped-entities */


import { useState, useEffect, useContext, useCallback, useRef, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { CartContext } from "../context/CartContext";
import { Carousel } from "react-bootstrap";
import Footer from "./Footer";
import RepairRequestForm from "./RepairRequestForm";
import ServicesSection from "./ServicesSection";
import ContactSection from "./ContactSection";
import styles from "../styles/Home.module.css";
import { fetchApi } from '../config/api';

function Home() {
  // États pour gérer les produits, le chargement et les erreurs
  const [products, setProducts] = useState([]); // Stocke la liste des produits
  const [loading, setLoading] = useState(true); // Indique si les produits sont en cours de chargement
  const [error, setError] = useState(null); // Stocke les erreurs éventuelles
  const [activeIndex, setActiveIndex] = useState(0); // Index actif du carrousel
  const [notification, setNotification] = useState({ show: false, message: "", count: 0 }); // Notification pour le panier
  const [searchQuery, setSearchQuery] = useState(""); // État pour la recherche
  
  // Contexte d'authentification et de panier
  const { user } = useContext(AuthContext); // Utilisateur connecté
  const { addToCart, cartCount } = useContext(CartContext); // Fonctions du panier
  
  // Navigation et localisation
  const navigate = useNavigate(); // Pour rediriger l'utilisateur
  const location = useLocation(); // Pour gérer les changements d'URL
  
  // Référence pour le défilement vers le formulaire de réparation
  const repairFormRef = useRef(null); // Permet de faire défiler jusqu'au formulaire
  
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null); // Clear previous errors

      // fetchApi now returns the full JSON response, including 'success' and 'data' properties.
      const responseJson = await fetchApi('get_products', { 
        method: "GET",
        credentials: "include",
      });

      console.log("get_products API raw response:", responseJson);

      // Check if the overall API call was successful and if the 'data' property exists
      if (responseJson.success && responseJson.data) {
        // Now, access the 'products' array from within the 'data' property
        if (Array.isArray(responseJson.data.products)) { 
          setProducts(responseJson.data.products); // Access the nested products array
        } else {
          // This case handles if 'data' exists but 'products' is not an array (unexpected backend structure)
          throw new Error("Format de réponse invalide : un tableau de produits était attendu dans la propriété 'data'.");
        }
      } else {
        // This handles cases where responseJson.success is false or responseJson.data is missing
        throw new Error(responseJson.message || "Échec de la récupération des produits : " + (responseJson.data && responseJson.data.message));
      }

    } catch (err) {
      console.error("Erreur lors de la récupération des produits:", err);
      setError(err.message || "Une erreur est survenue lors du chargement des produits.");
    } finally {
      setLoading(false);
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
      // Then sync with backend
      const responseJson = await fetchApi('add_purchase', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          product_id: product.id,
          quantity: 1, // Always send 1 for adding a single unit to cart
        }),
      });

      console.log("add_purchase API raw response:", responseJson);

      if (responseJson.success && responseJson.data && responseJson.data.success) {
        // Only add to local cart if backend confirms success
        addToCart(product); // Add here
        setNotification({
          show: true,
          message: responseJson.data.message || "Produit ajouté au panier !",
          count: cartCount + 1, // Update count only on success
        });
      } else if (responseJson.data && responseJson.data.error === "INSUFFICIENT_STOCK") {
        // Specific handling for insufficient stock
        setNotification({
          show: true,
          message: responseJson.data.message, // Use the detailed message from backend
          count: cartCount, // Do not increment cart count
        });
      } else {
        // General error from backend response
        throw new Error(responseJson.data.message || "Erreur lors de l'ajout au panier.");
      }
    } catch (err) {
      console.error("Erreur lors de l'ajout au panier:", err);
      setNotification({
        show: true,
        message: err.message || "Erreur lors de l'ajout au panier.",
        count: cartCount,
      });
    }
  };

  const getImagePath = useCallback((product) => {
    if (!product?.image) return '/images/default-product.png';
    
    // For production
    if (window.location.hostname !== 'localhost') {
      return `https://test.icvinformatique.com/images/${product.image}`;
    }
    // For development
    return `/images/${product.image}`;
  }, []);

  // Filtrage des produits basés sur la recherche
  const filteredProducts = useMemo(() => {
    if (!searchQuery) {
      return products;
    }
    return products.filter(product =>
      product.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [products, searchQuery]);

  // Fonction pour grouper les produits en fonction de la largeur de l'écran (responsive)
  const groupProducts = useCallback(() => {
    const groups = [];
    let productsToGroup = [...filteredProducts];

    let groupSize = 4; // Par défaut pour les grands écrans
    if (window.innerWidth < 768) {
      groupSize = 2; // Mobile
    } else if (window.innerWidth < 992) {
      groupSize = 2; // Tablette
    } else if (window.innerWidth < 1200) {
      groupSize = 3; // Bureau
    }

    for (let i = 0; i < productsToGroup.length; i += groupSize) {
      groups.push(productsToGroup.slice(i, i + groupSize));
    }

    return groups;
  }, [filteredProducts]);

  const productGroups = useMemo(() => groupProducts(), [groupProducts]);
  
  // Use a useEffect hook to log the product groups only when they change
  useEffect(() => {
    console.log("Product Groups:", productGroups);
  }, [productGroups]);

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

  // Affichage si aucun produit n'est disponible au total
  if (products.length === 0) {
    return (
      <div className={styles.emptyContainer}>
        <p>Aucun produit disponible pour le moment.</p>
      </div>
    );
  }

  // Affichage si aucun résultat de recherche
  if (searchQuery && filteredProducts.length === 0) {
    return (
      <div className={styles.pageWrapper}>
        <div className={styles.homeContainer}>
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
          
          <section className={styles.productsSection}>
            <h2 className={styles.sectionTitle}>Nos Produits</h2>
            
            <div className={styles.searchContainer}>
              <div className={styles.searchBox}>
                <svg className={styles.searchIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.35-4.35"></path>
                </svg>
                <input
                  type="text"
                  placeholder="Rechercher un produit..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={styles.searchInput}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className={styles.clearButton}
                    aria-label="Effacer la recherche"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                )}
              </div>
            </div>
            
            <div className={styles.noResultsContainer}>
              <div className={styles.noResultsIcon}>🔍</div>
              <h3>Aucun produit trouvé</h3>
              <p>Aucun produit ne correspond à votre recherche "{searchQuery}"</p>
              <button 
                onClick={() => setSearchQuery("")}
                className={styles.clearSearchButton}
              >
                Voir tous les produits
              </button>
            </div>
          </section>
          
          <ServicesSection repairFormRef={repairFormRef} />
          <div className={styles.contactContainer}>
            <section ref={repairFormRef} id="repair-form" className={styles.repairSection}>
              <h2 className={styles.sectionTitle}>Demander un service de réparation</h2>
              <RepairRequestForm />
            </section>
            <section id="contact" className={styles.contactSectionContainer}>
              <ContactSection />
            </section>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

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
          
          {/* Barre de recherche */}
          <div className={styles.searchContainer}>
            <div className={styles.searchBox}>
              <svg className={styles.searchIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
              <input
                type="text"
                placeholder="Rechercher un produit..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className={styles.clearButton}
                  aria-label="Effacer la recherche"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              )}
            </div>
          </div>

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
                        {/* Added onClick handler to the image */}
                        <img
                          src={getImagePath(product)}
                          alt={product.nom}
                          className={styles.productImage}
                          onClick={() => handleAddToCart(product)}
                          onError={(e) => {
                            e.target.src = 'https://test.icvinformatique.com/images/default-product.png';
                            e.target.style.objectFit = 'contain';
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