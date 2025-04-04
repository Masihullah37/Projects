

import { useContext, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { AuthContext } from "../App"
import styles from "../styles/PurchaseHistory.module.css"

function PurchaseHistory() {
  const { user } = useContext(AuthContext)
  const navigate = useNavigate()
  const [purchases, setPurchases] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!user) {
      navigate("/login")
      return
    }

    // Fetch purchase history
    const fetchPurchaseHistory = async () => {
      try {
        console.log("Fetching purchase history for user ID:", user.id)

        const response = await fetch(
          `http://localhost/IT_Repairs/Backend/routes.php?action=get_purchase_history&user_id=${user.id}`,
        )

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const responseText = await response.text()
        console.log("Raw response:", responseText)

        let data
        try {
          data = JSON.parse(responseText)
        } catch (e) {
          console.error("Error parsing JSON:", e)
          throw new Error("Invalid JSON response from server")
        }

        console.log("Parsed purchase history data:", data)

        if (data.error) {
          throw new Error(data.error)
        }

        setPurchases(data.purchases || [])
      } catch (error) {
        console.error("Error fetching purchase history:", error)
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    fetchPurchaseHistory()
  }, [user, navigate])

  if (!user) {
    return null // Don't render anything while redirecting
  }

  return (
    <div className={styles.historyContainer}>
      <h1 className={styles.historyTitle}>Historique des achats</h1>

      {loading ? (
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Chargement de votre historique...</p>
        </div>
      ) : error ? (
        <div className={styles.errorContainer}>
          <p className={styles.errorMessage}>Une erreur est survenue lors du chargement de votre historique: {error}</p>
          <button className={styles.retryButton} onClick={() => window.location.reload()}>
            Réessayer
          </button>
        </div>
      ) : purchases.length === 0 ? (
        <div className={styles.emptyHistoryContainer}>
          <p className={styles.emptyHistoryMessage}>Vous n'avez pas encore effectué d'achat.</p>
          <button className={styles.shopButton} onClick={() => navigate("/")}>
            Commencer vos achats
          </button>
        </div>
      ) : (
        <div className={styles.purchasesContainer}>
          {purchases.map((purchase) => (
            <div key={purchase.achat_id} className={styles.purchaseCard}>
              <div className={styles.purchaseHeader}>
                <div className={styles.purchaseInfo}>
                  <span className={styles.purchaseId}>Commande #{purchase.achat_id}</span>
                  <span className={styles.purchaseDate}>
                    {new Date(purchase.date).toLocaleDateString("fr-FR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <div className={styles.purchaseStatus}>
                  <span
                    className={`${styles.statusBadge} ${
                      purchase.status === "completed"
                        ? styles.statusCompleted
                        : purchase.status === "cancelled"
                          ? styles.statusCancelled
                          : styles.statusPending
                    }`}
                  >
                    {purchase.status === "completed"
                      ? "Complétée"
                      : purchase.status === "cancelled"
                        ? "Annulée"
                        : "En attente"}
                  </span>
                </div>
              </div>

              <div className={styles.purchaseItems}>
                {purchase.items &&
                  purchase.items.map((item, index) => (
                    <div key={index} className={styles.purchaseItem}>
                      <div className={styles.itemImageContainer}>
                        {item.image ? (
                          <img
                            src={`/images/${item.image}`}
                            alt={item.nom}
                            className={styles.itemImage}
                            onError={(e) => {
                              e.target.onerror = null
                              e.target.src = "/images/placeholder.png"
                            }}
                          />
                        ) : (
                          <div className={styles.noImage}>Pas d'image</div>
                        )}
                      </div>
                      <div className={styles.itemDetails}>
                        <span className={styles.itemName}>{item.nom}</span>
                        <span className={styles.itemQuantity}>Quantité: {item.quantity}</span>
                      </div>
                      <div className={styles.itemPrice}>{(item.price * item.quantity).toFixed(2)} €</div>
                    </div>
                  ))}
              </div>

              <div className={styles.purchaseFooter}>
                <div className={styles.purchaseTotal}>
                  <span>Total:</span>
                  <span className={styles.totalAmount}>{purchase.total_amount} €</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default PurchaseHistory

