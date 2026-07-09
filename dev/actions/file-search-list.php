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
	$validation->addVerification('filters',				'jsonArrayString',	'lastchecked',  		);	
	$validation->Validate(false,true);
	
	if(!$validation->isValidated())
	{
		if(ENV=="DEV") $fReturn->addConsole($validation->Message());
		$fReturn->fetch();
	}
	
	$EasyPDO = new EasyPDO($_SESSION['DB']);

	$result_tags['status']=false;
	$result_data['status']=false;
	$result_count['status']=false;
	$tagname="";
	
	//************************************************************
	//Main filter
	//************************************************************
		
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
		case 'trash': 

			$EasyPDO->addFields('file_hash');
			$EasyPDO->addFields('file_original_name');	
			$EasyPDO->addFields('time_taken_at_date');
			$EasyPDO->addFields('time_taken_at_zone');
			$EasyPDO->addFields('time_taken_at_time');
			$EasyPDO->addFields('file_orientation');
			$EasyPDO->addFields('file_type');
			$EasyPDO->addFields('file_status');
			$EasyPDO->addFields('id');

			$finalquery='file_status = 2 ORDER BY time_taken_at_date DESC, time_taken_at_zone DESC, time_taken_at_time DESC, id ASC';

			$EasyPDO->addConditionalData('offset',$_GET['offset']);

			$result_data=$EasyPDO->select('photos', $finalquery." LIMIT 50 OFFSET:offset");

			if($result_data['status']!==true) 
			{
				if(ENV=="DEV") $fReturn->addConsole(print_r($result_data,true));
				$fReturn->addConsole("[PHP] SQL error while loading trash data");	
			}
			else
			{
				$EasyPDO->addFields('COUNT (*) as total');
				$array_cnt=$EasyPDO->select('photos', 'file_status = 2');			

				if($array_cnt['status']===true) 
				{
					$bigarray['count']=$array_cnt['datas'][0]['total'];
				}
				else
				{
					$bigarray['count']="UNK";
				}
				
				//$fReturn->addConsole(print_r($result_data['datas'],true));
				$return = $result_data['datas'];		
				$fReturn->addCallBack("GRID_load_CallBack", array("datas"=>$return));				
				$fReturn->addCallBack("FILTERS_trash_CallBack",$bigarray['count']);
			}
			
			$fReturn->fetch();

		break;
		default: 
			$fReturn->addConsole("[PHP] Tag ".$_POST['tag']." invalid")->fetch();		
		break;
	}

	//************************************************************
	//sub filters assemlby
	//************************************************************

	$addquery="";
	$queryParts = [];
	$queryValues = [];
	
	$filters_raw = $_POST['filters'] ?? '';
	$filters_count=[];

	$filters = json_decode($_POST['filters'] ?? '', true) ?: [];
	
	foreach ($filters as $key => $values) 
	{
		$i=0;
		$placeholders = [];
		
		$filters_count[$key]=count($values);
		
		foreach ((array)$values as $value)
		{
			if($key === 'months')
			{
				$value_int=(int)$value;
				
				if($value_int<=9) $value="0".$value;
			}
			
			$placeholders[] = ':' . $key . '_' . $i;
			$queryValues[$key . '_' . $i]=$value;
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

	//************************************************************
	//query assembly
	//************************************************************

	if (!empty($queryParts)) {
		$addquery = ' AND '.implode(' AND ', $queryParts);
	}

	if($_POST['tag']=='years') 	$column='time_taken_at_date LIKE :value';
	else 						$column=$_POST['tag']. '=:value';
	
	$finalquery=final_query_search($column,$addquery);
	
	//************************************************************
	//query result_tags
	//************************************************************
	
	//$fReturn->addConsole($finalquery);
	
	if($_GET['tagslist']>0)
	{
		local_conditionalldata_fill($EasyPDO,$_POST,$queryValues);
		
		$EasyPDO->addFields('file_hash');
		$EasyPDO->addFields('time_taken_at_date');
		$EasyPDO->addFields('tag_country');
		$EasyPDO->addFields('tag_city');
		$EasyPDO->addFields('tag_place');
		$EasyPDO->addFields('tag_activity');
		$EasyPDO->addFields('tag_comment');
		$EasyPDO->addFields('tag_people');
		$EasyPDO->addFields('tag_other');
	
		$result_tags=$EasyPDO->select('photos', $finalquery);
		
		if($result_tags['status']!==true)
		{
			if(ENV=="DEV") $fReturn->addConsole(print_r($result_tags,true));
			$fReturn->addConsole("[PHP] SQL error while loading tags")->fetch();	
		}
	}
		
	//************************************************************
	//query result_count
	//************************************************************

	local_conditionalldata_fill($EasyPDO,$_POST,$queryValues);
	
	$EasyPDO->addFields('COUNT (*) as total');

	$result_count=$EasyPDO->select('photos', $finalquery);

	if($result_count['status']!==true)
	{
		if(ENV=="DEV") $fReturn->addConsole(print_r($result_count,true));
		$fReturn->addConsole("[PHP] SQL error while loading count")->fetch();	
	}
	
	if($result_count['datas'][0]['total']>0)
	{	
		//************************************************************
		//query result_data
		//************************************************************

		local_conditionalldata_fill($EasyPDO,$_POST,$queryValues);
		
		$EasyPDO->addFields('file_hash');
		$EasyPDO->addFields('time_taken_at_date');
		$EasyPDO->addFields('time_taken_at_zone');
		$EasyPDO->addFields('time_taken_at_time');
		$EasyPDO->addFields('file_orientation');
		$EasyPDO->addFields('file_type');
		$EasyPDO->addFields('id');
		
		$EasyPDO->addConditionalData('offset',$_GET['offset']);

		$result_data=$EasyPDO->select('photos', $finalquery." LIMIT 50 OFFSET:offset");
	}
	else
	{
		$last_checked = json_decode($_POST['lastchecked'] ?? '', true) ?: [];
			
		if(count($last_checked)!=0)
		{		
			$key = array_key_first($last_checked);

			unset($filters[$key]);
			
			$search_for = array_key_first($filters);
			
			$EasyPDO->addFields($search_for);
			$EasyPDO->addConditionalData('key',$last_checked[$key]);

			$column=$key."=:key";
			
			$finalquery=final_query_search($column," GROUP BY ".$key);
						
			$result_adv=$EasyPDO->select('photos',$finalquery);
		
			if($result_adv['status']==true) 
			{
				foreach($result_adv['datas'] as $key => $value) $tag['recheck']=$value;
			}
		}
			
		$result_data['datas']=array();
		$result_data['status']=true;
	}
	
	//************************************************************
	//final merge
	//************************************************************

	if($result_data['status']!==true) 
	{
		if(ENV=="DEV") $fReturn->addConsole(print_r($result_data,true));
		$fReturn->addConsole("[PHP] SQL error while loading data");	
	}
	else
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
		$tag['count']=$result_count['datas'][0]['total'];
		
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
			$tag['tags']=retreive_sort_tags($result_tags['datas'],$array_tags,$DATAS_country,$DATAS_months);	

			foreach ($result_tags['datas'] as &$row) {
				$row['years'] = substr($row['time_taken_at_date'], 0, 4);
				$row['months'] = substr($row['time_taken_at_date'], 4, 2);			
			}
			unset($row);
			
			if($_GET['tagslist']==1) $fReturn->addCallBack("EXPLORE_search_CallBack", $tag);
			if($_GET['tagslist']==2) $fReturn->addCallBack("FILTERS_search_CallBack", $tag);			
		}

		$return = $result_data['datas'];	
		
		$fReturn->addCallBack("GRID_load_CallBack", array("datas"=>$return));		
	}

	$fReturn->addConsole("[PHP EXECUTED] file-search-list.php");
	$fReturn->fetch();

	
?>