
<?php


use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
use PHPMailer\PHPMailer\SMTP;

class EmailService {
    private $mail;
    private $fromEmail;
    private $fromName;
    
    public function __construct() {
        // Load configuration
        $config = $this->loadEmailConfig();
        
        $this->fromEmail = $config['gmail_email'];
        $this->fromName = $config['from_name'];
        
        // Initialize PHPMailer
        $this->mail = new PHPMailer(true);
        
        // Configure Gmail SMTP
        $this->mail->isSMTP();
        $this->mail->Host = 'smtp.gmail.com';
        $this->mail->SMTPAuth = true;
        $this->mail->Username = $config['gmail_email'];
        $this->mail->Password = $config['gmail_app_password'];
        $this->mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $this->mail->Port = 587;
        $this->mail->CharSet = 'UTF-8';
    }
    
    private function loadEmailConfig() {
        $configFile = __DIR__ . '/../Config/mail/mail_config.php';
        
        if (!file_exists($configFile)) {
            throw new \Exception('Email configuration file not found');
        }
        
        return require $configFile;
    }

    public function sendPasswordResetEmail($toEmail, $resetUrl) {
        try {
            // Reset recipients
            $this->mail->clearAddresses();
            
            // Set sender
            $this->mail->setFrom($this->fromEmail, $this->fromName);
            
            // Add recipient
            $this->mail->addAddress($toEmail);
            
            // Set email content
            $this->mail->isHTML(true);
            $this->mail->Subject = "Réinitialisation de votre mot de passe";
            $this->mail->Body = $this->getPasswordResetEmailTemplate($resetUrl);
            $this->mail->AltBody = $this->getPasswordResetEmailTextContent($resetUrl);
            
            // Send email
            $this->mail->send();
            return true;
            
        } catch (Exception $e) {
            error_log('Erreur lors de l\'envoi de l\'email: ' . $e->getMessage());
            return false;
        }
    }
    
    private function getPasswordResetEmailTextContent($resetUrl) {
        return "Bonjour,\n\n" .
               "Vous avez demandé la réinitialisation de votre mot de passe.\n\n" .
               "Cliquez sur le lien suivant pour réinitialiser votre mot de passe : $resetUrl\n\n" .
               "Ce lien est valable pendant 1 heure.\n\n" .
               "Si vous n'avez pas demandé cette réinitialisation, veuillez ignorer cet email.\n\n" .
               "Cordialement,\nL'équipe " . $this->fromName;
    }
    
    private function getPasswordResetEmailTemplate($resetUrl) {
        return '
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Réinitialisation de votre mot de passe</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    margin: 0;
                    padding: 0;
                }
                .container {
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                }
                .header {
                    background-color: #004d6e;
                    color: white;
                    padding: 20px;
                    text-align: center;
                }
                .content {
                    padding: 20px;
                    background-color: #f9f9f9;
                }
                .button {
                    display: inline-block;
                    background-color: #004d6e;
                    color: white;
                    padding: 12px 24px;
                    text-decoration: none;
                    border-radius: 4px;
                    margin: 20px 0;
                }
                .footer {
                    text-align: center;
                    padding: 20px;
                    font-size: 12px;
                    color: #666;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Réinitialisation de votre mot de passe</h1>
                </div>
                <div class="content">
                    <p>Bonjour,</p>
                    <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
                    <p>Cliquez sur le bouton ci-dessous pour réinitialiser votre mot de passe :</p>
                    <p style="text-align: center;">
                        <a href="' . $resetUrl . '" class="button">Réinitialiser mon mot de passe</a>
                    </p>
                    <p>Ce lien est valable pendant 1 heure.</p>
                    <p>Si vous n\'avez pas demandé cette réinitialisation, veuillez ignorer cet email.</p>
                    <p>Cordialement,<br>L\'équipe ' . $this->fromName . '</p>
                </div>
                <div class="footer">
                    <p>© ' . date('Y') . ' ' . $this->fromName . '. Tous droits réservés.</p>
                </div>
            </div>
        </body>
        </html>';
    }
}
?>