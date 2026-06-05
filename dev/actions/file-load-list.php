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

	$EasyPDO->addFields('file_status');
	$EasyPDO->addFields('file_hash');
	$EasyPDO->addFields('time_taken_at_date');
	$EasyPDO->addFields('time_taken_at_zone');
	$EasyPDO->addFields('time_taken_at_time');
	$EasyPDO->addFields('file_orientation');
	$EasyPDO->addFields('file_type');
	$EasyPDO->addFields('id');
	
	//$array_lib=$EasyPDO->select('photos', 'file_status = 0 AND tag_status = 1 AND time_taken_at != "00000000+0000000000" ORDER BY time_taken_at DESC');
	//
	
	$array_lib=$EasyPDO->select(
	'photos',
    'file_status = 0
     AND tag_status = 1
     AND (
        time_taken_at_date != "00000000"
        OR time_taken_at_zone != "+0000"
        OR time_taken_at_time != "000000"
     )
     ORDER BY time_taken_at_date DESC,
              time_taken_at_time DESC,
              time_taken_at_zone DESC'
	);
	
	$EasyPDO->addFields('file_status');
	$EasyPDO->addFields('file_hash');
	$EasyPDO->addFields('time_taken_at_date');
	$EasyPDO->addFields('time_taken_at_zone');
	$EasyPDO->addFields('time_taken_at_time');
	$EasyPDO->addFields('file_orientation');
	$EasyPDO->addFields('file_type');
	$EasyPDO->addFields('id');

	//$array_untaged=$EasyPDO->select('photos', 'file_status = 0 AND (tag_status = 0 OR time_taken_at = "00000000+0000000000") ORDER BY time_taken_at DESC, id ASC');
	
	//CONCAT(time_taken_at_date, time_taken_at_zone, time_taken_at_time)

	$array_untaged=$EasyPDO->select(
	'photos',
	'file_status = 0
		AND (
			tag_status = 0
			OR (
				time_taken_at_date = "00000000"
				AND time_taken_at_zone = "+0000"
				AND time_taken_at_time = "000000"
			)
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