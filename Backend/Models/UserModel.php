
<?php

require_once(__DIR__ . '/../Config/Database.php');



class UserModel 
{
    private $conn;

    /**
     * Initialise la connexion à la base de données
     * Elle prend une instance PDO comme paramètre pour la connexion à la base de données.
     * @param PDO $conn Instance PDO
     */
    public function __construct($conn) 
    {
        $this->conn = $conn;
    }

    /**
     * Enregistre un nouvel utilisateur
     * Cette méthode insère un utilisateur dans la base de données.
     * @param string $nom
     * @param string $prenom
     * @param string $email
     * @param string $password
     * @param string $telephone
     * @return bool
     */
    public function register($nom, $prenom, $email,$password,$telephone) 
    {
        // Hash du mot de passe pour le sécuriser
        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
        
        // Préparation de la requête SQL d'insertion
        $sql = "INSERT INTO utilisateurs (nom, prenom, email,password,telephone) 
                VALUES (:nom, :prenom, :email,:password,:telephone)";
        
        // Préparation de la requête
        $stmt = $this->conn->prepare($sql);
        
        // Exécution de la requête avec les paramètres
        return $stmt->execute([
            ':nom' => $nom,
            ':prenom' => $prenom,
            ':email' => $email,
            ':password' => $hashedPassword,
            ':telephone' => $telephone,
            

        ]) && $stmt->rowCount() > 0; // Confirmer si l'insertion a eu lieu
    }

    /**
     * Vérifie si un utilisateur existe déjà avec un email ou un téléphone donné
     * Cette méthode vérifie si un utilisateur avec le même email ou téléphone existe dans la base.
     * @param string $email
     * @param string $telephone
     * @return array|false
     */
    // public function checkIfUserExists($email, $telephone) 
    // {
    //     // Requête SQL pour vérifier l'existence de l'email ou du téléphone
    //     $query = "SELECT email, telephone FROM utilisateurs 
    //               WHERE email = :email OR telephone = :telephone 
    //               LIMIT 1";
        
    //     // Préparation de la requête
    //     $stmt = $this->conn->prepare($query);
        
    //     // Exécution de la requête avec les paramètres
    //     $stmt->execute([
    //         ':email' => $email,
    //         ':telephone' => $telephone
    //     ]);
        
    //     // Retourner les résultats sous forme de tableau associatif
    //     return $stmt->fetch(PDO::FETCH_ASSOC);
    // }

    public function checkIfUserExists($email, $telephone) 
{
    // Requête SQL pour vérifier l'existence de l'email ou du téléphone
    $query = "SELECT email, telephone FROM utilisateurs 
              WHERE email = :email OR telephone = :telephone 
              LIMIT 1";
    
    // Préparation de la requête
    $stmt = $this->conn->prepare($query);
    
    // Exécution de la requête avec les paramètres
    $stmt->execute([
        ':email' => $email,
        ':telephone' => $telephone
    ]);
    //on stock le résultat
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($result) {
        // Retourne les champs qui correspondent réellement (email ou téléphone)
        $matches = [];
        if ($result['email'] === $email) {
            $matches['email'] = true; //email touvé
        }
        if ($result['telephone'] === $telephone) {
            $matches['telephone'] = true;
        }
        return $matches; //retourne les correspondances
    }
    
    return false; //Aucun utilisateur touvé
}

    /**
     * Connecte un utilisateur
     * Cette méthode tente de connecter un utilisateur avec son email et mot de passe.
     * @param string $email
     * @param string $password
     * @return array|false
     */
    public function login($email, $password) 
    {
        // Requête SQL pour récupérer un utilisateur par son email
        $sql = "SELECT * FROM utilisateurs WHERE email = :email LIMIT 1";
        
        // Préparation de la requête
        $stmt = $this->conn->prepare($sql);
        
        // Exécution de la requête
        $stmt->execute([':email' => $email]);
        
        // Récupération de l'utilisateur sous forme de tableau associatif
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        // Vérifier si le mot de passe est correct
        if ($user && password_verify($password, $user['password'])) {
            return $user; // L'utilisateur est connecté
        }
        
        return false; // L'utilisateur ou le mot de passe est incorrect
    }

    /**
     * Trouve un utilisateur par son email
     * Cette méthode permet de récupérer un utilisateur à partir de son email.
     * @param string $email
     * @return array|false
     */
    public function findUserByEmail($email) 
    {
        // Requête SQL pour récupérer l'utilisateur par son email
        $sql = "SELECT * FROM utilisateurs WHERE email = :email LIMIT 1";
        
        // Préparation de la requête
        $stmt = $this->conn->prepare($sql);
        
        // Exécution de la requête
        $stmt->execute([':email' => $email]);
        
        // Récupérer l'utilisateur sous forme de tableau associatif
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /**
     * Crée un token de réinitialisation de mot de passe
     * Cette méthode génère un token unique pour la réinitialisation du mot de passe et l'enregistre dans la base.
     * @param string $email
     * @return string|false
     */
    public function createPasswordResetToken($email) 
    {
        // Vérifier si l'utilisateur existe
        $user = $this->findUserByEmail($email);
        if (!$user) {
            return false; // L'utilisateur n'existe pas
        }
        
        // Créer un token aléatoire
        $token = bin2hex(random_bytes(32));
        $expires = date('Y-m-d H:i:s', strtotime('+1 hour')); // Le token expire dans une heure
        
        // Requête SQL pour mettre à jour l'utilisateur avec le token
        $sql = "UPDATE utilisateurs SET 
                reset_password_token = :token,
                reset_password_expires = :expires 
                WHERE email = :email";
        
        // Préparation de la requête
        $stmt = $this->conn->prepare($sql);
        
        // Exécution de la requête
        return $stmt->execute([
            ':token' => $token,
            ':expires' => $expires,
            ':email' => $email
        ]) ? $token : false; // Retourner le token ou false en cas d'échec
    }

    /**
     * Valide un token de réinitialisation
     * Cette méthode vérifie si le token est valide et non expiré.
     * @param string $token
     * @param string $email
     * @return array|false
     */
    public function validateResetToken($token, $email) 
    {
        // Requête SQL pour vérifier la validité du token
        $sql = "SELECT * FROM utilisateurs 
                WHERE reset_password_token = :token 
                AND email = :email 
                AND reset_password_expires > NOW()";
        
        // Préparation de la requête
        $stmt = $this->conn->prepare($sql);
        
        // Exécution de la requête
        $stmt->execute([
            ':token' => $token,
            ':email' => $email
        ]);
        
        // Récupérer les résultats sous forme de tableau associatif
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    /**
     * Réinitialise le mot de passe
     * Cette méthode permet de changer le mot de passe si le token est valide.
     * @param string $email
     * @param string $token
     * @param string $newPassword
     * @return bool
     */
    public function resetPassword($email, $token, $newPassword) 
    {
        // Vérifier si le token est valide
        if (!$this->validateResetToken($token, $email)) {
            return false; // Token invalide
        }
        
        // Hasher le nouveau mot de passe
        $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);
        
        // Requête SQL pour mettre à jour le mot de passe
        $sql = "UPDATE utilisateurs SET 
                password = :password,
                reset_password_token = NULL,
                reset_password_expires = NULL 
                WHERE email = :email";
        
        // Préparation de la requête
        $stmt = $this->conn->prepare($sql);
        
        // Exécution de la requête
        return $stmt->execute([
            ':password' => $hashedPassword,
            ':email' => $email
        ]);
    }

    /**
     * Invalide un token de réinitialisation
     * Cette méthode supprime le token de réinitialisation du mot de passe.
     * @param string $email
     * @return bool
     */
    public function invalidateResetToken($email) 
    {
        // Requête SQL pour invalider le token
        $sql = "UPDATE utilisateurs SET 
                reset_password_token = NULL,
                reset_password_expires = NULL 
                WHERE email = :email";
        
        // Préparation de la requête
        $stmt = $this->conn->prepare($sql);
        
        // Exécution de la requête
        return $stmt->execute([':email' => $email]);
    }
}


?>
