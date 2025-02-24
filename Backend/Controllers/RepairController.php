<?php
require_once(__DIR__ . '/../Models/RepairModel.php');


class RepairController {
    private $repairModel;

    // Constructeur : initialise le modèle Repair
    public function __construct($conn) {
        $this->repairModel = new RepairModel($conn);
    }

    // Ajouter une demande de réparation
    public function addRepair($data) {
        return $this->repairModel->addRepair(
            $data['nom'],
            $data['email'],
            $data['telephone'],
            $data['marque'],
            $data['modele'],
            $data['probleme'],
            $data['services'],
            $data['devis_demande']
        );
    }

    // Récupérer toutes les réparations
    public function getRepairs() {
        return $this->repairModel->getRepairs();
    }

    // Mettre à jour le statut d'une réparation
    public function updateStatus($data) {
        return $this->repairModel->updateStatus($data['repair_id'], $data['statut']);
    }
}
?>
