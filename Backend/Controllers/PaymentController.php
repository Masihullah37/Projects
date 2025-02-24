<?php
require_once __DIR__ . '/../Models/PaymentModel.php';

class PaymentController {
    private $paymentModel;

    // Constructeur : initialise le modèle Payment
    public function __construct($conn) {
        $this->paymentModel = new PaymentModel($conn);
    }

    // Ajouter un paiement
    public function addPayment($data) {

      if (!isset($data['user_id'], $data['purchase_id'], $data['payment_method'], $data['amount'])) {
        return ["error" => "Données de paiement incomplètes"];
    }
        return $this->paymentModel->addPayment(
            $data['user_id'],
            $data['purchase_id'],
            $data['payment_method'],
            $data['amount'],
            $data['transaction_id'] ?? null
        );
    }

    // Mettre à jour le statut d'un paiement
    public function updatePaymentStatus($data) {
      if (!isset($data['payment_id'], $data['payment_status'])) {
        return ["error" => "Données de mise à jour incomplètes"];
    }
        return $this->paymentModel->updatePaymentStatus($data['payment_id'], $data['payment_status']);
    }

    // Récupérer les détails d'un paiement
    public function getPayment($payment_id) {
        return $this->paymentModel->getPaymentById($payment_id);
    }
}
?>