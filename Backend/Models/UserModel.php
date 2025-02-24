


<?php
require_once(__DIR__ . '/../Config/Database.php');

class UserModel {
    private $conn;

    // Constructeur : initialise la connexion à la base de données
    public function __construct($conn) {
        $this->conn = $conn;
    }

    // // Enregistre un nouvel utilisateur
    // public function register($nom, $prenom, $email, $password, $telephone) {
    //     $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
    //     $sql = "INSERT INTO utilisateurs (nom, prenom, email, password, telephone) VALUES (:nom, :prenom, :email, :password, :telephone)";
    //     $stmt = $this->conn->prepare($sql);
    //     $stmt->execute([
    //         ':nom' => $nom,
    //         ':prenom' => $prenom,
    //         ':email' => $email,
    //         ':password' => $hashedPassword,
    //         ':telephone' => $telephone
    //     ]);
    //     return $stmt->rowCount() > 0;
    // }

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
}
?>
