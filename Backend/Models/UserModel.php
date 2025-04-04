


<?php
// require_once(__DIR__ . '/../Config/Database.php');

class UserModel {
    private $conn;

    // Constructeur : initialise la connexion à la base de données
    public function __construct($conn) {
        $this->conn = $conn;
    }

    public function register($nom, $prenom, $email, $password, $telephone) {
      $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
      $sql = "INSERT INTO utilisateurs (nom, prenom, email, password, telephone) VALUES (:nom, :prenom, :email, :password, :telephone)";
      $stmt = $this->conn->prepare($sql);
      $stmt->execute([
          ':nom' => $nom,
          ':prenom' => $prenom,
          ':email' => $email,
          ':password' => $hashedPassword,
          ':telephone' => $telephone
      ]);
      return $stmt->rowCount() > 0;
  }

    public function checkIfUserExists($email, $telephone) {
      $query = "SELECT email, telephone FROM utilisateurs WHERE email = :email OR telephone = :telephone LIMIT 1";
      $stmt = $this->conn->prepare($query);
      $stmt->bindParam(":email", $email);
      $stmt->bindParam(":telephone", $telephone);
      $stmt->execute();
      return $stmt->fetch(PDO::FETCH_ASSOC);
  }

    // Connecte un utilisateur
    public function login($email, $password) {
        $sql = "SELECT * FROM utilisateurs WHERE email = :email";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([':email' => $email]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($user && password_verify($password, $user['password'])) {
            return $user;
        }
        return false;
    }

    // Add this method - it was missing
    public function findUserByEmail($email) {
        $sql = "SELECT * FROM utilisateurs WHERE email = :email LIMIT 1";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([':email' => $email]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    // Add these new methods for password reset
    public function createPasswordResetToken($email) {
        $user = $this->findUserByEmail($email);
        if (!$user) {
            return false;
        }
        
        // Generate token
        $token = bin2hex(random_bytes(32));
        $expires = date('Y-m-d H:i:s', strtotime('+1 hour'));
        
        $sql = "UPDATE utilisateurs SET 
                reset_password_token = :token,
                reset_password_expires = :expires 
                WHERE email = :email";
                
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([
            ':token' => $token,
            ':expires' => $expires,
            ':email' => $email
        ]);
        
        return $stmt->rowCount() > 0 ? $token : false;
    }

    

    public function validateResetToken($token, $email) {
        $sql = "SELECT * FROM utilisateurs 
                WHERE reset_password_token = :token 
                AND email = :email 
                AND reset_password_expires > NOW()";
        
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([
            ':token' => $token,
            ':email' => $email
        ]);
        
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
       
        
        return $user;
    }
    
    public function resetPassword($email, $token, $newPassword) {
        $user = $this->validateResetToken($token, $email);
        if (!$user) {
            return false;
        }
        
        $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);
        
        $sql = "UPDATE utilisateurs SET 
                password = :password,
                reset_password_token = NULL,
                reset_password_expires = NULL 
                WHERE email = :email";
                
        $stmt = $this->conn->prepare($sql);
        return $stmt->execute([
            ':password' => $hashedPassword,
            ':email' => $email
        ]);
    }

    public function invalidateResetToken($email) {
        $sql = "UPDATE utilisateurs SET 
                reset_password_token = NULL,
                reset_password_expires = NULL 
                WHERE email = :email";
                
        $stmt = $this->conn->prepare($sql);
        return $stmt->execute([':email' => $email]);
    }
}
?>
