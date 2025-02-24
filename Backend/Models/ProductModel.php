

<?php
require_once(__DIR__ . '/../Config/Database.php');

class ProductModel {
    private $conn;

    // Constructeur : initialise la connexion à la base de données
    public function __construct($conn) {
        $this->conn = $conn;
    }

    // Ajouter un produit
    public function addProduct($nom, $description, $prix, $stock, $image) {
        $sql = "INSERT INTO produits (nom, description, prix, stock, image) VALUES (:nom, :description, :prix, :stock, :image)";
        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(':nom', $nom);
        $stmt->bindParam(':description', $description);
        $stmt->bindParam(':prix', $prix);
        $stmt->bindParam(':stock', $stock);
        $stmt->bindParam(':image', $image);
        
        return $stmt->execute();
    }

    // Récupérer tous les produits
    public function getAllProducts() {
        $sql = "SELECT * FROM produits";
        $stmt = $this->conn->query($sql);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Récupérer un produit par ID
    public function getProductById($product_id) {
        $sql = "SELECT * FROM produits WHERE id = :product_id";
        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(':product_id', $product_id);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
}
?>

