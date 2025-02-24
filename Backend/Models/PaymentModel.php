

<?php
require_once(__DIR__ . '/../Config/Database.php');

class PaymentModel {
    private $conn;

    // Constructeur : initialise la connexion à la base de données
    public function __construct($conn) {
        $this->conn = $conn;
    }

    // Ajouter un paiement
    public function addPayment($user_id, $purchase_id, $payment_method, $amount, $transaction_id = null) {
        $sql = "INSERT INTO paiements (user_id, purchase_id, payment_method, amount, transaction_id) 
                VALUES (:user_id, :purchase_id, :payment_method, :amount, :transaction_id)";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([
            ':user_id' => $user_id,
            ':purchase_id' => $purchase_id,
            ':payment_method' => $payment_method,
            ':amount' => $amount,
            ':transaction_id' => $transaction_id
        ]);
        return $stmt->rowCount() > 0;
    }

    // Mettre à jour le statut d'un paiement
    public function updatePaymentStatus($payment_id, $status) {
        $sql = "UPDATE paiements SET payment_status = :status WHERE id = :payment_id";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([
            ':status' => $status,
            ':payment_id' => $payment_id
        ]);
        return $stmt->rowCount() > 0;
    }

    // Récupérer les détails d'un paiement par ID
    public function getPaymentById($payment_id) {
        $sql = "SELECT * FROM paiements WHERE id = :payment_id";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([':payment_id' => $payment_id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
}
?>



