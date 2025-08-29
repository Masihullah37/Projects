/* eslint-disable react/no-unescaped-entities */


import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import styles from "../styles/PurchaseHistory.module.css";
import { fetchApi } from "../config/api";
import { toast } from "react-toastify"; // Import toast for messages

function PurchaseHistory() {
  // Get both 'user' and 'logout' from AuthContext
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!user) {
      navigate("/login");
      return;
    }

    // Fetch purchase history
    const fetchPurchaseHistory = async () => {
      try {
        console.log("Fetching purchase history for user ID:", user.id);

        const data = await fetchApi('get_purchase_history', {
          method: 'GET',
          // credentials: 'include' // 🔐 Include the session cookie
        });

        console.log("Parsed purchase history data:", data);

        if (!data.success) {
          throw new Error(data.message || "API call failed with an unknown error.");
        }

        setPurchases(data.data.purchases || []);

      } catch (error) {
        console.error("Error fetching purchase history:", error);
        
        // 🚨 IMPORTANT: If the user is unauthorized, log them out
        if (error.message.includes("Unauthorized")) {
          toast.error("Votre session a expiré. Veuillez vous reconnecter.");
          logout(); // Call the logout function from AuthContext
          navigate("/login"); // Navigate to login page
        } else {
          setError(error.message);
        }

      } finally {
        setLoading(false);
      }
    };

    fetchPurchaseHistory();
  }, [user, navigate, logout]); // Add 'logout' to the dependency array

  if (!user) {
    return null; // Don't render anything while redirecting
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
                {purchase.items && purchase.items.length > 0 ? (
                  purchase.items.map((item, index) => (
                    <div key={item.id || index} className={styles.purchaseItem}>
                      <div className={styles.itemImageContainer}>
                        {item.product_image ? (
                          <img
                            src={`/images/${item.product_image}`}
                            alt={item.product_name}
                            className={styles.itemImage}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "/images/placeholder.png";
                            }}
                          />
                        ) : (
                          <div className={styles.noImage}>Pas d'image</div>
                        )}
                      </div>
                      <div className={styles.itemDetails}>
                        <span className={styles.itemName}>{item.product_name}</span>
                        <span className={styles.itemQuantity}>Quantité: {item.quantity}</span>
                      </div>
                      <div className={styles.itemPrice}>{(parseFloat(item.price) * item.quantity).toFixed(2)} €</div>
                    </div>
                  ))
                ) : (
                  <div className={styles.noItemsMessage}>Aucun article pour cette commande.</div>
                )}
              </div>
              <div className={styles.purchaseFooter}>
                <div className={styles.purchaseTotal}>
                  <span>Total:</span>
                  <span className={styles.totalAmount}>{parseFloat(purchase.total_amount).toFixed(2)} €</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PurchaseHistory;