<?php

require_once($_SERVER['DOCUMENT_ROOT'].'/core/securityheader.php');
require_once($_SERVER['DOCUMENT_ROOT'].'/core/class.easypdo.php');
require_once($_SERVER['DOCUMENT_ROOT'].'/core/class.freturn.php');
require_once($_SERVER['DOCUMENT_ROOT'].'/includes/functions.php');

$uploadDir = $_SERVER['DOCUMENT_ROOT'].'/multimedia/'.$_SESSION["USER"].'/';

$fReturn = new fReturn();

if (!empty($_FILES['file']) && !empty($_FILES['preview'])) {
    $name = basename($_FILES['file']['name']);
    $tmp = $_FILES['file']['tmp_name'];
    $size = $_FILES['file']['size'];

    // Vérifie la taille
    if ($size > 55 * 1024 * 1024) {
		$fReturn->addRawText("file is over 55Mo")->fetch();
        //exit("file is over 55 Mo)");
    }

    $ext = strtolower(pathinfo($name, PATHINFO_EXTENSION));
    $allowedImages = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'tif', 'tiff'];
    $allowedVideos = ['mp4', 'webm', 'mov', 'mkv', 'avi', '3gp'];

    if (in_array($ext, $allowedImages)) {
        $file_type = 0; // Image
    } elseif (in_array($ext, $allowedVideos)) {
        $file_type = 1; // Vidéo
    } else {
		$fReturn->addRawText("Invalid file")->fetch();
        //exit("Invalid file");
    }

    $targetHD = $uploadDir.$name;
    if (is_file($targetHD)) {
		$fReturn->addRawText("Already exist")->fetch();
		//exit("already exist");
	}

    if (!move_uploaded_file($tmp, $targetHD)) {
		$fReturn->addRawText("Upload fail")->fetch();
        //exit("Upload fail");
    }

    $hash = hash('sha256', $name . bin2hex(random_bytes(10)));
    $previewName = $hash.'.webp';
    $targetSD = $uploadDir.$previewName;
    if (!move_uploaded_file($_FILES['preview']['tmp_name'], $targetSD)) {
        $fReturn->addRawText("Preview upload fail")->fetch();
		//exit("Preview upload fail");
    }

    // Récupère la date de prise de vue
    $strdate_taken = "00000000+0000000000";
    if ($file_type == 0) {
        $exif = @exif_read_data($targetHD);
        if (isset($exif['DateTimeOriginal'])) {
            $date = DateTime::createFromFormat('Y:m:d H:i:s', $exif['DateTimeOriginal']);
            $fuseau = "+0000";
            foreach ($exif as $value) {
                if (is_string($value)) {
                    $foundFuseau = extractTimezoneFromString($value);
                    if ($foundFuseau !== null) {
                        $fuseau = $foundFuseau;
                        break;
                    }
                }
            }
            $strdate_taken = $date->format('Ymd').$fuseau.$date->format('His');
        }
    }

    // Enregistre en base de données
    $date = new DateTime();
    $date->setTimezone(new DateTimeZone('UTC'));
    $strdate_added = $date->format('Y-m-d H:i:s');

    $EasyPDO = new EasyPDO($_SESSION['DB']);
    $EasyPDO->addFields('file_original_name', $name);
    $EasyPDO->addFields('file_orientation', ($file_type == 0) ? 0 : 1);
    $EasyPDO->addFields('file_hash', $hash);
    $EasyPDO->addFields('file_size', $size);
    $EasyPDO->addFields('file_type', $file_type);
    $EasyPDO->addFields('time_taken_at', $strdate_taken);
    $EasyPDO->addFields('time_added_at', $strdate_added);
    $EasyPDO->insert('photos');

	$fReturn->addRawText("Ok")->fetch();
} else {
    $fReturn->addRawText("Upload fail")->fetch();
}
?>