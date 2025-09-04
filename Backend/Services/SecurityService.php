<?php


class SecurityService {

    /**
     * Generates and stores a new CSRF token in the session.
     *
     * @return string The generated CSRF token.
     */
    public static function generateCsrfToken() {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        if (!isset($_SESSION)) {
            $_SESSION = [];
        }
        $token = bin2hex(random_bytes(32));
        $_SESSION['csrf_token'] = $token;
        return $token;
    }

   /**
 * Validates a CSRF token from the request header against the one in the session.
 * Now uses only the X-CSRF-Token header for validation (no body parameter).
 *
 * @return bool True if the tokens match, false otherwise.
 */
public static function validateCsrfToken() {
     // Étape 1 : Vérifier si une session est déjà active.
    // Si aucune session n'est démarrée, on démarre une nouvelle session
    // ou on récupère celle liée au cookie PHPSESSID envoyé par le navigateur.
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }

    //Récupérer le jeton CSRF uniquement depuis l’en-tête HTTP "X-CSRF-Token".
    $token = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
    
    // Check if either the received token or the session token is empty.
    if (empty($token) || !isset($_SESSION['csrf_token'])) {
        return false;   
    }
    
    //On compare le jeton reçu ($token) avec celui stocké en session ($_SESSION['csrf_token']).
    // Avec hash_equals(), la comparaison est faite en temps constant (toujours la même durée),
    //ce qui empêche toute fuite d’information basée sur la vitesse de réponse.
    return hash_equals($_SESSION['csrf_token'], $token);
}

    /**
     * Sanitizes input data to prevent Cross-Site Scripting (XSS).
     *
     * @param mixed $data The input data to be sanitized.
     * @return mixed The sanitized data.
     */
    public static function sanitizeInput($data) {
        if (is_array($data)) {
            return array_map('self::sanitizeInput', $data);
        }
        return htmlspecialchars($data, ENT_QUOTES, 'UTF-8');
    }

    /**
     * Sets common security headers to protect against various attacks.
     */
    public static function setSecurityHeaders() {
        header("X-Content-Type-Options: nosniff");
        header("X-Frame-Options: DENY");
        header("X-XSS-Protection: 1; mode=block");
        header("Referrer-Policy: strict-origin-when-cross-origin");
    }
}
