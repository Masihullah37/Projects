<?php
class Database {
    private $host = 'localhost';
    private $db = 'it_repair_shop';
    private $user = 'root';
    private $pass = 'Roshan';
    private $conn;

    // Constructeur : établit la connexion à la base de données avec PDO
    public function __construct() {
        try {
            $this->conn = new PDO("mysql:host=$this->host;dbname=$this->db", $this->user, $this->pass);
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch (PDOException $e) {
            die("Connection failed: " . $e->getMessage());
        }
    }

    // Retourne la connexion à la base de données
    public function getConnection() {
        return $this->conn;
    }
}
?>