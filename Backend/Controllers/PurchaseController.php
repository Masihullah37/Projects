<?php


require_once(__DIR__ . '/../Models/PurchaseModel.php');
require_once(__DIR__ . '/../Services/ResponseService.php');

class PurchaseController {
    private $purchaseModel;
    private $conn; // Keep connection for passing to other models if needed

    public function __construct($conn) {
        $this->conn = $conn;
        $this->purchaseModel = new PurchaseModel($conn);
    }

    /**
     * Handles adding a product to the user's cart (pending purchase).
     * This method is called by the 'add_purchase' action from the frontend.
     *
     * @param array $data The request data containing product_id and quantity.
     * @return void Sends JSON response.
     */
    public function addPurchase($data) {
        $user_id = $_SESSION['user_id'] ?? null;

        if (!$user_id) {
            ResponseService::sendError("User not authenticated.", 401);
            return;
        }

        // --- NEW DEBUG LOGS FOR INPUT DATA ---
        error_log("DEBUG: PurchaseController - addPurchase received raw data: " . print_r($data, true));
        // --- END NEW DEBUG LOGS ---

        $product_id = $data['product_id'] ?? null;
        $quantity = $data['quantity'] ?? 1; // Default to 1 if not provided

        // --- NEW DEBUG LOGS FOR EXTRACTED VALUES ---
        error_log("DEBUG: PurchaseController - Extracted product_id: " . var_export($product_id, true) . ", quantity: " . var_export($quantity, true));
        // --- END NEW DEBUG LOGS ---

        // Input validation
        if (empty($product_id) || !is_numeric($product_id) || $product_id <= 0) {
            error_log("ERROR: PurchaseController - Invalid product ID detected during validation. product_id: " . var_export($product_id, true));
            ResponseService::sendError("Invalid product ID.", 400);
            return;
        }
        if (empty($quantity) || !is_numeric($quantity) || $quantity <= 0) {
            error_log("ERROR: PurchaseController - Invalid quantity detected during validation. quantity: " . var_export($quantity, true));
            ResponseService::sendError("Invalid quantity.", 400);
            return;
        }

        try {
            // Call the modified addPurchase method in PurchaseModel
            $result = $this->purchaseModel->addPurchase((int)$user_id, (int)$product_id, (int)$quantity);

            if ($result['success']) {
                ResponseService::sendSuccess($result, 200);
            } else {
                ResponseService::sendError($result['message'], 400); // Use 400 for client-side errors
            }
        } catch (Exception $e) {
            error_log("ERROR: PurchaseController - addPurchase failed: " . $e->getMessage());
            ResponseService::sendError("An unexpected error occurred: " . $e->getMessage(), 500);
        }
    }

    /**
     * Retrieves the purchase history for the authenticated user.
     * @return void Sends JSON response.
     */
     
     
    public function getPurchaseHistory() {
        $user_id = $_SESSION['user_id'] ?? null;

        if (!$user_id) {
            ResponseService::sendError("User not authenticated.", 401);
            return;
        }

        try {
            // Renamed from getPurchases to getPurchaseHistory to match the model
            $history = $this->purchaseModel->getPurchaseHistory((int)$user_id);
            error_log("DEBUG: PurchaseController - Fetched purchase history for user ID: " . $user_id);
            ResponseService::sendSuccess(['purchases' => $history], 200);
        } catch (Exception $e) {
            error_log("ERROR: PurchaseController - getPurchaseHistory failed: " . $e->getMessage());
            ResponseService::sendError("Failed to retrieve purchase history.", 500);
        }
    }

    // Add any other methods your PurchaseController might have
    // If you had a getPurchases method, it should be removed or renamed to getPurchaseHistory
}
?>

