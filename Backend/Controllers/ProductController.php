<?php
require_once(__DIR__ . '/../Models/ProductModel.php');


class ProductController {
    private $productModel;

    // Constructeur : initialise le modèle Product
    public function __construct($conn) {
        $this->productModel = new ProductModel($conn);
    }

    // Ajouter un produit
    public function addProduct($data) {
        return $this->productModel->addProduct($data['nom'], $data['description'], $data['prix'], $data['stock'], $data['image']);
    }

    // Récupérer tous les produits (CORRECTED METHOD NAME)
    public function getProducts() {
        return $this->productModel->getAllProducts(); // Corrected method name
    }

    // Récupérer un produit par ID
    public function getProductById($product_id) {
        return $this->productModel->getProductById($product_id);
    }
}
?>

