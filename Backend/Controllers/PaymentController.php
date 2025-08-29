
<!-- 
<?php





require_once __DIR__ . '/../vendor/autoload.php'; // MUST be first
require_once __DIR__ . '/../Models/PaymentModel.php';
require_once __DIR__ . '/../Models/ProductModel.php';
require_once __DIR__ . '/../Models/PurchaseModel.php';

// use Dotenv\Dotenv;
use Stripe\Stripe;
use Stripe\PaymentIntent;
use Stripe\Exception\CardException;


class PaymentController {
    private $paymentModel;
    private $productModel;
     private $purchaseModel; 
    private $stripeSecretKey;
    

public function __construct($conn) {
   
    
       // --- CRITICAL FIX: Use $_ENV directly to retrieve Stripe Secret Key ---
        // getenv() seems problematic in your Hostinger environment, but $_ENV is populated.
        $this->stripeSecretKey = $_ENV['STRIPE_SECRET_KEY'] ?? null; // Use $_ENV directly, add null coalescing for safety
        // --- END CRITICAL FIX ---
        
        if (empty($this->stripeSecretKey)) {
            // Log a more descriptive error if the key is missing
            error_log('ERROR: Stripe secret key is missing or not loaded from environment variables.');
            throw new RuntimeException('Stripe key is missing'); // Line 29
        }

    $this->paymentModel = new PaymentModel($conn);
    $this->productModel = new ProductModel($conn);
    $this->purchaseModel = new PurchaseModel($conn);
    
    \Stripe\Stripe::setApiKey($this->stripeSecretKey);
    
}

     
    public function addPayment($data) {
        try {
            if (empty($data['user_id']) || empty($data['amount'])) {
                throw new \InvalidArgumentException('Missing required fields');
            }

            // Determine the correct achat_id to use for this payment process.
            // If frontend provided one (from getOrCreateAchat), use it.
            // Otherwise, create a new one.
            $currentAchatId = $data['achat_id'] ?? null;
            if (empty($currentAchatId)) {
                // When creating a new achat, set initial total_amount to 0.
                // It will be recalculated after adding items.
                $currentAchatId = $this->paymentModel->createAchat([
                    'user_id' => $data['user_id'],
                    'total_amount' => 0, // Set initial amount to 0
                    'status' => 'pending'
                ]);
                if (!$currentAchatId) throw new \RuntimeException('Failed creating achat for payment.');
                error_log("PaymentController - Created new achat_id during addPayment: " . $currentAchatId);
            } else {
                error_log("PaymentController - Using existing achat_id provided by frontend: " . $currentAchatId);
            }

            // Process and save Achat Items using $currentAchatId
            if (!empty($data['cart_items']) && is_array($data['cart_items'])) {
                error_log("PaymentController - Processing " . count($data['cart_items']) . " cart items for achat_id: " . $currentAchatId);
                foreach ($data['cart_items'] as $item) {
                    $productDetails = $this->productModel->getProductById($item['id']);
                    if ($productDetails) {
                        $added = $this->paymentModel->addAchatItem([
                            'achat_id' => $currentAchatId,
                            'product_id' => $item['id'],
                            'quantity' => $item['quantity'], // This is the correct quantity from the frontend
                            'price' => $productDetails['prix'] // This is the unit price from the product table
                        ]);
                        if (!$added) {
                            error_log("PaymentController - Failed to add achat item for product ID: " . $item['id'] . " to achat ID: " . $currentAchatId);
                        }
                    } else {
                        error_log("PaymentController - Product details not found for cart item ID: " . $item['id'] . ". Item skipped.");
                    }
                }
            } else {
                error_log("PaymentController - No cart items provided in data for achat_id: " . $currentAchatId);
            }

            // --- FIX START: Recalculate and update total_amount in 'achats' table ---
            // After all items are added/updated, recalculate the total based on saved items
            $this->purchaseModel->updateAchatTotalAmount($currentAchatId); // Use a new method for this
            error_log("PaymentController - Recalculated and updated total_amount for achat: " . $currentAchatId);
            // --- FIX END ---

            // Now, use $currentAchatId for the Stripe PaymentIntent metadata
            $paymentIntent = \Stripe\PaymentIntent::create([
                'amount' => round($data['amount'] * 100), // This 'amount' is still the frontend's total for Stripe
                'currency' => 'eur',
                'payment_method_types' => ['card'],
                'metadata' => [
                    'user_id' => $data['user_id'],
                    'achat_id' => $currentAchatId,
                ],
            ]);

            // Save payment record, linking it to $currentAchatId
            $paymentId = $this->paymentModel->createPayment([
                'user_id' => $data['user_id'],
                'achat_id' => $currentAchatId,
                'payment_method' => 'credit_card',
                'payment_status' => 'pending',
                'amount' => $data['amount'], // This 'amount' is still the frontend's total for the payment record
                'transaction_id' => $paymentIntent->id
            ]);

            if (!$paymentId) throw new \RuntimeException('Failed saving payment record.');

            // Handle shipping address
            if (!empty($data['shipping_address'])) {
                $shippingAddressData = [
                    'paiement_id' => $paymentId,
                    'nom' => $data['shipping_address']['name'] ?? null,
                    'adresse_ligne1' => $data['shipping_address']['address_line1'] ?? null,
                    'adresse_ligne2' => $data['shipping_address']['address_line2'] ?? null,
                    'ville' => $data['shipping_address']['city'] ?? null,
                    'departement' => $data['shipping_address']['state'] ?? null,
                    'code_postal' => $data['shipping_address']['postal_code'] ?? null,
                    'pays' => $data['shipping_address']['country'] ?? null,
                    'telephone' => $data['shipping_address']['phone'] ?? null,
                ];
                $this->paymentModel->addShippingAddress($shippingAddressData);
            }

            return [
                'success' => true,
                'payment_id' => $paymentId,
                'client_secret' => $paymentIntent->client_secret,
                'achat_id' => $currentAchatId
            ];

        } catch (\Stripe\Exception\CardException $e) {
            error_log('Stripe Card Error: ' . $e->getMessage());
            return ['error' => 'Payment failed: ' . $e->getMessage()];
        } catch (\Exception $e) {
            error_log('General Payment Error: ' . $e->getMessage());
            return ['error' => 'Payment processing error'];
        }
    }

    
    
    public function updatePaymentStatus($data) {
        try {
            if (empty($data['payment_id']) || empty($data['status'])) {
                throw new \InvalidArgumentException('Missing payment ID or status');
            }

            $dbStatus = $this->mapStripeStatusToDbStatus($data['status']);
            $updated = $this->paymentModel->updatePaymentStatus($data['payment_id'], $dbStatus);

            if (!$updated) throw new \RuntimeException('Database update failed');

            // Handle successful payments
            if ($dbStatus === 'success') {
                $payment = $this->paymentModel->getPaymentById($data['payment_id']);
                if ($payment) {
                    $this->paymentModel->updateAchatStatus($payment['achat_id'], 'completed');
                    
                    foreach ($this->paymentModel->getAchatItems($payment['achat_id']) as $item) {
                        $this->productModel->reduceStock($item['product_id'], $item['quantity']);
                    }
                }
            }

            return ['success' => true];
            
        } catch (\Exception $e) {
            error_log('Status update error: ' . $e->getMessage());
            return ['error' => 'Failed updating status'];
        }
    }
     public function getPayment($paymentId) {
        try {
             // Get payment from database
             $payment = $this->paymentModel->getPaymentById($paymentId);
            
             if (!$payment) {
                 return ['error' => 'Paiement non trouvé'];
             }
            
             // Get shipping address
             $shippingAddress = $this->paymentModel->getShippingAddressByPaymentId($paymentId);
            
             return [
                 'success' => true,
                 'payment' => $payment,
                 'shipping_address' => $shippingAddress
             ];
            
         } catch (\Exception $e) {
             error_log('Get payment error: ' . $e->getMessage());
             return ['error' => 'Erreur lors de la récupération du paiement: ' . $e->getMessage()];
         }
     }
    
     public function getOrCreateAchat($userId, $cartItems) {
         try {
             // Log the received cart items for debugging
             error_log('Received cart items: ' . print_r($cartItems, true));
            
             // Check if cartItems is empty or invalid
             if (empty($cartItems) || !is_array($cartItems)) {
                 error_log('Cart items are empty or invalid.');
                 return ['error' => 'Panier vide ou invalide'];
             }
            
             // Check if there's an existing pending purchase for this user
             $pendingAchat = $this->paymentModel->getPendingAchatByUserId($userId);
            
             if ($pendingAchat) {
                return [
                     'success' => true,
                     'achat_id' => $pendingAchat['id']
                 ];
             }
            
             // Extract product IDs from cart items
             $productIds = array_map(function($item) {
                 return $item['id'];
             }, $cartItems);
            
             // Get product details from database
             $products = $this->paymentModel->getProductDetails($productIds);
            
             if (empty($products)) {
                 error_log('No products found for the given IDs: ' . implode(', ', $productIds));
                 return ['error' => 'Produits non trouvés'];
             }
            
             // Create a map of product ID to product details
             $productMap = [];
             foreach ($products as $product) {
                 $productMap[$product['id']] = $product;
             }
            
             // Calculate total amount and prepare cart products with quantities
             $totalAmount = 0;
             $cartProducts = [];
            
             foreach ($cartItems as $item) {
                 if (isset($productMap[$item['id']])) {
                     $product = $productMap[$item['id']];
                     $quantity = $item['quantity'];
                     $price = $product['prix'];
                    
                     // Check if there's enough stock
                     if ($product['stock'] < $quantity) {
                         return [
                             'error' => 'Stock insuffisant pour ' . $product['nom'] . '. Disponible: ' . $product['stock']
                         ];
                     }
                    
                     $totalAmount += $price * $quantity;
                    
                     $cartProducts[] = [
                         'id' => $product['id'],
                        'nom' => $product['nom'],
                         'prix' => $price,
                         'quantity' => $quantity
                     ];
                 }
             }
            
             if (empty($cartProducts)) {
                 error_log('No valid products in cart');
                 return ['error' => 'Panier vide'];
             }
            
             // Create a new purchase record
             $achatData = [
                 'user_id' => $userId,
                 'total_amount' => $totalAmount,
                 'status' => 'pending'
             ];
            
             $achatId = $this->paymentModel->createAchat($achatData);
            
             if (!$achatId) {
                 throw new \Exception('Erreur lors de la création de l\'achat');
             }
            
             // Add purchase items
             foreach ($cartProducts as $item) {
                 $achatItemData = [
                     'achat_id' => $achatId,
                     'product_id' => $item['id'],
                     'quantity' => $item['quantity'],
                     'price' => $item['prix']
                 ];
                
                 $this->paymentModel->addAchatItem($achatItemData);
             }
            
             return [
                 'success' => true,
                 'achat_id' => $achatId
             ];
            
         } catch (\Exception $e) {
             error_log('Get or create achat error: ' . $e->getMessage());
             return ['error' => 'Erreur lors de la création de l\'achat: ' . $e->getMessage()];
         }
     }
    
     public function getUserPurchaseHistory($userId) {
     try {
         // Log the request for debugging
         error_log("Getting purchase history for user ID: " . $userId);
        
         // Get completed purchases for this user
         $completedAchats = $this->paymentModel->getCompletedAchatsByUserId($userId);
        
         // Log the completed achats for debugging
         error_log("Completed achats: " . print_r($completedAchats, true));
        
         if (empty($completedAchats)) {
             return [
                 'success' => true,
                 'message' => 'Aucun historique d\'achat trouvé',
                 'purchases' => []
             ];
         }
        
         $purchaseHistory = [];
        
         foreach ($completedAchats as $achat) {
             // Get items for this purchase
             $items = $this->paymentModel->getAchatItems($achat['id']);
            
             // Get payment info
             $payment = $this->paymentModel->getPaymentByAchatId($achat['id']);
            
             $purchaseHistory[] = [
                 'achat_id' => $achat['id'],
                 'date' => $achat['created_at'],
                 'total_amount' => $achat['total_amount'],
                 'status' => $achat['status'],
                 'payment_status' => $payment ? $payment['payment_status'] : 'unknown',
                 'items' => $items
             ];
         }
        
         // Log the purchase history for debugging
         error_log("Purchase history: " . print_r($purchaseHistory, true));
        
         return [
             'success' => true,
             'purchases' => $purchaseHistory
         ];
        
     } catch (\Exception $e) {
         error_log('Get purchase history error: ' . $e->getMessage());
         return ['error' => 'Erreur lors de la récupération de l\'historique d\'achat: ' . $e->getMessage()];
     }
 }


    private function mapStripeStatusToDbStatus($stripeStatus) {
        switch ($stripeStatus) {
            case 'succeeded': return 'success';
            case 'requires_payment_method':
            case 'requires_confirmation':
            case 'requires_action':
            case 'processing':
                return 'pending';
            default: return 'failed';
        }
    }
}

?>





 




