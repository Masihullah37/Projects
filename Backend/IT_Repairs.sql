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

    CREATE TABLE achats_old (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL, -- Foreign key referencing the users table
        product_id INT NOT NULL, -- Foreign key referencing the products table
        quantity INT NOT NULL DEFAULT 1, -- Quantity of the product purchased
        purchase_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Date and time of purchase
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE, -- Cascade delete if user is deleted
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE -- Cascade delete if product is deleted
    );

    -- Main purchases table (renamed to achats)
   CREATE TABLE achats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    status ENUM('pending', 'completed', 'cancelled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES utilisateurs(id) ON DELETE CASCADE
    );


    CREATE TABLE achats_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    achat_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (achat_id) REFERENCES achats(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES produits(id) ON DELETE CASCADE
    );

    

    -- Payments table
    CREATE TABLE paiements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    achat_id INT NOT NULL,
    adresse_livraison_id INT NOT NULL,
    payment_method ENUM('credit_card', 'paypal', 'bank_transfer') NOT NULL,
    payment_status ENUM('pending', 'success', 'failed') DEFAULT 'pending',
    amount DECIMAL(10, 2) NOT NULL,
    transaction_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (adresse_livraison_id) REFERENCES adresses_livraison(id),
    FOREIGN KEY (user_id) REFERENCES utilisateurs(id) ON DELETE CASCADE,
    FOREIGN KEY (achat_id) REFERENCES achats(id) ON DELETE CASCADE
    );

    -- Shipping addresses table
    CREATE TABLE adresses_livraison (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(255) NOT NULL,
    adresse_ligne1 VARCHAR(255) NOT NULL,
    adresse_ligne2 VARCHAR(255),
    ville VARCHAR(100) NOT NULL,
    departement VARCHAR(100) NOT NULL,
    code_postal VARCHAR(20) NOT NULL,
    pays VARCHAR(100) NOT NULL,
    telephone VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    );
