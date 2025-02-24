

<?php

class RepairModel {
    private $conn;

    // Constructeur : initialise la connexion à la base de données
    public function __construct($conn) {
        $this->conn = $conn;
    }

    // Ajouter une demande de réparation
    public function addRepair($nom, $email, $telephone, $marque, $modele, $probleme, $services, $devis_demande) {
        $sql = "INSERT INTO reparations (nom, email, telephone, marque, modele, probleme, services, devis_demande) 
                VALUES (:nom, :email, :telephone, :marque, :modele, :probleme, :services, :devis_demande)";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([
            ':nom' => $nom,
            ':email' => $email,
            ':telephone' => $telephone,
            ':marque' => $marque,
            ':modele' => $modele,
            ':probleme' => $probleme,
            ':services' => $services,
            ':devis_demande' => $devis_demande ? 1 : 0
        ]);
        return $stmt->rowCount() > 0;
    }

    // Récupérer toutes les demandes de réparation
    public function getRepairs() {
        $sql = "SELECT * FROM reparations";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Mettre à jour le statut d'une réparation
    public function updateStatus($repair_id, $statut) {
        $sql = "UPDATE reparations SET statut = :statut WHERE id = :repair_id";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([
            ':statut' => $statut,
            ':repair_id' => $repair_id
        ]);
        return $stmt->rowCount() > 0;
    }
}
?>

