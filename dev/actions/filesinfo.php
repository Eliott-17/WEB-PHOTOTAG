<?php

	require_once($_SERVER['DOCUMENT_ROOT'].'/core/securityheader.php');
	require_once($_SERVER['DOCUMENT_ROOT'].'/core/class.easypdo.php');
	require_once($_SERVER['DOCUMENT_ROOT'].'/includes/functions.php');
	require_once($_SERVER['DOCUMENT_ROOT'].'/includes/locations.php');
	require_once($_SERVER['DOCUMENT_ROOT'].'/core/class.freturn.php');

	$fReturn = new fReturn();

	if(isset($_POST['files_hash']))
	{
		$ids = json_decode($_POST['files_hash'], true); // true pour obtenir un tableau associatif
		
		if(json_last_error() === JSON_ERROR_NONE)
		{
			$total_size=0;
			
			$EasyPDO = new EasyPDO($_SESSION['DB']);
			$EasyPDO->addFields('*');	
			
			$result = $EasyPDO->select('photos', 'id IN', $ids);

			$mem['continent']=null;
			$mem['country']=null;
			$mem['city']=null;
			$mem['place']=null;
			
			$mem['activity']=null;
			$mem['comment']=null;
			$mem['people']=null;
			$mem['other']=null;
			
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
				
				if($mem['continent']==null) 	$mem['continent']=$value['tag_continent'];
				if($mem['country']===null) 		$mem['country']=$value['tag_country'];
				if($mem['city']===null) 		$mem['city']=$value['tag_city'];
				if($mem['place']===null) 		$mem['place']=$value['tag_place'];
				
				if($mem['activity']===null) 	$mem['activity']=$value['tag_activity'];
				if($mem['comment']===null) 		$mem['comment']=$value['tag_comment'];
				if($mem['people']===null) 		$mem['people']=$value['tag_people'];
				if($mem['other']===null) 		$mem['other']=$value['tag_other'];
				
				//pour le storage
				
				$filedata[$value['file_original_name']]['continent']=$contient[$value['tag_continent']];
				$filedata[$value['file_original_name']]['country']=$country[$value['tag_country']];
				$filedata[$value['file_original_name']]['city']=$value['tag_city'];
				$filedata[$value['file_original_name']]['place']=$value['tag_place'];
				
				$filedata[$value['file_original_name']]['activity']=$value['tag_activity'];
				$filedata[$value['file_original_name']]['comment']=$value['tag_comment'];
				$filedata[$value['file_original_name']]['people']=$value['tag_people'];
				$filedata[$value['file_original_name']]['other']=$value['tag_other'];	

				$filedata[$value['file_original_name']]['id']=$value['id'];		
				
				//pour le flag

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
			
			$fReturn->addCallBack("g_edit_treat_data", $bigarray)->fetch();
			
		}
	}

	$fReturn->addFailMessage("Internal error")->fetch();

?>