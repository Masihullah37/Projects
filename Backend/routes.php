    <?php
    ob_start() ;
    // Enable CORS and set headers
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type");
    header("Content-Type: application/json");

    // Handle OPTIONS requests for CORS
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        header("HTTP/1.1 200 OK");
        exit();
    }

    // Disable error reporting to avoid interfering with JSON responses
    ini_set('display_errors', 0);
    error_reporting(0);

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

    // Function to send a JSON response
    function sendJsonResponse($data, $statusCode = 200) {
        // Ensure no unwanted output before sending the JSON
        ob_end_clean();  // Clean the buffer if there's any unwanted output
        http_response_code($statusCode);
        echo json_encode($data);
        exit;
    }


    // Gère l'action reçue via le paramètre 'action'
    switch ($action) {
        case 'register':
              // Vérifie que la méthode HTTP utilisée est POST
            if ($_SERVER['REQUEST_METHOD'] === 'POST') {
                // Récupère et décode les données JSON envoyées dans la requête
                $data = json_decode(file_get_contents("php://input"), true);

                // Si les données sont valides, on appelle la méthode register du contrôleur
                if ($data) {
                    sendJsonResponse($authController->register($data));
                } else {
                    sendJsonResponse(["error" => "Données JSON invalides"], 400);
                }
            } else {
                // Si la méthode HTTP n'est pas POST, retourne une erreur 405
                sendJsonResponse(["error" => "Méthode invalide. Utilisez POST."], 405);
            }
            break;

        case 'login':
            if ($_SERVER['REQUEST_METHOD'] === 'POST') {
                $data = json_decode(file_get_contents("php://input"), true);
                if ($data) {
                    sendJsonResponse($authController->login($data));
                } else {
                    sendJsonResponse(["error" => "Données JSON invalides"], 400);
                }
            } else {
                sendJsonResponse(["error" => "Méthode invalide. Utilisez POST."], 405);
            }
            break;

    case 'add_purchase':
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $data = json_decode(file_get_contents("php://input"), true);
            if ($data) {
                sendJsonResponse($purchaseController->addPurchase($data['user_id'], $data['product_id'], $data['quantity']));
            } else {
                sendJsonResponse(["error" => "Données JSON invalides"], 400);
            }
        } else {
            sendJsonResponse(["error" => "Méthode invalide. Utilisez POST."], 405);
        }
        break;

    case 'get_purchases':
        if ($_SERVER['REQUEST_METHOD'] === 'GET') {
            $user_id = $_GET['user_id'] ?? null;
            if ($user_id) {
                sendJsonResponse($purchaseController->getPurchases($user_id));
            } else {
                sendJsonResponse(["error" => "Missing user_id parameter"], 400);
            }
        } else {
            sendJsonResponse(["error" => "Méthode invalide. Utilisez GET."], 405);
        }
        break;

    case 'add_repair':
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $data = json_decode(file_get_contents("php://input"), true);
            if ($data) {
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
                sendJsonResponse($repairController->updateStatus($data));
            } else {
                sendJsonResponse(["error" => "Données JSON invalides"], 400);
            }
        } else {
            sendJsonResponse(["error" => "Méthode invalide. Utilisez POST."], 405);
        }
        break;

    case 'add_product':
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $data = json_decode(file_get_contents("php://input"), true);
            if ($data) {
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
            sendJsonResponse($productController->getProductById($_GET['id']));
        } else {
            sendJsonResponse(["error" => "ID de produit manquant ou invalide"], 400);
        }
        break;


    case 'add_payment':
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $data = json_decode(file_get_contents("php://input"), true);
            
            if (!$data) {
                error_log("No valid JSON received in add_payment: " . file_get_contents("php://input"));
                sendJsonResponse(["error" => "Données JSON invalides"], 400);
                exit;
            }
            
            // Log the received data for debugging
            error_log("Payment data received: " . print_r($data, true));
            
            // Now actually call the function
            sendJsonResponse($paymentController->addPayment($data));
        } else {
            sendJsonResponse(["error" => "Méthode invalide. Utilisez POST."], 405);
        }
        break;
    
    case 'get_or_create_achat':
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $data = json_decode(file_get_contents("php://input"), true);
            
            if (!$data) {
                error_log("No valid JSON received in get_or_create_achat: " . file_get_contents("php://input"));
                sendJsonResponse(["error" => "Données JSON invalides"], 400);
                exit;
            }
            
            // Ensure user_id is provided
            if (empty($data['user_id'])) {
                sendJsonResponse(["error" => "ID utilisateur manquant"], 400);
                exit;
            }
            
            // Ensure cart_items is provided and is an array
            if (empty($data['cart_items']) || !is_array($data['cart_items'])) {
                error_log("Cart items missing or invalid: " . print_r($data, true));
                sendJsonResponse(["error" => "Panier vide ou invalide"], 400);
                exit;
            }
            
            // Log the received cart items for debugging
            error_log("Cart items received: " . print_r($data['cart_items'], true));
            
            // Call the PaymentController to get or create an achat
            sendJsonResponse($paymentController->getOrCreateAchat($data['user_id'], $data['cart_items']));
        } else {
            sendJsonResponse(["error" => "Méthode invalide. Utilisez POST."], 405);
        }
        break;
    
    case 'update_payment_status':
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $data = json_decode(file_get_contents("php://input"), true);
            if ($data) {
                sendJsonResponse($paymentController->updatePaymentStatus($data));
            } else {
                sendJsonResponse(["error" => "Données JSON invalides"], 400);
            }
        } else {
            sendJsonResponse(["error" => "Méthode invalide. Utilisez POST."], 405);
        }
        break;
    
    case 'get_payment':
        if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['payment_id'])) {
            sendJsonResponse($paymentController->getPayment($_GET['payment_id']));
        } else {
            sendJsonResponse(["error" => "ID de paiement manquant ou invalide"], 400);
        }
        break;
        
    case 'get_purchase_history':
        if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['user_id'])) {
            // Log the request for debugging
            error_log("Fetching purchase history for user ID: " . $_GET['user_id']);
        
            $result = $paymentController->getUserPurchaseHistory($_GET['user_id']);
        
            // Log the result for debugging
            error_log("Purchase history result: " . print_r($result, true));
        
            sendJsonResponse($result);
        } else {
            sendJsonResponse(["error" => "ID utilisateur manquant ou invalide"], 400);
        }
        break;

       


    case 'forgot_password':
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $data = json_decode(file_get_contents("php://input"), true);
            if ($data) {
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
            $token = $_GET['token'] ?? '';
            $email = $_GET['email'] ?? '';
            sendJsonResponse($authController->validateResetToken($token, $email));
        } else {
            sendJsonResponse(["error" => "Méthode invalide. Utilisez GET."], 405);
        }
        break;

    case 'reset_password':
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $data = json_decode(file_get_contents("php://input"), true);
            if ($data) {
                sendJsonResponse($authController->resetPassword($data));
            } else {
                sendJsonResponse(["error" => "Données JSON invalides"], 400);
            }
        } else {
            sendJsonResponse(["error" => "Méthode invalide. Utilisez POST."], 405);
        }
        break;

    default:
        sendJsonResponse(["error" => "Action non reconnue"], 404);
        break;
}
?>

