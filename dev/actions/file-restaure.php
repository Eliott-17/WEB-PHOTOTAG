<?php

	require_once($_SERVER['DOCUMENT_ROOT'].'/core/securityheader.php');
	require_once($_SERVER['DOCUMENT_ROOT'].'/core/class.easypdo.php');
	require_once($_SERVER['DOCUMENT_ROOT'].'/core/class.freturn.php');
	require_once($_SERVER['DOCUMENT_ROOT'].'/core/class.validation.php');
	require_once($_SERVER['DOCUMENT_ROOT'].'/includes/functions.php');

	$EasyPDO = new EasyPDO($_SESSION['DB']);

	$fReturn = new fReturn();
	$validation = new Validation();

	//VALIDATION FORMULAIRE

	$validation->addVerification('hash',	'sha256',		'Files id'		);	

	$validation->Validate();

	if(!$validation->isValidated())
	{
		$fReturn->addConsole($validation->Message())->fetch();	
	}
	
	//récupération du nom original + hash
	
	$EasyPDO->addFields('file_original_name');
	$EasyPDO->addFields('file_hash');
	$EasyPDO->addConditionalData('file_hash',$_GET['hash']);
	$return=$EasyPDO->select('photos', 'file_hash=:file_hash');
	
	if($return['status']===true)
	{
		$value=$return['datas'][0];
		
		$filenametestHD = $full_dir.$value['file_original_name'];
		$filenametestSD = $full_dir.$value['file_hash'].".webp";

		$filenametestHDtrash = $full_dir.'trash/'.$value['file_original_name'];
		$filenametestSDtrash = $full_dir.'trash/'.$value['file_hash'].".webp";
		
		if (file_exists($filenametestHDtrash)) 
		{
			if(!rename($filenametestHDtrash, $filenametestHD)) $fReturn->addFailMessage('Internal error')->addConsole($filenametestHDtrash)->fetch();
		}
		if (file_exists($filenametestSDtrash)) 
		{
			if(!rename($filenametestSDtrash, $filenametestSD)) $fReturn->addFailMessage('Internal error')->addConsole($filenametestSDtrash)->fetch();	
		}	
	
		$date = new DateTime();
		$date->setTimezone(new DateTimeZone('UTC'));
		$strdate_updated = $date->format('Y-m-d H:i:s');		

		$EasyPDO->addFields('time_modified_at',$strdate_updated); //last updated info		
		$EasyPDO->addFields('file_status',0);	
		
		$EasyPDO->addConditionalData('file_hash',$_GET['hash']);
		$return=$EasyPDO->update('photos', 'file_hash=:file_hash');

		if($return['status']!==true)
		{			
			$fReturn->addConsole("[PHP] SQL error while restaure bdd (2)");
			if(ENV=="DEV") $fReturn->addConsole(print_r($return,true));	
		}
	}
	else
	{
		$fReturn->addConsole("[PHP] SQL error while restaure bdd (1)");
		if(ENV=="DEV") $fReturn->addConsole(print_r($return,true));	
	}
	
	$fReturn->fetch();
	
?>	