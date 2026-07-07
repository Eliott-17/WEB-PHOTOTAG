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

	$validation->Validate();

	if(!$validation->isValidated())
	{
		$fReturn->addInfoMessage($validation->Message())->fetch();	
	}
	
	$array=$EasyPDO->supress('photos', 'file_status = 2');
	
	if($array['status']===true) 
	{
		$files = glob($full_dir.'trash/*');

		foreach ($files as $file) {
			if (is_file($file)) {
				unlink($file);
			}
		}
		
		$fReturn->addCallBack("FILTERS_flush_CallBack");
	}
	else
	{
		$fReturn->addConsole("[PHP] SQL error while supress bdd");
		if(ENV=="DEV") $fReturn->addConsole(print_r($array,true));	
	}
	
	$fReturn->fetch();
?>	