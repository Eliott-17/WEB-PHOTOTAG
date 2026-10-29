<?php

date_default_timezone_set('Europe/Paris');

define("MAILVER_VERSION", "702");

require($_SERVER['DOCUMENT_ROOT'].'/includes/PHPMailer'.MAILVER_VERSION.'/Exception.php');
require($_SERVER['DOCUMENT_ROOT'].'/includes/PHPMailer'.MAILVER_VERSION.'/PHPMailer.php');
require($_SERVER['DOCUMENT_ROOT'].'/includes/PHPMailer'.MAILVER_VERSION.'/SMTP.php');


use PHPMailer\PHPMailer\Exception;	
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;

$credentialFile = __DIR__ . '/../../mailcredential.json';
$smtp_ok = true;
$MAIL_CREDENTIALS = null;

if (!is_readable($credentialFile)) 
{
    $smtp_ok = 'SMTP configuration file is missing or unreadable.'.$credentialFile;
} 
else 
{
    try {
        $MAIL_CREDENTIALS = json_decode(
            file_get_contents($credentialFile),
            false,
            512,
            JSON_THROW_ON_ERROR
        );
    } catch (JsonException $e) 
	{
        $smtp_ok = 'SMTP configuration contains invalid JSON.';
    }

    if (
        $smtp_ok === true &&
        (
            !is_object($MAIL_CREDENTIALS) ||
            empty($MAIL_CREDENTIALS->Host) ||
            empty($MAIL_CREDENTIALS->Username) ||
            empty($MAIL_CREDENTIALS->Password)
        )
    ) {
        $smtp_ok = 'SMTP configuration is incomplete.';
    }
}

if ($smtp_ok === true) {


		$mail = new PHPMailer();
		$mail->Timeout = 5;
		//$mail->SMTPDebug = SMTP::DEBUG_SERVER;
		//$mail->SMTPDebug = SMTP::DEBUG_CONNECTION;

		$mail->isSMTP();                                    // Set mailer to use SMTP
		$mail->Host = $MAIL_CREDENTIALS->Host;  			// Specify main and backup SMTP servers
		$mail->SMTPAuth = true;                             // Enable SMTP authentication
		$mail->Username = $MAIL_CREDENTIALS->Username;   	// SMTP username
		$mail->Password = $MAIL_CREDENTIALS->Password;      // SMTP password
		$mail->SMTPSecure = 'ssl';                          // Enable TLS encryption, `ssl` also accepted
		$mail->Port = 465;    
		$mail->From = $MAIL_CREDENTIALS->From;
		//$mail->DKIM_domain = '';
		//$mail->DKIM_private = $_SERVER['DOCUMENT_ROOT'].'/...';
		//$mail->DKIM_selector = '';
		//$mail->DKIM_passphrase = '';
		//$mail->DKIM_identity = $mail->From;

		$mail->FromName = $MAIL_CREDENTIALS->FromName;

		$mail->addReplyTo($MAIL_CREDENTIALS->addReplyTo_mail,$MAIL_CREDENTIALS->addReplyTo_name);
		$mail->isHTML(true); 
	}

?>