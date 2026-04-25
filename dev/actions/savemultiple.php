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

	$validation->addVerification('token',		'string',				'Token',				64,64);	
	$validation->addVerification('files_hash',	'string',				'Hash',					4,2000);	
	$validation->addVerification('conflict_edit','string',				'Hash',					92,92);	
	$validation->addVerification('continent',	'string',				'Continent',			0,2);	
	$validation->addVerification('country',		'string',				'Country',				0,3);	
	$validation->addVerification('city',		'string',				'City',					0,200);	
	$validation->addVerification('place',		'string',				'Place',				0,200);	
	$validation->addVerification('activity',	'string',				'Activity',				0,200);	
	$validation->addVerification('comment',		'string',				'Comment',				0,200);	
	$validation->addVerification('people',		'string',				'People',				0,200);	
	$validation->addVerification('information',	'string',				'Information',			0,200);	
	
	$validation->Validate();

	if(!$validation->isValidated())
	{
		$fReturn->addInfoMessage($validation->Message())->fetch();	
	}
	
	$conflict = json_decode($_POST['conflict_edit']);

	if($conflict->continent==0)		$EasyPDO->addFields('tag_continent',$_POST['continent']);
	if($conflict->country==0)		$EasyPDO->addFields('tag_country',$_POST['country']);
	if($conflict->city==0)			$EasyPDO->addFields('tag_city',$_POST['city']);
	if($conflict->place==0)			$EasyPDO->addFields('tag_place',$_POST['place']);		
	if($conflict->activity==0)		$EasyPDO->addFields('tag_activity',$_POST['activity']);
	if($conflict->comment==0)		$EasyPDO->addFields('tag_comment',$_POST['comment']);
	if($conflict->people==0)		$EasyPDO->addFields('tag_people',$_POST['people']);
	if($conflict->other==0)			$EasyPDO->addFields('tag_other',$_POST['information']);
	
	$affectedrow = $EasyPDO->update('photos', 'id', json_decode($_POST['files_hash'], true));

	$fReturn->addCallback("g_load_data_edit","")->addCallback("g_hide_conflict","")->addSuccessMessage("Database updated")->fetch();
?>	