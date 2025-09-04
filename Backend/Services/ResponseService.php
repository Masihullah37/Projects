<?php

class ResponseService {
    public static function sendSuccess($data, $statusCode = 200) {
        self::sendResponse([
            'success' => true,
            'data' => $data // Data should be an array or object
        ], $statusCode);
    }

    /**
     * Sends an error response.
     *
     * @param string $message The main error message for the user.
     * @param int $statusCode The HTTP status code (e.g., 400, 401, 500).
     * @param array $errorData Optional: an associative array to include specific error details (e.g., ['error' => 'INSUFFICIENT_STOCK', 'available_stock' => 5]).
     */
    public static function sendError($message, $statusCode = 400, $errorData = []) {
        self::sendResponse([
            'success' => false,
            'message' => $message, 
            'data' => $errorData 
        ], $statusCode);
    }

    private static function sendResponse($data, $statusCode) {
        // Clear all output buffers
        while (ob_get_level()) {
            ob_end_clean();
        }
        
        // Set headers
        header('Content-Type: application/json');
        http_response_code($statusCode);
        
        // Output JSON and exit
        echo json_encode($data, JSON_UNESCAPED_UNICODE);
        exit();
    }
}