

<?php

require_once __DIR__ . '/../Models/PaymentModel.php';
require_once __DIR__ . '/../Models/ProductModel.php';
require_once __DIR__ . '/../vendor/autoload.php';

class PaymentController {
    private $paymentModel;
    private $productModel;
    private $stripeSecretKey;
    
    public function __construct($conn) {
        $this->paymentModel = new PaymentModel($conn);
        $this->productModel = new ProductModel($conn);
        $this->stripeSecretKey = 'REMOVED';
    }
    
    public function addPayment($data) {
        try {
            // Validate required fields
            if (empty($data['user_id']) || empty($data['amount'])) {
                return ['error' => 'Données de paiement incomplètes'];
            }
            
            // Set up Stripe
            \Stripe\Stripe::setApiKey($this->stripeSecretKey);
            
            // Create a PaymentIntent
            $paymentIntent = \Stripe\PaymentIntent::create([
                'amount' => round($data['amount'] * 100), // Convert to cents
                'currency' => 'eur',
                'payment_method_types' => ['card'],
                'metadata' => [
                    'user_id' => $data['user_id'],
                    'achat_id' => $data['achat_id'] ?? null,
                ],
            ]);
            
            // If achat_id is not provided, create a new achat
            if (empty($data['achat_id'])) {
                $achatData = [
                    'user_id' => $data['user_id'],
                    'total_amount' => $data['amount'],
                    'status' => 'pending',
                ];
                
                $achatId = $this->paymentModel->createAchat($achatData);
                
                if (!$achatId) {
                    throw new \Exception('Erreur lors de la création de l\'achat');
                }
                
                $data['achat_id'] = $achatId;
            }
            
            // Prepare payment data for database
            $paymentData = [
                'user_id' => $data['user_id'],
                'achat_id' => $data['achat_id'],
                'payment_method' => 'credit_card',
                'payment_status' => 'pending',
                'amount' => $data['amount'],
                'transaction_id' => $paymentIntent->id,
            ];
            
            // Save payment to database
            $paymentId = $this->paymentModel->createPayment($paymentData);
            
            if (!$paymentId) {
                throw new \Exception('Erreur lors de l\'enregistrement du paiement');
            }
            
            // Save shipping address if provided
            if (!empty($data['shipping_address'])) {
                $addressData = [
                    'paiement_id' => $paymentId,
                    'nom' => $data['shipping_address']['name'],
                    'adresse_ligne1' => $data['shipping_address']['address_line1'],
                    'adresse_ligne2' => $data['shipping_address']['address_line2'] ?? '',
                    'ville' => $data['shipping_address']['city'],
                    'departement' => $data['shipping_address']['state'],
                    'code_postal' => $data['shipping_address']['postal_code'],
                    'pays' => $data['shipping_address']['country'],
                    'telephone' => $data['shipping_address']['phone'],
                ];
                $this->paymentModel->addShippingAddress($addressData);
            }
            
            // Return the PaymentIntent client secret
            return [
                'success' => true,
                'payment_id' => $paymentId,
                'client_secret' => $paymentIntent->client_secret,
            ];
            
        } catch (\Stripe\Exception\CardException $e) {
            return ['error' => 'Votre carte a été refusée: ' . $e->getMessage()];
        } catch (\Exception $e) {
            error_log('Payment error: ' . $e->getMessage());
            return ['error' => 'Erreur lors du traitement du paiement: ' . $e->getMessage()];
        }
    }
    
    public function updatePaymentStatus($data) {
        try {
            // Validate required fields
            if (empty($data['payment_id']) || empty($data['status'])) {
                return ['error' => 'ID de paiement ou statut manquant'];
            }
            
            // Map the status to your ENUM values
            $dbStatus = $this->mapStripeStatusToDbStatus($data['status']);
            
            // Update payment status in database
            $success = $this->paymentModel->updatePaymentStatus($data['payment_id'], $dbStatus);
            
            if (!$success) {
                return ['error' => 'Erreur lors de la mise à jour du statut de paiement'];
            }
            
            // If payment is successful, update the purchase status and reduce stock
            if ($dbStatus === 'success') {
                // Get the payment to find the achat_id
                $payment = $this->paymentModel->getPaymentById($data['payment_id']);
                if ($payment) {
                    // Update achat status
                    $this->paymentModel->updateAchatStatus($payment['achat_id'], 'completed');
                    
                    // Get achat items
                    $achatItems = $this->paymentModel->getAchatItems($payment['achat_id']);
                    
                    // Reduce stock for each item
                    foreach ($achatItems as $item) {
                        $this->productModel->reduceStock($item['product_id'], $item['quantity']);
                    }
                }
            }
            
            return [
                'success' => true,
                'message' => 'Statut de paiement mis à jour avec succès'
            ];
            
        } catch (\Exception $e) {
            error_log('Payment status update error: ' . $e->getMessage());
            return ['error' => 'Erreur lors de la mise à jour du statut: ' . $e->getMessage()];
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
    
    // Helper method to map Stripe status to your database ENUM values
    private function mapStripeStatusToDbStatus($stripeStatus) {
        switch ($stripeStatus) {
            case 'succeeded':
                return 'success';
            case 'requires_payment_method':
            case 'requires_confirmation':
            case 'requires_action':
            case 'processing':
                return 'pending';
            default:
                return 'failed';
        }
    }
}
?>






