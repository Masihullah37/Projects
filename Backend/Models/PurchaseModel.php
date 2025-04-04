


<?php
// require_once(__DIR__ . '/../Config/Database.php');

class PurchaseModel {
    private $conn;

    // Constructeur : initialise la connexion à la base de données
    public function __construct($conn) {
        $this->conn = $conn;
    }

    // Ajoute un achat
    public function addPurchase($user_id, $product_id, $quantity) {
        $sql = "INSERT INTO achats (user_id, product_id, quantity) VALUES (:user_id, :product_id, :quantity)";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([
            ':user_id' => $user_id,
            ':product_id' => $product_id,
            ':quantity' => $quantity
        ]);
        return $stmt->rowCount() > 0;
    }

    // Récupère les achats d'un utilisateur
    public function getPurchases($user_id) {
        $sql = "SELECT p.*, pr.nom AS product_name, pr.prix, pr.image 
                FROM achats p
                JOIN produits pr ON p.product_id = pr.id
                WHERE p.user_id = :user_id";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([':user_id' => $user_id]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
?>