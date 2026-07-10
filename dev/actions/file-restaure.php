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
		$fReturn->addCallback("NAV_CallBack_error","Data request error");
		if(ENV=="DEV") $fReturn->addConsole($validation->Message());	
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
			$fReturn->addCallback("NAV_CallBack_error","Inconsistent file name");
			if(ENV=="DEV") $fReturn->addFailMessage('Internal error')->addConsole($filename);
			$fReturn->fetch();
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
				if(!rename($filenametestHDtrash, $filenametestHD)) 
				{		
					$fReturn->addCallback("NAV_CallBack_error","Fatal error while moving HD file");
					if(ENV=="DEV") $fReturn->addFailMessage('Internal error')->addConsole($filenametestHDtrash);
					if(ENV=="DEV") $fReturn->addFailMessage('Internal error')->addConsole($filenametestHD);
					$fReturn->fetch();
				}
			}
			if (file_exists($filenametestSDtrash)) 
			{
				if(!rename($filenametestSDtrash, $filenametestSD)) 
				{
					$fReturn->addCallback("NAV_CallBack_error","Fatal error while moving SD file");
					if(ENV=="DEV") $fReturn->addFailMessage('Internal error')->addConsole($filenametestSDtrash);
					if(ENV=="DEV") $fReturn->addFailMessage('Internal error')->addConsole($filenametestSD);
					$fReturn->fetch();
				}
			}
		
			$date = new DateTime();
			$date->setTimezone(new DateTimeZone('UTC'));
			$strdate_updated = $date->format('Y-m-d H:i:s');		

			$EasyPDO->addFields('file_original_name',$original_filename); //last updated info	
			$EasyPDO->addFields('time_modified_at',$strdate_updated); //last updated info		
			$EasyPDO->addFields('file_status',0);	
			
			$EasyPDO->addConditionalData('file_hash',$value['file_hash']);
			$return=$EasyPDO->update('photos', 'file_hash=:file_hash');

			if($return['status']===true)
			{
				$fReturn->addCallback("GRID_CallBack_restaure",$_GET['id'])->fetch();
			}
			else
			{
				$fReturn->addCallback("NAV_CallBack_error","Fatal error while updating to database");
				if(ENV=="DEV") $fReturn->addFailMessage('Internal error')->addConsole(print_r($return,true));
				$fReturn->fetch();
			}
		}
	}
	else
	{
		$fReturn->addCallback("NAV_CallBack_error","Fatal error while selecting from database");
		if(ENV=="DEV") $fReturn->addFailMessage('Internal error')->addConsole(print_r($return,true));
		$fReturn->fetch();
	}	
?>	