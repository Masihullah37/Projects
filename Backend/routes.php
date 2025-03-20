<?php
// On ajoute ces en-têtes pour activer le CORS (Cross-Origin Resource Sharing) et permettre les requêtes depuis d'autres domaines.
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// On ajoute cette condition pour traiter les requêtes OPTIONS envoyées avant les requêtes POST ou GET, notamment par les navigateurs pour le CORS.
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header("HTTP/1.1 200 OK");
    exit();
}
// Inclure l'autoloader de Composer
require_once __DIR__ . '/vendor/autoload.php';
require_once 'Config/Database.php';
require_once 'Controllers/AuthController.php';
require_once 'Controllers/PurchaseController.php';
require_once 'Controllers/RepairController.php';
require_once 'Controllers/ProductController.php';
require_once 'Controllers/PaymentController.php';

// Initialisation de la base de données
$database = new Database();
$conn = $database->getConnection();

// Initialisation des contrôleurs
$authController = new AuthController($conn);
$purchaseController = new PurchaseController($conn);
$repairController = new RepairController($conn);
$productController = new ProductController($conn);
$paymentController = new PaymentController($conn); 

// Récupérer l'action depuis la requête
$action = $_GET['action'] ?? '';

// Debugging: Log the action
error_log("Action received: " . $action);



// Gestion des routes avec switch-case
switch ($action) {
    case 'register':
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $data = json_decode(file_get_contents("php://input"), true);
            if ($data) {
                echo json_encode($authController->register($data));
            } else {
                echo json_encode(["error" => "Données JSON invalides"]);
            }
        } else {
            echo json_encode(["error" => "Méthode invalide. Utilisez POST."]);
        }
        break;

    case 'login':
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $data = json_decode(file_get_contents("php://input"), true);
            if ($data) {
                echo json_encode($authController->login($data));
            } else {
                echo json_encode(["error" => "Données JSON invalides"]);
            }
        } else {
            echo json_encode(["error" => "Méthode invalide. Utilisez POST."]);
        }
        break;

    case 'add_purchase':
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $data = json_decode(file_get_contents("php://input"), true);
            if ($data) {
                echo json_encode($purchaseController->addPurchase($data['user_id'], $data['product_id'], $data['quantity']));
            } else {
                echo json_encode(["error" => "Données JSON invalides"]);
            }
        } else {
            echo json_encode(["error" => "Méthode invalide. Utilisez POST."]);
        }
        break;

    case 'get_purchases':
        if ($_SERVER['REQUEST_METHOD'] === 'GET') {
            $user_id = $_GET['user_id'] ?? null;
            if ($user_id) {
                echo json_encode($purchaseController->getPurchases($user_id));
            } else {
                echo json_encode(["error" => "Missing user_id parameter"]);
            }
        } else {
            echo json_encode(["error" => "Méthode invalide. Utilisez GET."]);
        }
        break;

    case 'add_repair':
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $data = json_decode(file_get_contents("php://input"), true);
            if ($data) {
                echo json_encode($repairController->addRepair($data));
            } else {
                echo json_encode(["error" => "Données JSON invalides"]);
            }
        } else {
            echo json_encode(["error" => "Méthode invalide. Utilisez POST."]);
        }
        break;

    case 'get_repairs':
        if ($_SERVER['REQUEST_METHOD'] === 'GET') {
            echo json_encode($repairController->getRepairs());
        } else {
            echo json_encode(["error" => "Méthode invalide. Utilisez GET."]);
        }
        break;

    case 'update_repair_status':
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $data = json_decode(file_get_contents("php://input"), true);
            if ($data) {
                echo json_encode($repairController->updateStatus($data));
            } else {
                echo json_encode(["error" => "Données JSON invalides"]);
            }
        } else {
            echo json_encode(["error" => "Méthode invalide. Utilisez POST.."]);
        }
        break;

    case 'add_product':
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $data = json_decode(file_get_contents("php://input"), true);
            if ($data) {
                echo json_encode($productController->addProduct($data));
            } else {
                echo json_encode(["error" => "Données JSON invalides"]);
            }
        } else {
            echo json_encode(["error" => "Méthode invalide. Utilisez POST."]);
        }
        break;

    case 'get_products':
        if ($_SERVER['REQUEST_METHOD'] === 'GET') {
            echo json_encode($productController->getProducts());
        } else {
            echo json_encode(["error" => "Méthode invalide. Utilisez GET."]);
        }
        break;

    case 'get_product':
        if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['id'])) {
            echo json_encode($productController->getProductById($_GET['id']));
        } else {
            echo json_encode(["error" => "ID de paiement manquant ou invalide"]);
        }
        break;

        case 'add_payment':
          if ($_SERVER['REQUEST_METHOD'] === 'POST') {
              $data = json_decode(file_get_contents("php://input"), true);
              if ($data) {
                  echo json_encode($paymentController->addPayment($data));
              } else {
                  echo json_encode(["error" => "Données JSON invalides"]);
              }
          } else {
              echo json_encode(["error" => "Méthode invalide. Utilisez POST."]);
          }
          break;
  
      case 'update_payment_status':
          if ($_SERVER['REQUEST_METHOD'] === 'POST') {
              $data = json_decode(file_get_contents("php://input"), true);
              if ($data) {
                  echo json_encode($paymentController->updatePaymentStatus($data));
              } else {
                  echo json_encode(["error" => "Données JSON invalides"]);
              }
          } else {
              echo json_encode(["error" => "Méthode invalide. Utilisez POST."]);
          }
          break;
  
      case 'get_payment':
          if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['payment_id'])) {
              echo json_encode($paymentController->getPayment($_GET['payment_id']));
          } else {
              echo json_encode(["error" => "ID de paiement manquant ou invalide"]);
          }
          break;

          // Add new password reset routes
    case 'forgot_password':
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $data = json_decode(file_get_contents("php://input"), true);
            if ($data) {
                echo json_encode($authController->forgotPassword($data));
            } else {
                echo json_encode(["error" => "Données JSON invalides"]);
            }
        } else {
            echo json_encode(["error" => "Méthode invalide. Utilisez POST."]);
        }
        break;

    case 'validate_reset_token':
        if ($_SERVER['REQUEST_METHOD'] === 'GET') {
            $token = $_GET['token'] ?? '';
            $email = $_GET['email'] ?? '';
            echo json_encode($authController->validateResetToken($token, $email));
        } else {
            echo json_encode(["error" => "Méthode invalide. Utilisez GET."]);
        }
        break;

   

    case 'reset_password':
        error_log("Request Method: " . $_SERVER['REQUEST_METHOD']);
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $rawData = file_get_contents("php://input");
            error_log("Raw JSON Data: " . $rawData);
            $data = json_decode($rawData, true);
            if ($data) {
                echo json_encode($authController->resetPassword($data));
            } else {
                echo json_encode(["error" => "Données JSON invalides"]);
            }
        } else {
            echo json_encode(["error" => "Méthode invalide. Utilisez POST."]);
        }
        break;

    default:
        echo json_encode(["error" => "Action non reconnue"]);
        break;
}
?>