


<?php
// // require_once(__DIR__ . '/../Config/Database.php');

// class PurchaseModel {
//     private $conn;

//     // Constructeur : initialise la connexion à la base de données
//     public function __construct($conn) {
//         $this->conn = $conn;
//     }

//     // Ajoute un achat
//     public function addPurchase($user_id, $product_id, $quantity) {
//         $sql = "INSERT INTO achats (user_id, product_id, quantity) VALUES (:user_id, :product_id, :quantity)";
//         $stmt = $this->conn->prepare($sql);
//         $stmt->execute([
//             ':user_id' => $user_id,
//             ':product_id' => $product_id,
//             ':quantity' => $quantity
//         ]);
//         return $stmt->rowCount() > 0;
//     }

//     // Récupère les achats d'un utilisateur
//     public function getPurchases($user_id) {
//         $sql = "SELECT p.*, pr.nom AS product_name, pr.prix, pr.image 
//                 FROM achats p
//                 JOIN produits pr ON p.product_id = pr.id
//                 WHERE p.user_id = :user_id";
//         $stmt = $this->conn->prepare($sql);
//         $stmt->execute([':user_id' => $user_id]);
//         return $stmt->fetchAll(PDO::FETCH_ASSOC);
//     }
// }

require_once(__DIR__ . '/../Config/Database.php');
require_once(__DIR__ . '/ProductModel.php'); // Ensure ProductModel is available to get product price

class PurchaseModel {
    private $conn;
    private $productModel; // Instance of ProductModel

    // Constructor: initializes the database connection and ProductModel
    public function __construct($conn) {
        $this->conn = $conn;
        $this->productModel = new ProductModel($conn);
    }

    
    
    public function addPurchase($user_id, $product_id, $quantity) {
        try {
            // 1. Get product price from ProductModel
            $product = $this->productModel->getProductById($product_id);
            if (!$product) {
                error_log("DEBUG: PurchaseModel - addPurchase: Product not found for ID: " . $product_id);
                throw new RuntimeException("Product not found.", 404);
            }
            $price = (float)$product['prix']; // Ensure price is a float

            // 2. Find or create a pending achat (cart) for the user
            $achat_id = null;
            $query = "SELECT id FROM achats WHERE user_id = :user_id AND status = 'pending'";
            $stmt = $this->conn->prepare($query);
            $stmt->execute([':user_id' => $user_id]);
            $pendingAchat = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($pendingAchat) {
                $achat_id = $pendingAchat['id'];
                error_log("DEBUG: PurchaseModel - Found existing pending achat (cart) for user " . $user_id . ": " . $achat_id);
            } else {
                // Create a new pending achat (cart)
                // 'achats' table has created_at and updated_at, so keep them.
                $insertAchatQuery = "INSERT INTO achats (user_id, total_amount, status, created_at, updated_at) VALUES (:user_id, 0, 'pending', NOW(), NOW())";
                $insertAchatStmt = $this->conn->prepare($insertAchatQuery);
                $insertAchatStmt->execute([':user_id' => $user_id]);
                $achat_id = $this->conn->lastInsertId();
                if (!$achat_id) {
                    throw new RuntimeException("Failed to create new pending achat (cart).");
                }
                error_log("DEBUG: PurchaseModel - Created new pending achat (cart) for user " . $user_id . ": " . $achat_id);
            }

            // 3. Use INSERT ... ON DUPLICATE KEY UPDATE for achats_items
            // This query will insert a new row if (achat_id, product_id) is unique,
            // or update the quantity and price if it already exists.
            $upsertItemQuery = "
                INSERT INTO achats_items (achat_id, product_id, quantity, price, created_at)
                VALUES (:achat_id, :product_id, :quantity, :price, NOW())
                ON DUPLICATE KEY UPDATE
                    quantity = quantity + VALUES(quantity), -- Add the new quantity to existing
                    price = VALUES(price);                  -- Update price to the latest product price
            ";
            $upsertItemStmt = $this->conn->prepare($upsertItemQuery);
            $upsertItemStmt->execute([
                ':achat_id' => $achat_id,
                ':product_id' => (int)$product_id, // Ensure product_id is int
                ':quantity' => (int)$quantity,     // Ensure quantity is int
                ':price' => $price
            ]);
            error_log("DEBUG: PurchaseModel - Upserted item for product " . $product_id . " into achat " . $achat_id);

            // 4. Update the total_amount in the main achats table
            // 'achats' table has updated_at, so keep it here.
            // CRITICAL FIX: Use distinct named parameters for each occurrence in the query
            $updateTotalQuery = "UPDATE achats SET total_amount = (SELECT COALESCE(SUM(quantity * price), 0) FROM achats_items WHERE achat_id = :sub_achat_id), updated_at = NOW() WHERE id = :main_achat_id";
            $updateTotalStmt = $this->conn->prepare($updateTotalQuery);
            $updateTotalStmt->execute([
                ':sub_achat_id' => $achat_id,
                ':main_achat_id' => $achat_id
            ]);
            error_log("DEBUG: PurchaseModel - Updated total_amount for achat: " . $achat_id);

            return ["success" => true, "message" => "Produit ajouté au panier avec succès", "data" => ["achat_id" => $achat_id]];

        } catch (RuntimeException $e) {
            error_log("ERROR: PurchaseModel Runtime Error in addPurchase: " . $e->getMessage());
            return ["success" => false, "message" => $e->getMessage(), "error" => "RUNTIME_ERROR"];
        } catch (PDOException $e) {
            error_log("ERROR: PurchaseModel PDO Error in addPurchase: " . $e->getMessage());
            return ["success" => false, "message" => "Erreur base de données: " . $e->getMessage(), "error" => "DATABASE_ERROR"];
        }
    }


    /**
     * Retrieves the purchase history for the authenticated user.
     * This method correctly fetches purchases and their associated items.
     *
     * @param int $user_id The ID of the user.
     * @return array An array of purchase records, each with its items.
     */
    public function getPurchaseHistory($user_id) {
        try {
            // Fetch completed purchases for the user
            $query = "SELECT id, user_id, total_amount, status, created_at, updated_at FROM achats WHERE user_id = :user_id AND status = 'completed' ORDER BY created_at DESC";
            $stmt = $this->conn->prepare($query);
            $stmt->execute([':user_id' => $user_id]);
            $achats = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Fetch items for each purchase
            foreach ($achats as &$achat) {
                // The achats_items table does not have 'updated_at', so we don't select it here.
                // Assuming 'product_name', 'product_description', 'product_image', 'product_price' come from 'produits' table.
                $itemsQuery = "SELECT ai.id, ai.achat_id, ai.product_id, ai.quantity, ai.price, ai.created_at, 
                                p.nom AS product_name, p.description AS product_description, p.image AS product_image, p.prix AS product_price
                                FROM achats_items ai
                                JOIN produits p ON ai.product_id = p.id
                                WHERE ai.achat_id = :achat_id";
                $itemsStmt = $this->conn->prepare($itemsQuery);
                $itemsStmt->execute([':achat_id' => $achat['id']]);
                $achat['items'] = $itemsStmt->fetchAll(PDO::FETCH_ASSOC);
            }

            error_log("DEBUG: PurchaseModel - Fetched " . count($achats) . " completed achats for user " . $user_id);
            return $achats;

        } catch (PDOException $e) {
            error_log("ERROR: Database error in getPurchaseHistory: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Retrieves the current pending achat (cart) for a user.
     * @param int $user_id The ID of the user.
     * @return array|false The pending achat data, or false if none exists.
     */
    public function getPendingAchat($user_id) {
        $query = "SELECT id, total_amount FROM achats WHERE user_id = :user_id AND status = 'pending'";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([':user_id' => $user_id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /**
     * Retrieves all items for a given achat_id.
     * @param int $achat_id The ID of the achat.
     * @return array An array of achat items.
     */
    public function getAchatItems($achat_id) {
        // Updated to reflect no 'updated_at' in achats_items
        $query = "SELECT ai.id, ai.achat_id, ai.product_id, ai.quantity, ai.price, ai.created_at, 
                          p.nom AS product_name, p.description AS product_description, p.image AS product_image, p.prix AS product_price
                  FROM achats_items ai
                  JOIN produits p ON ai.product_id = p.id
                  WHERE ai.achat_id = :achat_id";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([':achat_id' => $achat_id]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Updates the status of an achat.
     * @param int $achatId The ID of the achat to update.
     * @param string $status The new status (e.g., 'completed', 'cancelled').
     * @return bool True on success, false on failure.
     */
    public function updateAchatStatus($achatId, $status) {
        try {
            // 'achats' table has updated_at, so keep it here.
            $query = "UPDATE achats SET status = :status, updated_at = NOW() WHERE id = :achat_id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':status', $status, PDO::PARAM_STR);
            $stmt->bindParam(':achat_id', $achatId, PDO::PARAM_INT);
            return $stmt->execute();
        } catch (PDOException $e) {
            error_log('Error updating achat status in PurchaseModel: ' . $e->getMessage());
            return false;
        }
    }


 public function updateAchatTotalAmount($achatId) {
        try {
            $query = "UPDATE achats
                      SET total_amount = (SELECT COALESCE(SUM(quantity * price), 0) FROM achats_items WHERE achat_id = :sub_achat_id),
                          updated_at = NOW()
                      WHERE id = :main_achat_id";

            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':sub_achat_id', $achatId, PDO::PARAM_INT);
            $stmt->bindParam(':main_achat_id', $achatId, PDO::PARAM_INT);
            
            error_log("DEBUG: PurchaseModel - updateAchatTotalAmount executing for achat_id: " . $achatId);

            return $stmt->execute();
        } catch (PDOException $e) {
            error_log("ERROR: Database error in updateAchatTotalAmount for achat_id " . $achatId . ": " . $e->getMessage());
            return false;
        }
    }

}

?>