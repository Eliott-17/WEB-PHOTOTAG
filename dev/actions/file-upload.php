<?php

define("POST_LIMIT_RATE", 100); //3 tentatives toutes les deux secondes

require_once($_SERVER['DOCUMENT_ROOT'].'/core/securityheader.php');
require_once($_SERVER['DOCUMENT_ROOT'].'/core/class.easypdo.php');
require_once($_SERVER['DOCUMENT_ROOT'].'/core/class.freturn.php');
require_once($_SERVER['DOCUMENT_ROOT'].'/includes/functions.php');
require_once($_SERVER['DOCUMENT_ROOT'].'/includes/getid3/getid3.php');

$fReturn = new fReturn();

if (!empty($_FILES['file']) && !empty($_FILES['preview'])) {
    $name = basename($_FILES['file']['name']);
    $tmp = $_FILES['file']['tmp_name'];
	$size_webp = $_FILES['preview']['size'];
    $size = $_FILES['file']['size'];

    // Vérifie la taille
    if ($size > 1024 * 1024 * 1024) {
		$fReturn->addRawText("file is over 1 Go")->fetch();
        //exit("file is over 55 Mo)");
    }

    $ext = strtolower(pathinfo($name, PATHINFO_EXTENSION));
    $allowedImages = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'tif', 'tiff','heic','heif'];
    $allowedVideos = ['mp4', 'webm', 'mov', 'mkv', 'avi', '3gp'];

    if (in_array($ext, $allowedImages)) {
        $file_type = 0; // Image
    } elseif (in_array($ext, $allowedVideos)) {
        $file_type = 1; // Vidéo
    } else {
		$fReturn->addRawText("Invalid file")->fetch();
        //exit("Invalid file");
    }

    $targetHD = DIR_HD.$name;
    if (is_file($targetHD)) {
		$fReturn->addRawText("Already exist")->fetch();
		//exit("already exist");
	}

    if (!move_uploaded_file($tmp, $targetHD)) {
		$fReturn->addRawText("Upload fail")->fetch();
        //exit("Upload fail");
    }

    $hash = hash('sha256', $name . time() .bin2hex(random_bytes(10)));
    $previewName = $hash.'.webp';
    $targetSD = DIR_SD.$previewName;
    if (!move_uploaded_file($_FILES['preview']['tmp_name'], $targetSD)) {
        $fReturn->addRawText("Preview upload fail")->fetch();
		//exit("Preview upload fail");
    }

    // Récupère la date de prise de vue
	//				  YYYYMMDD+ZZZZHHMMSS
	$strdate_taken_at_date = "00000000";
	$strdate_taken_at_zone = "00000";
	$strdate_taken_at_time = "000000";
	
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
			$strdate_taken_at_date = $date->format('Ymd');
			$strdate_taken_at_zone = $fuseau;
			$strdate_taken_at_time = $date->format('His');
		}
		else
		{
			$regex = '/((?:19\d{2}|20\d{2}|2100)(?:0[0-9]|1[0-2])(?:0[0-9]|[12][0-9]|3[01]))(?:.*?((?:[01][0-9]|2[0-4])[0-5][0-9][0-5][0-9]))?/';
			
			if (preg_match($regex, $name, $matches)) 
			{
				if (isset($matches[1])) $strdate_taken_at_date = $matches[1];
				if (isset($matches[2])) $strdate_taken_at_time = $matches[2];
				$strdate_taken_at_zone="+0000";
			}
		}
    }
	
	if ($file_type == 1) {
		
		$getID3 = new getID3;
	
		$info = getVideoDate($getID3->analyze($targetHD),$name);

		if (is_array($info)) 
		{
			//decoded strucutre info
			
			/*$decoded = [
				"datetime" => "00000000000000",
				"timezone_mode" => 3,
				"offset" => "+0000",
				"lat" => 0,
				"lon" => 0
			];*/
			
			//Generate stae format: YYYYMMDD+ZZZZHHMMSS

			$datetime = $info['datetime'];
			$offset = $info['offset'];

			// YYYYMMDD + OFFSET + HHMMSS
			$strdate_taken_at_date = substr($datetime, 0, 8);
			$strdate_taken_at_zone = $offset;
			$strdate_taken_at_time = substr($datetime, 8, 6);
		}
	}
	
	$orientation = (!empty($_POST['orientation']) && $_POST['orientation'] == "1") ? 1 : 0;

    // Enregistre en base de données
    $date = new DateTime();
    $date->setTimezone(new DateTimeZone('UTC'));
    $strdate_added = $date->format('Y-m-d H:i:s');

    $EasyPDO = new EasyPDO($_SESSION['DB']);
    $EasyPDO->addFields('file_original_name', $name);
    $EasyPDO->addFields('file_orientation', $orientation);
    $EasyPDO->addFields('file_hash', $hash);
    $EasyPDO->addFields('file_size', $size);
    $EasyPDO->addFields('file_size_webp', $size_webp);
    $EasyPDO->addFields('file_type', $file_type);
    $EasyPDO->addFields('time_taken_at_date', $strdate_taken_at_date);
    $EasyPDO->addFields('time_taken_at_zone', $strdate_taken_at_zone);
	$EasyPDO->addFields('time_taken_at_time', $strdate_taken_at_time);
    $EasyPDO->addFields('time_added_at', $strdate_added);	
    $return=$EasyPDO->insert('photos');

	if($return['status']===true) 
	{
		$fReturn->addRawText("OK")->fetch();
	}
	else
	{
		if(is_file($targetHD)) unlink($targetHD);
		if(is_file($targetSD)) unlink($targetSD);	
		
		$fReturn->addConsole("[PHP] SQL error while recording file");
		if(ENV=="DEV") $fReturn->addConsole(print_r($return,true));	
		
		$fReturn->addRawText("Already in database")->fetch();
	}
} 

$fReturn->addRawText("Upload form fail")->fetch();

?>