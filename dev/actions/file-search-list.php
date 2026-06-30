<?php

	define("POST_LIMIT_RATE", 10);

	require_once($_SERVER['DOCUMENT_ROOT'].'/core/securityheader.php');
	require_once($_SERVER['DOCUMENT_ROOT'].'/core/class.easypdo.php');
	require_once($_SERVER['DOCUMENT_ROOT'].'/core/class.freturn.php');
	require_once($_SERVER['DOCUMENT_ROOT'].'/core/class.validation.php');
	require_once($_SERVER['DOCUMENT_ROOT'].'/includes/functions.php');
	require_once($_SERVER['DOCUMENT_ROOT'].'/includes/datas.php');

	$fReturn = new fReturn();
	$validation = new Validation();

	$validation->addVerification('token',				'sha256',			'Token');	
	$validation->addVerification('offset',				'int',				'Offset'			);	
	$validation->addVerification('tag',					'string',			'Tag',					4,100	);
	$validation->addVerification('value',				'string',			'Value',				0,100	);
	$validation->addVerification('tagslist',			'int_interval',		'Taglist incorrect',  	0,2		);	
	$validation->addVerification('filters',				'jsonArrayString',	'filters',  			);
	
	$validation->Validate(false,true);
	
	if(!$validation->isValidated())
	{
		if(ENV=="DEV") $fReturn->addConsole($validation->Message());
		$fReturn->fetch();
	}
	
	$EasyPDO = new EasyPDO($_SESSION['DB']);

	$EasyPDO->addFields('file_status');	
	$EasyPDO->addFields('file_hash');
	$EasyPDO->addFields('time_taken_at_date');
	$EasyPDO->addFields('time_taken_at_zone');
	$EasyPDO->addFields('time_taken_at_time');
	$EasyPDO->addFields('file_orientation');
	$EasyPDO->addFields('file_type');
	$EasyPDO->addFields('id');
	
	if($_GET['tagslist']>0)
	{
		$EasyPDO->addFields('tag_country');
		$EasyPDO->addFields('tag_city');
		$EasyPDO->addFields('tag_place');
		$EasyPDO->addFields('tag_activity');
		$EasyPDO->addFields('tag_comment');
		$EasyPDO->addFields('tag_people');
		$EasyPDO->addFields('tag_other');
	}
	
	$result['status']=false;
	$tagname="";
		
	switch($_POST['tag'])
	{
		case 'tag_country':
		
			$key = array_search($_POST['value'], $DATAS_country);

			if ($key === false) {
				$fReturn->addConsole("[PHP] Country value ".$_POST['value']." invalid");
				break;
			}
			else
			{
				$_POST['value']=$key;
			}
			
			$tagname="Pays";
		
		break;
				
		case 'tag_city': $tagname="City"; break;
		case 'tag_place': $tagname="Location"; break;
		case 'tag_activity': $tagname="Activity"; break;
		case 'tag_comment': $tagname="Comment"; break;
		case 'tag_people': $tagname="People"; break;
		case 'tag_other': $tagname="Information"; break;
		case 'years': $tagname='years'; break;
		default: 
			$fReturn->addConsole("[PHP] Tag ".$_POST['tag']." invalid");
		break;
	}
	
	if($_GET['tagslist']>0)
	{
		$limit = "";
	}
	else
	{
		$limit = " LIMIT 50 OFFSET:offset";
		$EasyPDO->addConditionalData('offset',$_GET['offset']);
	}

	//************************************************************
	//sub filters
	//************************************************************
	
	$addquery="";
	$queryParts = [];
	
	$filters_raw = $_POST['filters'] ?? '';

	$filters = json_decode($_POST['filters'] ?? '', true) ?: [];

	foreach ($filters as $key => $values) 
	{
		$i=0;
		$placeholders = [];
		
		foreach ((array)$values as $value)
		{
			if($key === 'months')
			{
				$value_int=(int)$value;
				
				if($value_int<=9) $value="0".$value;
			}
			
			$placeholders[] = ':' . $key . '_' . $i;
			//$fReturn->addConsole($key.'=>'.$value);
			$EasyPDO->addConditionalData($key . '_' . $i,$value);		
			$i++;
		}
		
		// -------------------------
		// mapping spécial date
		// -------------------------
		if ($key === 'years') {
			$column = "SUBSTR(time_taken_at_date,1,4)";
		}
		elseif ($key === 'months') {
			$column = "SUBSTR(time_taken_at_date,5,2)";
		}
		else {
			$column = $key;
		}
		
		$queryParts[] = '('.$column.' NOT IN (' . implode(',', $placeholders) . ') OR '.$column.' IS NULL)';	

	}
	
	// -------------------------
	// assemble WHERE
	// -------------------------

	if (!empty($queryParts)) {
		$addquery = ' AND '.implode(' AND ', $queryParts);
	}

	if(!empty($tagname))
	{
		if($_POST['tag']=='years')
		{
			$column='time_taken_at_date LIKE :value';
			$EasyPDO->addConditionalData('value',$_POST['value'].'%');
		}
		else
		{
			$column=$_POST['tag']. '=:value';
			$EasyPDO->addConditionalData('value',$_POST['value']);
		}
		
		$result=$EasyPDO->select('photos', 	$column.' AND
											time_taken_at_date != "00000000" AND
											time_taken_at_time != "000000" AND
											time_taken_at_zone != "00000" AND 
											tag_country IS NOT null AND tag_country != "UNK" AND 
											(
												tag_city IS NOT null
												OR tag_place IS NOT null
												OR tag_activity IS NOT null
											) AND
											file_status = 0'.$addquery.' ORDER BY 	
											time_taken_at_date DESC,
											time_taken_at_zone DESC, 
											time_taken_at_time DESC, 
											id ASC'.$limit);
	}
	else
	{
		$fReturn->addConsole("Empty tagname, not executed".$tagname)->fetch();
	}

	if($result['status']===true) 
	{
		
		if($_POST['tag']=='tag_country') 		$keywordsname=$DATAS_country[$_POST['value']];
		else if($_POST['tag']=='months')		$keywordsname=$DATAS_months[$_POST['value']];
		else 									$keywordsname=$_POST['value'];
		
		if($tagname=='years')					$tagname='';

		$tag['keywords']=$_POST['value'];
		$tag['tag']=$_POST['tag'];
		
		$tag['keywords']=$_POST['value'];
		$tag['tag']=$_POST['tag'];
		$tag['tagname']=$tagname;
		$tag['keywordsname']=$keywordsname;
		$tag['count']=count($result['datas']);

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
				
		if($_GET['tagslist']>0)
		{		
			//$fReturn->addConsole($result['datas']);
	
			$tag['tags']=retreive_sort_tags($result['datas'],$array_tags,$DATAS_country,$DATAS_months);	

			foreach ($result['datas'] as &$row) {
				$row['years'] = substr($row['time_taken_at_date'], 0, 4);
				$row['months'] = substr($row['time_taken_at_date'], 4, 2);			
			}
			unset($row);

			$return = array_slice($result['datas'], 0, 50);
			
			if($_GET['tagslist']==1) $fReturn->addCallBack("EXPLORE_search_CallBack", $tag);
			if($_GET['tagslist']==2) $fReturn->addCallBack("FILTERS_search_CallBack", $tag);			
		}
		else
		{
			$return = $result['datas'];
			
		}

		$fReturn->addCallBack("GRID_load_CallBack", array("datas"=>$return));		
	}
	else
	{
		if(ENV=="DEV") $fReturn->addConsole(print_r($result,true));
		$fReturn->addConsole("[PHP] SQL error while loading search");	
	}

	//$fReturn->addConsole(print_r($result,true));
	
	$fReturn->addConsole("[PHP EXECUTED] file-search-list.php");
	$fReturn->fetch();

?>