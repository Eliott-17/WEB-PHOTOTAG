<?php

	require_once($_SERVER['DOCUMENT_ROOT'].'/core/securityheader.php');
	require_once($_SERVER['DOCUMENT_ROOT'].'/core/class.easypdo.php');
	require_once($_SERVER['DOCUMENT_ROOT'].'/core/class.freturn.php');
	require_once($_SERVER['DOCUMENT_ROOT'].'/core/class.validation.php');
	require_once($_SERVER['DOCUMENT_ROOT'].'/includes/functions.php');

	$EasyPDO = new EasyPDO($_SESSION['DB']);

	$fReturn = new fReturn();
	$validation = new Validation();

	//VALIDATION FORMULAIRE

	$validation->addVerification('token',		'sha256',				'Token'							);	
	$validation->addVerification('filesid',		'jsonArrayString',		'Files id'						);	
	$validation->addVerification('conflictedit','jsonArrayString',		'Conflict array',		        );	

	switch($_GET['form'])
	{
		case "time":

			$validation->addVerification('date',		'string',				'Date',			10,10);	
			$validation->addVerification('time',		'string',				'Time',			8,8);	
			$validation->addVerification('zone',		'string',				'Zone',			5,5);

		break;
		case "tag-location":

			$validation->addVerification('continent',	'string',				'Continent',	0,2);	
			$validation->addVerification('country',		'string',				'Country',		0,3);	
			$validation->addVerification('city',		'string',				'City',			0,200);	
			$validation->addVerification('place',		'string',				'Place',		0,200);	

		break;
		case "tag-general":
	
			$validation->addVerification('activity',	'string',				'Activity',		0,200);	
			$validation->addVerification('comment',		'string',				'Comment',		0,200);	
			$validation->addVerification('people',		'string',				'People',		0,200);	
			$validation->addVerification('other',		'string',				'Information',	0,200);	
		break;
		default:
		
			$fReturn->addFailMessage("Bad form")->fetch();
			
		break;
	}
		
	$validation->Validate();

	if(!$validation->isValidated())
	{
		$fReturn->addInfoMessage($validation->Message())->fetch();	
	}
	
	//
	
	$conflict = json_decode($_POST['conflictedit']);
	
	//$fReturn->addConsole($_POST['conflictedit'])->fetch();

	switch($_GET['form'])
	{
		case "time":

			if($conflict->date==0) $EasyPDO->addFields('time_taken_at_date',str_replace('-','',$_POST['date']));
			if($conflict->zone==0) $EasyPDO->addFields('time_taken_at_zone',$_POST['zone']);
			if($conflict->time==0) $EasyPDO->addFields('time_taken_at_time',str_replace(':','',$_POST['time']));

		break;
		case "tag-location":

			if(empty($_POST['continent'])) 	$_POST['continent']=null;
			if(empty($_POST['country'])) 	$_POST['country']=null;		/*else	$tag['tag_country']=$_POST['country'];*/
			if(empty($_POST['city'])) 		$_POST['city']=null;		else	$tag['tag_city']=$_POST['city'];
			if(empty($_POST['place'])) 		$_POST['place']=null;		else	$tag['tag_place']=$_POST['place'];
			
			if($conflict->continent==0)		$EasyPDO->addFields('tag_continent',$_POST['continent']);
			if($conflict->country==0)		$EasyPDO->addFields('tag_country',$_POST['country']);
			if($conflict->city==0)			$EasyPDO->addFields('tag_city',$_POST['city']);
			if($conflict->place==0)			$EasyPDO->addFields('tag_place',$_POST['place']);	

		break;
		case "tag-general":
		
			if(empty($_POST['activity']))	$_POST['activity']=null; 	else	$tag['tag_activity']=$_POST['activity'];		
			if(empty($_POST['comment'])) 	$_POST['comment']=null;		else	$tag['tag_comment']=$_POST['comment'];		
			if(empty($_POST['people'])) 	$_POST['people']=null;		else	$tag['tag_people']=$_POST['people'];
			if(empty($_POST['other'])) 		$_POST['other']=null;		else	$tag['tag_other']=$_POST['other'];
			
			if($conflict->activity==0)		$EasyPDO->addFields('tag_activity',$_POST['activity']);
			if($conflict->comment==0)		$EasyPDO->addFields('tag_comment',$_POST['comment']);
			if($conflict->people==0)		$EasyPDO->addFields('tag_people',$_POST['people']);
			if($conflict->other==0)			$EasyPDO->addFields('tag_other',$_POST['other']);
		
		break;
		default:
		
			$fReturn->addFailMessage("Bad form")->fetch();
			
		break;
	}	

	$date = new DateTime();
    $date->setTimezone(new DateTimeZone('UTC'));
    $strdate_updated = $date->format('Y-m-d H:i:s');		

	$EasyPDO->addFields('time_modified_at',$strdate_updated); //last updated info	
	
	$dataarray = json_decode($_POST['filesid'], true);
	$count = count($dataarray);
	
	$affectedrow = $EasyPDO->update('photos', 'id IN', $dataarray);

	$fReturn->addConsole("Request update:".$count);	
	$fReturn->addConsole("Total Update data:".$affectedrow['count']);
	
	if($count==1)
	{
		$fReturn->addCallback("FILEINFO_load",true);
		$fReturn->addCallback("FILEINFO_CallBack_success");
		if(isset($tag))  $fReturn->addCallback("GRID_add_tags",$tag);
	}
	else
	{	
		$fReturn->addCallback("FILEMULTISELECTION_load",true);
		$fReturn->addCallback("FILEMULTISELECTION_CallBack_success");
		if(isset($tag))  $fReturn->addCallback("GRID_add_tags",$tag);
	}
	
	$fReturn->fetch();
?>	