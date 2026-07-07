<?php

	require_once($_SERVER['DOCUMENT_ROOT'].'/core/securityheader.php');
	require_once($_SERVER['DOCUMENT_ROOT'].'/core/class.easypdo.php');
	require_once($_SERVER['DOCUMENT_ROOT'].'/includes/functions.php');
	require_once($_SERVER['DOCUMENT_ROOT'].'/includes/datas.php');
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
			
			$mem['file_is_private']=null;

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

			$flag['file_is_private']=0;
			
			$filedata=[];

			foreach($result['datas'] as $key => $value)
			{
				//pour l'init

				if($mem['date']==null) 					$mem['date']=$value['time_taken_at_date'];
				if($mem['time']==null) 					$mem['time']=$value['time_taken_at_time'];
				if($mem['zone']==null) 					$mem['zone']=$value['time_taken_at_zone'];
				
				if($mem['continent']==null) 			$mem['continent']=$value['tag_continent'];
				if($mem['country']===null) 				$mem['country']=$value['tag_country'];
				if($mem['city']===null) 				$mem['city']=$value['tag_city'];
				if($mem['place']===null) 				$mem['place']=$value['tag_place'];
				
				if($mem['activity']===null) 			$mem['activity']=$value['tag_activity'];
				if($mem['comment']===null) 				$mem['comment']=$value['tag_comment'];
				if($mem['people']===null) 				$mem['people']=$value['tag_people'];
				if($mem['other']===null) 				$mem['other']=$value['tag_other'];
				if($mem['file_is_private']===null) 		$mem['file_is_private']=$value['file_is_private'];
				
				//pour le storage

				$filedata[$value['file_original_name']]['date']=$value['time_taken_at_date'];
				$filedata[$value['file_original_name']]['time']=$value['time_taken_at_time'];
				$filedata[$value['file_original_name']]['zone']=$value['time_taken_at_zone'];
				
				$filedata[$value['file_original_name']]['continent']=$DATAS_contient[$value['tag_continent']];
				$filedata[$value['file_original_name']]['country']=$DATAS_country[$value['tag_country']];
				$filedata[$value['file_original_name']]['city']=$value['tag_city'];
				$filedata[$value['file_original_name']]['place']=$value['tag_place'];
				
				$filedata[$value['file_original_name']]['activity']=$value['tag_activity'];
				$filedata[$value['file_original_name']]['comment']=$value['tag_comment'];
				$filedata[$value['file_original_name']]['people']=$value['tag_people'];
				$filedata[$value['file_original_name']]['other']=$value['tag_other'];	

				$filedata[$value['file_original_name']]['id']=$value['id'];		
				$filedata[$value['file_original_name']]['file_is_private']=$value['file_is_private'];	
				//$filedata[$value['file_original_name']]['file_hash']=$value['file_hash'];		
				
				//pour le flag

				if($mem['date']!=$value['time_taken_at_date']) 					$flag['date']++;
				if($mem['time']!=$value['time_taken_at_time']) 					$flag['time']++;
				if($mem['zone']!=$value['time_taken_at_zone']) 					$flag['zone']++;

				if($mem['continent']!=$value['tag_continent']) 					$flag['continent']++;
				if($mem['country']!=$value['tag_country']) 						$flag['country']++;
				if($mem['city']!=$value['tag_city']) 							$flag['city']++;
				if($mem['place']!=$value['tag_place']) 							$flag['place']++;
				
				if($mem['activity']!=$value['tag_activity']) 					$flag['activity']++;
				if($mem['comment']!=$value['tag_comment']) 						$flag['comment']++;
				if($mem['people']!=$value['tag_people']) 						$flag['people']++;
				if($mem['other']!=$value['tag_other'])	 						$flag['other']++;	

				if($mem['file_is_private']!=$value['file_is_private'])	 		$flag['file_is_private']++;	
				
				$total_size+=$value['file_size'];
			}
			
			$bigarray['flag']=$flag;
			$bigarray['mem']=$mem;
			$bigarray['total_size']=$total_size;			
			$bigarray['filedata']=$filedata;
			
			$fReturn->addConsole("[PHP EXECUTED] file-selection-load-tags.php");			
			$fReturn->addCallBack("FILEMULTISELECTION_CallBack_load", $bigarray)->fetch();		
		}
	}

	$fReturn->addFailMessage("Internal error")->fetch();

?>