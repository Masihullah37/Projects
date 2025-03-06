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

    // Vérifier si l'utilisateur existe déjà
    $userExists = $this->usersModel->checkIfUserExists($email, $telephone);

    if ($userExists) {
        if ($userExists['email'] === $email) {
            error_log("Email already exists: " . $email); // Debugging
            return ["error" => "EMAIL_EXISTS"];
        } elseif ($userExists['telephone'] === $telephone) {
            error_log("Phone already exists: " . $telephone); // Debugging
            return ["error" => "PHONE_EXISTS"];
        }
    }

    // Inscription de l'utilisateur
    $registered = $this->usersModel->register($nom, $prenom, $email, $password, $telephone); // Corrected parameter order

    if ($registered) {
        return ["success" => "Utilisateur inscrit avec succès"];
    } else {
        return ["error" => "Échec de l'inscription"];
    }
}

    public function login($data) {
        $email = $data['email'] ?? '';
        $password = $data['password'] ?? '';
    
        // Validate if email is empty
        if (empty($email)) {
            return ["error" => "Veuillez remplir le champ email"];
        }
    
        // Validate if password is empty
        if (empty($password)) {
            return ["error" => "Veuillez remplir le champ mot de passe"];
        }
    
        // Attempt to log in the user
        $user = $this->usersModel->login($email, $password);
    
        if ($user) {
            return $user; // Return user data if login is successful
        } else {
            return ["error" => "Email ou mot de passe incorrect"];
        }
    }

    public function forgotPassword($data) {

        $email = $data['email'] ?? '';
        
        if (empty($email)) {
            return ["error" => "Veuillez remplir le champ email"];
        }
        
        // Check if user exists
        $user = $this->usersModel->findUserByEmail($email);
        if (!$user) {
            // Return error for non-existent email
            return ["error" => "Cette adresse email n'est pas enregistrée"];
        }

        // Check if a reset token already exists and is still valid
        if ($user['reset_password_token'] && 
            strtotime($user['reset_password_expires']) > time()) {
            return ["error" => "Un lien de réinitialisation a déjà été envoyé. Veuillez vérifier votre email ou attendre avant de faire une nouvelle demande."];
        }
        
        // Create reset token
        $token = $this->usersModel->createPasswordResetToken($email);
        
        if ($token) {
            $frontendUrl = "http://localhost:5173"; // Changed from 3000 to 5173
            $resetUrl = "$frontendUrl/reset-password?token=" . $token . "&email=" . urlencode($email);
            
            try {
                // Send email
                $emailSent = $this->emailService->sendPasswordResetEmail($email, $resetUrl);
                
                if ($emailSent) {
                    return ["success" => "Un email de réinitialisation a été envoyé"];
                } else {
                    return ["error" => "Erreur lors de l'envoi de l'email"];
                }
            } catch (Exception $e) {
                error_log("Email error: " . $e->getMessage());
                return ["error" => "Erreur lors de l'envoi de l'email"];
            }
        }
        
        return ["error" => "Une erreur est survenue lors de la réinitialisation"];
    }
   
    
    public function validateResetToken($token, $email) {
        $valid = $this->usersModel->validateResetToken($token, $email);
        return ["valid" => $valid ? true : false];
    }
    
    public function resetPassword($data) {
        $token = trim($data['token']) ?? '';
        $email = trim($data['email']) ?? '';
        $password = $data['password'] ?? '';
        
        if (empty($token) || empty($email) || empty($password)) {
            return ["error" => "Données invalides"];
        }
        
        $reset = $this->usersModel->resetPassword($email, $token, $password);
        
        if ($reset) {
            return ["success" => "Mot de passe réinitialisé avec succès"];
        }
        
        return ["error" => "Lien de réinitialisation invalide ou expiré"];
    }
}


?>