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

	$validation->addVerification('token',		'sha256',				'Token'				);	
	$validation->addVerification('filesid',		'jsonArrayString',		'Files id'			);	
	$validation->addVerification('lock_status',	'int_interval',			'status',	0,1		);	

	$validation->Validate();

	if(!$validation->isValidated())
	{
		$fReturn->addCallback("NAV_CallBack_error","Data request error".print_r($_POST,true));
		if(ENV=="DEV" && PHPDEBUG>=PHPDEBUGLVL_WARN) $fReturn->addConsole($validation->Message());	
		$fReturn->fetch();
	}
	
	$lock_status=1;
	
	if($_POST['lock_status']==1) $lock_status=0;
	
	$EasyPDO->addFields('file_is_private',$lock_status);	
	
	$dataarray = json_decode($_POST['filesid'], true);

	$return = $EasyPDO->update('photos', 'id IN', $dataarray);
	
	$ret['lock']=$lock_status;
	$ret['id']=$dataarray;

	if($return['status']!==true)
	{
		$fReturn->addCallback("NAV_CallBack_error","Fatal error while updating to database");
		if(ENV=="DEV" && PHPDEBUG>=PHPDEBUGLVL_ERR) $fReturn->addConsole(print_r($return,true));
		$fReturn->fetch();
	}

	if(ENV=="DEV" && PHPDEBUG>=PHPDEBUGLVL_INFO) $fReturn->addCallback("FILEINFO_CallBack_lock",$ret);	
	$fReturn->fetch();
?>	