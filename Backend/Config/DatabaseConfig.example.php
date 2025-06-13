<?php
class Database {
    private $host = 'localhost';
    private $db = 'your_database';
    private $user = 'your_user';
    private $pass = 'your_password';
    private $conn;

    public function __construct() {
        try {
            date_default_timezone_set('Europe/Paris');
            $this->conn = new PDO("mysql:host=$this->host;dbname=$this->db", $this->user, $this->pass);
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $this->conn->exec("SET time_zone = '+01:00'");
        } catch (PDOException $e) {
            die("Connection failed: " . $e->getMessage());
        }
    }

    public function getConnection() {
        return $this->conn;
    }
}
