<?php

define("POST_LIMIT_RATE", 1000); //30 tentatives toutes les deux secondes

	require_once($_SERVER['DOCUMENT_ROOT'].'/core/securityheader.php');
	require_once($_SERVER['DOCUMENT_ROOT'].'/core/class.easypdo.php');
	require_once($_SERVER['DOCUMENT_ROOT'].'/core/class.freturn.php');
	require_once($_SERVER['DOCUMENT_ROOT'].'/core/class.validation.php');
	require_once($_SERVER['DOCUMENT_ROOT'].'/includes/functions.php');

	$EasyPDO = new EasyPDO($_SESSION['DB']);

	$fReturn = new fReturn();
	$validation = new Validation();

	//VALIDATION FORMULAIRE

	$validation->addVerification('token',		'sha256',				'Token'							);	
	$validation->addVerification('filename',	'string',				'filename',		5,80	        );	
	$validation->addVerification('date',		'string',				'Date',			8,8);	
	$validation->addVerification('time',		'string',				'Time',			6,6);	
		
	$validation->Validate();

	if(!$validation->isValidated())
	{
		$fReturn->addRawText($validation->Message())->fetch();
	}
	
	$EasyPDO->addFields('time_taken_at_date',$_POST['date']);
	$EasyPDO->addFields('time_taken_at_time',$_POST['time']);
	$EasyPDO->addFields('time_taken_is_utc',1);	
	
	$date = new DateTime();
    $date->setTimezone(new DateTimeZone('UTC'));
    $strdate_updated = $date->format('Y-m-d H:i:s');		

	$EasyPDO->addFields('time_modified_at',$strdate_updated); //last updated info	
	$EasyPDO->addConditionalData('file_original_name',$_POST['filename']);
	
	$affectedrow = $EasyPDO->update('photos', 'file_original_name=:file_original_name');

	if($affectedrow['status']===true)
	{	
		if($affectedrow['count']==1)
		{
			$fReturn->addRawText("OK")->fetch();
		}
		else
		{	
			$fReturn->addRawText("File not found in database")->fetch();
		}
	}
	else
	{	
		if(ENV=="DEV") 	$fReturn->addRawText("<pre>".print_r($affectedrow,true)."</pre>")->fetch();
		else 			$fReturn->addRawText("Updating database fail")->fetch();
	}
?>	