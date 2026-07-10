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

	$validation->addVerification('token',		'sha256',				'Token'			);	
	$validation->addVerification('files_hash',	'jsonArrayString',		'Files id'		);	

	$validation->Validate();

	if(!$validation->isValidated())
	{
		$fReturn->addInfoMessage($validation->Message())->fetch();	
	}
	
	$ids = json_decode($_POST['files_hash'], true); // true pour obtenir un tableau associatif
	
	//récupération du nom original + hash
	
	$EasyPDO->addFields('file_original_name');
	$EasyPDO->addFields('file_hash');
	$array_files=$EasyPDO->select('photos', 'id IN', $ids);
	
	foreach($array_files['datas'] as $key => $value)
	{	
		$date = new DateTime();
		$date->setTimezone(new DateTimeZone('UTC'));
		$strdate_updated = $date->format('Y-m-d H:i:s');		
		$strdate_file = $date->format('YmdHis');	
		
		$filenametestHD = DIR_HD.$value['file_original_name'];
		$filenametestSD = DIR_SD.$value['file_hash'].".webp";

		$filenametestHDtrash = DIR_TRASH.$strdate_file.'_'.$value['file_original_name'];
		$filenametestSDtrash = DIR_TRASH.$strdate_file.'_'.$value['file_hash'].".webp";
		
		if (file_exists($filenametestHD)) 
		{
			if(!rename($filenametestHD, $filenametestHDtrash)) 
			{
				$fReturn->addCallback("NAV_CallBack_error","Fatal error while moving HD file");
				if(ENV=="DEV") $fReturn->addFailMessage('Internal error')->addConsole($filenametestHDtrash);
				$fReturn->fetch();
			}
		}
		if (file_exists($filenametestSD)) 
		{
			if(!rename($filenametestSD, $filenametestSDtrash)) 
			{
				$fReturn->addCallback("NAV_CallBack_error","Fatal error while moving SD file");
				if(ENV=="DEV") $fReturn->addFailMessage('Internal error')->addConsole($filenametestSDtrash);
				$fReturn->fetch();
			}
		}	
				
		$EasyPDO->addFields('file_original_name',$strdate_file.'_'.$value['file_original_name']); //last updated info	
		$EasyPDO->addFields('time_modified_at',$strdate_updated); //last updated info	
		$EasyPDO->addFields('file_status',2);		

		$EasyPDO->addConditionalData('file_hash',$value['file_hash']);		
		$return=$EasyPDO->update('photos', 'file_hash=:file_hash');

		if($return['status']!==true)
		{			
			$fReturn->addCallback("NAV_CallBack_error","Fatal error while updating to database");
			if(ENV=="DEV") $fReturn->addFailMessage('Internal error')->addConsole(print_r($return,true));
			$fReturn->fetch();
		}		
	}
	
	if(ENV=="DEV") $fReturn->addConsole("[PHP EXECUTED] file-delete.php");	
	$fReturn->addCallback('FILEMULTISELECTION_CallBack_trash');
	$fReturn->fetch();
	
?>	