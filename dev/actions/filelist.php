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

	$array_file=[];
	$array_lib=[];
	$array_untaged=[];

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
		
		$fReturn->addCallBack("g_loadinfoview_data", $bigarray)->fetch();
	}	
	else
	{
		$EasyPDO->addFields('file_status');
		$EasyPDO->addFields('file_hash');
		$EasyPDO->addFields('time_taken_at');
		$EasyPDO->addFields('file_orientation');
		$EasyPDO->addFields('file_type');
		$EasyPDO->addFields('id');
		
		$array_lib=$EasyPDO->select('photos', 'file_status = 0 AND tag_status = 1 AND time_taken_at != "00000000+0000000000" ORDER BY time_taken_at DESC');

		$EasyPDO->addFields('file_status');
		$EasyPDO->addFields('file_hash');
		$EasyPDO->addFields('time_taken_at');
		$EasyPDO->addFields('file_orientation');
		$EasyPDO->addFields('file_type');
		$EasyPDO->addFields('id');

		$array_untaged=$EasyPDO->select('photos', 'file_status = 0 AND (tag_status = 0 OR time_taken_at = "00000000+0000000000") ORDER BY time_taken_at DESC, id ASC');
		
		$bigarray['library']=$array_lib['datas'];
		$bigarray['untagged']=$array_untaged['datas'];
		$bigarray['dir']=$_SESSION["USER"];

		$fReturn->addCallBack("load_grid", $bigarray)->fetch();
	}

?>