<?php

require_once __DIR__ . '/../Models/AdminModel.php';
require_once __DIR__ . '/../Models/UserModel.php';
require_once __DIR__ . '/../Models/ProductModel.php';
require_once __DIR__ . '/../Models/RepairModel.php';
require_once __DIR__ . '/../Services/EmailService.php';
require_once __DIR__ . '/../Services/ResponseService.php';

class AdminController {
    private $adminModel;
    private $userModel;
    private $productModel;
    private $repairModel;
    private $emailService;

    public function __construct($conn) {
        $this->adminModel = new AdminModel($conn);
        $this->userModel = new UserModel($conn);
        $this->productModel = new ProductModel($conn);
        $this->repairModel = new RepairModel($conn);
        $this->emailService = new EmailService();
    }

    /**
     * Admin login
     */
    public function login($data) {
        try {
            $username = $data['username'] ?? '';
            $password = $data['password'] ?? '';

            if (empty($username) || empty($password)) {
                return ['success' => false, 'message' => 'Username and password are required'];
            }

            $admin = $this->adminModel->login($username, $password);
            
            if (!$admin) {
                return ['success' => false, 'message' => 'Invalid credentials'];
            }

            // Set admin session
            $_SESSION['admin_id'] = $admin['id'];
            $_SESSION['admin_username'] = $admin['username'];
            $_SESSION['is_admin'] = true;

            return [
                'success' => true,
                'admin' => [
                    'id' => $admin['id'],
                    'username' => $admin['username'],
                    'email' => $admin['email']
                ]
            ];

        } catch (Exception $e) {
            error_log("Admin login error: " . $e->getMessage());
            return ['success' => false, 'message' => 'Login failed'];
        }
    }

    /**
     * Create new admin account
     */
    public function createAdmin($data) {
        try {
            $username = $data['username'] ?? '';
            $email = $data['email'] ?? '';
            $password = $data['password'] ?? '';

            if (empty($username) || empty($email) || empty($password)) {
                return ['success' => false, 'message' => 'All fields are required'];
            }

            // Check if admin already exists
            if ($this->adminModel->adminExists($username, $email)) {
                return ['success' => false, 'message' => 'Admin with this username or email already exists'];
            }

            $adminId = $this->adminModel->createAdmin($username, $email, $password);
            
            if ($adminId) {
                return ['success' => true, 'message' => 'Admin account created successfully'];
            }

            return ['success' => false, 'message' => 'Failed to create admin account'];

        } catch (Exception $e) {
            error_log("Create admin error: " . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to create admin account'];
        }
    }

    /**
     * Get all users
     */
    public function getUsers() {
        try {
            $users = $this->adminModel->getAllUsers();
            return ['success' => true, 'users' => $users];
        } catch (Exception $e) {
            error_log("Get users error: " . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to fetch users'];
        }
    }

    /**
     * Block/Unblock user
     */
    public function toggleUserStatus($data) {
        try {
            $userId = $data['user_id'] ?? '';
            $status = $data['status'] ?? '';

            if (empty($userId) || !in_array($status, ['active', 'blocked'])) {
                return ['success' => false, 'message' => 'Invalid data'];
            }

            $updated = $this->adminModel->updateUserStatus($userId, $status);
            
            if ($updated) {
                return ['success' => true, 'message' => 'User status updated successfully'];
            }

            return ['success' => false, 'message' => 'Failed to update user status'];

        } catch (Exception $e) {
            error_log("Toggle user status error: " . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to update user status'];
        }
    }

    /**
     * Delete user
     */
    public function deleteUser($userId) {
        try {
            if (empty($userId)) {
                return ['success' => false, 'message' => 'User ID is required'];
            }

            $deleted = $this->adminModel->deleteUser($userId);
            
            if ($deleted) {
                return ['success' => true, 'message' => 'User deleted successfully'];
            }

            return ['success' => false, 'message' => 'Failed to delete user'];

        } catch (Exception $e) {
            error_log("Delete user error: " . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to delete user'];
        }
    }

    /**
     * Add product with image upload
     */
    public function addProduct($data, $files = null) {
        try {
            $nom = $data['nom'] ?? '';
            $description = $data['description'] ?? '';
            $prix = $data['prix'] ?? '';
            $stock = $data['stock'] ?? '';

            if (empty($nom) || empty($prix) || empty($stock)) {
                return ['success' => false, 'message' => 'Name, price and stock are required'];
            }

            $imagePath = null;
            
            // Handle image upload
            if ($files && isset($files['image']) && $files['image']['error'] === UPLOAD_ERR_OK) {
                $imagePath = $this->handleImageUpload($files['image']);
                if (!$imagePath) {
                    return ['success' => false, 'message' => 'Failed to upload image'];
                }
            }

            $productData = [
                'nom' => $nom,
                'description' => $description,
                'prix' => $prix,
                'stock' => $stock,
                'image' => $imagePath
            ];

            $productId = $this->productModel->addProduct($productData);
            
            if ($productId) {
                return ['success' => true, 'message' => 'Product added successfully', 'product_id' => $productId];
            }

            return ['success' => false, 'message' => 'Failed to add product'];

        } catch (Exception $e) {
            error_log("Add product error: " . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to add product'];
        }
    }

    /**
     * Update product
     */
    public function updateProduct($data, $files = null) {
        try {
            $productId = $data['product_id'] ?? '';
            $nom = $data['nom'] ?? '';
            $description = $data['description'] ?? '';
            $prix = $data['prix'] ?? '';
            $stock = $data['stock'] ?? '';

            if (empty($productId) || empty($nom) || empty($prix) || empty($stock)) {
                return ['success' => false, 'message' => 'Product ID, name, price and stock are required'];
            }

            $productData = [
                'nom' => $nom,
                'description' => $description,
                'prix' => $prix,
                'stock' => $stock
            ];

            // Handle image upload if provided
            if ($files && isset($files['image']) && $files['image']['error'] === UPLOAD_ERR_OK) {
                $imagePath = $this->handleImageUpload($files['image']);
                if ($imagePath) {
                    $productData['image'] = $imagePath;
                }
            }

            $updated = $this->productModel->updateProduct($productId, $productData);
            
            if ($updated) {
                return ['success' => true, 'message' => 'Product updated successfully'];
            }

            return ['success' => false, 'message' => 'Failed to update product'];

        } catch (Exception $e) {
            error_log("Update product error: " . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to update product'];
        }
    }

    /**
     * Delete product
     */
    public function deleteProduct($productId) {
        try {
            if (empty($productId)) {
                return ['success' => false, 'message' => 'Product ID is required'];
            }

            $deleted = $this->productModel->deleteProduct($productId);
            
            if ($deleted) {
                return ['success' => true, 'message' => 'Product deleted successfully'];
            }

            return ['success' => false, 'message' => 'Failed to delete product'];

        } catch (Exception $e) {
            error_log("Delete product error: " . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to delete product'];
        }
    }

    /**
     * Get all repairs
     */
    public function getRepairs() {
        try {
            $repairs = $this->repairModel->getRepairs();
            return ['success' => true, 'repairs' => $repairs];
        } catch (Exception $e) {
            error_log("Get repairs error: " . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to fetch repairs'];
        }
    }

    /**
     * Update repair status and send notification
     */
    public function updateRepairStatus($data) {
        try {
            $repairId = $data['repair_id'] ?? '';
            $status = $data['status'] ?? '';
            $notes = $data['notes'] ?? '';

            if (empty($repairId) || empty($status)) {
                return ['success' => false, 'message' => 'Repair ID and status are required'];
            }

            // Get repair details
            $repair = $this->repairModel->getRepairById($repairId);
            if (!$repair) {
                return ['success' => false, 'message' => 'Repair not found'];
            }

            // Update status
            $updated = $this->repairModel->updateStatus($repairId, $status);
            
            if (!$updated) {
                return ['success' => false, 'message' => 'Failed to update repair status'];
            }

            // Update notes if provided
            if (!empty($notes)) {
                $this->repairModel->updateNotes($repairId, $notes);
            }

            // Send notification email
            $this->sendRepairStatusNotification($repair, $status, $notes);

            return ['success' => true, 'message' => 'Repair status updated and notification sent'];

        } catch (Exception $e) {
            error_log("Update repair status error: " . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to update repair status'];
        }
    }

    /**
     * Admin forgot password
     */
    public function forgotPassword($data) {
        try {
            $email = $data['email'] ?? '';

            if (empty($email)) {
                return ['success' => false, 'message' => 'Email is required'];
            }

            $admin = $this->adminModel->findAdminByEmail($email);
            if (!$admin) {
                return ['success' => false, 'message' => 'Admin not found with this email'];
            }

            $token = $this->adminModel->createPasswordResetToken($email);
            if (!$token) {
                return ['success' => false, 'message' => 'Failed to create reset token'];
            }

            // Send reset email
            $resetUrl = "https://test.icvinformatique.com/admin/reset-password?token=$token&email=" . urlencode($email);
            
            if ($this->emailService->sendPasswordResetEmail($email, $resetUrl)) {
                return ['success' => true, 'message' => 'Reset email sent successfully'];
            }

            return ['success' => false, 'message' => 'Failed to send reset email'];

        } catch (Exception $e) {
            error_log("Admin forgot password error: " . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to process forgot password request'];
        }
    }

    /**
     * Reset admin password
     */
    public function resetPassword($data) {
        try {
            $token = $data['token'] ?? '';
            $email = $data['email'] ?? '';
            $password = $data['password'] ?? '';

            if (empty($token) || empty($email) || empty($password)) {
                return ['success' => false, 'message' => 'All fields are required'];
            }

            $reset = $this->adminModel->resetPassword($email, $token, $password);
            
            if ($reset) {
                return ['success' => true, 'message' => 'Password reset successfully'];
            }

            return ['success' => false, 'message' => 'Invalid or expired reset link'];

        } catch (Exception $e) {
            error_log("Admin reset password error: " . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to reset password'];
        }
    }

    /**
     * Handle image upload
     */
    private function handleImageUpload($file) {
        try {
            $uploadDir = __DIR__ . '/../../Frontend/public/images/';
            
            // Create directory if it doesn't exist
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0755, true);
            }

            // Validate file type
            $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
            if (!in_array($file['type'], $allowedTypes)) {
                return false;
            }

            // Validate file size (max 5MB)
            if ($file['size'] > 5 * 1024 * 1024) {
                return false;
            }

            // Generate unique filename
            $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
            $filename = 'product_' . time() . '_' . uniqid() . '.' . $extension;
            $filepath = $uploadDir . $filename;

            if (move_uploaded_file($file['tmp_name'], $filepath)) {
                return $filename;
            }

            return false;

        } catch (Exception $e) {
            error_log("Image upload error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Send repair status notification
     */
    private function sendRepairStatusNotification($repair, $status, $notes = '') {
        try {
            $statusMessages = [
                'en_attente' => 'Votre demande de réparation est en attente de traitement.',
                'en_cours' => 'Votre réparation est actuellement en cours.',
                'termine' => 'Votre réparation est terminée et prête à être récupérée.'
            ];

            $statusMessage = $statusMessages[$status] ?? 'Statut de réparation mis à jour.';
            
            $subject = "Mise à jour de votre réparation - IT Repairs";
            $body = $this->getRepairNotificationTemplate($repair, $statusMessage, $notes);

            return $this->emailService->sendRepairNotification($repair['email'], $subject, $body);

        } catch (Exception $e) {
            error_log("Send repair notification error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Get repair notification email template
     */
    private function getRepairNotificationTemplate($repair, $statusMessage, $notes) {
        $notesSection = !empty($notes) ? "<p><strong>Notes :</strong> " . htmlspecialchars($notes) . "</p>" : "";
        
        return "
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset='UTF-8'>
            <title>Mise à jour de réparation</title>
        </head>
        <body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>
            <div style='max-width: 600px; margin: 0 auto; padding: 20px;'>
                <h2 style='color: #004d6e;'>Mise à jour de votre réparation</h2>
                <p>Bonjour {$repair['nom']},</p>
                <p>{$statusMessage}</p>
                <div style='background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;'>
                    <p><strong>Détails de votre réparation :</strong></p>
                    <p><strong>Appareil :</strong> {$repair['marque']} {$repair['modele']}</p>
                    <p><strong>Problème :</strong> {$repair['probleme']}</p>
                    <p><strong>Statut actuel :</strong> " . ucfirst(str_replace('_', ' ', $repair['statut'])) . "</p>
                    {$notesSection}
                </div>
                <p>Pour toute question, n'hésitez pas à nous contacter.</p>
                <p>Cordialement,<br>L'équipe IT Repairs</p>
            </div>
        </body>
        </html>";
    }

    /**
     * Get dashboard statistics
     */
    public function getDashboardStats() {
        try {
            $stats = $this->adminModel->getDashboardStats();
            return ['success' => true, 'stats' => $stats];
        } catch (Exception $e) {
            error_log("Get dashboard stats error: " . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to fetch dashboard statistics'];
        }
    }
}

?>