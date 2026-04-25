<?php

	require_once($_SERVER['DOCUMENT_ROOT'].'/core/securityheader.php');
	require_once($_SERVER['DOCUMENT_ROOT'].'/core/class.easypdo.php');
	require_once($_SERVER['DOCUMENT_ROOT'].'/core/class.freturn.php');
	require_once($_SERVER['DOCUMENT_ROOT'].'/includes/functions.php');

	$fReturn = new fReturn();

	$EasyPDO = new EasyPDO($_SESSION['DB']);

	$array_file=[];
	$array_lib=[];
	$array_untaged=[];

	if(isset($_GET['hash']))
	{
		$EasyPDO->addFields('*');
		$EasyPDO->addConditionalData('hash',$_GET['hash']);
		$array_file=$EasyPDO->select('photos', 'file_hash=:hash');
		
		// Parcourir chaque ligne du résultat
		foreach ($array_file as &$file) {
			// Ajouter la clé 'exif' à chaque ligne
			$file['exif'] = getExifData($full_dir . $file['file_original_name']);
			/*$file['time_friendly'] = formatDateTime($file['time_taken_at']);*/
		}
		unset($file); // Important : rompre la référence après la boucle

		$bigarray['info']=$array_file;
		$bigarray['lform']=$_GET['lform'];
		$bigarray['hash']=$_GET['hash'];
		
		$fReturn->addCallBack("g_loadinfoview_data", $bigarray)->fetch();
	}	
	else
	{
		$EasyPDO->addFields('file_hash');
		$EasyPDO->addFields('time_taken_at');
		$EasyPDO->addFields('file_orientation');
		$EasyPDO->addFields('id');

		$array_lib=$EasyPDO->select('photos', 'tag_status = 1 AND time_taken_at != "00000000+0000000000" ORDER BY time_taken_at DESC');

		$EasyPDO->addFields('file_hash');
		$EasyPDO->addFields('time_taken_at');
		$EasyPDO->addFields('file_orientation');
		$EasyPDO->addFields('id');

		$array_untaged=$EasyPDO->select('photos', 'tag_status = 0 OR time_taken_at = "00000000+0000000000" ORDER BY time_taken_at DESC, id ASC');
		
		$bigarray['library']=$array_lib;
		$bigarray['untagged']=$array_untaged;
		$bigarray['dir']=$_SESSION["USER"];

		$fReturn->addCallBack("load_grid", $bigarray)->fetch();
	}

?>