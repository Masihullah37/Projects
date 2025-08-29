<?php


/**
 * Contrôleur des Produits
 * Gère les opérations liées aux produits
 */

require_once __DIR__ . '/../Models/ProductModel.php';

class ProductController {
    private $productModel;

    public function __construct($conn) {
        $this->productModel = new ProductModel($conn);
    }

    

public function getProducts() {
    try {
        $result = $this->productModel->getProducts();
        
        return [
            'success' => $result['status'] === 'success',
            'data' => [
                'products' => $result['data'], // Nest products here
                'count' => $result['count']
            ],
            'message' => $result['message'] ?? null
        ];
        
    } catch (Exception $e) {
        error_log("ProductController Error: " . $e->getMessage());
        return [
            'success' => false,
            'data' => [
                'products' => [],
                'count' => 0
            ],
            'message' => 'Failed to load products'
        ];
    }
}

    /**
     * Récupérer un produit par son ID
     * @param int $product_id
     * @return array|false
     */
    public function getProductById($product_id) {
        return $this->productModel->getProductById($product_id);
    }

    /**
     * Ajouter un nouveau produit
     * @param array $data
     * @return int|false
     */
    public function addProduct($data) {
        $productData = [
            'nom' => $data['nom'],
            'description' => $data['description'],
            'prix' => $data['prix'],
            'stock' => $data['stock'],
            'image' => $data['image']
        ];
        
        return $this->productModel->addProduct($productData);
    }

    /**
     * Supprimer un produit par son ID
     * @param int $productId
     * @return bool
     */
    public function deleteProduct($productId) {
        return $this->productModel->deleteProduct($productId);
    }

    /**
     * Réduire le stock d’un produit
     * @param int $productId
     * @param int $quantity
     * @return bool
     */
    public function reduceStock($productId, $quantity) {
        return $this->productModel->reduceStock($productId, $quantity);
    }

    /**
     * Vérifier si un produit a suffisamment de stock
     * @param int $productId
     * @param int $requestedQuantity
     * @return array
     */
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

    /**
     * Récupérer tous les produits (y compris ceux avec stock = 0)
     * @return array
     */
    public function getAllProducts() {
        return $this->productModel->getAllProducts();
    }
}
?>



