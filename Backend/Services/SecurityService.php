<?php


// ========= SECURITY SERVICE (INLINE) =========
class SecurityService {
    public static function generateCsrfToken() {
        return bin2hex(random_bytes(32));
    }

    public static function validateCsrfToken($token) {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        if (!isset($_SESSION)) {
            $_SESSION = [];
        }
        if (empty($token) || empty($_SESSION['csrf_token'])) {
            return false; // Don't throw exception, just return false
        }
        
        return hash_equals($_SESSION['csrf_token'], $token);
    }

    public static function sanitizeInput($data) {
        if (is_array($data)) {
            return array_map([self::class, 'sanitizeInput'], $data);
        }
        
        return htmlspecialchars(strip_tags(trim($data)), ENT_QUOTES, 'UTF-8');
    }

    public static function setSecurityHeaders() {
        header("X-Content-Type-Options: nosniff");
        header("X-Frame-Options: DENY");
        header("X-XSS-Protection: 1; mode=block");
        header("Referrer-Policy: strict-origin-when-cross-origin");
    }
}
