<?php

header('Content-Type: application/json; charset=utf-8');

define("SESSION_END_URL", '[{"type":"message","content":"Disconnected","param":"info"}]');

require_once($_SERVER['DOCUMENT_ROOT'].'/core/securityheader.php');
require_once($_SERVER['DOCUMENT_ROOT'].'/core/class.easypdo.php');
require_once($_SERVER['DOCUMENT_ROOT'].'/includes/functions.php');
require_once($_SERVER['DOCUMENT_ROOT'].'/core/class.freturn.php');

$fReturn = new fReturn();

if(isset($_POST['files_hash']))
{
	$ids = json_decode($_POST['files_hash'], true); // true pour obtenir un tableau associatif
	
	if(json_last_error() === JSON_ERROR_NONE)
	{
		$EasyPDO = new EasyPDO($_SESSION['DB']);
		$EasyPDO->addFields('*');
		$result = $EasyPDO->selectIN('photos', 'id', $ids);

		$mem['tag_continent']=null;
		$mem['tag_country']=null;
		$mem['tag_city']=null;
		$mem['tag_place']=null;
		
		$mem['tag_activity']=null;
		$mem['tag_comment']=null;
		$mem['tag_people']=null;
		$mem['tag_other']=null;
		
		$flag['tag_continent']=0;
		$flag['tag_country']=0;
		$flag['tag_city']=0;
		$flag['tag_place']=0;
		
		$flag['tag_activity']=0;
		$flag['tag_comment']=0;
		$flag['tag_people']=0;
		$flag['tag_other']=0;

		foreach($result as $key => $value)
		{
			if($value['tag_continent']===null) 	$mem['tag_continent']=$value['tag_continent'];
			if($value['tag_country']===null) 	$mem['tag_country']=$value['tag_country'];
			if($value['tag_city']===null) 		$mem['tag_city']=$value['tag_city'];
			if($value['tag_place']===null) 		$mem['tag_place']=$value['tag_place'];
			
			if($value['tag_activity']===null) 	$mem['tag_activity']=$value['tag_activity'];
			if($value['tag_comment']===null) 	$mem['tag_comment']=$value['tag_comment'];
			if($value['tag_people']===null) 	$mem['tag_people']=$value['tag_people'];
			if($value['tag_other']===null) 		$mem['tag_other']=$value['tag_other'];

			if($mem['tag_continent']!=$value['tag_continent']) $flag['tag_continent']++;
			if($mem['tag_country']!=$value['tag_country']) $flag['tag_country']++;
			if($mem['tag_city']!=$value['tag_city']) $flag['tag_city']++;
			if($mem['tag_place']!=$value['tag_place']) $flag['tag_place']++;
			
			if($mem['tag_activity']!=$value['tag_activity']) $flag['tag_activity']++;
			if($mem['tag_comment']!=$value['tag_comment']) $flag['tag_comment']++;
			if($mem['tag_people']!=$value['tag_people']) $flag['tag_people']++;
			if($mem['tag_other']!=$value['tag_other'])	 $flag['tag_other']++;	
		}
		
		$bigarray['flag']=$flag;
		$bigarray['value']=$mem;
		
		$fReturn->addSuccessMessage("Fetched")->addCallBack("g_edit_treat_data", $bigarray)->fetch();
		
	}
}

$fReturn->addFailMessage("Internal error")->fetch();


/*
echo json_encode([
	"status" => "ok"
]);
*/
?>