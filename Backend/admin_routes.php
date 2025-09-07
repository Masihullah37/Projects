<?php

// Clear all output buffers
while (ob_get_level() > 0) ob_end_clean();
ob_start();

// Error reporting
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/logs/admin_errors.log');

// Load dependencies
require_once __DIR__ . '/vendor/autoload.php';
require_once __DIR__ . '/Services/ResponseService.php';
require_once __DIR__ . '/Services/SecurityService.php';
require_once __DIR__ . '/Controllers/AdminController.php';
require_once __DIR__ . '/Config/Database.php';

// Load environment variables
try {
    $dotenv = Dotenv\Dotenv::createImmutable(__DIR__, '.env.local');
    $dotenv->load();
} catch (Exception $e) {
    error_log("ERROR: .env file not found: " . $e->getMessage());
    ResponseService::sendError('Configuration error', 500);
}

// CORS headers
$allowedOrigins = [
    'http://localhost:5173',
    'https://test.icvinformatique.com',
    'https://www.test.icvinformatique.com'
];

$requestOrigin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowedOrigin = in_array($requestOrigin, $allowedOrigins) ? $requestOrigin : 'http://localhost:5173';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header("Access-Control-Allow-Origin: $allowedOrigin");
    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization, X-CSRF-Token");
    header("Access-Control-Allow-Credentials: true");
    http_response_code(204);
    exit();
}

header("Access-Control-Allow-Origin: $allowedOrigin");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-CSRF-Token");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json;charset=UTF-8");

// Session configuration
session_start();

// Database connection
try {
    $database = new Database(
        $_ENV['DB_HOST'],
        $_ENV['DB_NAME'],
        $_ENV['DB_USER'],
        $_ENV['DB_PASS']
    );
    $conn = $database->getConnection();
} catch (Exception $e) {
    error_log("Database connection failed: " . $e->getMessage());
    ResponseService::sendError('Database connection failed', 500);
}

// Initialize controller
$adminController = new AdminController($conn);

// Get action
$action = $_GET['action'] ?? '';

// Generate CSRF token for protected actions
$protectedActions = ['admin_login', 'create_admin', 'add_product', 'update_product', 'delete_product', 'delete_user', 'toggle_user_status', 'update_repair_status', 'admin_forgot_password', 'admin_reset_password'];

if (in_array($action, $protectedActions)) {
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = SecurityService::generateCsrfToken();
    }
}

// Admin authentication check for protected routes
$adminOnlyActions = ['get_users', 'create_admin', 'add_product', 'update_product', 'delete_product', 'delete_user', 'toggle_user_status', 'get_repairs', 'update_repair_status', 'get_dashboard_stats'];

if (in_array($action, $adminOnlyActions)) {
    if (!isset($_SESSION['admin_id']) || !isset($_SESSION['is_admin'])) {
        ResponseService::sendError('Admin authentication required', 401);
    }
}

try {
    switch ($action) {
        case 'admin_login':
            if ($_SERVER['REQUEST_METHOD'] === 'POST') {
                if (!isset($_SERVER['HTTP_X_CSRF_TOKEN'])) {
                    ResponseService::sendError("CSRF token missing", 403);
                }
                SecurityService::validateCsrfToken();
                
                $data = json_decode(file_get_contents("php://input"), true);
                if ($data) {
                    $data = SecurityService::sanitizeInput($data);
                    $response = $adminController->login($data);
                    ResponseService::sendSuccess($response);
                } else {
                    ResponseService::sendError("Invalid JSON data", 400);
                }
            } else {
                ResponseService::sendError("Method not allowed", 405);
            }
            break;

        case 'admin_logout':
            $_SESSION = [];
            if (ini_get("session.use_cookies")) {
                $params = session_get_cookie_params();
                setcookie(session_name(), '', time() - 3600, $params["path"], $params["domain"], $params["secure"], $params["httponly"]);
            }
            session_destroy();
            ResponseService::sendSuccess(['success' => true, 'message' => 'Logout successful']);
            break;

        case 'check_admin_session':
            if (isset($_SESSION['admin_id']) && isset($_SESSION['is_admin'])) {
                ResponseService::sendSuccess([
                    'loggedIn' => true,
                    'admin_id' => $_SESSION['admin_id'],
                    'username' => $_SESSION['admin_username'] ?? ''
                ]);
            } else {
                ResponseService::sendSuccess(['loggedIn' => false]);
            }
            break;

        case 'create_admin':
            if ($_SERVER['REQUEST_METHOD'] === 'POST') {
                if (!isset($_SERVER['HTTP_X_CSRF_TOKEN'])) {
                    ResponseService::sendError("CSRF token missing", 403);
                }
                SecurityService::validateCsrfToken();
                
                $data = json_decode(file_get_contents("php://input"), true);
                if ($data) {
                    $data = SecurityService::sanitizeInput($data);
                    $response = $adminController->createAdmin($data);
                    ResponseService::sendSuccess($response);
                } else {
                    ResponseService::sendError("Invalid JSON data", 400);
                }
            } else {
                ResponseService::sendError("Method not allowed", 405);
            }
            break;

        case 'get_users':
            if ($_SERVER['REQUEST_METHOD'] === 'GET') {
                $response = $adminController->getUsers();
                ResponseService::sendSuccess($response);
            } else {
                ResponseService::sendError("Method not allowed", 405);
            }
            break;

        case 'toggle_user_status':
            if ($_SERVER['REQUEST_METHOD'] === 'POST') {
                if (!isset($_SERVER['HTTP_X_CSRF_TOKEN'])) {
                    ResponseService::sendError("CSRF token missing", 403);
                }
                SecurityService::validateCsrfToken();
                
                $data = json_decode(file_get_contents("php://input"), true);
                if ($data) {
                    $data = SecurityService::sanitizeInput($data);
                    $response = $adminController->toggleUserStatus($data);
                    ResponseService::sendSuccess($response);
                } else {
                    ResponseService::sendError("Invalid JSON data", 400);
                }
            } else {
                ResponseService::sendError("Method not allowed", 405);
            }
            break;

        case 'delete_user':
            if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
                if (!isset($_SERVER['HTTP_X_CSRF_TOKEN'])) {
                    ResponseService::sendError("CSRF token missing", 403);
                }
                SecurityService::validateCsrfToken();
                
                $userId = $_GET['user_id'] ?? '';
                $response = $adminController->deleteUser($userId);
                ResponseService::sendSuccess($response);
            } else {
                ResponseService::sendError("Method not allowed", 405);
            }
            break;

        case 'admin_add_product':
            if ($_SERVER['REQUEST_METHOD'] === 'POST') {
                if (!isset($_SERVER['HTTP_X_CSRF_TOKEN'])) {
                    ResponseService::sendError("CSRF token missing", 403);
                }
                SecurityService::validateCsrfToken();
                
                $data = $_POST;
                $files = $_FILES;
                $response = $adminController->addProduct($data, $files);
                ResponseService::sendSuccess($response);
            } else {
                ResponseService::sendError("Method not allowed", 405);
            }
            break;

        case 'admin_update_product':
            if ($_SERVER['REQUEST_METHOD'] === 'POST') {
                if (!isset($_SERVER['HTTP_X_CSRF_TOKEN'])) {
                    ResponseService::sendError("CSRF token missing", 403);
                }
                SecurityService::validateCsrfToken();
                
                $data = $_POST;
                $files = $_FILES;
                $response = $adminController->updateProduct($data, $files);
                ResponseService::sendSuccess($response);
            } else {
                ResponseService::sendError("Method not allowed", 405);
            }
            break;

        case 'admin_delete_product':
            if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
                if (!isset($_SERVER['HTTP_X_CSRF_TOKEN'])) {
                    ResponseService::sendError("CSRF token missing", 403);
                }
                SecurityService::validateCsrfToken();
                
                $productId = $_GET['product_id'] ?? '';
                $response = $adminController->deleteProduct($productId);
                ResponseService::sendSuccess($response);
            } else {
                ResponseService::sendError("Method not allowed", 405);
            }
            break;

        case 'get_repairs':
            if ($_SERVER['REQUEST_METHOD'] === 'GET') {
                $response = $adminController->getRepairs();
                ResponseService::sendSuccess($response);
            } else {
                ResponseService::sendError("Method not allowed", 405);
            }
            break;

        case 'update_repair_status':
            if ($_SERVER['REQUEST_METHOD'] === 'POST') {
                if (!isset($_SERVER['HTTP_X_CSRF_TOKEN'])) {
                    ResponseService::sendError("CSRF token missing", 403);
                }
                SecurityService::validateCsrfToken();
                
                $data = json_decode(file_get_contents("php://input"), true);
                if ($data) {
                    $data = SecurityService::sanitizeInput($data);
                    $response = $adminController->updateRepairStatus($data);
                    ResponseService::sendSuccess($response);
                } else {
                    ResponseService::sendError("Invalid JSON data", 400);
                }
            } else {
                ResponseService::sendError("Method not allowed", 405);
            }
            break;

        case 'admin_forgot_password':
            if ($_SERVER['REQUEST_METHOD'] === 'POST') {
                if (!isset($_SERVER['HTTP_X_CSRF_TOKEN'])) {
                    ResponseService::sendError("CSRF token missing", 403);
                }
                SecurityService::validateCsrfToken();
                
                $data = json_decode(file_get_contents("php://input"), true);
                if ($data) {
                    $data = SecurityService::sanitizeInput($data);
                    $response = $adminController->forgotPassword($data);
                    ResponseService::sendSuccess($response);
                } else {
                    ResponseService::sendError("Invalid JSON data", 400);
                }
            } else {
                ResponseService::sendError("Method not allowed", 405);
            }
            break;

        case 'admin_reset_password':
            if ($_SERVER['REQUEST_METHOD'] === 'POST') {
                if (!isset($_SERVER['HTTP_X_CSRF_TOKEN'])) {
                    ResponseService::sendError("CSRF token missing", 403);
                }
                SecurityService::validateCsrfToken();
                
                $data = json_decode(file_get_contents("php://input"), true);
                if ($data) {
                    $data = SecurityService::sanitizeInput($data);
                    $response = $adminController->resetPassword($data);
                    ResponseService::sendSuccess($response);
                } else {
                    ResponseService::sendError("Invalid JSON data", 400);
                }
            } else {
                ResponseService::sendError("Method not allowed", 405);
            }
            break;

        case 'get_dashboard_stats':
            if ($_SERVER['REQUEST_METHOD'] === 'GET') {
                $response = $adminController->getDashboardStats();
                ResponseService::sendSuccess($response);
            } else {
                ResponseService::sendError("Method not allowed", 405);
            }
            break;

        case 'get_csrf':
            if (empty($_SESSION['csrf_token'])) {
                $_SESSION['csrf_token'] = SecurityService::generateCsrfToken();
            }
            ResponseService::sendSuccess([
                'csrf_token' => $_SESSION['csrf_token'],
                'timestamp' => time()
            ]);
            break;

        default:
            ResponseService::sendError("Action not recognized: " . $action, 404);
            break;
    }

} catch (Exception $e) {
    error_log("Unhandled exception in admin_routes.php: " . $e->getMessage());
    ResponseService::sendError("An unexpected error occurred", 500);
}

?>