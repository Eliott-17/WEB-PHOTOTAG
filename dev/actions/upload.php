<?php

define("SESSION_END_URL","noredirect");

require_once($_SERVER['DOCUMENT_ROOT'].'/core/securityheader.php');
require_once($_SERVER['DOCUMENT_ROOT'].'/core/class.easypdo.php');
require_once($_SERVER['DOCUMENT_ROOT'].'/includes/functions.php');

$uploadDir = $_SERVER['DOCUMENT_ROOT'].'/multimedia/'.$_SESSION["USER"].'/';

if(!empty($_FILES['file'])){
	
    $name = basename($_FILES['file']['name']);
    $tmp  = $_FILES['file']['tmp_name'];
	$size = $_FILES['file']['size'];

    $ext = strtolower(pathinfo($name, PATHINFO_EXTENSION));

    $allowed = ['jpg','jpeg','png','gif','bmp','webp','tif','tiff'];

    if(!in_array($ext,$allowed)){
        exit("Invalid file $name");
    }

    $targetHD = $uploadDir.$name;
	
	if(is_file($targetHD)) exit("$name exist");

	if(isset($_FILES['file'])){
		if(is_uploaded_file($_FILES['file']['tmp_name'])){
		} else {
			exit("Upload fail");
		}
	}

	//on cherche la date dans le fichier d'origine
	
	$exif = @exif_read_data($_FILES['file']['tmp_name']);

	if(isset($exif['DateTimeOriginal'])){
		$date = DateTime::createFromFormat('Y:m:d H:i:s', $exif['DateTimeOriginal']);
		$fuseau="+0000";
		
		// Parcourir les données EXIF pour trouver un fuseau horaire valide
		foreach ($exif as $value) {
			if (is_string($value)) { // Vérifier que la valeur est une chaîne
				$foundFuseau = extractTimezoneFromString($value);
				if ($foundFuseau !== null) {
					$fuseau = $foundFuseau;
					break; // Sortir de la boucle dès qu'un fuseau est trouvé
				}
			}
		}
		
		$strdate_taken = $date->format('Ymd').$fuseau.$date->format('His');
		
	}
	else
	{
		$strdate_taken = "00000000+0000000000";
		//			YYYYMMDDZZZZZHHMMSS
	}

    if(move_uploaded_file($tmp,$targetHD)){
		
        /* charger image */
        switch($ext){

            case 'jpg':
            case 'jpeg':
                $img = imagecreatefromjpeg($targetHD);
            break;

            case 'png':
                $img = imagecreatefrompng($targetHD);
            break;

            case 'gif':
                $img = imagecreatefromgif($targetHD);
            break;

            case 'bmp':
                $img = imagecreatefrombmp($targetHD);
            break;

            case 'webp':
                $img = imagecreatefromwebp($targetHD);
            break;

            default:
                echo "Uploaded but preview skipped: ".$name;
                exit;
        }

        /* dimensions */
        $width  = imagesx($img);
        $height = imagesy($img);

        $newWidth  = intval($width/4);
        $newHeight = intval($height/4);
		
		if($newWidth<=0) $newWidth=1;
		if($newHeight<=0) $newHeight=1;
		
		$ratio = $width / $height;
        if($ratio > 1.3){ // paysage
            $orientation = 0;
        } else { // portrait
            $orientation = 1;
        }
		
        /* resize */
        $preview = imagecreatetruecolor($newWidth,$newHeight);

        imagecopyresampled(
            $preview,
            $img,
            0,0,
            0,0,
            $newWidth,$newHeight,
            $width,$height
        );

        /* nom preview */
		
		$hash_name = hash('sha256', $name . bin2hex(random_bytes(10)));

        $previewName = $hash_name;
        $targetSD = $uploadDir.$previewName;

        /* export webp */
        imagewebp($preview,$targetSD,10);

        imagedestroy($img);
        imagedestroy($preview);
		
		//addbdd

		$date = new DateTime();
        $date->setTimezone(new DateTimeZone('UTC'));
        $strdate_added = $date->format('Y-m-d H:i:s');		
		
		$EasyPDO = new EasyPDO($_SESSION['DB']);		
		$EasyPDO->addFields('file_original_name',$name);
		$EasyPDO->addFields('file_orientation',$orientation);
		$EasyPDO->addFields('file_hash', $previewName);
		$EasyPDO->addFields('file_size', $size);		
		$EasyPDO->addFields('time_taken_at',$strdate_taken);		
		$EasyPDO->addFields('time_added_at',$strdate_added);	
		$EasyPDO->insert('photos');

        exit("OK");

    } else {
        exit("Upload fail");
    }

}
?>