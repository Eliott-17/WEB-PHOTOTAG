<?php

	require_once($_SERVER['DOCUMENT_ROOT'].'/core/securityheader.php');
	require_once($_SERVER['DOCUMENT_ROOT'].'/core/class.easypdo.php');
	require_once($_SERVER['DOCUMENT_ROOT'].'/core/class.freturn.php');
	require_once($_SERVER['DOCUMENT_ROOT'].'/core/class.validation.php');
	require_once($_SERVER['DOCUMENT_ROOT'].'/includes/functions.php');
	require_once($_SERVER['DOCUMENT_ROOT'].'/includes/datas.php');

	$fReturn = new fReturn();
	$validation = new Validation();

	$validation->addVerification('offset',		'int',	'offset',			0,100000			);	
	$validation->addVerification('source',		'int',	'source',			0,1					);
	$validation->Validate();
	
	$bigarray['datas']=[];
	$bigarray['dir']=$_SESSION["USER"];

	if(!$validation->isValidated())
	{
		if(ENV=="DEV") $fReturn->addConsole($validation->Message());
		$fReturn->fetch();
	}

	if($_GET['source']==0)
	{		
		$conditionaldata='AND (
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
		)';
	}
	else
	{			
		$conditionaldata='AND (
			time_taken_at_date = "00000000"
			OR time_taken_at_time = "000000"
			OR time_taken_at_zone = "00000"
			OR tag_country IS null
			OR tag_country = "UNK"
			OR (tag_city IS null AND tag_place IS null AND tag_activity IS null)
		)';
	}
	
	$EasyPDO = new EasyPDO($_SESSION['DB']);
	
	$EasyPDO->addFields('file_status');
	$EasyPDO->addFields('file_hash');
	$EasyPDO->addFields('time_taken_at_date');
	$EasyPDO->addFields('time_taken_at_zone');
	$EasyPDO->addFields('time_taken_at_time');
	$EasyPDO->addFields('file_orientation');

	$EasyPDO->addFields('file_type');
	$EasyPDO->addFields('id');
	
	$EasyPDO->addConditionalData('offset',$_GET['offset']);

	$array=$EasyPDO->select(
	'photos',
	'file_status = 0
		'.$conditionaldata.'
		ORDER BY time_taken_at_date DESC,
				 time_taken_at_zone DESC,
				 time_taken_at_time DESC,
				 id ASC 
		LIMIT 50 OFFSET:offset
	');
	
	if($array['status']===true) 
	{
		$bigarray['datas']=$array['datas'];
	}
	else
	{
		$fReturn->addConsole("[PHP] SQL error while loading list");
		if(ENV=="DEV") $fReturn->addConsole(print_r($array,true));	
	}

	$fReturn->addConsole("[PHP EXECUTED] file-load-list.php");
	$fReturn->addCallBack("GRID_load_CallBack", $bigarray)->fetch();

?>