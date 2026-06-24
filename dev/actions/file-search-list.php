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

	$EasyPDO->addFields('tag_country');
	$EasyPDO->addFields('tag_city');
	$EasyPDO->addFields('tag_place');
	$EasyPDO->addFields('tag_activity');
	$EasyPDO->addFields('tag_comment');
	$EasyPDO->addFields('tag_people');
	$EasyPDO->addFields('tag_other');
	
	$result['status']=0;
	$tagname="";
		
	switch($_GET['tag'])
	{
		case 'tag_country':
		
			$key = array_search($_GET['value'], $country);

			if ($key === false) {
				$fReturn->addConsole("[PHP] Country value ".$_GET['value']." invalid");
				break;
			}
			else
			{
				$_GET['value']=$key;
			}
			
			$tagname="Pays";
		
		break;
				
		case 'tag_city': $tagname="City"; break;
		case 'tag_place': $tagname="Location"; break;
		case 'tag_activity': $tagname="Activity"; break;
		case 'tag_comment': $tagname="Comment"; break;
		case 'tag_people': $tagname="People"; break;
		case 'tag_other': $tagname="Information"; break;		
		default: 
			$fReturn->addConsole("[PHP] Tag ".$_GET['tag']." invalid");
		break;
	}
	
	if(!empty($tagname))
	{
		$EasyPDO->addConditionalData('value',$_GET['value']);
		$result=$EasyPDO->select('photos', $_GET['tag']. '=:value AND file_status = 0 ORDER BY time_taken_at_date DESC,time_taken_at_zone DESC, time_taken_at_time DESC, id ASC');		
	}

	if($result['status']==1) 
	{
		$return['keywords']=$_GET['value'];
		$return['tag']=$_GET['tag'];
		$return['tagname']=$tagname;

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
		
		$return['tags']=retreive_sort_tags($result['datas'],$array_tags,$country);	
		
		foreach ($result['datas'] as &$row) {
			$row['advfilter_hidden'] = 0;
		}
		unset($row);
				
		$return['datas']=$result['datas'];
		$fReturn->addCallBack("GRID_search_CallBack", $return);
	}
	else
	{
		$fReturn->addConsole("[PHP] SQL error while loading search");	
	}
	
	$fReturn->addConsole("[PHP EXECUTED] file-search-list.php");
	$fReturn->fetch();

?>