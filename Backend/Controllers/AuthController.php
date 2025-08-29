<?php


/**
 * Authentication Controller
 * Handles user authentication operations
 */

require_once __DIR__ . '/../Models/UserModel.php';
require_once __DIR__ . '/../Services/EmailService.php';

// Start session if not already started
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

class AuthController {
    
    // Use consistent property name (userModel)
    private UserModel $userModel;
    private EmailService $emailService;

    public function __construct(PDO $conn) {
        if (!$conn) {
            throw new InvalidArgumentException("Database connection cannot be null");
        }
        
        try {
            $this->userModel = new UserModel($conn);
            $this->emailService = new EmailService();
            
            // Verify model initialization
            if (!$this->userModel) {
                throw new RuntimeException("Failed to initialize UserModel");
            }
            
        } catch (Exception $e) {
            error_log("AuthController initialization failed: " . $e->getMessage());
            throw $e;
        }
    }
    
    /**
     * Register new user
     * @param array $data
     * @return array
     */
    public function register($data) {
        // Ensure all required fields are present
        $nom = $data['nom'] ?? '';
        $prenom = $data['prenom'] ?? '';
        $email = $data['email'] ?? '';
        $telephone = $data['telephone'] ?? '';
        $password = $data['password'] ?? '';

        // Validation
        if (empty($telephone)) {
            return ["success" => false, "error" => "MISSING_PHONE", "message" => "Le numéro de téléphone est obligatoire"];
        }
        if (empty($password)) {
            return ["success" => false, "error" => "MISSING_PASSWORD", "message" => "Le mot de passe est obligatoire"];
        }

        // Check if user exists
        $userExists = $this->userModel->checkIfUserExists($email, $telephone);

        if ($userExists) {
            if (isset($userExists['email'])) {
                error_log("Cette adresse email est déjà utilisée: " . $email);
                return ["success" => false, "error" => "EMAIL_EXISTS", "message" => "Cette adresse email est déjà utilisée"];
            }
            if (isset($userExists['telephone'])) {
                error_log("Ce numéro de téléphone est déjà utilisé: " . $telephone);
                return ["success" => false, "error" => "PHONE_EXISTS", "message" => "Ce numéro de téléphone est déjà utilisé"];
            }
        }

        // Register user
        $registered = $this->userModel->register($nom, $prenom, $email, $password, $telephone);

        if (!$registered) {
            error_log("Registration failed for: " . $email);
            return ["success" => false, "error" => "REGISTRATION_FAILED"];
        }

        return ["success" => true, "message" => "Utilisateur inscrit avec succès"];
    }

public function login($data) {
    try {
        $email = $data['email'] ?? '';
        $password = $data['password'] ?? '';

        // Validate inputs
        if (empty($email)) {
            throw new RuntimeException("EMPTY_EMAIL", 400);
        }
        if (empty($password)) {
            throw new RuntimeException("EMPTY_PASSWORD", 400);
        }

        // Debug logging
        error_log("Login attempt for: " . $email);
        
        $user = $this->userModel->login($email, $password);
        
        if (!$user) {
            error_log("Invalid credentials for: " . $email);
            throw new RuntimeException("INVALID_CREDENTIALS", 401);
        }
        
        // Ensure session is started before using $_SESSION
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        if (!isset($_SESSION)) {
            $_SESSION = [];
        }
        $_SESSION['user_id'] = $user['id']; // Store the authenticated user's ID in the session
        error_log("DEBUG: AuthController - User " . $user['id'] . " successfully logged in and session set.");

        return [
            "success" => true,
            "user" => $user
        ];
        
    } catch (Exception $e) {
        error_log("Login error: " . $e->getMessage());
        return [
            "success" => false,
            "error" => $e->getMessage(),
            "message" => $this->getErrorMessage($e->getMessage())
        ];
    }
}

private function getErrorMessage($errorCode) {
    $messages = [
        'EMPTY_EMAIL' => 'Veuillez remplir le champ email',
        'EMPTY_PASSWORD' => 'Veuillez remplir le champ mot de passe',
        'INVALID_CREDENTIALS' => 'Email ou mot de passe incorrect',
        'DATABASE_ERROR' => 'Erreur de base de données'
    ];
    return $messages[$errorCode] ?? 'Une erreur est survenue';
}
    /**
     * Forgot password
     * @param array $data
     * @return array
     */
    public function forgotPassword($data) {
        $email = $data['email'] ?? '';

        if (empty($email)) {
            return ["error" => "EMPTY_EMAIL"];
        }

        $user = $this->userModel->findUserByEmail($email);
        if (!$user) {
            return ["error" => "EMAIL_NOT_FOUND"];
        }

        if ($user['reset_password_token'] && strtotime($user['reset_password_expires']) > time()) {
            return ["error" => "RESET_ALREADY_SENT"];
        }

        $token = $this->userModel->createPasswordResetToken($email);
        if (!$token) {
            return ["error" => "TOKEN_CREATION_FAILED"];
        }

        try {
            $resetUrl = "https://test.icvinformatique.com/reset-password?token=$token&email=" . urlencode($email);

            if ($this->emailService->sendPasswordResetEmail($email, $resetUrl)) {
                return ["success" => true];
            }

            return ["error" => "EMAIL_SEND_FAILED"];
        } catch (Exception $e) {
            error_log("Email error: " . $e->getMessage());
            return ["error" => "EMAIL_SEND_ERROR"];
        }
    }

    /**
     * Validate reset token
     * @param string $token
     * @param string $email
     * @return array
     */
    // public function validateResetToken($token, $email) {
    //     $valid = $this->userModel->validateResetToken($token, $email);
    //     return ["valid" => $valid ? true : false];
    // }
    // ...
    public function validateResetToken($token, $email) {
        error_log("DEBUG: AuthController - validateResetToken called with Token=" . $token . ", Email=" . $email); // Add this log
        $valid = $this->userModel->validateResetToken($token, $email);

        if ($valid) {
            error_log("DEBUG: AuthController - Token validation successful for email: " . $email);
            return ["valid" => true];
        } else {
            error_log("DEBUG: AuthController - Token validation FAILED for email: " . $email);
            // Provide a more specific error message to the frontend if possible
            // For now, it will return valid: false, and frontend handles the generic message
            return ["valid" => false, "message" => "Ce lien a expiré ou est invalide."]; // Added message
        }
    }
// ...

    /**
     * Reset password
     * @param array $data
     * @return array
     */
    public function resetPassword($data) {
        $token = trim($data['token']) ?? '';
        $email = trim($data['email']) ?? '';
        $password = $data['password'] ?? '';

        if (empty($token) || empty($email) || empty($password)) {
            return ["error" => "INVALID_DATA"];
        }

        $reset = $this->userModel->resetPassword($email, $token, $password);

        if ($reset) {
            return ["success" => true];
        }

        return ["error" => "INVALID_OR_EXPIRED_LINK"];
    }
}





?>