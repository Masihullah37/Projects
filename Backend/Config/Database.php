<?php
class Database {
    private $host = 'localhost';
    private $db = 'it_repair_shop';
    private $user = '';
    private $pass = '';
    private $conn;

    // Constructeur : établit la connexion à la base de données avec PDO
    public function __construct() {
        try {
             // Set PHP timezone (Europe/Paris)
             date_default_timezone_set('Europe/Paris');
            $this->conn = new PDO("mysql:host=$this->host;dbname=$this->db", $this->user, $this->pass);
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $this->conn->exec("SET time_zone = '+01:00'");  // Paris Timezone (Europe)
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