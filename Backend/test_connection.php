<?php
require_once 'Config/Database.php';

try {
    $database = new Database();
    $conn = $database->getConnection();
    
    // Test query
    $stmt = $conn->query("SELECT COUNT(*) FROM produits");
    $count = $stmt->fetchColumn();
    
    echo "<h1>Connection successful!</h1>";
    echo "<p>Found $count products in database.</p>";
    echo "<p>Server time: " . date('Y-m-d H:i:s') . "</p>";
} catch (PDOException $e) {
    echo "<h1>Connection failed</h1>";
    echo "<pre>" . $e->getMessage() . "</pre>";
    echo "<p>Check these common issues:</p>";
    echo "<ul>
          <li>MySQL service is running</li>
          <li>Database credentials in Database.php</li>
          <li>Table 'produits' exists</li>
          </ul>";
}
?>