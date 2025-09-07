<?php

class AdminModel {
    private $conn;
    private $table_name = "admins";

    public function __construct($conn) {
        $this->conn = $conn;
    }

    /**
     * Admin login
     */
    public function login($username, $password) {
        try {
            $query = "SELECT * FROM " . $this->table_name . " WHERE username = :username AND status = 'active' LIMIT 1";
            $stmt = $this->conn->prepare($query);
            $stmt->execute([':username' => $username]);
            
            $admin = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$admin || !password_verify($password, $admin['password'])) {
                return false;
            }

            // Remove sensitive data
            unset($admin['password']);
            unset($admin['reset_password_token']);
            unset($admin['reset_password_expires']);
            
            return $admin;

        } catch (PDOException $e) {
            error_log('Database error in admin login: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Create new admin
     */
    public function createAdmin($username, $email, $password) {
        try {
            $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
            
            $query = "INSERT INTO " . $this->table_name . " (username, email, password, status) VALUES (:username, :email, :password, 'active')";
            $stmt = $this->conn->prepare($query);
            
            $stmt->execute([
                ':username' => $username,
                ':email' => $email,
                ':password' => $hashedPassword
            ]);

            return $this->conn->lastInsertId();

        } catch (PDOException $e) {
            error_log('Database error creating admin: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Check if admin exists
     */
    public function adminExists($username, $email) {
        try {
            $query = "SELECT id FROM " . $this->table_name . " WHERE username = :username OR email = :email LIMIT 1";
            $stmt = $this->conn->prepare($query);
            $stmt->execute([':username' => $username, ':email' => $email]);
            
            return $stmt->fetch(PDO::FETCH_ASSOC) !== false;

        } catch (PDOException $e) {
            error_log('Database error checking admin exists: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Get all users
     */
    public function getAllUsers() {
        try {
            $query = "SELECT id, nom, prenom, email, telephone, status, created_at FROM utilisateurs ORDER BY created_at DESC";
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            
            return $stmt->fetchAll(PDO::FETCH_ASSOC);

        } catch (PDOException $e) {
            error_log('Database error getting users: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Update user status
     */
    public function updateUserStatus($userId, $status) {
        try {
            $query = "UPDATE utilisateurs SET status = :status WHERE id = :user_id";
            $stmt = $this->conn->prepare($query);
            
            return $stmt->execute([
                ':status' => $status,
                ':user_id' => $userId
            ]);

        } catch (PDOException $e) {
            error_log('Database error updating user status: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Delete user
     */
    public function deleteUser($userId) {
        try {
            $query = "DELETE FROM utilisateurs WHERE id = :user_id";
            $stmt = $this->conn->prepare($query);
            
            return $stmt->execute([':user_id' => $userId]);

        } catch (PDOException $e) {
            error_log('Database error deleting user: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Find admin by email
     */
    public function findAdminByEmail($email) {
        try {
            $query = "SELECT * FROM " . $this->table_name . " WHERE email = :email LIMIT 1";
            $stmt = $this->conn->prepare($query);
            $stmt->execute([':email' => $email]);
            
            return $stmt->fetch(PDO::FETCH_ASSOC);

        } catch (PDOException $e) {
            error_log('Database error finding admin by email: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Create password reset token
     */
    public function createPasswordResetToken($email) {
        try {
            $token = bin2hex(random_bytes(32));
            $expires = date('Y-m-d H:i:s', strtotime('+1 hour'));
            
            $query = "UPDATE " . $this->table_name . " SET reset_password_token = :token, reset_password_expires = :expires WHERE email = :email";
            $stmt = $this->conn->prepare($query);
            
            if ($stmt->execute([':token' => $token, ':expires' => $expires, ':email' => $email])) {
                return $token;
            }
            
            return false;

        } catch (PDOException $e) {
            error_log('Database error creating reset token: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Reset password
     */
    public function resetPassword($email, $token, $newPassword) {
        try {
            // Validate token
            $query = "SELECT id FROM " . $this->table_name . " WHERE email = :email AND reset_password_token = :token AND reset_password_expires > NOW()";
            $stmt = $this->conn->prepare($query);
            $stmt->execute([':email' => $email, ':token' => $token]);
            
            if (!$stmt->fetch()) {
                return false;
            }

            // Update password
            $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);
            $updateQuery = "UPDATE " . $this->table_name . " SET password = :password, reset_password_token = NULL, reset_password_expires = NULL WHERE email = :email";
            $updateStmt = $this->conn->prepare($updateQuery);
            
            return $updateStmt->execute([':password' => $hashedPassword, ':email' => $email]);

        } catch (PDOException $e) {
            error_log('Database error resetting admin password: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Get dashboard statistics
     */
    public function getDashboardStats() {
        try {
            $stats = [];

            // Total users
            $query = "SELECT COUNT(*) as total FROM utilisateurs";
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            $stats['total_users'] = $stmt->fetch(PDO::FETCH_ASSOC)['total'];

            // Total products
            $query = "SELECT COUNT(*) as total FROM produits";
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            $stats['total_products'] = $stmt->fetch(PDO::FETCH_ASSOC)['total'];

            // Total repairs
            $query = "SELECT COUNT(*) as total FROM reparations";
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            $stats['total_repairs'] = $stmt->fetch(PDO::FETCH_ASSOC)['total'];

            // Pending repairs
            $query = "SELECT COUNT(*) as total FROM reparations WHERE statut = 'en_attente'";
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            $stats['pending_repairs'] = $stmt->fetch(PDO::FETCH_ASSOC)['total'];

            // Total revenue
            $query = "SELECT COALESCE(SUM(total_amount), 0) as total FROM achats WHERE status = 'completed'";
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            $stats['total_revenue'] = $stmt->fetch(PDO::FETCH_ASSOC)['total'];

            // Recent orders
            $query = "SELECT COUNT(*) as total FROM achats WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)";
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            $stats['recent_orders'] = $stmt->fetch(PDO::FETCH_ASSOC)['total'];

            return $stats;

        } catch (PDOException $e) {
            error_log('Database error getting dashboard stats: ' . $e->getMessage());
            return [];
        }
    }
}

?>