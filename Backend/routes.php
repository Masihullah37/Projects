    <?php

// Clear all output buffers
while (ob_get_level() > 0) ob_end_clean();

// ========= PREVENT ANY OUTPUT BEFORE HEADERS =========
ob_start();

// ========= ERROR REPORTING (PRODUCTION SAFE) =========
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/logs/php_errors.log');


// --- Composer Autoload ---
require_once __DIR__ . '/vendor/autoload.php'; 
require_once __DIR__ . '/Services/ResponseService.php';
require_once __DIR__ . '/Services/SecurityService.php';

// --- Load Dotenv ---
try {
    $dotenv = Dotenv\Dotenv::createImmutable(__DIR__, '.env.local');
    $dotenv->load();
} catch (Dotenv\Exception\InvalidPathException $e) {
    // This is safe to catch as it means the .env file is missing.
    // In production, you'd likely configure env vars via the web server.
    // For local dev, a missing .env is a critical error.
    error_log("ERROR: .env file not found or path is invalid: " . $e->getMessage());
    ResponseService::sendError('Application configuration error', 500);
} catch (Exception $e) {
    error_log("ERROR: Dotenv loading failed: " . $e->getMessage());
    ResponseService::sendError('Application configuration failed', 500);
}

// ========= ENVIRONMENT DETECTION =========
$isDevEnvironment = in_array($_SERVER['HTTP_HOST'] ?? '', [
    'localhost',    
    'localhost:5173',
    '127.0.0.1',
    'localhost:8000'
]) || strpos($_SERVER['HTTP_HOST'] ?? '', '.local') !== false;

// ========= CORS HEADERS =========
$allowedOrigins = [
    'http://localhost:5173',
    'https://test.icvinformatique.com',
    'https://www.test.icvinformatique.com'
];

$requestOrigin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowedOrigin = in_array($requestOrigin, $allowedOrigins) ? $requestOrigin : 
                ($isDevEnvironment ? "http://localhost:5173" : "https://test.icvinformatique.com");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header("Access-Control-Allow-Origin: $allowedOrigin");
    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization, X-CSRF-Token");
    header("Access-Control-Allow-Credentials: true");
    header("Access-Control-Max-Age: 86400");
    http_response_code(204);
    exit();
}

// Set CORS headers
header("Access-Control-Allow-Origin: $allowedOrigin");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-CSRF-Token");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json;charset=UTF-8");

// ========= SESSION CONFIGURATION =========
$isHttps = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || 
          $_SERVER['SERVER_PORT'] == 443 || 
          (!empty($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] == 'https');

session_set_cookie_params([
    'lifetime' => 1800, // 30mins Session cookie expires when the browser closes
    'path' => '/',
    'domain' => $isDevEnvironment ? null : $_SERVER['HTTP_HOST'],
    'secure' => $isHttps,
    'httponly' => true,
    'samesite' => 'Lax'
]);
ini_set('session.gc_maxlifetime', 1800); // Session data lasts until browser closes

session_start();


date_default_timezone_set('Europe/Paris');

// --- NEW SESSION DEBUGGING LOGS ---
error_log("DEBUG: routes.php - Request received. Session ID: " . session_id());
error_log("DEBUG: routes.php - User ID in session: " . ($_SESSION['user_id'] ?? 'NULL/NOT SET'));
error_log("DEBUG: routes.php - Request action: " . ($_GET['action'] ?? 'N/A') . ", Method: " . $_SERVER['REQUEST_METHOD']);
// --- END NEW SESSION DEBUGGING LOGS ---

// ========= AUTOLOAD SERVICES & CONTROLLERS =========
// require_once __DIR__ . '/Services/ResponseService.php';
// require_once __DIR__ . '/Services/SecurityService.php';
require_once __DIR__ . '/Controllers/AuthController.php';
require_once __DIR__ . '/Controllers/ProductController.php';
require_once __DIR__ . '/Controllers/PurchaseController.php';
require_once __DIR__ . '/Controllers/RepairController.php';
require_once __DIR__ . '/Controllers/PaymentController.php';
require_once __DIR__ . '/Config/Database.php';

// ========= DATABASE CONNECTION =========
error_log("DEBUG: DB_HOST from _ENV: " . ($_ENV['DB_HOST'] ?? 'N/A'));
error_log("DEBUG: DB_NAME from _ENV: " . ($_ENV['DB_NAME'] ?? 'N/A'));
error_log("DEBUG: DB_USER from _ENV: " . ($_ENV['DB_USER'] ?? 'N/A'));
error_log("DEBUG: DB_PASS from _ENV: " . ($_ENV['DB_PASS'] ?? 'N/A')); 

try {
    $database = new Database(
        $_ENV['DB_HOST'],
        $_ENV['DB_NAME'],
        $_ENV['DB_USER'],
        $_ENV['DB_PASS']
    );
    $conn = $database->getConnection();
} catch (Exception $e) {
    error_log("Database initialization failed: " . $e->getMessage());
    ResponseService::sendError('Database connection failed', 500);
}

// ========= INITIALIZE CONTROLLERS =========
$authController = new AuthController($conn);
$productController = new ProductController($conn);
$purchaseController = new PurchaseController($conn);
$repairController = new RepairController($conn);
$paymentController = new PaymentController($conn);

// ========= GET ACTION =========
$action = $_GET['action'] ?? '';

// Generate CSRF token for state-changing actions
// Note: 'add_repair' and 'update_repair_status' are now public, but still need CSRF if they are POST/PUT/DELETE
if (in_array($action, ['register', 'add_purchase', 'add_payment', 'reset_password', 'forgot_password', 'add_repair', 'update_repair_status'])) {
     if (empty($_SESSION['csrf_token'])) {
         $_SESSION['csrf_token'] = SecurityService::generateCsrfToken();
    }
}



// ========= ROUTE HANDLING =========
try {
    switch ($action) {
        // ========= AUTHENTICATION ROUTES =========
        case 'register':
            if ($_SERVER['REQUEST_METHOD'] === 'POST') {
                // Check for CSRF token in HEADER first
                  if (!isset($_SERVER['HTTP_X_CSRF_TOKEN'])) {
                      error_log("ERROR: register - CSRF token missing in header.");
                      ResponseService::sendError("CSRF token missing.", 403);
                  }
        
                    SecurityService::validateCsrfToken(); // Validate from header only
                $data = json_decode(file_get_contents("php://input"), true);
                if ($data) {
                    error_log("Routes - Raw JSON data for register before sanitization: " . print_r($data, true));

                    // SecurityService::validateCsrfToken($data['csrf_token'] ?? '');
                    
                    
                    // --- CRITICAL FIX START: Extract sensitive data before general sanitization ---
                    $email = $data['email'] ?? '';
                    $password = $data['password'] ?? '';
                    $telephone = $data['telephone'] ?? '';
                    $nom = $data['nom'] ?? '';
                    $prenom = $data['prenom'] ?? '';

                    unset($data['email']);
                    unset($data['password']);
                    unset($data['telephone']);
                    unset($data['nom']);
                    unset($data['prenom']);

                    $sanitizedData = SecurityService::sanitizeInput($data);

                    $sanitizedData['email'] = $email;
                    $sanitizedData['password'] = $password;
                    $sanitizedData['telephone'] = $telephone;
                    $sanitizedData['nom'] = $nom;
                    $sanitizedData['prenom'] = $prenom;
                    // --- CRITICAL FIX END ---

                    error_log("Routes - Data for register AFTER selective sanitization: " . print_r($sanitizedData, true));

                    ResponseService::sendSuccess($authController->register($sanitizedData));
                } else {
                    ResponseService::sendError("Invalid JSON data", 400);
                }
            } else {
                ResponseService::sendError("Method not allowed", 405);
            }
            break;
            
        case 'login':
            if ($_SERVER['REQUEST_METHOD'] === 'POST') {
                $data = json_decode(file_get_contents("php://input"), true);
                if ($data) {
                    // CSRF validation for login is often optional but can be added if desired.
                    // SecurityService::validateCsrfToken($data['csrf_token'] ?? ''); 
                    $data = SecurityService::sanitizeInput($data);
                    $response = $authController->login($data);

                    if (isset($response['error'])) {
                        ResponseService::sendError($response['error'], 400);
                    }

                    if ($response && isset($response['user']['id'])) {
                        $_SESSION['user_id'] = $response['user']['id'];
                        $_SESSION['user_email'] = $response['user']['email'];
                        $_SESSION['csrf_token'] = SecurityService::generateCsrfToken();

                        ResponseService::sendSuccess([
                            "success" => true,
                            "message" => "Login successful",
                            "user" => $response['user'],
                            "csrf_token" => $_SESSION['csrf_token']
                        ]);
                    } else {
                        ResponseService::sendError("INVALID_CREDENTIALS", 401);
                    }
                } else {
                    ResponseService::sendError("Invalid JSON", 400);
                }
            } else {
                ResponseService::sendError("Method not allowed", 405);
            }
            break;

        case 'logout':
                // Clear all session variables
             $_SESSION = [];
    
             // Delete the session cookie
             if (ini_get("session.use_cookies")) {
                $params = session_get_cookie_params();
                setcookie(session_name(), '', time() - 3600,
                $params["path"], $params["domain"],
                $params["secure"], $params["httponly"]
            );
        }
            session_destroy();
            ResponseService::sendSuccess(["success" => true, "message" => "Logout successful"]);
            break;

        case 'check_session':
            if (isset($_SESSION['user_id'])) {
                ResponseService::sendSuccess([
                    "loggedIn" => true,
                    "user_id" => $_SESSION['user_id'],
                    "email" => $_SESSION['user_email'] ?? '',
                    // "csrf_token" => $_SESSION['csrf_token'] ?? ''
                ]);
            } else {
                ResponseService::sendSuccess(["loggedIn" => false]);
            }
            break;

        // ========= PRODUCT ROUTES =========
        case 'get_products':
            if ($_SERVER['REQUEST_METHOD'] === 'GET') {
                $result = $productController->getProducts();
                
                if ($result['success']) {
                    ResponseService::sendSuccess([
                        'products' => $result['data']['products'] ?? $result['data'] ?? [],
                        'count' => $result['data']['count'] ?? count($result['data']['products'] ?? 0)
                    ]);
                } else {
                    ResponseService::sendError($result['message'] ?? 'Failed to fetch products', 500);
                }
            } else {
                ResponseService::sendError('Method not allowed', 405);
            }
            break;
            
        case 'get_product':
            if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['id'])) {
                $id = SecurityService::sanitizeInput($_GET['id']);
                $product = $productController->getProductById($id);
                ResponseService::sendSuccess($product ?: ['error' => 'Product not found']);
            } else {
                ResponseService::sendError("Product ID missing", 400);
            }
            break;


        case 'add_product':
            if (!isset($_SESSION['user_id']) || empty($_SESSION['user_id'])) {
                error_log("ERROR: add_product - Unauthorized access attempt (user not logged in).");
                ResponseService::sendError("Not authenticated", 401);
         }
            if ($_SERVER['REQUEST_METHOD'] === 'POST') {
             // Check for CSRF token in HEADER first
               if (!isset($_SERVER['HTTP_X_CSRF_TOKEN'])) {
               error_log("ERROR: add_product - CSRF token missing in header.");
               ResponseService::sendError("CSRF token missing.", 403);
                }
        
            SecurityService::validateCsrfToken(); // Validate from header only
        
             $data = json_decode(file_get_contents("php://input"), true);
                if ($data) {
                    $data = SecurityService::sanitizeInput($data);
                     ResponseService::sendSuccess($productController->addProduct($data));
                    } else {
                          error_log("ERROR: add_product - Invalid JSON data received.");
                             ResponseService::sendError("Invalid JSON data", 400);
                             }
                     } else {
                    ResponseService::sendError("Method not allowed", 405);
                 }
                    break;

        // ========= PURCHASE ROUTES =========

        case 'add_purchase':
            if (!isset($_SESSION['user_id']) || empty($_SESSION['user_id'])) {
                error_log("ERROR: add_purchase - Unauthorized access attempt (user not logged in).");
                ResponseService::sendError("Not authenticated", 401);
                exit();
            }
             if ($_SERVER['REQUEST_METHOD'] === 'POST') {
             // Check for CSRF token in HEADER first
            if (!isset($_SERVER['HTTP_X_CSRF_TOKEN'])) {
                 error_log("ERROR: add_purchase - CSRF token missing in header.");
                ResponseService::sendError("CSRF token missing.", 403);
                }
        
                 SecurityService::validateCsrfToken(); // Validate from header only
        
            $data = json_decode(file_get_contents("php://input"), true);
            if ($data) {
            $sanitizedData = SecurityService::sanitizeInput($data);
            $response = $purchaseController->addPurchase($sanitizedData); 
            ResponseService::sendSuccess($response);
             } else {
            error_log("ERROR: add_purchase - Invalid JSON data received.");
            ResponseService::sendError("Invalid JSON data", 400);
                     }
              } else {
            ResponseService::sendError("Method not allowed", 405);
            }
             break;
        

        // // ========= REPAIR ROUTES =========
       
        case 'add_repair':
            if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            // Check for CSRF token in HEADER first
            if (!isset($_SERVER['HTTP_X_CSRF_TOKEN'])) {
            error_log("ERROR: add_repair - CSRF token missing in header.");
            ResponseService::sendError("CSRF token missing.", 403);
            }
        
        SecurityService::validateCsrfToken(); // Validate from header only
        
        $data = json_decode(file_get_contents("php://input"), true);
        if ($data) {
            $data = SecurityService::sanitizeInput($data);
            ResponseService::sendSuccess($repairController->addRepair($data));
        } else {
            error_log("ERROR: add_repair - Invalid JSON data received.");
            ResponseService::sendError("Invalid JSON data", 400);
        }
             } else {
            ResponseService::sendError("Method not allowed", 405);
           }
        break;

        case 'get_repairs':
            // This route remains public as per previous discussion.
            // If it needs to be user-specific (e.g., get repairs for logged-in user),
            // add the session check and pass $_SESSION['user_id'].
            if ($_SERVER['REQUEST_METHOD'] === 'GET') {
                ResponseService::sendSuccess($repairController->getRepairs());
            } else {
                ResponseService::sendError("Method not allowed", 405);
            }
            break;

        
        case 'update_repair_status':
            if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        // Check for CSRF token in HEADER first
            if (!isset($_SERVER['HTTP_X_CSRF_TOKEN'])) {
            error_log("ERROR: update_repair_status - CSRF token missing in header.");
            ResponseService::sendError("CSRF token missing.", 403);
            }
        
            SecurityService::validateCsrfToken(); // Validate from header only
        
            $data = json_decode(file_get_contents("php://input"), true);
            if ($data) {
            $data = SecurityService::sanitizeInput($data);
            ResponseService::sendSuccess($repairController->updateStatus($data));
            } else {
            error_log("ERROR: update_repair_status - Invalid JSON data received.");
            ResponseService::sendError("Invalid JSON data", 400);
            }
        } else {
            ResponseService::sendError("Method not allowed", 405);
            }
        break;

        // // ========= PAYMENT ROUTES (from previous context, now integrated) =========
        
        case 'get_or_create_achat':
        if (!isset($_SESSION['user_id']) || empty($_SESSION['user_id'])) {
        error_log("ERROR: get_or_create_achat - Unauthorized access attempt (user not logged in).");
        ResponseService::sendError("Unauthorized: User not logged in. Please log in to proceed.", 401);
        }

        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        // Check for CSRF token in HEADER first
        if (!isset($_SERVER['HTTP_X_CSRF_TOKEN'])) {
            error_log("ERROR: get_or_create_achat - CSRF token missing in header.");
            ResponseService::sendError("CSRF token missing.", 403);
        }
        
        SecurityService::validateCsrfToken(); // Validate from header only
        
        $data = json_decode(file_get_contents("php://input"), true);
        if ($data) {
            $data = SecurityService::sanitizeInput($data);
             if (!empty($data['cart_items']) && is_array($data['cart_items'])) {
                        $user_id = $_SESSION['user_id']; // User ID is now guaranteed to be set
                        ResponseService::sendSuccess($paymentController->getOrCreateAchat($user_id, $data['cart_items']));
                    } else {
                        error_log("ERROR: get_or_create_achat - Empty or invalid cart data.");
                        ResponseService::sendError("Empty or invalid cart", 400);
                    }
                } else {
                    error_log("ERROR: get_or_create_achat - Invalid JSON data received.");
                    ResponseService::sendError("Invalid JSON data", 400);
                }
            } else {
                ResponseService::sendError("Method not allowed", 405);
            }
            break;

        case 'add_payment':
            if (!isset($_SESSION['user_id']) || empty($_SESSION['user_id'])) {
                error_log("ERROR: add_payment - Unauthorized access attempt (user not logged in).");
                ResponseService::sendError("Not authenticated", 401);
            }
            if ($_SERVER['REQUEST_METHOD'] === 'POST') {
                // Check for CSRF token in HEADER first
                  if (!isset($_SERVER['HTTP_X_CSRF_TOKEN'])) {
                      error_log("ERROR: add_payment - CSRF token missing in header.");
                      ResponseService::sendError("CSRF token missing.", 403);
           }
        
                SecurityService::validateCsrfToken(); // Validate from header only
                $data = json_decode(file_get_contents("php://input"), true);
                if ($data) {
                    error_log("Routes - Raw JSON data before sanitization: " . print_r($data, true));

                    
                    $cartItems = $data['cart_items'] ?? []; // Extract cart_items BEFORE sanitization

                    unset($data['cart_items']); // Remove cart_items from data before general sanitization

                    $sanitizedData = SecurityService::sanitizeInput($data);
                    
                    $sanitizedData['cart_items'] = $cartItems; // Re-add unsanitized cart_items

                    error_log("Routes - Data AFTER selective sanitization: " . print_r($sanitizedData, true));

                    $sanitizedData['user_id'] = $_SESSION['user_id'];
                    ResponseService::sendSuccess($paymentController->addPayment($sanitizedData));
                } else {
                    error_log("ERROR: add_payment - Invalid JSON data received.");
                    ResponseService::sendError("Invalid JSON data", 400);
                }
            } else {
                ResponseService::sendError("Method not allowed", 405);
            }
            break;

        case 'update_payment_status':
            // --- CRITICAL FIX: Ensure session check is robust and happens first ---
            if (!isset($_SESSION['user_id']) || empty($_SESSION['user_id'])) {
                error_log("ERROR: update_payment_status - Unauthorized access attempt (user not logged in).");
                ResponseService::sendError("Unauthorized: User not logged in. Please log in to proceed.", 401);
            }
            if ($_SERVER['REQUEST_METHOD'] === 'POST') {
                // Check for CSRF token in HEADER first
               if (!isset($_SERVER['HTTP_X_CSRF_TOKEN'])) {
                  error_log("ERROR: update_payment_status - CSRF token missing in header.");
                  ResponseService::sendError("CSRF token missing.", 403);
           }
        
        SecurityService::validateCsrfToken(); // Validate from header only
                $data = json_decode(file_get_contents("php://input"), true);
                if ($data) {

                    $data = SecurityService::sanitizeInput($data);
                    ResponseService::sendSuccess($paymentController->updatePaymentStatus($data));
                } else {
                    error_log("ERROR: update_payment_status - Invalid JSON data received.");
                    ResponseService::sendError("Invalid JSON data", 400);
                }
            } else {
                ResponseService::sendError("Method not allowed", 405);
            }
            break;

        case 'get_payment':

            if (!isset($_SESSION['user_id']) || empty($_SESSION['user_id'])) {
                error_log("ERROR: get_payment - Unauthorized access attempt (user not logged in).");
                ResponseService::sendError("Not authenticated", 401);
            }
            if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['payment_id'])) {
                $payment_id = SecurityService::sanitizeInput($_GET['payment_id']);
                ResponseService::sendSuccess($paymentController->getPayment($payment_id));
            } else {
                error_log("ERROR: get_payment - Missing or invalid payment ID.");
                ResponseService::sendError("Missing or invalid payment ID", 400);
            }
            break;

   
        
        case 'get_purchase_history':
            
            if (!isset($_SESSION['user_id']) || empty($_SESSION['user_id'])) {
                error_log("ERROR: get_purchase_history - Unauthorized access attempt (user not logged in).");
                ResponseService::sendError("Not authenticated", 401);
            }
            if ($_SERVER['REQUEST_METHOD'] === 'GET') {
                $user_id = $_SESSION['user_id'];
                error_log("DEBUG: routes.php - Calling getUserPurchaseHistory for user: " . $user_id); // Log 1

                $purchaseHistoryData = $paymentController->getUserPurchaseHistory($user_id);
                
                error_log("DEBUG: routes.php - Data received from controller: " . print_r($purchaseHistoryData, true)); // Log 2

        
                // Inside ResponseService::sendSuccess, json_encode is called.
                // If an error happens *after* Log 2 but *before* ResponseService finishes,
                // it's likely during the JSON encoding or output phase.
                ResponseService::sendSuccess($purchaseHistoryData); 

                // This log will only appear if ResponseService::sendSuccess completes without a fatal error
                error_log("DEBUG: routes.php - ResponseService::sendSuccess completed for purchase history."); // Log 3

            } else {
                ResponseService::sendError("Method not allowed", 405);
            }
            break;

        // ========= PASSWORD RECOVERY ROUTES =========
        case 'forgot_password':
            if ($_SERVER['REQUEST_METHOD'] === 'POST') {
                // Check for CSRF token in HEADER first
                 if (!isset($_SERVER['HTTP_X_CSRF_TOKEN'])) {
                    error_log("ERROR: forgot_password - CSRF token missing in header.");
                    ResponseService::sendError("CSRF token missing.", 403);
                }
        
                SecurityService::validateCsrfToken(); // Validate from header only
                $data = json_decode(file_get_contents("php://input"), true);
                if ($data) {
                    $data = SecurityService::sanitizeInput($data);
                    ResponseService::sendSuccess($authController->forgotPassword($data));
                } else {
                    error_log("ERROR: forgot_password - Invalid JSON data received.");
                    ResponseService::sendError("Invalid JSON data", 400);
                }
            } else {
                ResponseService::sendError("Method not allowed", 405);
            }
            break;
            
        case 'validate_reset_token':
            if ($_SERVER['REQUEST_METHOD'] === 'GET') {
                $token = $_GET['token'] ?? '';
                $email = $_GET['email'] ?? '';

                error_log("DEBUG: routes.php - validate_reset_token received: Token=" . $token . ", Email=" . $email);

                ResponseService::sendSuccess($authController->validateResetToken($token, $email));
            } else {
                ResponseService::sendError("Method not allowed", 405);
            }
            break;

        case 'reset_password':
            if ($_SERVER['REQUEST_METHOD'] === 'POST') {
                    // Check for CSRF token in HEADER first
               if (!isset($_SERVER['HTTP_X_CSRF_TOKEN'])) {
                  error_log("ERROR: reset_password - CSRF token missing in header.");
                  ResponseService::sendError("CSRF token missing.", 403);
               }
        
                SecurityService::validateCsrfToken(); // Validate from header only
                $data = json_decode(file_get_contents("php://input"), true);
                if ($data) {
                    $data = SecurityService::sanitizeInput($data);
                    ResponseService::sendSuccess($authController->resetPassword($data));
                } else {
                    error_log("ERROR: reset_password - Invalid JSON data received.");
                    ResponseService::sendError("Invalid JSON data", 400);
                }
            } else {
                ResponseService::sendError("Method not allowed", 405);
            }
            break;

            
        // ========= UTILITY ROUTES =========
        case 'get_csrf':
            if (empty($_SESSION['csrf_token'])) {
                $_SESSION['csrf_token'] = SecurityService::generateCsrfToken();
            }
            ResponseService::sendSuccess([
                'csrf_token' => $_SESSION['csrf_token'],
                'timestamp' => time()
            ]);
            break;
            
        
            
        case 'test_products':
            $testProducts = [
                ['id' => 1, 'name' => 'Test Product 1', 'price' => 10.99],
                ['id' => 2, 'name' => 'Test Product 2', 'price' => 20.99]
            ];
            ResponseService::sendSuccess([
                'success' => true,
                'products' => $testProducts,
                'count' => count($testProducts)
            ]);
            break;

        default:
            ResponseService::sendError("Action not recognized: " . $action, 404);
            break;
    }
        } catch (Exception $e) {
            error_log("Unhandled exception in routes.php: " . $e->getMessage() . " on line " . $e->getLine());
            ResponseService::sendError("An unexpected error occurred: " . $e->getMessage(), 500);
        }


?>

