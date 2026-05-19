<?php

	require_once($_SERVER['DOCUMENT_ROOT'].'/core/securityheader.php');
	require_once($_SERVER['DOCUMENT_ROOT'].'/core/class.easypdo.php');
	require_once($_SERVER['DOCUMENT_ROOT'].'/core/class.freturn.php');
	require_once($_SERVER['DOCUMENT_ROOT'].'/core/class.validation.php');
	require_once($_SERVER['DOCUMENT_ROOT'].'/includes/functions.php');

	$EasyPDO = new EasyPDO($_SESSION['DB']);

	$fReturn = new fReturn();
	$validation = new Validation();

	$validation->addVerification('token',		'sha256',	'Token');	
	$validation->addVerification('file_hash',	'sha256',	'Hash');
	
	switch($_GET['form'])
	{
		case "time":

			$validation->addVerification('datetime',	'string',				'Date',					16,16);	
			$validation->addVerification('timezone',	'string',				'Timezone',				5,5);	

			$datetimeInput = $_POST['datetime'] ?? '';
			$timezoneInput = $_POST['timezone'] ?? '+0000';

			// Crée un objet DateTime à partir du datetime-local
			$date = DateTime::createFromFormat('Y-m-d\TH:i:s', $datetimeInput);
			if (!$date) {
				$date = DateTime::createFromFormat('Y-m-d\TH:i', $datetimeInput); // Au cas où les secondes sont absentes
			}

			// Applique le fuseau horaire personnalisé
			$timezone = new DateTimeZone($timezoneInput);
			$date->setTimezone($timezone);

			// Formate la date : YYYYMMDD + ZZZZZ (sans ":") + HHMMSS
			$offset = str_replace(':', '', $date->format('P')); // Ex: "+0700"
			$strdate = $date->format('Ymd') . $offset . $date->format('His');

			$EasyPDO->addFields('time_taken_at',$strdate);

		break;
		case "tag-location":
		
			$validation->addVerification('continent',	'string',				'Continent',			2,2);	
			$validation->addVerification('country',		'string',				'Country',				3,3);	
			$validation->addVerification('city',		'string',				'City',					0,200);	
			$validation->addVerification('place',		'string',				'Place',				0,200);	

			$EasyPDO->addFields('tag_continent',$_POST['continent']);
			$EasyPDO->addFields('tag_country',$_POST['country']);
			$EasyPDO->addFields('tag_city',$_POST['city']);
			$EasyPDO->addFields('tag_place',$_POST['place']);

		break;
		case "tag-general":

			$validation->addVerification('activity',	'string',				'Activity',				0,200);	
			$validation->addVerification('comment',		'string',				'Comment',				0,200);	
			$validation->addVerification('people',		'string',				'People',				0,200);	
			$validation->addVerification('information',	'string',				'Information',			0,200);	
			
			$EasyPDO->addFields('tag_activity',$_POST['activity']);
			$EasyPDO->addFields('tag_comment',$_POST['comment']);
			$EasyPDO->addFields('tag_people',$_POST['people']);
			$EasyPDO->addFields('tag_other',$_POST['information']);
		
		break;
		default:
		
			$fReturn->addFailMessage("Bad form")->fetch();
			
		break;
	}

	$validation->Validate();	

	if(!$validation->isValidated())
	{
		$fReturn->addFailMessage($validation->Message())->fetch();	
	}
	
	$date = new DateTime();
    $date->setTimezone(new DateTimeZone('UTC'));
    $strdate_updated = $date->format('Y-m-d H:i:s');		

	$EasyPDO->addFields('time_status',$strdate_updated); //last updated info	
	$EasyPDO->addFields('tag_status',1); //now file is tagged
	
	$EasyPDO->addConditionalData('file_hash',$_POST['file_hash']);
	$EasyPDO->update('photos', 'file_hash=:file_hash');
		
	$fReturn->addSuccessMessage("Database updated")->addCallBack("g_file_load_infos", $_GET['form'])->fetch();
?>	