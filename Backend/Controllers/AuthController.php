<?php
require_once __DIR__ . '/../Models/UserModel.php';
require_once __DIR__ . '/../Services/EmailService.php';

class AuthController {
    private $usersModel;
    private $emailService;

    // Constructeur : Initialise le modèle Users avec la connexion à la base de données
    public function __construct($conn) {
        $this->usersModel = new UserModel($conn);
        $this->emailService = new EmailService();
    }

    public function register($data) {
        $nom = $data['nom'] ?? '';
        $prenom = $data['prenom'] ?? '';
        $email = $data['email'] ?? '';
        $telephone = $data['telephone'] ?? '';
        $password = $data['password'] ?? '';

         // **Validation des champs obligatoires avant toute autre étape**
    if (empty($telephone)) {
        return ["success" => false, "error" => "MISSING_PHONE", "message" => "Le numéro de téléphone est obligatoire"];
    }

    if (empty($password)) {
        return ["success" => false, "error" => "MISSING_PASSWORD", "message" => "Le mot de passe est obligatoire"];
    }
    
        // Vérifier si l'utilisateur existe déjà
        $userExists = $this->usersModel->checkIfUserExists($email, $telephone);
    
        if ($userExists) {
            if (isset($userExists['email'])) {
                error_log("Cette adresse email est déjà utilisée: " . $email);
                return ["success" => false, "error" => "EMAIL_EXISTS","message" => "Cette adresse email est déjà utilisée"];
            }
            if (isset($userExists['telephone'])) {
                error_log("Ce numéro de téléphone est déjà utilisé: " . $telephone);
                return ["success" => false, "error" => "PHONE_EXISTS","message" => "Ce numéro de téléphone est déjà utilisé"];
            }
        }
    
        // Inscription de l'utilisateur
        $registered = $this->usersModel->register($nom, $prenom, $email, $password, $telephone);
    
        if (!$registered) {
            error_log("Échec de l'inscription pour: " . $email);
            return ["success" => false, "error" => "REGISTRATION_FAILED"]; 
        }
            
        return ["success" => true,
                "message" => "Utilisateur inscrit avec succès"];
    }

//     public function register($data) {
//     $nom = $data['nom'] ?? '';
//     $prenom = $data['prenom'] ?? '';
//     $email = $data['email'] ?? '';
//     $telephone = $data['telephone'] ?? '';
//     $password = $data['password'] ?? '';

//     // Vérifier si l'utilisateur existe déjà
//     $userExists = $this->usersModel->checkIfUserExists($email, $telephone);

//     if ($userExists) {
//         if ($userExists['email'] === $email) {
//             error_log("Cette adresse email est déjà utilisée: " . $email); // Debugging
//             return ["error" => "EMAIL_EXISTS"];
//         } elseif ($userExists['telephone'] === $telephone) {
//             error_log("Ce numéro de téléphone est déjà utilisé: " . $telephone); // Debugging
//             return ["error" => "PHONE_EXISTS"];
//         }
//     }

//     // Inscription de l'utilisateur
//     $registered = $this->usersModel->register($nom, $prenom, $email, $password, $telephone); // Corrected parameter order

  
//     if (!$registered) {
//         // Échec de l'inscription en base de données
//         // On retourne un code d'erreur générique qui sera géré par le frontend
//         return ["error" => "REGISTRATION_FAILED"]; 
//     }
        
//     // Succès de l'opération d'inscription
//     // On retourne un simple indicateur de succès (le message sera géré côté frontend)
//     return ["success" => true];
// }

    public function login($data) {

        // Récupération des données envoyées (avec des valeurs par défaut vides si non définies)
        $email = $data['email'] ?? '';
        $password = $data['password'] ?? '';
    
        // Vérification si le champ email est vide
        if (empty($email)) {
            return ["error" => "EMPTY_EMAIL"]; // Code d'erreur
        }
        // Vérification si le champ mot de passe est vide
        if (empty($password)) {
            return ["error" => "EMPTY_PASSWORD"]; // Code d'erreur
        }

        // Si les identifiants sont corrects et que l'utilisateur existe
        $user = $this->usersModel->login($email, $password);
    
        if ($user) {
            return [
                "success" => true, // Connexion réussie
                "user" => [
                    'id' => $user['id'],
                    'nom' => $user['nom'],
                    'prenom' => $user['prenom'],
                    'email' => $user['email']
                ]
            ];
        } else {
            // Si les identifiants sont incorrects
            return ["error" => "INVALID_CREDENTIALS"]; // Code d'erreur
        }
    }

    public function forgotPassword($data) {
        // Récupération de l'email envoyé dans les données (ou chaîne vide si non défini)
        $email = $data['email'] ?? '';
    
        // Vérifie si le champ email est vide
        if (empty($email)) {
            return ["error" => "EMPTY_EMAIL"];
        }
    
        // Recherche l'utilisateur par son adresse email
        $user = $this->usersModel->findUserByEmail($email);
        if (!$user) {
            return ["error" => "EMAIL_NOT_FOUND"];
        }
    
        // Vérifie si un lien de réinitialisation a déjà été envoyé et est encore valide
        if ($user['reset_password_token'] && strtotime($user['reset_password_expires']) > time()) {
            return ["error" => "RESET_ALREADY_SENT"];
        }
    
        // Génère un nouveau token de réinitialisation
        $token = $this->usersModel->createPasswordResetToken($email);
        if (!$token) {
            return ["error" => "TOKEN_CREATION_FAILED"];
        }
    
        try {
            // Construit l'URL de réinitialisation vers le frontend
            $resetUrl = "http://localhost:5173/reset-password?token=$token&email=" . urlencode($email);
    
            // Envoie l'email de réinitialisation
            if ($this->emailService->sendPasswordResetEmail($email, $resetUrl)) {
                return ["success" => true]; // Succès sous forme booléenne
            }
    
            return ["error" => "EMAIL_SEND_FAILED"];
        } catch (Exception $e) {
            // En cas d'exception lors de l'envoi d'email
            error_log("Email error: " . $e->getMessage());
            return ["error" => "EMAIL_SEND_ERROR"];
        }
    }
    
    // public function forgotPassword($data) {

    //     $email = $data['email'] ?? '';
        
    //     if (empty($email)) {
    //         return ["error" => "Veuillez remplir le champ email"];
    //     }
        
    //     // Check if user exists
    //     $user = $this->usersModel->findUserByEmail($email);
    //     if (!$user) {
    //         // Return error for non-existent email
    //         return ["error" => "Cette adresse email n'est pas enregistrée"];
    //     }

    //     // Check if a reset token already exists and is still valid
    //     if ($user['reset_password_token'] && 
    //         strtotime($user['reset_password_expires']) > time()) {
    //         return ["error" => "Un lien de réinitialisation a déjà été envoyé. Veuillez vérifier votre email ou attendre avant de faire une nouvelle demande."];
    //     }
        
    //     // Create reset token
    //     $token = $this->usersModel->createPasswordResetToken($email);
        
    //     if ($token) {
    //         $frontendUrl = "http://localhost:5173"; 
    //         $resetUrl = "$frontendUrl/reset-password?token=" . $token . "&email=" . urlencode($email);
            
    //         try {
    //             // Send email
    //             $emailSent = $this->emailService->sendPasswordResetEmail($email, $resetUrl);
                
    //             if ($emailSent) {
    //                 return ["success" => "Un email de réinitialisation a été envoyé"];
    //             } else {
    //                 return ["error" => "Erreur lors de l'envoi de l'email"];
    //             }
    //         } catch (Exception $e) {
    //             error_log("Email error: " . $e->getMessage());
    //             return ["error" => "Erreur lors de l'envoi de l'email"];
    //         }
    //     }
        
    //     return ["error" => "Une erreur est survenue lors de la réinitialisation"];
    // }
   
    
    public function validateResetToken($token, $email) {
        $valid = $this->usersModel->validateResetToken($token, $email);
        return ["valid" => $valid ? true : false];
    }

    public function resetPassword($data) {
        $token = trim($data['token']) ?? '';
        $email = trim($data['email']) ?? '';
        $password = $data['password'] ?? '';
    
        // Vérifie les données obligatoires
        if (empty($token) || empty($email) || empty($password)) {
            return ["error" => "INVALID_DATA"];
        }
    
        // Appelle le modèle pour réinitialiser le mot de passe
        $reset = $this->usersModel->resetPassword($email, $token, $password);
    
        if ($reset) {
            return ["success" => true]; // Succès booléen
        }
    
        return ["error" => "INVALID_OR_EXPIRED_LINK"];
    }
    
    
    // public function resetPassword($data) {
    //     $token = trim($data['token']) ?? '';
    //     $email = trim($data['email']) ?? '';
    //     $password = $data['password'] ?? '';
        
    //     if (empty($token) || empty($email) || empty($password)) {
    //         return ["error" => "Données invalides"];
    //     }
        
    //     $reset = $this->usersModel->resetPassword($email, $token, $password);
        
    //     if ($reset) {
    //         return ["success" => "Mot de passe réinitialisé avec succès"];
    //     }
        
    //     return ["error" => "Lien de réinitialisation invalide ou expiré"];
    // }
}


?>