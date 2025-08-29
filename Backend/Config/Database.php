<?php



// class Database {
//     private $host;
//     private $db;
//     private $user;
//     private $pass;
//     private $conn;

//     public function __construct() {
//         // Determine environment (local or production)
//         $isProduction = (php_sapi_name() !== 'cli' && $_SERVER['HTTP_HOST'] !== 'localhost');

//         if (!$isProduction) {
//             // Local development - load .env.local exactly as before
//             $dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../', '.env.local');
//             $dotenv->load();

//             $this->host = $_ENV['DB_HOST'];
//             $this->db   = $_ENV['DB_NAME'];
//             $this->user = $_ENV['DB_USER'];
//             $this->pass = $_ENV['DB_PASS'];
//         } else {
//             // Production - ONLY change environment variable access method
//             $this->host = getenv('DB_HOST') ?: $_ENV['DB_HOST'] ?? 'test.icvinformatique.com';
//             $this->db   = getenv('DB_NAME') ?: $_ENV['DB_NAME'] ?? 'IT_Repairs';
//             $this->user = getenv('DB_USER') ?: $_ENV['DB_USER'] ?? 'IT_Users';
//             $this->pass = getenv('DB_PASS') ?: $_ENV['DB_PASS'] ?? 'Lutf@1234567';
//         }

//         try {
//             date_default_timezone_set('Europe/Paris');
//             $this->conn = new PDO("mysql:host=$this->host;dbname=$this->db", $this->user, $this->pass);
//             $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
//             $this->conn->exec("SET time_zone = '+01:00'");
//             error_log("Database connection successful");
//         } catch (PDOException $e) {
//             error_log("Database connection failed: " . $e->getMessage());
//             die("Connection failed: " . $e->getMessage());
//         }
//     }

//     public function getConnection() {
//         return $this->conn;
//     }
// }

// 

class Database {
    private $host;
    private $db_name;
    private $username;
    private $password;
    private $conn;
 
    public function __construct($host, $db_name, $username, $password) {
        $this->host = $host;
        $this->db_name = $db_name;
        $this->username = $username;
        $this->password = $password;}
    /**
     * Get database connection
     * @return PDO
     */
     
      public function getConnection() {
        if ($this->conn) {
            return $this->conn;
        }

        try {
            $this->conn = new PDO(
                "mysql:host=" . $this->host . ";dbname=" . $this->db_name,
                $this->username,
                $this->password,
                [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false
                ]
            );
            } catch(PDOException $e) {
            error_log("Database Connection Error: " . $e->getMessage());
            throw new RuntimeException("Database connection failed: " . $e->getMessage());
        }
    // CRITICAL: You must return the connection here.
    return $this->conn;}
    }






?>