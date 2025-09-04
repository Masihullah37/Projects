<?php

class SecurityService {

    /**
     * Génère et stocke un nouveau jeton CSRF dans la session.
     *
     * @return string Le jeton CSRF généré.
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
     * Valide un jeton CSRF reçu dans l’en-tête de la requête
     * en le comparant avec celui stocké en session.
     * Utilise uniquement l’en-tête "X-CSRF-Token" pour la validation.
     *
     * @return bool Vrai si les jetons correspondent, faux sinon.
     */
    public static function validateCsrfToken() {
        // Étape 1 : Vérifier si une session est déjà active.
        // Si aucune session n’est démarrée, on en démarre une
        // ou on récupère celle associée au cookie PHPSESSID envoyé par le navigateur.
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        // Récupérer le jeton CSRF uniquement depuis l’en-tête HTTP "X-CSRF-Token".
        $token = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
        
        // Vérifie si le jeton reçu ou celui stocké en session est vide.
        if (empty($token) || !isset($_SESSION['csrf_token'])) {
            return false;   
        }
        
        // Comparer le jeton reçu ($token) avec celui stocké en session ($_SESSION['csrf_token']).
        // La fonction hash_equals() effectue une comparaison en temps constant,
        // ce qui empêche toute fuite d’information basée sur le temps de réponse.
        return hash_equals($_SESSION['csrf_token'], $token);
    }

    /**
     * Nettoie les données d’entrée pour prévenir les failles XSS.
     *
     * @param mixed $data Les données à nettoyer.
     * @return mixed Les données nettoyées.
     */
    public static function sanitizeInput($data) {
        if (is_array($data)) {
            return array_map('self::sanitizeInput', $data);
        }
        return htmlspecialchars($data, ENT_QUOTES, 'UTF-8');
    }

    /**
     * Définit des en-têtes de sécurité communs pour se protéger
     * contre différentes attaques.
     */
    public static function setSecurityHeaders() {
        header("X-Content-Type-Options: nosniff");
        header("X-Frame-Options: DENY");
        header("X-XSS-Protection: 1; mode=block");
        header("Referrer-Policy: strict-origin-when-cross-origin");
    }
}
