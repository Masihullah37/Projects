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
        // Convert to the format expected by the model
        $productData = [
            'nom' => $data['nom'],
            'description' => $data['description'],
            'prix' => $data['prix'],
            'stock' => $data['stock'],
            'image' => $data['image']
        ];
        
        return $this->productModel->addProduct($productData);
    }

    // // Récupérer tous les produits avec stock > 0
    public function getProducts() {
        return $this->productModel->getProducts();
    }

    
    // Récupérer tous les produits, y compris ceux avec stock = 0
    public function getAllProducts() {
        return $this->productModel->getAllProducts();
    }

    // Récupérer un produit par ID
    public function getProductById($product_id) {
        return $this->productModel->getProductById($product_id);
    }
    
    // Mettre à jour un produit
    public function updateProduct($productId, $data) {
        // Convert to the format expected by the model
        $productData = [
            'nom' => $data['nom'],
            'description' => $data['description'],
            'prix' => $data['prix'],
            'stock' => $data['stock']
        ];
        
        // Only include image if provided
        if (!empty($data['image'])) {
            $productData['image'] = $data['image'];
        }
        
        return $this->productModel->updateProduct($productId, $productData);
    }
    
    // Supprimer un produit
    public function deleteProduct($productId) {
        return $this->productModel->deleteProduct($productId);
    }
    
    // Réduire le stock d'un produit
    public function reduceStock($productId, $quantity) {
        return $this->productModel->reduceStock($productId, $quantity);
    }
    
    // Vérifier si un produit a suffisamment de stock
    public function checkStock($productId, $requestedQuantity) {
        $product = $this->productModel->getProductById($productId);
        
        if (!$product) {
            return [
                'success' => false,
                'message' => 'Produit non trouvé'
            ];
        }
        
        if ($product['stock'] < $requestedQuantity) {
            return [
                'success' => false,
                'message' => 'Stock insuffisant',
                'available' => $product['stock']
            ];
        }
        
        return [
            'success' => true,
            'available' => $product['stock']
        ];
    }
}
?>



