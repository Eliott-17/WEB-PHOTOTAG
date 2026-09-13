<?php

	require_once($_SERVER['DOCUMENT_ROOT'].'/core/securityheader.php');
	require_once($_SERVER['DOCUMENT_ROOT'].'/core/class.easypdo.php');
	require_once($_SERVER['DOCUMENT_ROOT'].'/core/class.freturn.php');
	require_once($_SERVER['DOCUMENT_ROOT'].'/core/class.validation.php');
	require_once($_SERVER['DOCUMENT_ROOT'].'/includes/functions.php');
	require_once($_SERVER['DOCUMENT_ROOT'].'/includes/datas.php');

	$fReturn = new fReturn();
	$validation = new Validation();

	$validation->addVerification('offset',			'int',			'offset',				0,100000									);	
	$validation->addVerification('elements',		'int',			'elements',				0,100000									);	
	$validation->addVerification('sectionactive', 	'in_array', 	'sectionactive', 		['library', 'untagged']);
	//$validation->addVerification('sectionactive',		'string',			'sectionactive',  		6,8);	
	$validation->Validate();
	
	$bigarray['datas']=[];
	$bigarray['dir']=$_SESSION["USER"];

	if(!$validation->isValidated())
	{
		$fReturn->addCallback("NAV_CallBack_error","Data request error");
		if(ENV=="DEV") $fReturn->addConsole($validation->Message());	
		$fReturn->fetch();
	}
	
	//source TAG ou UNTAG

	if($_GET['sectionactive']=="library") // tagged request
	{		
		$conditionaldata=tag_query();
		$sort="DESC";
	}
	else if($_GET['sectionactive']=="untagged") // tagged request
		//non tagged request
	{			
		$conditionaldata=untag_query();
		$sort="DESC";
	}
	else
	{
		$fReturn->addCallback("NAV_CallBack_error","Fatal error while selecting sectionactive");
		if(ENV=="DEV") $fReturn->addFailMessage('Internal error')->addConsole($_GET['sectionactive']);
		$fReturn->fetch();		
	}
	
	$EasyPDO = new EasyPDO($_SESSION['DB']);
	
	$EasyPDO->addFields('file_status');
	$EasyPDO->addFields('file_hash');
	$EasyPDO->addFields('time_taken_at_date');
	$EasyPDO->addFields('time_taken_at_zone');
	$EasyPDO->addFields('time_taken_at_time');
	$EasyPDO->addFields('file_orientation');
	$EasyPDO->addFields('file_is_private');

	$EasyPDO->addFields('file_type');
	$EasyPDO->addFields('id');
	
	$EasyPDO->addConditionalData('offset',$_GET['offset']);
	$EasyPDO->addConditionalData('elements',$_GET['elements']);

	$array=$EasyPDO->select(
	'photos',
	'file_status = 0 AND '.$conditionaldata.' ORDER BY
		CASE
			WHEN
			'.$conditionaldata.'
			THEN 0
			ELSE 1
		END ASC, time_taken_at_date '.$sort.',
				 time_taken_at_zone '.$sort.',
				 time_taken_at_time '.$sort.'
		LIMIT :elements OFFSET:offset
	');
	
	if($array['status']===true) 
	{
		$bigarray['datas']=$array['datas'];
	}
	else
	{
		$fReturn->addCallback("NAV_CallBack_error","Fatal error while selecting from database");
		if(ENV=="DEV") $fReturn->addFailMessage('Internal error')->addConsole(print_r($array,true));
		$fReturn->fetch();
	}

	//if($_GET['offset']==0)
	//{
		$EasyPDO->addFields('COUNT (*) as total');
		$array_cnt=$EasyPDO->select('photos','file_status = 0 AND'.$conditionaldata);			

		if($array_cnt['status']===true) 
		{
			$bigarray['count']=$array_cnt['datas'][0];
		}
		else
		{
			$fReturn->addCallback("NAV_CallBack_error","Fatal error while selecting from database");
			if(ENV=="DEV") $fReturn->addFailMessage('Internal error')->addConsole(print_r($array_cnt,true));
			$fReturn->fetch();
		}
	//}
	
	$bigarray['sectionactive']=$_GET['sectionactive'];
	
	//if(ENV=="DEV") $fReturn->addConsole("[PHP EXECUTED] file-load-list.php");
	$fReturn->addCallBack("GRID_CallBack_load", $bigarray)->fetch();

?>