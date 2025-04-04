

<?php


class ProductModel {
    private $conn;
    
    public function __construct($conn) {
        $this->conn = $conn;
    }
    
    public function getProducts() {
        try {
            $query = "SELECT * FROM produits WHERE stock > 0";
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log('Database error getting products: ' . $e->getMessage());
            return [];
        }
    }
    
    public function getAllProducts() {
        try {
            $query = "SELECT * FROM produits";
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log('Database error getting all products: ' . $e->getMessage());
            return [];
        }
    }
    
    public function getProductById($productId) {
        try {
            $query = "SELECT * FROM produits WHERE id = :id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id', $productId, PDO::PARAM_INT);
            $stmt->execute();
            
            return $stmt->fetch(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log('Database error getting product: ' . $e->getMessage());
            return false;
        }
    }
    
    public function reduceStock($productId, $quantity) {
        try {
            // First, check current stock
            $query = "SELECT stock FROM produits WHERE id = :id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id', $productId, PDO::PARAM_INT);
            $stmt->execute();
            
            $product = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$product) {
                error_log('Product not found: ' . $productId);
                return false;
            }
            
            // Calculate new stock level
            $newStock = max(0, $product['stock'] - $quantity);
            
            // Update stock
            $updateQuery = "UPDATE produits SET stock = :stock WHERE id = :id";
            $updateStmt = $this->conn->prepare($updateQuery);
            $updateStmt->bindParam(':stock', $newStock, PDO::PARAM_INT);
            $updateStmt->bindParam(':id', $productId, PDO::PARAM_INT);
            
            return $updateStmt->execute();
        } catch (PDOException $e) {
            error_log('Database error reducing stock: ' . $e->getMessage());
            return false;
        }
    }
    
    public function addProduct($productData) {
        try {
            $query = "INSERT INTO produits (nom, description, prix, stock, image) 
                      VALUES (:nom, :description, :prix, :stock, :image)";
            
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':nom', $productData['nom'], PDO::PARAM_STR);
            $stmt->bindParam(':description', $productData['description'], PDO::PARAM_STR);
            $stmt->bindParam(':prix', $productData['prix'], PDO::PARAM_STR);
            $stmt->bindParam(':stock', $productData['stock'], PDO::PARAM_INT);
            $stmt->bindParam(':image', $productData['image'], PDO::PARAM_STR);
            
            $stmt->execute();
            return $this->conn->lastInsertId();
        } catch (PDOException $e) {
            error_log('Database error adding product: ' . $e->getMessage());
            return false;
        }
    }
    
    public function updateProduct($productId, $productData) {
        try {
            $query = "UPDATE produits 
                      SET nom = :nom, 
                          description = :description, 
                          prix = :prix, 
                          stock = :stock";
            
            // Only update image if provided
            if (!empty($productData['image'])) {
                $query .= ", image = :image";
            }
            
            $query .= " WHERE id = :id";
            
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':nom', $productData['nom'], PDO::PARAM_STR);
            $stmt->bindParam(':description', $productData['description'], PDO::PARAM_STR);
            $stmt->bindParam(':prix', $productData['prix'], PDO::PARAM_STR);
            $stmt->bindParam(':stock', $productData['stock'], PDO::PARAM_INT);
            $stmt->bindParam(':id', $productId, PDO::PARAM_INT);
            
            if (!empty($productData['image'])) {
                $stmt->bindParam(':image', $productData['image'], PDO::PARAM_STR);
            }
            
            return $stmt->execute();
        } catch (PDOException $e) {
            error_log('Database error updating product: ' . $e->getMessage());
            return false;
        }
    }
    
    public function deleteProduct($productId) {
        try {
            $query = "DELETE FROM produits WHERE id = :id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id', $productId, PDO::PARAM_INT);
            
            return $stmt->execute();
        } catch (PDOException $e) {
            error_log('Database error deleting product: ' . $e->getMessage());
            return false;
        }
    }
}
?>


