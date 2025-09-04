<?php



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
    
    return $this->conn;}
    }






?>