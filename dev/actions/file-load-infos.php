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

	if(isset($_GET['hash']))
	{
		$validation = new Validation();

		$validation->addVerification('hash','sha256','Hash');
		$validation->addVerification('lform','string','lform',0,20);	
		$validation->Validate(true);

		if(!$validation->isValidated())
		{
			$fReturn->addConsole($validation->Message())->fetch();	
		}

		$EasyPDO->addFields('*');
		$EasyPDO->addConditionalData('hash',$_GET['hash']);
		$array_file=$EasyPDO->select('photos', 'file_hash=:hash');
		
		// Parcourir chaque ligne du résultat
		foreach ($array_file['datas'] as &$file) {
			// Ajouter la clé 'exif' à chaque ligne
			
			$file['exif']=[];
			
			if ($file['file_type']==0)
			{		
				$file['exif'] = getExifData($full_dir . $file['file_original_name']);
			}
			if ($file['file_type']==1)
			{		
				$file['exif'] = $getID3->analyze($full_dir . $file['file_original_name']);
			}
		}
		unset($file); // Important : rompre la référence après la boucle

		$bigarray['info']=$array_file['datas'];
		$bigarray['lform']=$_GET['lform'];
		$bigarray['hash']=$_GET['hash'];
	}
	else
	{
		$bigarray['info']=[];
		$bigarray['lform']="";
		$bigarray['hash']="";
	}	
	
	$fReturn->addCallBack("g_file_load_info_CallBack", $bigarray)->fetch();	
?>