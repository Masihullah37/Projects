<?php

class PaymentModel {
    private $conn;
    
    public function __construct($conn) {
        $this->conn = $conn;
    }

    // Payment methods
    public function createPayment($paymentData) {
        try {
            $query = "INSERT INTO paiements (
                user_id, achat_id, payment_method, payment_status, amount, transaction_id
            ) VALUES (
                :user_id, :achat_id, :payment_method, :payment_status, :amount, :transaction_id
            )";
            
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':user_id', $paymentData['user_id'], PDO::PARAM_INT);
            $stmt->bindParam(':achat_id', $paymentData['achat_id'], PDO::PARAM_INT);
            $stmt->bindParam(':payment_method', $paymentData['payment_method'], PDO::PARAM_STR);
            $stmt->bindParam(':payment_status', $paymentData['payment_status'], PDO::PARAM_STR);
            $stmt->bindParam(':amount', $paymentData['amount'], PDO::PARAM_STR);
            $stmt->bindParam(':transaction_id', $paymentData['transaction_id'], PDO::PARAM_STR);
            
            $stmt->execute();
            return $this->conn->lastInsertId();
            
        } catch (PDOException $e) {
            error_log('Database error creating payment: ' . $e->getMessage());
            error_log('Payment data: ' . print_r($paymentData, true));
            return false;
        }
    }
    
    public function updatePaymentStatus($paymentId, $status) {
        try {
            $query = "UPDATE paiements SET payment_status = :status, updated_at = NOW() WHERE id = :payment_id";
            
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':status', $status, PDO::PARAM_STR);
            $stmt->bindParam(':payment_id', $paymentId, PDO::PARAM_INT);
            
            return $stmt->execute();
            
        } catch (PDOException $e) {
            error_log('Database error updating payment status: ' . $e->getMessage());
            return false;
        }
    }
    
    public function getPaymentById($paymentId) {
        try {
            $query = "SELECT * FROM paiements WHERE id = :payment_id";
            
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':payment_id', $paymentId, PDO::PARAM_INT);
            $stmt->execute();
            
            return $stmt->fetch(PDO::FETCH_ASSOC);
            
        } catch (PDOException $e) {
            error_log('Database error getting payment: ' . $e->getMessage());
            return false;
        }
    }
    
    public function getPaymentByAchatId($achatId) {
        try {
            $query = "SELECT * FROM paiements WHERE achat_id = :achat_id ORDER BY created_at DESC LIMIT 1";
            
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':achat_id', $achatId, PDO::PARAM_INT);
            $stmt->execute();
            
            return $stmt->fetch(PDO::FETCH_ASSOC);
            
        } catch (PDOException $e) {
            error_log('Database error getting payment by achat ID: ' . $e->getMessage());
            return false;
        }
    }
    
    // Purchase methods
    public function getPendingAchatByUserId($userId) {
        try {
            $query = "SELECT * FROM achats WHERE user_id = :user_id AND status = 'pending' ORDER BY created_at DESC LIMIT 1";
            
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':user_id', $userId, PDO::PARAM_INT);
            $stmt->execute();
            
            return $stmt->fetch(PDO::FETCH_ASSOC);
            
        } catch (PDOException $e) {
            error_log('Database error getting pending achat: ' . $e->getMessage());
            return false;
        }
    }
    
    public function getCompletedAchatsByUserId($userId) {
        try {
            $query = "SELECT * FROM achats WHERE user_id = :user_id AND status = 'completed' ORDER BY created_at DESC";
        
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':user_id', $userId, PDO::PARAM_INT);
            $stmt->execute();
        
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        } catch (PDOException $e) {
            error_log('Database error getting completed achats: ' . $e->getMessage());
            return [];
        }
    }
    
    public function createAchat($achatData) {
        try {
            $query = "INSERT INTO achats (
                user_id, total_amount, status
            ) VALUES (
                :user_id, :total_amount, :status
            )";
            
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':user_id', $achatData['user_id'], PDO::PARAM_INT);
            $stmt->bindParam(':total_amount', $achatData['total_amount'], PDO::PARAM_STR);
            $stmt->bindParam(':status', $achatData['status'], PDO::PARAM_STR);
            
            $stmt->execute();
            return $this->conn->lastInsertId();
            
        } catch (PDOException $e) {
            error_log('Database error creating achat: ' . $e->getMessage());
            return false;
        }
    }
    
    public function updateAchatStatus($achatId, $status) {
        try {
            $query = "UPDATE achats SET status = :status, updated_at = NOW() WHERE id = :achat_id";
            
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':status', $status, PDO::PARAM_STR);
            $stmt->bindParam(':achat_id', $achatId, PDO::PARAM_INT);
            
            return $stmt->execute();
            
        } catch (PDOException $e) {
            error_log('Database error updating achat status: ' . $e->getMessage());
            return false;
        }
    }
    
    public function getAchatById($achatId) {
        try {
            $query = "SELECT * FROM achats WHERE id = :achat_id";
            
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':achat_id', $achatId, PDO::PARAM_INT);
            $stmt->execute();
            
            return $stmt->fetch(PDO::FETCH_ASSOC);
            
        } catch (PDOException $e) {
            error_log('Database error getting achat: ' . $e->getMessage());
            return false;
        }
    }
    
    // Purchase items methods
    public function addAchatItem($achatItemData) {
        try {
            $query = "INSERT INTO achats_items (
                achat_id, product_id, quantity, price
            ) VALUES (
                :achat_id, :product_id, :quantity, :price
            )";
            
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':achat_id', $achatItemData['achat_id'], PDO::PARAM_INT);
            $stmt->bindParam(':product_id', $achatItemData['product_id'], PDO::PARAM_INT);
            $stmt->bindParam(':quantity', $achatItemData['quantity'], PDO::PARAM_INT);
            $stmt->bindParam(':price', $achatItemData['price'], PDO::PARAM_STR);
            
            return $stmt->execute();
            
        } catch (PDOException $e) {
            error_log('Database error adding achat item: ' . $e->getMessage());
            return false;
        }
    }
    
    public function getAchatItems($achatId) {
        try {
            $query = "SELECT ai.*, p.nom, p.description, p.image 
                      FROM achats_items ai
                      JOIN produits p ON ai.product_id = p.id
                      WHERE ai.achat_id = :achat_id";
            
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':achat_id', $achatId, PDO::PARAM_INT);
            $stmt->execute();
            
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
            
        } catch (PDOException $e) {
            error_log('Database error getting achat items: ' . $e->getMessage());
            return [];
        }
    }
    
    // Get product details for cart items
    public function getProductDetails($productIds) {
        try {
            if (empty($productIds)) {
                return [];
            }
            
            $placeholders = implode(',', array_fill(0, count($productIds), '?'));
            
            $query = "SELECT * FROM produits WHERE id IN ($placeholders)";
            $stmt = $this->conn->prepare($query);
            
            // Bind each product ID to its placeholder
            foreach ($productIds as $index => $id) {
                $stmt->bindValue($index + 1, $id, PDO::PARAM_INT);
            }
            
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
            
        } catch (PDOException $e) {
            error_log('Database error getting product details: ' . $e->getMessage());
            return [];
        }
    }
    
    // Shipping address methods
    public function addShippingAddress($addressData) {
        try {
            $query = "INSERT INTO adresses_livraison (
                paiement_id, nom, adresse_ligne1, adresse_ligne2, ville, departement, code_postal, pays, telephone
            ) VALUES (
                :paiement_id, :nom, :adresse_ligne1, :adresse_ligne2, :ville, :departement, :code_postal, :pays, :telephone
            )";
            
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':paiement_id', $addressData['paiement_id'], PDO::PARAM_INT);
            $stmt->bindParam(':nom', $addressData['nom'], PDO::PARAM_STR);
            $stmt->bindParam(':adresse_ligne1', $addressData['adresse_ligne1'], PDO::PARAM_STR);
            $stmt->bindParam(':adresse_ligne2', $addressData['adresse_ligne2'], PDO::PARAM_STR);
            $stmt->bindParam(':ville', $addressData['ville'], PDO::PARAM_STR);
            $stmt->bindParam(':departement', $addressData['departement'], PDO::PARAM_STR);
            $stmt->bindParam(':code_postal', $addressData['code_postal'], PDO::PARAM_STR);
            $stmt->bindParam(':pays', $addressData['pays'], PDO::PARAM_STR);
            $stmt->bindParam(':telephone', $addressData['telephone'], PDO::PARAM_STR);
            
            return $stmt->execute();
            
        } catch (PDOException $e) {
            error_log('Database error adding shipping address: ' . $e->getMessage());
            return false;
        }
    }
    
    public function getShippingAddressByPaymentId($paymentId) {
        try {
            $query = "SELECT * FROM adresses_livraison WHERE paiement_id = :paiement_id";
            
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':paiement_id', $paymentId, PDO::PARAM_INT);
            $stmt->execute();
            
            return $stmt->fetch(PDO::FETCH_ASSOC);
            
        } catch (PDOException $e) {
            error_log('Database error getting shipping address: ' . $e->getMessage());
            return false;
        }
    }
}
?>



