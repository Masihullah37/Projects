<?php


class Database {
    private $host;
    private $db;
    private $user;
    private $pass;
    private $conn;

    public function __construct() {
      
         // Determine environment (local or production)
        $isProduction = (getenv('APP_ENV') === 'production' || $_SERVER['HTTP_HOST'] !== 'localhost');

        // Load the correct .env file
        $dotenv = Dotenv\Dotenv::createImmutable(
            __DIR__ . '/../', 
            $isProduction ? '.env.production' : '.env.local'
        );
        $dotenv->load();

        $this->host = $_ENV['DB_HOST'];
        $this->db   = $_ENV['DB_NAME'];
        $this->user = $_ENV['DB_USER'];
        $this->pass = $_ENV['DB_PASS'];

        try {
            date_default_timezone_set('Europe/Paris');
            $this->conn = new PDO("mysql:host=$this->host;dbname=$this->db", $this->user, $this->pass);
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $this->conn->exec("SET time_zone = '+01:00'");
            error_log("Database connection successful");
        } catch (PDOException $e) {
            error_log("Database connection failed: " . $e->getMessage());
            die("Connection failed: " . $e->getMessage());
        }
    }

    public function getConnection() {
        return $this->conn;
    }
}

?>