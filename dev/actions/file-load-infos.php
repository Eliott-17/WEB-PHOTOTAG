<?php

	require_once($_SERVER['DOCUMENT_ROOT'].'/core/securityheader.php');
	require_once($_SERVER['DOCUMENT_ROOT'].'/core/class.easypdo.php');
	require_once($_SERVER['DOCUMENT_ROOT'].'/core/class.freturn.php');
	require_once($_SERVER['DOCUMENT_ROOT'].'/core/class.validation.php');
	require_once($_SERVER['DOCUMENT_ROOT'].'/includes/functions.php');
	require_once($_SERVER['DOCUMENT_ROOT'].'/includes/getid3/getid3.php');

	$fReturn = new fReturn();
	$getID3 = new getID3;

	$EasyPDO = new EasyPDO($_SESSION['DB']);

	$bigarray['info']=[];
	$bigarray['lform']="";

	$validation = new Validation();

	$validation->addVerification('hash','sha256','Hash');
	$validation->addVerification('lform','string','lform',0,20);	
	$validation->Validate(true);

	if(!$validation->isValidated())
	{
		$fReturn->addCallback("NAV_CallBack_error","Data request error");
		if(ENV=="DEV") $fReturn->addConsole($validation->Message());	
		$fReturn->fetch();
	}

	$EasyPDO->addFields('*');
	$EasyPDO->addConditionalData('hash',$_GET['hash']);
	$array_file=$EasyPDO->select('photos', 'file_hash=:hash');
			
	if($array_file['status']===true)
	{			
		// Parcourir chaque ligne du résultat
		foreach ($array_file['datas'] as &$file) {
			// Ajouter la clé 'exif' à chaque ligne
			
			$file['exif']=[];
			
			if ($file['file_type']==0)
			{		
				$file['exif_photo'] = getExifData(DIR_HD.$file['file_original_name']);
			}
			if ($file['file_type']==1)
			{		
				$file['exif_video'] = cleanExif($getID3->analyze(DIR_HD.$file['file_original_name']));
			}
		}
		unset($file); // Important : rompre la référence après la boucle

		$bigarray['info']=$array_file['datas'];
		$bigarray['lform']=$_GET['lform'];
	}
	else
	{
		$fReturn->addCallback("NAV_CallBack_error","Fatal error while selecting from database");
		if(ENV=="DEV") $fReturn->addFailMessage('Internal error')->addConsole(print_r($array_file,true));
		$fReturn->fetch();
	}
	
	if(ENV=="DEV") $fReturn->addConsole("[PHP EXECUTED] file-load-infos.php");
	$fReturn->addCallBack("FILEINFO_CallBack_display", $bigarray)->fetch();	
?>