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
	
	$regex1='/^\d{14}_[a-f0-9]{64}$/';
	$regex2='/^search_[0-9]{1,7}$/';

	$validation->addVerification('hash','preg','hash',$regex1);
	$validation->addVerification('id','preg','id',$regex2);

	$validation->Validate();

	if(!$validation->isValidated())
	{
		$fReturn->addConsole($validation->Message());	
		if(ENV=="DEV") $fReturn->addConsole($_GET['hash']);
		$fReturn->fetch();
	}
	
	//récupération du nom original + hash
	$parts = explode('_', $_GET['hash'], 2);
	
	$EasyPDO->addFields('file_original_name');
	$EasyPDO->addFields('file_hash');
	$EasyPDO->addConditionalData('file_hash',$parts[1]);
	$return=$EasyPDO->select('photos', 'file_hash=:file_hash');
	
	if($return['status']===true && $return['count']==1)
	{
		$value=$return['datas'][0];
		
		$filename = $value['file_original_name'];

		$pos = strpos($filename, '_');

		if ($pos !== false) {
			$before = substr($filename, 0, $pos);
			$after  = substr($filename, $pos + 1);
		} else {
			$before = $filename;
			$after  = null;
		}
		
		if($after == null)
		{
			$fReturn->addConsole("Inconsistent file name")->fetch();
		}
		else
		{
			$original_filename = $after;
			$trash_header = $before;
			
			$filenametestHD = DIR_HD.$original_filename;
			$filenametestSD = DIR_SD.$value['file_hash'].".webp";

			$filenametestHDtrash = DIR_TRASH.$trash_header.'_'.$original_filename;
			$filenametestSDtrash = DIR_TRASH.$trash_header.'_'.$value['file_hash'].".webp";
			
			if (file_exists($filenametestHDtrash)) 
			{
				if(!rename($filenametestHDtrash, $filenametestHD)) $fReturn->addFailMessage('Internal error')->addConsole($filenametestHDtrash)->fetch();
			}
			if (file_exists($filenametestSDtrash)) 
			{
				if(!rename($filenametestSDtrash, $filenametestSD)) $fReturn->addFailMessage('Internal error')->addConsole($filenametestSDtrash)->fetch();	
			}	
		
			$date = new DateTime();
			$date->setTimezone(new DateTimeZone('UTC'));
			$strdate_updated = $date->format('Y-m-d H:i:s');		

			$EasyPDO->addFields('file_original_name',$original_filename); //last updated info	
			$EasyPDO->addFields('time_modified_at',$strdate_updated); //last updated info		
			$EasyPDO->addFields('file_status',0);	
			
			$EasyPDO->addConditionalData('file_hash',$value['file_hash']);
			$return=$EasyPDO->update('photos', 'file_hash=:file_hash');

			if($return['status']!==true)
			{			
				$fReturn->addConsole("[PHP] SQL error while restaure bdd (2)");
				if(ENV=="DEV") $fReturn->addConsole(print_r($return,true));	
			}
			else
			{
				$fReturn->addCallback("GRID_CallBack_restaure",$_GET['id']);
				if(ENV=="DEV") $fReturn->addConsole($return['count']);	
			}
		}
	}
	
	else
	{
		$fReturn->addConsole("[PHP] SQL error while restaure bdd (1)");
		if(ENV=="DEV") $fReturn->addConsole(print_r($return,true));	
	}
	
	$fReturn->fetch();
	
?>	