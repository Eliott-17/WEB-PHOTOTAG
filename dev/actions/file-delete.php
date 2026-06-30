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
		$filenametestHD = $full_dir.$value['file_original_name'];
		$filenametestSD = $full_dir.$value['file_hash'].".webp";

		$filenametestHDtrash = $full_dir.'trash/'.$value['file_original_name'];
		$filenametestSDtrash = $full_dir.'trash/'.$value['file_hash'].".webp";
		
		if (file_exists($filenametestHD)) 
		{
			//$fReturn->addFailMessage('Internal error')->addConsole($filenametestHD)->fetch();
			if(!rename($filenametestHD, $filenametestHDtrash)) $fReturn->addFailMessage('Internal error')->addConsole($filenametestHDtrash)->fetch();
		}
		if (file_exists($filenametestSD)) 
		{
			if(!rename($filenametestSD, $filenametestSDtrash)) $fReturn->addFailMessage('Internal error')->addConsole($filenametestSDtrash)->fetch();	
			//$fReturn->addFailMessage('Internal error')->addConsole($filenametestSD)->fetch();
		}	
	}
	
	$EasyPDO->addFields('file_status',2);		
	$EasyPDO->update('photos', 'id IN', $ids);	
		
	$fReturn->addCallback('FILEMULTISELECTION_CallBack_trash');
	$fReturn->fetch();
	
?>	