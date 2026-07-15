<?php

	require_once($_SERVER['DOCUMENT_ROOT'].'/core/securityheader.php');
	require_once($_SERVER['DOCUMENT_ROOT'].'/core/class.easypdo.php');
	require_once($_SERVER['DOCUMENT_ROOT'].'/includes/functions.php');
	require_once($_SERVER['DOCUMENT_ROOT'].'/includes/datas.php');
	require_once($_SERVER['DOCUMENT_ROOT'].'/core/class.freturn.php');
	require_once($_SERVER['DOCUMENT_ROOT'].'/core/class.validation.php');

	$fReturn = new fReturn();
	$validation = new Validation();

	$validation->addVerification('token',	'sha256',			'Token');	
	$validation->addVerification('files',	'jsonArrayString',	'Files');
	$validation->Validate();

	$status=false;
	
	$datas="[PHP] Internal error {TEST} file-exist.php";

	if(!$validation->isValidated())
	{
		$datas="[PHP] Internal error {".$validation->Message()."} file-exist.php";		
	}
	else
	{
		$ids = json_decode($_POST['files'], true); // true pour obtenir un tableau associatif

		if(json_last_error() === JSON_ERROR_NONE)
		{
			$total_size=0;
			
			$EasyPDO = new EasyPDO($_SESSION['DB']);
			$EasyPDO->addFields('file_original_name');
			$EasyPDO->setPdoOption(PDO::FETCH_COLUMN);			
			
			$result = $EasyPDO->select('photos', 'file_original_name IN', $ids);
			
			exit(json_encode($result));
		}
		else
		{
			 $datas="[PHP] Internal error {decode} file-exist.php";
		}
	}
	
	exit(json_encode(["status" => $status,"datas" => $datas],true));
?>