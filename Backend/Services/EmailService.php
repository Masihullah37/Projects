
 <?php  

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
use PHPMailer\PHPMailer\SMTP;

class EmailService {
    private PHPMailer $mail;
    private string $fromEmail;
    private string $fromName;

    public function __construct() {
       
    
        
        // These values are loaded by Dotenv in routes.php and made available globally in $_ENV.
        $this->fromEmail = $_ENV['GMAIL_EMAIL'] ?? null; // Use $_ENV directly, add null coalescing for safety
        $this->fromName = $_ENV['FROM_NAME'] ?? null;   // Use $_ENV directly
        $appPassword = $_ENV['GMAIL_APP_PASSWORD'] ?? null; // Use $_ENV directly
       

        // Basic validation for critical email credentials
        if (empty($this->fromEmail) || empty($appPassword)) {
            error_log('ERROR: EmailService initialization failed. GMAIL_EMAIL or GMAIL_APP_PASSWORD missing from environment variables.');
            throw new RuntimeException('Email service credentials are not configured.');
        }

        $this->mail = new PHPMailer(true);
        try {
            // SMTP server configuration
            // For production, set SMTPDebug to SMTP::DEBUG_OFF to prevent logging sensitive info
            $this->mail->SMTPDebug = SMTP::DEBUG_SERVER; // Set to SMTP::DEBUG_OFF for production
            $this->mail->isSMTP();
            $this->mail->Host = 'smtp.gmail.com';
            $this->mail->SMTPAuth = true;
            $this->mail->Username = $this->fromEmail; // Use the property set from $_ENV
            $this->mail->Password = $appPassword;// Use the variable set from $_ENV
            $this->mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
            $this->mail->Port = 587;
            $this->mail->CharSet = 'UTF-8';
        } catch (Exception $e) {
            error_log('EmailService initialization failed: ' . $e->getMessage());
            throw $e;
        }
    }

    public function sendPasswordResetEmail(string $toEmail, string $resetUrl): bool {
        try {
            $this->mail->clearAddresses();// Clear previous addresses for each send
            $this->mail->setFrom($this->fromEmail, $this->fromName);
            $this->mail->addAddress($toEmail);
            $this->mail->isHTML(true);
            $this->mail->Subject = "Réinitialisation de votre mot de passe";
            $this->mail->Body = $this->getPasswordResetEmailTemplate($resetUrl);
            $this->mail->AltBody = $this->getPasswordResetEmailTextContent($resetUrl);

            $this->mail->send();
            return true;
        } catch (Exception $e) {
            error_log('Erreur lors de l\'envoi de l\'email: ' . $e->getMessage());
            return false;
        }
    }

    private function getPasswordResetEmailTextContent(string $resetUrl): string {
        return "Bonjour,\n\n" .
               "Vous avez demandé la réinitialisation de votre mot de passe.\n\n" .
               "Cliquez sur le lien suivant pour réinitialiser votre mot de passe : $resetUrl\n\n" .
               "Ce lien est valable pendant 1 heure.\n\n" .
               "Si vous n'avez pas demandé cette réinitialisation, veuillez ignorer cet email.\n\n" .
               "Cordialement,\nL'équipe " . $this->fromName;
    }

    private function getPasswordResetEmailTemplate(string $resetUrl): string {
        return '
        <!DOCTYPE html>
        <html lang="fr">
        <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <title>Réinitialisation de votre mot de passe</title>
        </head>
        <body style="font-family: Arial, sans-serif; color: #333; margin:0; padding:0;">
            <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; margin: auto; border-collapse: collapse;">
                <tr>
                    <td style="background-color:#004d6e; color:#fff; padding:20px; text-align:center;">
                        <h1 style="margin:0;">Réinitialisation de votre mot de passe</h1>
                    </td>
                </tr>
                <tr>
                    <td style="background:#f9f9f9; padding:20px;">
                        <p>Bonjour,</p>
                        <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
                        <p style="text-align:center;">
                            <a href="' . htmlspecialchars($resetUrl) . '" style="background:#004d6e; color:#fff; padding:12px 24px; text-decoration:none; border-radius:4px; display:inline-block; font-weight:bold;">Réinitialiser mon mot de passe</a>
                        </p>
                        <p>Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :</p>
                        <p style="word-break: break-word;"><a href="' . htmlspecialchars($resetUrl) . '" style="color:#004d6e;">' . htmlspecialchars($resetUrl) . '</a></p>
                        <p>Ce lien est valable pendant 1 heure.</p>
                        <p>Si vous n\'avez pas demandé cette réinitialisation, veuillez ignorer cet email.</p>
                        <p>Cordialement,<br>L\'équipe ' . htmlspecialchars($this->fromName) . '</p>
                    </td>
                </tr>
                <tr>
                    <td style="background:#eee; color:#666; font-size:12px; text-align:center; padding:15px;">
                        © ' . date('Y') . ' ' . htmlspecialchars($this->fromName) . '. Tous droits réservés.
                    </td>
                </tr>
            </table>
        </body>
        </html>';
    }
}

    public function sendRepairNotification(string $toEmail, string $subject, string $body): bool {
        try {
            $this->mail->clearAddresses();
            $this->mail->setFrom($this->fromEmail, $this->fromName);
            $this->mail->addAddress($toEmail);
            $this->mail->isHTML(true);
            $this->mail->Subject = $subject;
            $this->mail->Body = $body;

            $this->mail->send();
            return true;
        } catch (Exception $e) {
            error_log('Error sending repair notification: ' . $e->getMessage());
            return false;
        }
    }





?>