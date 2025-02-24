<?php
require_once(__DIR__ . '/../Models/PurchaseModel.php');


class PurchaseController {
    private $purchaseModel;

    // Constructeur : initialise le modèle Purchase
    public function __construct($conn) {
        $this->purchaseModel = new PurchaseModel($conn);
    }

    // Ajoute un achat
    public function addPurchase($user_id, $product_id, $quantity) {
        return $this->purchaseModel->addPurchase($user_id, $product_id, $quantity);
    }

    // Récupère les achats d'un utilisateur
    public function getPurchases($user_id) {
        return $this->purchaseModel->getPurchases($user_id);
    }
}
?>

