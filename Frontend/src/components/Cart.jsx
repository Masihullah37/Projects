

import { useContext, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { CartContext } from "../context/CartContext"
// import { AuthContext } from "../App"
import { AuthContext } from "../context/AuthContext";
import { Trash2, Minus, Plus } from "react-feather"
import styles from "../styles/Cart.module.css"
import Footer from "./Footer";

function Cart() {
  const { cartItems, removeFromCart, updateQuantity, getCartTotal } = useContext(CartContext)
  const { user } = useContext(AuthContext)
  const navigate = useNavigate()
  const [isUpdating, setIsUpdating] = useState(false)

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      navigate("/login")
    }
  }, [user, navigate])

  // Helper function to get the correct image path
  const getImagePath = (product) => {
    // // If the product has an image_path field, use it
    // if (product.image_path) {
    //   // Make sure the path is correct
    //   return product.image_path.startsWith("/") ? product.image_path : `/images/${product.image_path}`
    // }

    // Try product.image if it exists
    if (product.image) {
      return `/images/${product.image}`
    }

    // Otherwise, use the numbered image based on product ID
    return `/images/image${product.id}.png`
  }

  // Calculate VAT (20% of subtotal)
  const calculateVAT = () => {
    const subtotal = getCartTotal()
    return subtotal * 0.2
  }

  const handleQuantityChange = (product, newQuantity) => {
    setIsUpdating(true)
    updateQuantity(product.id, newQuantity)
    setTimeout(() => setIsUpdating(false), 300)
  }

  const handleProceedToPayment = () => {
    navigate("/payment")
  }

  if (!user) {
    return null // Don't render anything while redirecting
  }

  if (cartItems.length === 0) {
    return (
      <div className={styles.cartEmpty}>
        <h2>Votre panier est vide</h2>
        <p>Ajoutez des produits à votre panier pour les voir ici.</p>
        <button className={styles.returnBtn} onClick={() => navigate("/")}>
          Retour aux produits
        </button>
      </div>
    )
  }

  return (
    <div className={styles.cartPageContainer}>
      <div className={styles.cartContainer}>
        <h1 className={styles.cartTitle}>
          Votre panier ({cartItems.length} {cartItems.length > 1 ? "Articles" : "Article"})
        </h1>

        <div className={styles.cartContent}>
          <div className={styles.cartItems}>
            {cartItems.map((item) => (
              <div key={item.id} className={styles.cartItem}>
                <div className={styles.productInfo}>
                  <div className={styles.productImage}>
                    <img
                      src={getImagePath(item) || "/placeholder.svg"}
                      alt={item.nom}
                      onError={(e) => {
                        // Try a second fallback before using vite.svg
                        if (!e.target.src.includes("logo.png")) {
                          e.target.src = "/logo.png";
                        }
                        
                      }}
                    />
                  </div>
                  <div className={styles.productDetails}>
                    <h3 className={styles.productName}>{item.nom}</h3>
                    <p className={styles.productReference}>Référence: {item.id}</p>
                    <p className={styles.productShipping}>Expédition estimée sous 3-5 jours</p>

                    <div className={styles.quantityControls}>
                      <button
                        className={styles.quantityBtn}
                        onClick={() => handleQuantityChange(item, item.quantity - 1)}
                        disabled={item.quantity <= 1 || isUpdating}
                      >
                        <Minus size={16} />
                      </button>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(item, Number.parseInt(e.target.value) || 1)}
                        className={styles.quantityInput}
                      />
                      <button
                        className={styles.quantityBtn}
                        onClick={() => handleQuantityChange(item, item.quantity + 1)}
                        disabled={isUpdating}
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className={styles.productActions}>
                  <div className={styles.productPrice}>{(item.prix * item.quantity).toFixed(2)} €</div>
                  <button
                    className={styles.removeBtn}
                    onClick={() => removeFromCart(item.id)}
                    aria-label="Supprimer l'article"
                  >
                    <Trash2 size={18} />
                    <span>Supprimer</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.cartSummary}>
            <h2 className={styles.summaryTitle}>Récapitulatif</h2>

            <div className={styles.summaryDetails}>
              <div className={styles.summaryRow}>
                <span>Sous-total :</span>
                <span>{getCartTotal().toFixed(2)} €</span>
              </div>

              <div className={styles.summaryRow}>
                <span>TVA incluse de :</span>
                <span>{calculateVAT().toFixed(2)} €</span>
              </div>

              <div className={styles.summaryRow}>
                <span>Livraison :</span>
                <span className={styles.freeShipping}>GRATUIT</span>
              </div>

              <div className={`${styles.summaryRow} ${styles.totalRow}`}>
                <span>Total estimé :</span>
                <span>{getCartTotal().toFixed(2)} €</span>
              </div>
            </div>

            <button className={styles.checkoutBtn} onClick={handleProceedToPayment}>
              Procéder au paiement
            </button>
          </div>
        </div>
      </div>
        {/* Pied de page */}
            <Footer />
    </div>
  )
}

export default Cart


// import { useContext, useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { CartContext } from "../context/CartContext";
// import { AuthContext } from "../App";
// import { Trash2, Minus, Plus } from "react-feather";
// import styles from "../styles/Cart.module.css";
// import Footer from "./Footer";

// function Cart() {
//     const { cartItems, removeFromCart, updateQuantity, getCartTotal } = useContext(CartContext);
//     const { user } = useContext(AuthContext);
//     const navigate = useNavigate();
//     const [isUpdating, setIsUpdating] = useState(false);

//     // Redirect to login if not authenticated
//     useEffect(() => {
//         if (!user) {
//             navigate("/login");
//         }
//     }, [user, navigate]);

//     // Helper function to get the correct image path
//     const getImagePath = (product) => {
//         // // Option 1: If your backend provides a direct full URL for the image
//         // if (product.image_url) {
//         //     return product.image_url;
//         // }
//         // Option 2: If your backend provides just the filename and images are in /public/images/
//         if (product.image) {
//             return `/images/${product.image}`;
//         }
//         // Option 3: Fallback to numbered images if 'id' corresponds (e.g., image1.png, image2.png)
//         return `/images/image${product.id}.png`;
//     };

//     // Calculate VAT (20% of subtotal)
//     const calculateVAT = () => {
//         const subtotal = getCartTotal();
//         return subtotal * 0.2;
//     };

//     const handleQuantityChange = async (product, newQuantity) => {
//         setIsUpdating(true);
//         // Ensure newQuantity is a valid number, minimum 1
//         const quantityToUpdate = Math.max(1, Number.parseInt(newQuantity) || 1);

//         // Debugging log for quantity change
//         console.log(`Attempting to update quantity for product ID: ${product.id} from ${product.quantity} to ${quantityToUpdate}`);

//         await updateQuantity(product.id, quantityToUpdate);
//         setIsUpdating(false);
//     };

//     const handleProceedToPayment = () => {
//         navigate("/payment");
//     };

//     if (!user) {
//         return null; // Don't render anything while redirecting
//     }

//     if (cartItems.length === 0) {
//         return (
//             <div className={styles.cartEmpty}>
//                 <h2>Votre panier est vide</h2>
//                 <p>Ajoutez des produits à votre panier pour les voir ici.</p>
//                 <button className={styles.returnBtn} onClick={() => navigate("/")}>
//                     Retour aux produits
//                 </button>
//             </div>
//         );
//     }

//     return (
//         <div className={styles.cartPageContainer}>
//             <div className={styles.cartContainer}>
//                 <h1 className={styles.cartTitle}>
//                     Votre panier ({cartItems.length} {cartItems.length > 1 ? "Articles" : "Article"})
//                 </h1>

//                 <div className={styles.cartContent}>
//                     <div className={styles.cartItems}>
//                         {cartItems.map((item) => (
//                             // Add a console log for each item to inspect its properties
//                             // This is especially useful for 'id', 'nom', 'prix', 'image', 'image_url'
//                             console.log("Cart Item Details:", {
//                                 id: item.id,
//                                 nom: item.nom,
//                                 prix: item.prix,
//                                 quantity: item.quantity,
//                                 image: item.image,
//                                 image_url: item.image_url // Check if this property exists from backend
//                             }) && (
//                                 <div key={item.id} className={styles.cartItem}>
//                                     <div className={styles.productInfo}>
//                                         <div className={styles.productImage}>
//                                             <img
//                                                 src={getImagePath(item)}
//                                                 alt={item.nom}
//                                                 onError={(e) => {
//                                                     // Only change to /logo.png if the current src is not already the fallback
//                                                     if (e.target.src !== `${window.location.origin}/logo.png`) {
//                                                         e.target.src = "/logo.png"; // Final fallback image
//                                                     } else {
//                                                         // If the fallback also fails, hide the image and update alt text
//                                                         e.target.style.display = 'none';
//                                                         e.target.alt = "Image non disponible";
//                                                     }
//                                                 }}
//                                             />
//                                         </div>
//                                         <div className={styles.productDetails}>
//                                             <h3 className={styles.productName}>{item.nom}</h3>
//                                             <p className={styles.productReference}>Référence: {item.id}</p>
//                                             <p className={styles.productShipping}>Expédition estimée sous 3-5 jours</p>

//                                             <div className={styles.quantityControls}>
//                                                 <button
//                                                     className={styles.quantityBtn}
//                                                     onClick={() => handleQuantityChange(item, item.quantity - 1)}
//                                                     disabled={item.quantity <= 1 || isUpdating}
//                                                 >
//                                                     <Minus size={16} />
//                                                 </button>
//                                                 <input
//                                                     type="number"
//                                                     min="1"
//                                                     value={item.quantity}
//                                                     onChange={(e) => handleQuantityChange(item, e.target.value)}
//                                                     className={styles.quantityInput}
//                                                 />
//                                                 <button
//                                                     className={styles.quantityBtn}
//                                                     onClick={() => handleQuantityChange(item, item.quantity + 1)}
//                                                     disabled={isUpdating}
//                                                 >
//                                                     <Plus size={16} />
//                                                 </button>
//                                             </div>
//                                         </div>
//                                     </div>

//                                     <div className={styles.productActions}>
//                                         {/* Ensure item.prix is treated as a number to prevent NaN */}
//                                         <div className={styles.productPrice}>{(Number(item.prix) * item.quantity).toFixed(2)} €</div>
//                                         <button
//                                             className={styles.removeBtn}
//                                             onClick={() => {
//                                                 console.log("Attempting to remove item with ID:", item.id); // Debugging log
//                                                 removeFromCart(item.id);
//                                             }}
//                                             aria-label="Supprimer l'article"
//                                         >
//                                             <Trash2 size={18} />
//                                             <span>Supprimer</span>
//                                         </button>
//                                     </div>
//                                 </div>
//                             )
//                         ))}
//                     </div>

//                     <div className={styles.cartSummary}>
//                         <h2 className={styles.summaryTitle}>Récapitulatif</h2>

//                         <div className={styles.summaryDetails}>
//                             <div className={styles.summaryRow}>
//                                 <span>Sous-total :</span>
//                                 <span>{getCartTotal().toFixed(2)} €</span>
//                             </div>

//                             <div className={styles.summaryRow}>
//                                 <span>TVA incluse de :</span>
//                                 <span>{calculateVAT().toFixed(2)} €</span>
//                             </div>

//                             <div className={styles.summaryRow}>
//                                 <span>Livraison :</span>
//                                 <span className={styles.freeShipping}>GRATUIT</span>
//                             </div>

//                             <div className={`${styles.summaryRow} ${styles.totalRow}`}>
//                                 <span>Total estimé :</span>
//                                 <span>{getCartTotal().toFixed(2)} €</span>
//                             </div>
//                         </div>

//                         <button className={styles.checkoutBtn} onClick={handleProceedToPayment}>
//                             Procéder au paiement
//                         </button>
//                     </div>
//                 </div>
//             </div>
//             {/* Pied de page */}
//             <Footer />
//         </div>
//     );
// }

// export default Cart;