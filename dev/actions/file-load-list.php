<?php

	require_once($_SERVER['DOCUMENT_ROOT'].'/core/securityheader.php');
	require_once($_SERVER['DOCUMENT_ROOT'].'/core/class.easypdo.php');
	require_once($_SERVER['DOCUMENT_ROOT'].'/core/class.freturn.php');
	require_once($_SERVER['DOCUMENT_ROOT'].'/core/class.validation.php');
	require_once($_SERVER['DOCUMENT_ROOT'].'/includes/functions.php');
	require_once($_SERVER['DOCUMENT_ROOT'].'/includes/locations.php');

	$fReturn = new fReturn();
	$EasyPDO = new EasyPDO($_SESSION['DB']);

	$file_size_total=0;
	$file_size_webp_total=0;

	//***************************************
	//QUERY TAGGUED FILES *******************
	//***************************************

	//$EasyPDO->addFields('file_status');
	$EasyPDO->addFields('file_hash');
	$EasyPDO->addFields('time_taken_at_date');
	$EasyPDO->addFields('time_taken_at_zone');
	$EasyPDO->addFields('time_taken_at_time');
	$EasyPDO->addFields('file_orientation');

	$EasyPDO->addFields('tag_country');
	$EasyPDO->addFields('tag_city');
	$EasyPDO->addFields('tag_place');
	$EasyPDO->addFields('tag_activity');
	$EasyPDO->addFields('tag_comment');
	$EasyPDO->addFields('tag_people');
	$EasyPDO->addFields('tag_other');

	$EasyPDO->addFields('file_size');
	$EasyPDO->addFields('file_size_webp');

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


	$array_tags = [
		'tag_country' => [],
		'tag_city' => [],
		'tag_place' => [],
		'tag_activity' => [],
		'tag_comment' => [],
		'tag_people' => [],
		'tag_other' => [],
		'time_taken_at_date' => []
	];
	
	$array_tags_remove = [
		'file_size' => [],
		'file_size_webp' => []
	];
	
	if($array_lib['status']==1)
	{		
		$bigarray['tags']=retreive_sort_tags($array_lib['datas'],$array_tags,$country);
		
		unset($array_tags['time_taken_at_date']);
		
		$keysToRemove = array_flip(array_keys(array_merge($array_tags,$array_tags_remove)));

		foreach ($array_lib['datas'] as &$row) {
			
			$file_size_total+=$row['file_size'];
			$file_size_webp_total+=$row['file_size_webp'];

			$row = array_diff_key($row, $keysToRemove);
		}
		
		$bigarray['library']=array_values($array_lib['datas']);			
	}
	else
	{
		$fReturn->addConsole("[PHP] SQL error while loading library");
		if(ENV=="DEV") $fReturn->addConsole(print_r($array_lib,true));
		$bigarray['tags']=[];
		$bigarray['library']=[];
	}
	
	//***************************************
	//QUERY UNTAGGUED FILES *****************
	//***************************************
	
	$EasyPDO->addFields('file_status');
	$EasyPDO->addFields('file_hash');
	$EasyPDO->addFields('time_taken_at_date');
	$EasyPDO->addFields('time_taken_at_zone');
	$EasyPDO->addFields('time_taken_at_time');
	$EasyPDO->addFields('file_orientation');

	$EasyPDO->addFields('file_size');
	$EasyPDO->addFields('file_size_webp');

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
	
	if($array_untaged['status']==1) 
	{
		$keysToRemove = array_flip(array_keys($array_tags_remove));

		foreach ($array_untaged['datas'] as &$row) {
			
			$file_size_total+=$row['file_size'];
			$file_size_webp_total+=$row['file_size_webp'];

			$row = array_diff_key($row, $keysToRemove);
		}
		
		$bigarray['untagged']=array_values($array_untaged['datas']);
	}
	else
	{
		$fReturn->addConsole("[PHP] SQL error while loading untagged");
		if(ENV=="DEV") $fReturn->addConsole(print_r($array_untaged,true));
		$bigarray['untagged']=[];		
	}
	
	$bigarray['dir']=$_SESSION["USER"];
	$bigarray['file_size_total']=$file_size_total;
	$bigarray['file_size_webp_total']=$file_size_webp_total;
	
	$fReturn->addConsole("[PHP EXECUTED] file-load-list.php");
	$fReturn->addCallBack("GRID_load_CallBack", $bigarray)->fetch();

?>