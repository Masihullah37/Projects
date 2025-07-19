<?php
// Services/SecurityService.php

class SecurityService {
    // CSRF Protection
    public static function generateCsrfToken() {
        if (empty($_SESSION['csrf_token'])) {
            $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
        }
        return $_SESSION['csrf_token'];
    }

    public static function validateCsrfToken($token) {
        if (!isset($_SESSION['csrf_token']) || !hash_equals($_SESSION['csrf_token'], $token)) {
            http_response_code(403);
            echo json_encode(["error" => "Invalid CSRF token"]);
            exit;
        }
        return true;
    }

    // XSS Protection
    public static function sanitizeInput($data) {
        if (is_array($data)) {
            return array_map([self::class, 'sanitizeInput'], $data);
        }
        return htmlspecialchars($data, ENT_QUOTES | ENT_HTML5, 'UTF-8');
    }

    // Content Security Policy Headers
    public static function setSecurityHeaders() {
        $csp = [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' https://js.stripe.com",
            "style-src 'self' 'unsafe-inline'",
            "img-src 'self' data:",
            "font-src 'self'",
            "connect-src 'self' " . ($_SERVER['HTTPS'] === 'on' ? 'https://' : 'http://') . $_SERVER['HTTP_HOST'],
            "frame-src https://js.stripe.com",
            "object-src 'none'",
            "base-uri 'self'",
            "form-action 'self'"
        ];
        
        header("Content-Security-Policy: " . implode("; ", $csp));
        header("X-Content-Type-Options: nosniff");
        header("X-Frame-Options: DENY");
        header("X-XSS-Protection: 1; mode=block");
    }

  
    public static function secureJsonResponse($data, $statusCode = 200) {
        // Clear any existing output buffers
        while (ob_get_level() > 0) {
            ob_end_clean();
        }
        
        // Set status code and headers
        http_response_code($statusCode);
        header('Content-Type: application/json; charset=utf-8');
        
        // Ensure the data is properly encoded to JSON
        $json = json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        
        if ($json === false) {
            // JSON encoding failed - send error response
            $errorResponse = [
                'error' => 'Failed to encode response data',
                'details' => json_last_error_msg()
            ];
            echo json_encode($errorResponse);
        } else {
            // Send the properly encoded JSON
            echo $json;
        }
        
        exit;
    }
}