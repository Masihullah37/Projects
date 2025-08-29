
<?php

// require_once(__DIR__ . '/../Config/Database.php');



// class UserModel 
// {
//     private $conn;

//     /**
//      * Initialise la connexion à la base de données
//      * Elle prend une instance PDO comme paramètre pour la connexion à la base de données.
//      * @param PDO $conn Instance PDO
//      */
//     public function __construct($conn) 
//     {
//         $this->conn = $conn;
//     }

//     /**
//      * Enregistre un nouvel utilisateur
//      * Cette méthode insère un utilisateur dans la base de données.
//      * @param string $nom
//      * @param string $prenom
//      * @param string $email
//      * @param string $password
//      * @param string $telephone
//      * @return bool
//      */
//     public function register($nom, $prenom, $email,$password,$telephone) 
//     {
//         // Hash du mot de passe pour le sécuriser
//         $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
        
//         // Préparation de la requête SQL d'insertion
//         $sql = "INSERT INTO utilisateurs (nom, prenom, email,password,telephone) 
//                 VALUES (:nom, :prenom, :email,:password,:telephone)";
        
//         // Préparation de la requête
//         $stmt = $this->conn->prepare($sql);
        
//         // Exécution de la requête avec les paramètres
//         return $stmt->execute([
//             ':nom' => $nom,
//             ':prenom' => $prenom,
//             ':email' => $email,
//             ':password' => $hashedPassword,
//             ':telephone' => $telephone,
            

//         ]) && $stmt->rowCount() > 0; // Confirmer si l'insertion a eu lieu
//     }

//     /**
//      * Vérifie si un utilisateur existe déjà avec un email ou un téléphone donné
//      * Cette méthode vérifie si un utilisateur avec le même email ou téléphone existe dans la base.
//      * @param string $email
//      * @param string $telephone
//      * @return array|false
//      */
  

//     public function checkIfUserExists($email, $telephone) 
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
//     //on stock le résultat
//     $result = $stmt->fetch(PDO::FETCH_ASSOC);
    
//     if ($result) {
//         // Retourne les champs qui correspondent réellement (email ou téléphone)
//         $matches = [];
//         if ($result['email'] === $email) {
//             $matches['email'] = true; //email touvé
//         }
//         if ($result['telephone'] === $telephone) {
//             $matches['telephone'] = true;
//         }
//         return $matches; //retourne les correspondances
//     }
    
//     return false; //Aucun utilisateur touvé
// }

//     /**
//      * Connecte un utilisateur
//      * Cette méthode tente de connecter un utilisateur avec son email et mot de passe.
//      * @param string $email
//      * @param string $password
//      * @return array|false
//      */
//     public function login($email, $password) 
//     {
//         // Requête SQL pour récupérer un utilisateur par son email
//         $sql = "SELECT * FROM utilisateurs WHERE email = :email LIMIT 1";
        
//         // Préparation de la requête
//         $stmt = $this->conn->prepare($sql);
        
//         // Exécution de la requête
//         $stmt->execute([':email' => $email]);
        
//         // Récupération de l'utilisateur sous forme de tableau associatif
//         $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
//         // Vérifier si le mot de passe est correct
//         if ($user && password_verify($password, $user['password'])) {
//             return $user; // L'utilisateur est connecté
//         }
        
//         return false; // L'utilisateur ou le mot de passe est incorrect
//     }

//     /**
//      * Trouve un utilisateur par son email
//      * Cette méthode permet de récupérer un utilisateur à partir de son email.
//      * @param string $email
//      * @return array|false
//      */
//     public function findUserByEmail($email) 
//     {
//         // Requête SQL pour récupérer l'utilisateur par son email
//         $sql = "SELECT * FROM utilisateurs WHERE email = :email LIMIT 1";
        
//         // Préparation de la requête
//         $stmt = $this->conn->prepare($sql);
        
//         // Exécution de la requête
//         $stmt->execute([':email' => $email]);
        
//         // Récupérer l'utilisateur sous forme de tableau associatif
//         return $stmt->fetch(PDO::FETCH_ASSOC);
//     }

//     /**
//      * Crée un token de réinitialisation de mot de passe
//      * Cette méthode génère un token unique pour la réinitialisation du mot de passe et l'enregistre dans la base.
//      * @param string $email
//      * @return string|false
//      */
//     public function createPasswordResetToken($email) 
//     {
//         // Vérifier si l'utilisateur existe
//         $user = $this->findUserByEmail($email);
//         if (!$user) {
//             return false; // L'utilisateur n'existe pas
//         }
        
//         // Créer un token aléatoire
//         $token = bin2hex(random_bytes(32));
//         $expires = date('Y-m-d H:i:s', strtotime('+1 hour')); // Le token expire dans une heure
        
//         // Requête SQL pour mettre à jour l'utilisateur avec le token
//         $sql = "UPDATE utilisateurs SET 
//                 reset_password_token = :token,
//                 reset_password_expires = :expires 
//                 WHERE email = :email";
        
//         // Préparation de la requête
//         $stmt = $this->conn->prepare($sql);
        
//         // Exécution de la requête
//         return $stmt->execute([
//             ':token' => $token,
//             ':expires' => $expires,
//             ':email' => $email
//         ]) ? $token : false; // Retourner le token ou false en cas d'échec
//     }

//     /**
//      * Valide un token de réinitialisation
//      * Cette méthode vérifie si le token est valide et non expiré.
//      * @param string $token
//      * @param string $email
//      * @return array|false
//      */
//     public function validateResetToken($token, $email) 
//     {
//         // Requête SQL pour vérifier la validité du token
//         $sql = "SELECT * FROM utilisateurs 
//                 WHERE reset_password_token = :token 
//                 AND email = :email 
//                 AND reset_password_expires > NOW()";
        
//         // Préparation de la requête
//         $stmt = $this->conn->prepare($sql);
        
//         // Exécution de la requête
//         $stmt->execute([
//             ':token' => $token,
//             ':email' => $email
//         ]);
        
//         // Récupérer les résultats sous forme de tableau associatif
//         return $stmt->fetch(PDO::FETCH_ASSOC);
//     }
    
//     /**
//      * Réinitialise le mot de passe
//      * Cette méthode permet de changer le mot de passe si le token est valide.
//      * @param string $email
//      * @param string $token
//      * @param string $newPassword
//      * @return bool
//      */
//     public function resetPassword($email, $token, $newPassword) 
//     {
//         // Vérifier si le token est valide
//         if (!$this->validateResetToken($token, $email)) {
//             return false; // Token invalide
//         }
        
//         // Hasher le nouveau mot de passe
//         $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);
        
//         // Requête SQL pour mettre à jour le mot de passe
//         $sql = "UPDATE utilisateurs SET 
//                 password = :password,
//                 reset_password_token = NULL,
//                 reset_password_expires = NULL 
//                 WHERE email = :email";
        
//         // Préparation de la requête
//         $stmt = $this->conn->prepare($sql);
        
//         // Exécution de la requête
//         return $stmt->execute([
//             ':password' => $hashedPassword,
//             ':email' => $email
//         ]);
//     }

//     /**
//      * Invalide un token de réinitialisation
//      * Cette méthode supprime le token de réinitialisation du mot de passe.
//      * @param string $email
//      * @return bool
//      */
//     public function invalidateResetToken($email) 
//     {
//         // Requête SQL pour invalider le token
//         $sql = "UPDATE utilisateurs SET 
//                 reset_password_token = NULL,
//                 reset_password_expires = NULL 
//                 WHERE email = :email";
        
//         // Préparation de la requête
//         $stmt = $this->conn->prepare($sql);
        
//         // Exécution de la requête
//         return $stmt->execute([':email' => $email]);
//     }
// }
/**
 * User Model Class
 * Handles user-related database operations
 */

class UserModel {
    private $conn;
    private $table_name = "utilisateurs";// Le nom de la table est stocké ici pour faciliter la maintenance du code.

    public function __construct($conn) {
        $this->conn = $conn;
    }

    /**
     * Register a new user
     * @param string $nom
     * @param string $prenom
     * @param string $email
     * @param string $password
     * @param string $telephone
     * @return bool
     */
  
    // ...
public function register($nom, $prenom, $email, $password, $telephone) {
    try {
        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
        
        $query = "INSERT INTO " . $this->table_name . " 
                          (nom, prenom, email, password, telephone) 
                          VALUES (:nom, :prenom, :email, :password, :telephone)";
        
        $stmt = $this->conn->prepare($query);
        
        $params = [
            ':nom' => $nom,
            ':prenom' => $prenom,
            ':email' => $email,
            ':password' => $hashedPassword,
            ':telephone' => $telephone,
        ];

        error_log("UserModel - Attempting to register user with data: " . print_r($params, true)); // Added log
        
        $executed = $stmt->execute($params);
        
        if ($executed && $stmt->rowCount() > 0) {
            error_log("UserModel - User registered successfully: " . $email);
            return true;
        } else {
            error_log("UserModel - Registration failed for " . $email . ". No rows affected or query failed silently.");
            return false;
        }
        
    } catch (PDOException $e) {
        error_log('Database error in UserModel register: ' . $e->getMessage() . " | SQL: " . $query . " | Params: " . print_r($params, true)); // More detailed log
        return false;
    }
}
// ...

    /**
     * Check if user exists by email or phone
     * @param string $email
     * @param string $telephone
     * @return array|false
     */
    public function checkIfUserExists($email, $telephone) {
        try {
            $query = "SELECT email, telephone FROM " . $this->table_name . " 
                      WHERE email = :email OR telephone = :telephone 
                      LIMIT 1";
            
            $stmt = $this->conn->prepare($query);
            $stmt->execute([
                ':email' => $email,
                ':telephone' => $telephone
            ]);
            
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($result) {
                $matches = [];
                if ($result['email'] === $email) {
                    $matches['email'] = true;
                }
                if ($result['telephone'] === $telephone) {
                    $matches['telephone'] = true;
                }
                return $matches;
            }
            
            return false;
            
        } catch (PDOException $e) {
            error_log('Database error in checkIfUserExists: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Login user
     * @param string $email
     * @param string $password
     * @return array|false
     */
     public function login($email, $password) {
    try {
        
         error_log("Attempting to find user with email: " . $email); // Add this line
        $query = "SELECT * FROM " . $this->table_name . " WHERE email = :email LIMIT 1";
        $stmt = $this->conn->prepare($query);
        
        if (!$stmt) {
            error_log("Failed to prepare login statement");
            return false;
        }
        
        $stmt->execute([':email' => $email]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$user) {
            error_log("No user found with email: " . $email);
            return false;
        }
        
        if (!password_verify($password, $user['password'])) {
            error_log("Password verification failed for: " . $email);
            return false;
        }
        
        // Remove sensitive data before returning
        unset($user['password']);
        unset($user['reset_password_token']);
        unset($user['reset_password_expires']);
        
        return $user;
        
    } catch (PDOException $e) {
        error_log('Database error in login: ' . $e->getMessage());
        return false;
    }
}
    
    /**
     * Find user by email
     * @param string $email
     * @return array|false
     */
    public function findUserByEmail($email) {
        try {
            $query = "SELECT * FROM " . $this->table_name . " WHERE email = :email LIMIT 1";
            $stmt = $this->conn->prepare($query);
            $stmt->execute([':email' => $email]);
            
            return $stmt->fetch(PDO::FETCH_ASSOC);
            
        } catch (PDOException $e) {
            error_log('Database error in findUserByEmail: ' . $e->getMessage());
            return false;
        }
    }


    public function createPasswordResetToken($email) {
        try {
            $user = $this->findUserByEmail($email);
            if (!$user) {
                error_log("DEBUG: UserModel - createPasswordResetToken: User not found for email: " . $email);
                return false;
            }
            
            $token = bin2hex(random_bytes(32));
            
            
            // Since PHP is set to 'Europe/Paris' (or 'UTC'), this calculation will be in that timezone.
            $now = new DateTime(); // Current time in the timezone set by date_default_timezone_set()
            $expires = $now->modify('+1 hour')->format('Y-m-d H:i:s');
            
            
            error_log("DEBUG: UserModel - Generated token: " . $token . " for email: " . $email . " expires at: " . $expires); // Add this log
            
            $query = "UPDATE " . $this->table_name . " SET 
                              reset_password_token = :token,
                              reset_password_expires = :expires 
                              WHERE email = :email";
            
            $stmt = $this->conn->prepare($query);
            
            if ($stmt->execute([
                ':token' => $token,
                ':expires' => $expires,
                ':email' => $email
            ])) {
                error_log("DEBUG: UserModel - Token updated in DB for email: " . $email . " expires: " . $expires);
                return $token;
            } else {
                error_log("DEBUG: UserModel - Failed to update token in DB for email: " . $email);
                return false;
            }
            
        } catch (PDOException $e) {
            error_log('Database error in createPasswordResetToken: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Validate reset token
     * @param string $token
     * @param string $email
     * @return array|false
     */
    
    public function validateResetToken($token, $email) {
        try {
            $query = "SELECT id, reset_password_token, reset_password_expires, email FROM " . $this->table_name . "
                              WHERE reset_password_token = :token
                              AND email = :email
                              AND reset_password_expires > NOW()";
            
            error_log("DEBUG: UserModel - validateResetToken query: " . $query); // Log the query
            error_log("DEBUG: UserModel - validateResetToken params: Token=" . $token . ", Email=" . $email); // Log params
            
            $stmt = $this->conn->prepare($query);
            $stmt->execute([
                ':token' => $token,
                ':email' => $email
            ]);
            
            $result = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($result) {
                error_log("DEBUG: UserModel - validateResetToken found user: " . print_r($result, true)); // Log found user
            } else {
                error_log("DEBUG: UserModel - validateResetToken found NO user for token/email or link expired."); // Log no user
            }
            
            return $result; // Returns the user data if valid, false otherwise
            
        } catch (PDOException $e) {
            error_log('Database error in validateResetToken: ' . $e->getMessage());
            return false;
        }
    }
// ...

    /**
     * Reset password
     * @param string $email
     * @param string $token
     * @param string $newPassword
     * @return bool
     */
    public function resetPassword($email, $token, $newPassword) {
        try {
            if (!$this->validateResetToken($token, $email)) {
                return false;
            }
            
            $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);
            
            $query = "UPDATE " . $this->table_name . " SET 
                      password = :password,
                      reset_password_token = NULL,
                      reset_password_expires = NULL 
                      WHERE email = :email";
            
            $stmt = $this->conn->prepare($query);
            
            return $stmt->execute([
                ':password' => $hashedPassword,
                ':email' => $email
            ]);
            
        } catch (PDOException $e) {
            error_log('Database error in resetPassword: ' . $e->getMessage());
            return false;
        }
    }
}


?>
