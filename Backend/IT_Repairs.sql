    CREATE DATABASE IT_repair_shop;

    USE IT_repair_shop;

    -- Table for users
    CREATE TABLE utilisateurs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nom VARCHAR(50) NOT NULL,
        prenom VARCHAR(50) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        telephone VARCHAR(20),
        reset_password_token VARCHAR(255),
        reset_password_expires DATETIME,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Table for products
    CREATE TABLE produits (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nom VARCHAR(100) NOT NULL,
        description TEXT,
        prix DECIMAL(10, 2) NOT NULL,
        stock INT NOT NULL,
        image VARCHAR(255) -- Path to the image file
    );

    -- Table for repair requests
    CREATE TABLE reparations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nom VARCHAR(50) NOT NULL,
        email VARCHAR(100) NOT NULL,
        telephone VARCHAR(20) NOT NULL,
        marque VARCHAR(50) NOT NULL,
        modele VARCHAR(50) NOT NULL,
        probleme TEXT NOT NULL,
        services TEXT,
        devis_demande BOOLEAN DEFAULT FALSE,
        statut ENUM('en_attente', 'en_cours', 'termine') DEFAULT 'en_attente',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE achats (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL, -- Foreign key referencing the users table
        product_id INT NOT NULL, -- Foreign key referencing the products table
        quantity INT NOT NULL DEFAULT 1, -- Quantity of the product purchased
        purchase_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Date and time of purchase
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE, -- Cascade delete if user is deleted
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE -- Cascade delete if product is deleted
    );

    CREATE TABLE paiements (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL, -- Foreign key referencing the users table
        purchase_id INT NOT NULL, -- Foreign key referencing the purchases table
        payment_method ENUM('credit_card', 'paypal') NOT NULL, -- Payment method used
        payment_status ENUM('pending', 'success', 'failed') DEFAULT 'pending', -- Payment status
        amount DECIMAL(10, 2) NOT NULL, -- Total amount paid
        transaction_id VARCHAR(255), -- Transaction ID from payment gateway
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Date and time of payment
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE, -- Cascade delete if user is deleted
        FOREIGN KEY (purchase_id) REFERENCES purchases(id) ON DELETE CASCADE -- Cascade delete if purchase is deleted
    );
