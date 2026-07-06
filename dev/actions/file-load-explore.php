<?php

	require_once($_SERVER['DOCUMENT_ROOT'].'/core/securityheader.php');
	require_once($_SERVER['DOCUMENT_ROOT'].'/core/class.easypdo.php');
	require_once($_SERVER['DOCUMENT_ROOT'].'/core/class.freturn.php');
	require_once($_SERVER['DOCUMENT_ROOT'].'/core/class.validation.php');
	require_once($_SERVER['DOCUMENT_ROOT'].'/includes/functions.php');
	require_once($_SERVER['DOCUMENT_ROOT'].'/includes/datas.php');

	$fReturn = new fReturn();
	$EasyPDO = new EasyPDO($_SESSION['DB']);

	$file_size_total=0;
	$file_size_webp_total=0;

	//***************************************
	//QUERY TAGGUED FILES *******************
	//***************************************

	$EasyPDO->addFields('file_status');
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

	$EasyPDO->addFields('file_type');
	$EasyPDO->addFields('id');
	
	$array_lib=$EasyPDO->select(
	'photos',
	'file_status = 0
		AND (
			time_taken_at_date != "00000000"
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
	
	if($array_lib['status']===true)
	{		
		$bigarray['tags']=retreive_sort_tags($array_lib['datas'],$array_tags,$DATAS_country,$DATAS_months);
		
		unset($array_tags['time_taken_at_date']);
		
		$keysToRemove = array_flip(array_keys($array_tags));

		foreach ($array_lib['datas'] as &$row) $row = array_diff_key($row, $keysToRemove);		
	}
	else
	{
		$fReturn->addConsole("[PHP] SQL error while loading explore");
		if(ENV=="DEV") $fReturn->addConsole(print_r($array_lib,true));
		$bigarray['tags']=[];
	}
		
	$array_lib=$EasyPDO->executequery("SELECT","SUM(file_size+file_size_webp) AS total FROM photos");

	if($array_lib['status']===true)
	{		
		$bigarray['size']=$array_lib['datas'][0]['total'];
	}
	else
	{
		$bigarray['size']=0;
	}
			
	$fReturn->addConsole("[PHP EXECUTED] file-load-explore.php");
	$fReturn->addCallBack("EXPLORE_CallBack", $bigarray)->fetch();

?>