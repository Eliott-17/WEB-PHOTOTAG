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

	$array_lib=[];
	$array_untaged=[];

	//$EasyPDO->addFields('file_status');
	$EasyPDO->addFields('file_hash');
	$EasyPDO->addFields('time_taken_at_date');
	$EasyPDO->addFields('time_taken_at_zone');
	$EasyPDO->addFields('time_taken_at_time');
	$EasyPDO->addFields('file_orientation');
	//$EasyPDO->addFields('tag_country');
	//$EasyPDO->addFields('tag_city');
	//$EasyPDO->addFields('tag_place');
	//$EasyPDO->addFields('tag_activity');
	$EasyPDO->addFields('file_type');
	$EasyPDO->addFields('id');
	
	$array_lib=$EasyPDO->select(
	'photos',
	'file_status = 0
		AND (
			time_taken_at_date != "00000000"
			AND time_taken_at_time != "000000"
			AND time_taken_at_zone != "00000"
			AND tag_country IS NOT null
			AND tag_country != "UNK"
			AND (
				tag_city IS NOT null
				OR tag_place IS NOT null
				OR tag_activity IS NOT null
			)
		)
		ORDER BY time_taken_at_date DESC,
				 time_taken_at_zone DESC,
				 time_taken_at_time DESC,
				 id ASC
	');
	
	$EasyPDO->addFields('file_status');
	$EasyPDO->addFields('file_hash');
	$EasyPDO->addFields('time_taken_at_date');
	$EasyPDO->addFields('time_taken_at_zone');
	$EasyPDO->addFields('time_taken_at_time');
	$EasyPDO->addFields('file_orientation');
	/*$EasyPDO->addFields('tag_country');
	$EasyPDO->addFields('tag_city');
	$EasyPDO->addFields('tag_place');
	$EasyPDO->addFields('tag_activity');*/
	$EasyPDO->addFields('file_type');
	$EasyPDO->addFields('id');
	

	$array_untaged=$EasyPDO->select(
	'photos',
	'file_status = 0
		AND (
			time_taken_at_date = "00000000"
			OR time_taken_at_time = "000000"
			OR time_taken_at_zone = "00000"
			OR tag_country IS null
			OR tag_country = "UNK"
			OR (tag_city IS null AND tag_place IS null AND tag_activity IS null)
		)
		ORDER BY time_taken_at_date DESC,
				 time_taken_at_zone DESC,
				 time_taken_at_time DESC,
				 id ASC
	');
			
	$bigarray['library']=$array_lib['datas'];
	$bigarray['untagged']=$array_untaged['datas'];
	$bigarray['dir']=$_SESSION["USER"];

	$fReturn->addConsole("[PHP EXECUTED] file-load-list.php");
	$fReturn->addCallBack("GRID_load_Callback", $bigarray)->fetch();

?>