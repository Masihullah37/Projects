    <?php


// ========= ACTIVER LE BUFFERING =========
ob_start();

// ========= DÉTECTION ENVIRONNEMENT (DEV/PROD) =========
$isDevEnvironment = in_array($_SERVER['HTTP_HOST'] ?? '', [
    'localhost', 
    'localhost:5173',
    '127.0.0.1',
    'localhost:8000'
]) || strpos($_SERVER['HTTP_HOST'] ?? '', '.local') !== false;

// ========= CORS (mettre AVANT TOUT !) =========
$allowedOrigins = [
    'http://localhost:5173',
    'https://test.icvinformatique.com',
    'https://www.test.icvinformatique.com'
];

$requestOrigin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowedOrigin = in_array($requestOrigin, $allowedOrigins) ? $requestOrigin : 
                ($isDevEnvironment ? "http://localhost:5173" : "https://test.icvinformatique.com'");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header("Access-Control-Allow-Origin: $allowedOrigin");
    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization, X-CSRF-Token");
    header("Access-Control-Allow-Credentials: true");
    header("Access-Control-Max-Age: 86400"); // Cache for 1 day
    http_response_code(204);
    exit();
}

header("Access-Control-Allow-Origin: $allowedOrigin");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-CSRF-Token");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");
header("X-Content-Type-Options: nosniff");
header("X-Frame-Options: DENY");
header("X-XSS-Protection: 1; mode=block");

// ========= SESSION SÉCURISÉE =========
$isHttps = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') 
         || $_SERVER['SERVER_PORT'] == 443
         || (!empty($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] == 'https');

session_set_cookie_params([
    'lifetime' => 86400, // 24 hours
    'path' => '/',
    'domain' => $isDevEnvironment ? null : $_SERVER['HTTP_HOST'], // Dynamic for prod
    'secure' => $isHttps,
    'httponly' => true,
    'samesite' => 'Lax'
]);


session_start();

// ========= SECURITY SERVICE INITIALIZATION =========
require_once 'Services/SecurityService.php';
SecurityService::setSecurityHeaders();

// ========= GESTION DES ERREURS (DIFFÉRENTE EN DEV/PROD) =========
ini_set('display_errors', $isDevEnvironment ? 1 : 0);
ini_set('display_startup_errors', $isDevEnvironment ? 1 : 0);
// error_reporting($isDevEnvironment ? E_ALL : E_ALL & ~E_DEPRECATED & ~E_STRICT);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/php-errors.log');

// ========= SECURITÉ SUPPLÉMENTAIRE =========
if (!$isDevEnvironment) {
    header("Strict-Transport-Security: max-age=63072000; includeSubDomains; preload");
    header("Referrer-Policy: strict-origin-when-cross-origin");
    header_remove('X-Powered-By');
    ini_set('expose_php', 'off');
}

// ========= PROTECTION CONTRE LES FAILLES COURANTES =========
ini_set('session.cookie_httponly', '1');
ini_set('session.cookie_secure', $isHttps ? '1' : '0');
ini_set('session.use_strict_mode', '1');
ini_set('session.cookie_samesite', 'strict');

// Include required files
require_once __DIR__ . '/vendor/autoload.php';
require_once 'Config/Database.php';
require_once 'Controllers/AuthController.php';
require_once 'Controllers/PurchaseController.php';
require_once 'Controllers/RepairController.php';
require_once 'Controllers/ProductController.php';
require_once 'Controllers/PaymentController.php';

// Initialize the database
$database = new Database();
$conn = $database->getConnection();

// Initialize controllers
$authController = new AuthController($conn);
$purchaseController = new PurchaseController($conn);
$repairController = new RepairController($conn);
$productController = new ProductController($conn);
$paymentController = new PaymentController($conn);

// Get the action from the request
$action = $_GET['action'] ?? '';

// Debugging: Log the action
error_log("Action received: " . $action);


function sendJsonResponse($data, $statusCode = 200) {
    // Ensure we're working with clean output
    if (ob_get_length()) {
        ob_clean();
    }
    
    // Let SecurityService handle the secure response
    SecurityService::secureJsonResponse($data, $statusCode);
}


// Generate CSRF token for GET requests that need forms
if (in_array($action, ['register', 'login', 'add_purchase', 'add_payment', 'reset_password', 'forgot_password'])) {
    $_SESSION['csrf_token'] = SecurityService::generateCsrfToken();
}

// ========= GESTION DES ACTIONS =========
switch ($action) {
    case 'register':
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $data = json_decode(file_get_contents("php://input"), true);
            if ($data) {
                SecurityService::validateCsrfToken($data['csrf_token'] ?? '');
                $data = SecurityService::sanitizeInput($data);
                sendJsonResponse($authController->register($data));
            } else {
                sendJsonResponse(["error" => "Données JSON invalides"], 400);
            }
        } else {
            sendJsonResponse(["error" => "Méthode invalide. Utilisez POST."], 405);
        }
        break;

    case 'login':
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $data = json_decode(file_get_contents("php://input"), true);
            if ($data) {
                SecurityService::validateCsrfToken($data['csrf_token'] ?? '');
                $data = SecurityService::sanitizeInput($data);
                $response = $authController->login($data);

                if (isset($response['error'])) {
                    sendJsonResponse(["error" => $response['error']], 400);
                }

                if ($response && isset($response['user']['id'])) {
                    $_SESSION['user_id'] = $response['user']['id'];
                    $_SESSION['user_email'] = $response['user']['email'];
                    $_SESSION['csrf_token'] = SecurityService::generateCsrfToken();

                    sendJsonResponse([
                        "success" => true,
                        "message" => "Login successful",
                        "user" => $response['user'],
                        "csrf_token" => $_SESSION['csrf_token']
                    ]);
                } else {
                    sendJsonResponse(["error" => "INVALID_CREDENTIALS"], 401);
                }
            } else {
                sendJsonResponse(["error" => "Invalid JSON"], 400);
            }
        } else {
            sendJsonResponse(["error" => "Use POST method"], 405);
        }
        break;

    case 'logout':
        session_destroy();
        sendJsonResponse(["success" => true, "message" => "Logout successful"]);
        break;

    case 'check_session':
        if (isset($_SESSION['user_id'])) {
            sendJsonResponse([
                "loggedIn" => true,
                "user_id" => $_SESSION['user_id'],
                "email" => $_SESSION['user_email'] ?? '',
                "csrf_token" => $_SESSION['csrf_token'] ?? ''
            ]);
        } else {
            sendJsonResponse(["loggedIn" => false]);
        }
        break;

    case 'add_purchase':
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            if (!isset($_SESSION['user_id'])) {
                sendJsonResponse(["error" => "Not authenticated"], 401);
            }

            $data = json_decode(file_get_contents("php://input"), true);
            if ($data) {
                SecurityService::validateCsrfToken($data['csrf_token'] ?? '');
                $data = SecurityService::sanitizeInput($data);
                if (isset($data['product_id'], $data['quantity'])) {
                    $user_id = $_SESSION['user_id'];
                    sendJsonResponse($purchaseController->addPurchase($user_id, $data['product_id'], $data['quantity']));
                } else {
                    sendJsonResponse(["error" => "Invalid JSON data"], 400);
                }
            } else {
                sendJsonResponse(["error" => "Invalid JSON data"], 400);
            }
        } else {
            sendJsonResponse(["error" => "Invalid method. Use POST."], 405);
        }
        break;

    case 'get_purchases':
        if ($_SERVER['REQUEST_METHOD'] === 'GET') {
            if (!isset($_SESSION['user_id'])) {
                sendJsonResponse(["error" => "Not authenticated"], 401);
            }
            $user_id = $_SESSION['user_id'];
            sendJsonResponse($purchaseController->getPurchases($user_id));
        } else {
            sendJsonResponse(["error" => "Invalid method. Use GET."], 405);
        }
        break;

    case 'add_repair':
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $data = json_decode(file_get_contents("php://input"), true);
            if ($data) {
                SecurityService::validateCsrfToken($data['csrf_token'] ?? '');
                $data = SecurityService::sanitizeInput($data);
                sendJsonResponse($repairController->addRepair($data));
            } else {
                sendJsonResponse(["error" => "Données JSON invalides"], 400);
            }
        } else {
            sendJsonResponse(["error" => "Méthode invalide. Utilisez POST."], 405);
        }
        break;

    case 'get_repairs':
        if ($_SERVER['REQUEST_METHOD'] === 'GET') {
            sendJsonResponse($repairController->getRepairs());
        } else {
            sendJsonResponse(["error" => "Méthode invalide. Utilisez GET."], 405);
        }
        break;

    case 'update_repair_status':
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $data = json_decode(file_get_contents("php://input"), true);
            if ($data) {
                SecurityService::validateCsrfToken($data['csrf_token'] ?? '');
                $data = SecurityService::sanitizeInput($data);
                sendJsonResponse($repairController->updateStatus($data));
            } else {
                sendJsonResponse(["error" => "Données JSON invalides"], 400);
            }
        } else {
            sendJsonResponse(["error" => "Méthode invalide. Utilisez POST."], 405);
        }
        break;

    case 'add_product':
        if (!isset($_SESSION['user_id'])) {
            sendJsonResponse(["error" => "Not authenticated"], 401);
        }
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $data = json_decode(file_get_contents("php://input"), true);
            if ($data) {
                SecurityService::validateCsrfToken($data['csrf_token'] ?? '');
                $data = SecurityService::sanitizeInput($data);
                sendJsonResponse($productController->addProduct($data));
            } else {
                sendJsonResponse(["error" => "Données JSON invalides"], 400);
            }
        } else {
            sendJsonResponse(["error" => "Méthode invalide. Utilisez POST."], 405);
        }
        break;

    case 'get_products':
        if ($_SERVER['REQUEST_METHOD'] === 'GET') {
            sendJsonResponse($productController->getProducts());
        } else {
            sendJsonResponse(["error" => "Méthode invalide. Utilisez GET."], 405);
        }
        break;

    case 'get_product':
        if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['id'])) {
            $id = SecurityService::sanitizeInput($_GET['id']);
            sendJsonResponse($productController->getProductById($id));
        } else {
            sendJsonResponse(["error" => "ID de produit manquant ou invalide"], 400);
        }
        break;

    case 'add_payment':
        if (!isset($_SESSION['user_id'])) {
            sendJsonResponse(["error" => "Not authenticated"], 401);
        }
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $data = json_decode(file_get_contents("php://input"), true);
            if ($data) {
                SecurityService::validateCsrfToken($data['csrf_token'] ?? '');
                $data = SecurityService::sanitizeInput($data);
                $data['user_id'] = $_SESSION['user_id'];
                sendJsonResponse($paymentController->addPayment($data));
            } else {
                sendJsonResponse(["error" => "Données JSON invalides"], 400);
            }
        } else {
            sendJsonResponse(["error" => "Méthode invalide. Utilisez POST."], 405);
        }
        break;

    case 'get_or_create_achat':
        if (!isset($_SESSION['user_id'])) {
            sendJsonResponse(["error" => "Not authenticated"], 401);
        }
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $data = json_decode(file_get_contents("php://input"), true);
            if ($data) {
                SecurityService::validateCsrfToken($data['csrf_token'] ?? '');
                $data = SecurityService::sanitizeInput($data);
                if (!empty($data['cart_items']) && is_array($data['cart_items'])) {
                    $user_id = $_SESSION['user_id'];
                    sendJsonResponse($paymentController->getOrCreateAchat($user_id, $data['cart_items']));
                } else {
                    sendJsonResponse(["error" => "Panier vide ou invalide"], 400);
                }
            } else {
                sendJsonResponse(["error" => "Données JSON invalides"], 400);
            }
        } else {
            sendJsonResponse(["error" => "Méthode invalide. Utilisez POST."], 405);
        }
        break;

    case 'update_payment_status':
        if (!isset($_SESSION['user_id'])) {
            sendJsonResponse(["error" => "Not authenticated"], 401);
        }
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $data = json_decode(file_get_contents("php://input"), true);
            if ($data) {
                SecurityService::validateCsrfToken($data['csrf_token'] ?? '');
                $data = SecurityService::sanitizeInput($data);
                sendJsonResponse($paymentController->updatePaymentStatus($data));
            } else {
                sendJsonResponse(["error" => "Données JSON invalides"], 400);
            }
        } else {
            sendJsonResponse(["error" => "Méthode invalide. Utilisez POST."], 405);
        }
        break;

    case 'get_payment':
        if (!isset($_SESSION['user_id'])) {
            sendJsonResponse(["error" => "Not authenticated"], 401);
        }
        if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['payment_id'])) {
            $payment_id = SecurityService::sanitizeInput($_GET['payment_id']);
            sendJsonResponse($paymentController->getPayment($payment_id));
        } else {
            sendJsonResponse(["error" => "ID de paiement manquant ou invalide"], 400);
        }
        break;

    case 'get_purchase_history':
        if (!isset($_SESSION['user_id'])) {
            sendJsonResponse(["error" => "Not authenticated"], 401);
        }
        if ($_SERVER['REQUEST_METHOD'] === 'GET') {
            $user_id = $_SESSION['user_id'];
            sendJsonResponse($paymentController->getUserPurchaseHistory($user_id));
        } else {
            sendJsonResponse(["error" => "Méthode invalide. Utilisez GET."], 405);
        }
        break;

    case 'forgot_password':
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $data = json_decode(file_get_contents("php://input"), true);
            if ($data) {
                SecurityService::validateCsrfToken($data['csrf_token'] ?? '');
                $data = SecurityService::sanitizeInput($data);
                sendJsonResponse($authController->forgotPassword($data));
            } else {
                sendJsonResponse(["error" => "Données JSON invalides"], 400);
            }
        } else {
            sendJsonResponse(["error" => "Méthode invalide. Utilisez POST."], 405);
        }
        break;

    case 'validate_reset_token':
        if ($_SERVER['REQUEST_METHOD'] === 'GET') {
            $token = SecurityService::sanitizeInput($_GET['token'] ?? '');
            $email = SecurityService::sanitizeInput($_GET['email'] ?? '');
            sendJsonResponse($authController->validateResetToken($token, $email));
        } else {
            sendJsonResponse(["error" => "Méthode invalide. Utilisez GET."], 405);
        }
        break;

    case 'reset_password':
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $data = json_decode(file_get_contents("php://input"), true);
            if ($data) {
                SecurityService::validateCsrfToken($data['csrf_token'] ?? '');
                $data = SecurityService::sanitizeInput($data);
                sendJsonResponse($authController->resetPassword($data));
            } else {
                sendJsonResponse(["error" => "Données JSON invalides"], 400);
            }
        } else {
            sendJsonResponse(["error" => "Méthode invalide. Utilisez POST."], 405);
        }
        break;

        case 'get_csrf':
    // Generate new CSRF token if doesn't exist
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = SecurityService::generateCsrfToken();
    }
    
    sendJsonResponse([
        'csrf_token' => $_SESSION['csrf_token'],
        'timestamp' => time()
    ]);
    break;

    default:
        sendJsonResponse(["error" => "Action non reconnue"], 404);
        break;
}
?>

