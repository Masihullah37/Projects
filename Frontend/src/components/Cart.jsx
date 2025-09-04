

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

export default Cart;


