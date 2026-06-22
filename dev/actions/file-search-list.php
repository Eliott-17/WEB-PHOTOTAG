<?php

	require_once($_SERVER['DOCUMENT_ROOT'].'/core/securityheader.php');
	require_once($_SERVER['DOCUMENT_ROOT'].'/core/class.easypdo.php');
	require_once($_SERVER['DOCUMENT_ROOT'].'/core/class.freturn.php');
	require_once($_SERVER['DOCUMENT_ROOT'].'/core/class.validation.php');
	require_once($_SERVER['DOCUMENT_ROOT'].'/includes/functions.php');
	require_once($_SERVER['DOCUMENT_ROOT'].'/includes/locations.php');

	$fReturn = new fReturn();
	$EasyPDO = new EasyPDO($_SESSION['DB']);
	
	if(!isset($_GET['tag']) || !isset($_GET['value']))
	{
		$fReturn->addConsole("Invalid GET")->fetch();
	}

	if(empty($_GET['value']))
	{
		$fReturn->addConsole("Empty GET value")->fetch();
	}

	$EasyPDO->addFields('file_hash');
	$EasyPDO->addFields('time_taken_at_date');
	$EasyPDO->addFields('time_taken_at_zone');
	$EasyPDO->addFields('time_taken_at_time');
	$EasyPDO->addFields('file_orientation');
	$EasyPDO->addFields('file_type');
	$EasyPDO->addFields('id');
	
	$result['status']=0;
		
	switch($_GET['tag'])
	{
		case 'tag_country':
		
			$key = array_search($_GET['value'], $country);

			if ($key === false) {
				$fReturn->addConsole("[PHP] Counrty value ".$_GET['value']." invalid");
				break;
			}
			else
			{
				$_GET['value']=$key;
			}
				
		case 'tag_city':
		case 'tag_place':
		case 'tag_activity':
		case 'tag_comment':
		case 'tag_people':
		case 'tag_other': 
			
			$EasyPDO->addConditionalData('value',$_GET['value']);
			$result=$EasyPDO->select('photos', $_GET['tag']. '=:value AND file_status = 0 ORDER BY time_taken_at_date DESC,time_taken_at_zone DESC, time_taken_at_time DESC, id ASC');		

		break;		
		default: 
			$fReturn->addConsole("[PHP] Tag ".$_GET['tag']." invalid");
		break;
	}

	
	if($result['status']==1) 
	{
		$fReturn->addCallBack("GRID_search_CallBack", $result['datas']);
	}
	else
	{
		$fReturn->addConsole("[PHP] SQL error while loading search");	
	}
	
	$fReturn->addConsole("[PHP EXECUTED] file-search-list.php");
	$fReturn->fetch();

?>