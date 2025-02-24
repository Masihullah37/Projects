<?php

require_once __DIR__ . '/../Models/UserModel.php';

class AuthController {
    private $usersModel;

    // Constructeur : Initialise le modèle Users avec la connexion à la base de données
    public function __construct($conn) {
        $this->usersModel = new UserModel($conn);
    }

  //   public function register($data) {
  //     $nom = $data['nom'] ?? '';
  //     $prenom = $data['prenom'] ?? '';
  //     $email = $data['email'] ?? '';
  //     $telephone = $data['telephone'] ?? '';
  //     $password = $data['password'] ?? '';
  
  //     // Vérifier si l'utilisateur existe déjà
  //     $userExists = $this->usersModel->checkIfUserExists($email, $telephone);
  
  //     if ($userExists) {
  //         if ($userExists['email'] === $email) {
  //             error_log("Email already exists: " . $email); // Debugging
  //             return ["error" => "EMAIL_EXISTS"];
  //         } elseif ($userExists['telephone'] === $telephone) {
  //             error_log("Phone already exists: " . $telephone); // Debugging
  //             return ["error" => "PHONE_EXISTS"];
  //         }
  //     }
  
  //     // Inscription de l'utilisateur
  //     $registered = $this->usersModel->register($nom,$prenom, $email, $telephone, $password);
  
  //     if ($registered) {
  //         return ["success" => "Utilisateur inscrit avec succès"];
  //     } else {
  //         return ["error" => "Échec de l'inscription"];
  //     }
  // }

  public function register($data) {
    $nom = $data['nom'] ?? '';
    $prenom = $data['prenom'] ?? '';
    $email = $data['email'] ?? '';
    $telephone = $data['telephone'] ?? '';
    $password = $data['password'] ?? '';

    // Vérifier si l'utilisateur existe déjà
    $userExists = $this->usersModel->checkIfUserExists($email, $telephone);

    if ($userExists) {
        if ($userExists['email'] === $email) {
            error_log("Email already exists: " . $email); // Debugging
            return ["error" => "EMAIL_EXISTS"];
        } elseif ($userExists['telephone'] === $telephone) {
            error_log("Phone already exists: " . $telephone); // Debugging
            return ["error" => "PHONE_EXISTS"];
        }
    }

    // Inscription de l'utilisateur
    $registered = $this->usersModel->register($nom, $prenom, $email, $password, $telephone); // Corrected parameter order

    if ($registered) {
        return ["success" => "Utilisateur inscrit avec succès"];
    } else {
        return ["error" => "Échec de l'inscription"];
    }
}

    // Inscription d'un nouvel utilisateur
    // public function register($data) {
    //     $nom = $data['nom'] ?? '';
    //     $prenom = $data['prenom'] ?? '';
    //     $email = $data['email'] ?? '';
    //     $telephone = $data['telephone'] ?? '';
    //     $password = $data['password'] ?? '';

    //     // Vérifier si l'utilisateur existe déjà
    //     $userExists = $this->usersModel->checkIfUserExists($email, $telephone);

    //     if ($userExists) {
    //         if ($userExists['email'] === $email) {
    //             return ["error" => "EMAIL_EXISTS"];
    //         } elseif ($userExists['telephone'] === $telephone) {
    //             return ["error" => "PHONE_EXISTS"];
    //         }
    //     }

    //     // Inscription de l'utilisateur
    //     $registered = $this->usersModel->register($nom, $prenom, $email, $telephone, $password);

    //     if ($registered) {
    //         return ["success" => "Utilisateur inscrit avec succès"];
    //     } else {
    //         return ["error" => "Échec de l'inscription"];
    //     }
    // }

    // Connexion de l'utilisateur
    public function login($data) {
        return $this->usersModel->login($data['email'], $data['password']);
    }
}

// require_once __DIR__ . '/../Models/UserModel.php';


// class AuthController {
//     private $userModel;

//     // Constructeur : initialise le modèle User
//     public function __construct($conn) {
//         $this->userModel = new UserModel($conn);
//     }

//     // Enregistre un nouvel utilisateur
//     public function register($data) {
//         return $this->userModel->register($data['nom'], $data['prenom'], $data['email'], $data['password'], $data['telephone']);
//     }

//     // Connecte un utilisateur
//     public function login($data) {
//         return $this->userModel->login($data['email'], $data['password']);
//     }
// }
?>