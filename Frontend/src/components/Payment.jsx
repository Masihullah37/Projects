

// Import des dépendances nécessaires
import { useContext, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { CartContext } from "../context/CartContext"
import { AuthContext } from "../App"
import { loadStripe } from "@stripe/stripe-js"
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js"
import { Check, AlertCircle } from "react-feather"
import styles from "../styles/Payment.module.css"

// Initialisation de Stripe avec la clé publique de test
const stripePromise = loadStripe(
  "pk_test_51R5QYu01MWrQZStFZ5rZBQOhWJHDc7WfitDzqq36IcmI8dmpb7xrVmbLyh8eKqoyV5Kmqae4jCP7X5x2Si7J7ncm00xlD0n5g0",
)

function Payment() {
  // Récupération du contexte du panier et d'authentification
  const { cartItems, getCartTotal, clearCart } = useContext(CartContext)
  const { user } = useContext(AuthContext)
  const navigate = useNavigate()

  // Redirection si l'utilisateur n'est pas connecté
  useEffect(() => {
    if (!user) {
      navigate("/login")
    }
  }, [user, navigate])

  // Ne rien afficher pendant la redirection
  if (!user || cartItems.length === 0) {
    return null
  }

  return (
    <div className={styles.paymentContainer}>
      <h1 className={styles.paymentTitle}>Finaliser votre commande</h1>

      <div className={styles.paymentContent}>
        {/* Formulaire d'adresse et de paiement */}
        <div className={styles.addressFormContainer}>
          <h2 className={styles.sectionTitle}>Adresse de livraison</h2>

          {/* Intégration de Stripe */}
          <Elements stripe={stripePromise}>
            <CheckoutForm
              amount={getCartTotal()}
              cartItems={cartItems}
              user={user}
              clearCart={clearCart}
              navigate={navigate}
            />
          </Elements>
        </div>

        {/* Récapitulatif de la commande */}
        <div className={styles.orderSummaryContainer}>
          <OrderSummary cartItems={cartItems} total={getCartTotal()} />
        </div>
      </div>
    </div>
  )
}

// Composant pour le formulaire de paiement
function CheckoutForm({ amount, cartItems, user, clearCart, navigate }) {
  // Initialisation de Stripe
  const stripe = useStripe()
  const elements = useElements()
  
  // États pour gérer le processus de paiement
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState({ status: "", message: "" })
  
  // Données du formulaire avec valeurs par défaut
  const [formData, setFormData] = useState({
    fullName: user?.nom ? `${user.nom} ${user.prenom}` : "",
    email: user?.email || "",
    phone: user?.telephone || "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "France",
    sameAsBilling: true,
  })
  
  // Gestion des erreurs de formulaire
  const [formErrors, setFormErrors] = useState({})

  // Gestion des changements dans les champs du formulaire
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    })

    // Effacer l'erreur quand le champ est modifié
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: "",
      })
    }
  }

  // Validation du formulaire
  const validateForm = () => {
    const errors = {}
    const requiredFields = ["fullName", "email", "phone", "addressLine1", "city", "state", "postalCode", "country"]

    // Vérification des champs requis
    requiredFields.forEach((field) => {
      if (!formData[field]) {
        errors[field] = "Ce champ est requis"
      }
    })

    // Validation de l'email
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Adresse email invalide"
    }

    // Validation du téléphone
    if (formData.phone && !/^[0-9+\s()-]{8,15}$/.test(formData.phone)) {
      errors.phone = "Numéro de téléphone invalide"
    }

    // Validation du code postal pour la France
    if (formData.country === "France" && formData.postalCode && !/^[0-9]{5}$/.test(formData.postalCode)) {
      errors.postalCode = "Code postal invalide (5 chiffres)"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Création ou récupération d'un achat existant
  const getOrCreateAchat = async (userId) => {
    try {
      console.log("Envoi des articles au backend:", cartItems)

      // Formatage des articles du panier
      const formattedCartItems = cartItems.map((item) => ({
        id: item.id,
        quantity: item.quantity,
      }))

      const response = await fetch(`http://localhost/IT_Repairs/Backend/routes.php?action=get_or_create_achat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId,
          cart_items: formattedCartItems,
        }),
      })

      if (!response.ok) {
        throw new Error(`Erreur HTTP! statut: ${response.status}`)
      }

      const result = await response.json()
      console.log("Résultat de création d'achat:", result)

      if (result.error) {
        throw new Error(result.error)
      }

      return result.achat_id
    } catch (error) {
      console.error("Erreur lors de la création de l'achat:", error)
      throw error
    }
  }

  // Soumission du formulaire de paiement
  const handleSubmit = async (e) => {
    e.preventDefault()

    // Vérification que Stripe est chargé
    if (!stripe || !elements) {
      return
    }

    // Validation du formulaire
    if (!validateForm()) {
      setPaymentStatus({
        status: "error",
        message: "Veuillez corriger les erreurs dans le formulaire",
      })
      return
    }

    try {
      setIsProcessing(true)
      setPaymentStatus({ status: "", message: "" })

      // Récupération de l'élément de carte
      const cardElement = elements.getElement(CardElement)

      if (!cardElement) {
        throw new Error("Élément de carte non trouvé")
      }

      // Création d'une méthode de paiement
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: "card",
        card: cardElement,
      })

      if (error) {
        throw new Error(error.message)
      }

      // Création ou récupération d'un achat
      const achatId = await getOrCreateAchat(user.id)

      // Préparation des données de paiement
      const paymentData = {
        user_id: user.id,
        achat_id: achatId,
        amount: amount,
        stripe_payment_method_id: paymentMethod.id,
        shipping_address: {
          name: formData.fullName,
          address_line1: formData.addressLine1,
          address_line2: formData.addressLine2 || "",
          city: formData.city,
          state: formData.state,
          postal_code: formData.postalCode,
          country: formData.country,
          phone: formData.phone,
        },
      }

      console.log("Envoi des données de paiement:", paymentData)

      // Appel au backend pour traiter le paiement
      const response = await fetch("http://localhost/IT_Repairs/Backend/routes.php?action=add_payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(paymentData),
      })

      const result = await response.json()
      console.log("Résultat du paiement:", result)

      if (result.error) {
        throw new Error(result.error)
      }

      // Confirmation du paiement avec Stripe
      const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(result.client_secret, {
        payment_method: paymentMethod.id,
      })

      if (confirmError) {
        throw new Error(confirmError.message)
      }

      console.log("Paiement confirmé:", paymentIntent)

      // Mise à jour du statut du paiement
      const updateResponse = await fetch(
        "http://localhost/IT_Repairs/Backend/routes.php?action=update_payment_status",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            payment_id: result.payment_id,
            status: paymentIntent.status,
          }),
        },
      )

      const updateResult = await updateResponse.json()
      console.log("Résultat de mise à jour:", updateResult)

      if (updateResult.error) {
        console.error("Erreur de mise à jour:", updateResult.error)
      }

      // Affichage du message de succès
      setPaymentStatus({
        status: "success",
        message: "Paiement réussi! Votre commande a été confirmée.",
      })

      // Vidage du panier et redirection après 3 secondes
      setTimeout(() => {
        clearCart()
        console.log("Redirection vers l'historique...")
        navigate("/purchase-history")
      }, 3000)
    } catch (error) {
      console.error("Erreur de paiement:", error)
      setPaymentStatus({
        status: "error",
        message: error.message || "Une erreur est survenue lors du traitement du paiement. Veuillez réessayer.",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  // Rendu du formulaire
  return (
    <form onSubmit={handleSubmit} className={styles.checkoutForm}>
      {/* Section informations personnelles */}
      <div className={styles.formSection}>
        <div className={styles.formGroup}>
          <label htmlFor="fullName">Nom complet *</label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            value={formData.fullName}
            onChange={handleInputChange}
            className={formErrors.fullName ? styles.inputError : ""}
          />
          {formErrors.fullName && <div className={styles.errorMessage}>{formErrors.fullName}</div>}
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="email">Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={formErrors.email ? styles.inputError : ""}
            />
            {formErrors.email && <div className={styles.errorMessage}>{formErrors.email}</div>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="phone">Téléphone *</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className={formErrors.phone ? styles.inputError : ""}
            />
            {formErrors.phone && <div className={styles.errorMessage}>{formErrors.phone}</div>}
          </div>
        </div>

        {/* Section adresse */}
        <div className={styles.formGroup}>
          <label htmlFor="addressLine1">Adresse *</label>
          <input
            type="text"
            id="addressLine1"
            name="addressLine1"
            value={formData.addressLine1}
            onChange={handleInputChange}
            className={formErrors.addressLine1 ? styles.inputError : ""}
          />
          {formErrors.addressLine1 && <div className={styles.errorMessage}>{formErrors.addressLine1}</div>}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="addressLine2">Complément d'adresse</label>
          <input
            type="text"
            id="addressLine2"
            name="addressLine2"
            value={formData.addressLine2}
            onChange={handleInputChange}
          />
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="city">Ville *</label>
            <input
              type="text"
              id="city"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              className={formErrors.city ? styles.inputError : ""}
            />
            {formErrors.city && <div className={styles.errorMessage}>{formErrors.city}</div>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="state">Département *</label>
            <input
              type="text"
              id="state"
              name="state"
              value={formData.state}
              onChange={handleInputChange}
              className={formErrors.state ? styles.inputError : ""}
            />
            {formErrors.state && <div className={styles.errorMessage}>{formErrors.state}</div>}
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="postalCode">Code postal *</label>
            <input
              type="text"
              id="postalCode"
              name="postalCode"
              value={formData.postalCode}
              onChange={handleInputChange}
              className={formErrors.postalCode ? styles.inputError : ""}
            />
            {formErrors.postalCode && <div className={styles.errorMessage}>{formErrors.postalCode}</div>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="country">Pays *</label>
            <select
              id="country"
              name="country"
              value={formData.country}
              onChange={handleInputChange}
              className={formErrors.country ? styles.inputError : ""}
            >
              <option value="France">France</option>
              <option value="Belgique">Belgique</option>
              <option value="Suisse">Suisse</option>
              <option value="Luxembourg">Luxembourg</option>
              <option value="Canada">Canada</option>
              <option value="Autre">Autre</option>
            </select>
            {formErrors.country && <div className={styles.errorMessage}>{formErrors.country}</div>}
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.checkboxLabel}>
            <input type="checkbox" name="sameAsBilling" checked={formData.sameAsBilling} onChange={handleInputChange} />
            <span>L'adresse de facturation est identique à l'adresse de livraison</span>
          </label>
        </div>
      </div>

      {/* Section paiement */}
      <div className={styles.formSection}>
        <h2 className={styles.sectionTitle}>Méthode de paiement</h2>

        <div className={styles.paymentMethodContainer}>
          <div className={styles.cardElementContainer}>
            <label htmlFor="card-element">Carte de crédit / débit *</label>
            <CardElement
              id="card-element"
              options={{
                style: {
                  base: {
                    fontSize: "16px",
                    color: "#424770",
                    "::placeholder": {
                      color: "#aab7c4",
                    },
                  },
                  invalid: {
                    color: "#9e2146",
                  },
                },
              }}
            />
          </div>

          <div className={styles.securePaymentNote}>
            <div className={styles.secureIcon}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </div>
            <span>Paiement sécurisé par Stripe</span>
          </div>
        </div>

        {/* Affichage du statut du paiement */}
        {paymentStatus.status && (
          <div className={`${styles.paymentStatusMessage} ${styles[paymentStatus.status]}`}>
            {paymentStatus.status === "success" ? (
              <Check size={20} className={styles.statusIcon} />
            ) : (
              <AlertCircle size={20} className={styles.statusIcon} />
            )}
            <span>{paymentStatus.message}</span>
          </div>
        )}

        {/* Boutons d'action */}
        <div className={styles.formActions}>
          <button type="button" className={styles.backButton} onClick={() => navigate("/cart")} disabled={isProcessing}>
            Retour au panier
          </button>

          <button type="submit" className={styles.payButton} disabled={!stripe || isProcessing}>
            {isProcessing ? (
              <>
                <div className={styles.spinner}></div>
                <span>Traitement en cours...</span>
              </>
            ) : (
              `Payer ${amount.toFixed(2)} €`
            )}
          </button>
        </div>
      </div>
    </form>
  )
}

// Composant pour le récapitulatif de commande
function OrderSummary({ cartItems, total }) {
  // Calcul de la TVA (20%)
  const vat = total * 0.2

  return (
    <div className={styles.orderSummary}>
      <h2 className={styles.summaryTitle}>Récapitulatif de la commande</h2>

      <div className={styles.orderItems}>
        {cartItems.map((item) => (
          <div key={item.id} className={styles.orderItem}>
            <div className={styles.itemInfo}>
              <span className={styles.itemName}>{item.nom}</span>
              <span className={styles.itemQuantity}>x{item.quantity}</span>
            </div>
            <span className={styles.itemPrice}>{(item.prix * item.quantity).toFixed(2)} €</span>
          </div>
        ))}
      </div>

      <div className={styles.summaryDetails}>
        <div className={styles.summaryRow}>
          <span>Sous-total :</span>
          <span>{total.toFixed(2)} €</span>
        </div>

        <div className={styles.summaryRow}>
          <span>TVA incluse de :</span>
          <span>{vat.toFixed(2)} €</span>
        </div>

        <div className={styles.summaryRow}>
          <span>Livraison :</span>
          <span className={styles.freeShipping}>GRATUIT</span>
        </div>

        <div className={`${styles.summaryRow} ${styles.totalRow}`}>
          <span>Total :</span>
          <span>{total.toFixed(2)} €</span>
        </div>
      </div>
    </div>
  )
}

export default Payment

