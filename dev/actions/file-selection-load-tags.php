<?php

	require_once($_SERVER['DOCUMENT_ROOT'].'/core/securityheader.php');
	require_once($_SERVER['DOCUMENT_ROOT'].'/core/class.easypdo.php');
	require_once($_SERVER['DOCUMENT_ROOT'].'/includes/functions.php');
	require_once($_SERVER['DOCUMENT_ROOT'].'/includes/locations.php');
	require_once($_SERVER['DOCUMENT_ROOT'].'/core/class.freturn.php');
	require_once($_SERVER['DOCUMENT_ROOT'].'/core/class.validation.php');

	$fReturn = new fReturn();
	$validation = new Validation();

	$validation->addVerification('token',		'sha256',	'Token');	
	$validation->addVerification('files_hash',	'jsonArrayString',	'Hash');
	$validation->Validate();

	if(!$validation->isValidated())
	{
		$fReturn->addConsole($validation->Message())->fetch();	
	}

	if(isset($_POST['files_hash']))
	{
		$ids = json_decode($_POST['files_hash'], true); // true pour obtenir un tableau associatif
		
		if(json_last_error() === JSON_ERROR_NONE)
		{
			$total_size=0;
			
			$EasyPDO = new EasyPDO($_SESSION['DB']);
			$EasyPDO->addFields('*');	
			
			$result = $EasyPDO->select('photos', 'id IN', $ids);

			$mem['date']=null;
			$mem['time']=null;
			$mem['zone']=null;

			$mem['continent']=null;
			$mem['country']=null;
			$mem['city']=null;
			$mem['place']=null;
			
			$mem['activity']=null;
			$mem['comment']=null;
			$mem['people']=null;
			$mem['other']=null;

			$flag['date']=0;
			$flag['time']=0;
			$flag['zone']=0;

			$flag['continent']=0;
			$flag['country']=0;
			$flag['city']=0;
			$flag['place']=0;
			
			$flag['activity']=0;
			$flag['comment']=0;
			$flag['people']=0;
			$flag['other']=0;
			
			$filedata=[];

			foreach($result['datas'] as $key => $value)
			{
				//pour l'init
				
				$date = substr($value['time_taken_at'], 0, 4).substr($value['time_taken_at'], 4, 2).substr($value['time_taken_at'], 6, 2).'+0000000000';
				$zone = '00000000'.substr($value['time_taken_at'], 8, 5).'000000'; // ±HHMM (ex: +0700)
				$time = '00000000+0000'.substr($value['time_taken_at'], 13, 2).substr($value['time_taken_at'], 15, 2).substr($value['time_taken_at'], 17, 2);
	
				if($mem['date']==null) 			$mem['date']=$date;
				if($mem['time']==null) 			$mem['time']=$time;
				if($mem['zone']==null) 			$mem['zone']=$zone;
				
				if($mem['continent']==null) 	$mem['continent']=$value['tag_continent'];
				if($mem['country']===null) 		$mem['country']=$value['tag_country'];
				if($mem['city']===null) 		$mem['city']=$value['tag_city'];
				if($mem['place']===null) 		$mem['place']=$value['tag_place'];
				
				if($mem['activity']===null) 	$mem['activity']=$value['tag_activity'];
				if($mem['comment']===null) 		$mem['comment']=$value['tag_comment'];
				if($mem['people']===null) 		$mem['people']=$value['tag_people'];
				if($mem['other']===null) 		$mem['other']=$value['tag_other'];
				
				//pour le storage

				$filedata[$value['file_original_name']]['date']=$date;
				$filedata[$value['file_original_name']]['time']=$time;
				$filedata[$value['file_original_name']]['zone']=$zone;
				
				$filedata[$value['file_original_name']]['continent']=$contient[$value['tag_continent']];
				$filedata[$value['file_original_name']]['country']=$country[$value['tag_country']];
				$filedata[$value['file_original_name']]['city']=$value['tag_city'];
				$filedata[$value['file_original_name']]['place']=$value['tag_place'];
				
				$filedata[$value['file_original_name']]['activity']=$value['tag_activity'];
				$filedata[$value['file_original_name']]['comment']=$value['tag_comment'];
				$filedata[$value['file_original_name']]['people']=$value['tag_people'];
				$filedata[$value['file_original_name']]['other']=$value['tag_other'];	

				$filedata[$value['file_original_name']]['id']=$value['id'];		
				//$filedata[$value['file_original_name']]['file_hash']=$value['file_hash'];		
				
				//pour le flag

				if($mem['date']!=$date) $flag['date']++;
				if($mem['time']!=$time) $flag['time']++;
				if($mem['zone']!=$zone) $flag['zone']++;

				if($mem['continent']!=$value['tag_continent']) $flag['continent']++;
				if($mem['country']!=$value['tag_country']) $flag['country']++;
				if($mem['city']!=$value['tag_city']) $flag['city']++;
				if($mem['place']!=$value['tag_place']) $flag['place']++;
				
				if($mem['activity']!=$value['tag_activity']) $flag['activity']++;
				if($mem['comment']!=$value['tag_comment']) $flag['comment']++;
				if($mem['people']!=$value['tag_people']) $flag['people']++;
				if($mem['other']!=$value['tag_other'])	 $flag['other']++;	
				
				$total_size+=$value['file_size'];
				
				//$fReturn->addConsole($key.":".$value['tag_continent']);
			}
			
			$bigarray['flag']=$flag;
			$bigarray['mem']=$mem;
			$bigarray['total_size']=$total_size;			
			$bigarray['filedata']=$filedata;
			
			$fReturn->addCallBack("g_multiple_selection_load_data_CallBack", $bigarray)->fetch();
			
		}
	}

	$fReturn->addFailMessage("Internal error")->fetch();

?>