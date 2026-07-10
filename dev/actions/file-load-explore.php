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
		AND '.tag_query().'
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
		$fReturn->addCallback("NAV_CallBack_error","Fatal error while selecting from database");
		if(ENV=="DEV") $fReturn->addFailMessage('Internal error')->addConsole(print_r($array_lib,true));
		$fReturn->fetch();
	}
		
	$array_lib=$EasyPDO->executequery("SELECT","substr(time_taken_at_date, 1, 4) AS years, SUM(file_size) AS size_files, SUM(file_size_webp) AS size_webp, COUNT() as count_files FROM photos WHERE file_status = 0 GROUP BY substr(time_taken_at_date, 1, 4)");

	if($array_lib['status']===true)
	{		
		$bigarray['size']=$array_lib['datas'];
	}
	else
	{
		$fReturn->addCallback("NAV_CallBack_error","Fatal error while selecting from database");
		if(ENV=="DEV") $fReturn->addFailMessage('Internal error')->addConsole(print_r($array_lib,true));
		$fReturn->fetch();
	}
			
	if(ENV=="DEV") $fReturn->addConsole("[PHP EXECUTED] file-load-explore.php");
	$fReturn->addCallBack("EXPLORE_CallBack_load", $bigarray)->fetch();

?>