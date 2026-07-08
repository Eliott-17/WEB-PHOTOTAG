<?php

define("SESSION_TOKEN", "no-mandatory-session");
require_once($_SERVER['DOCUMENT_ROOT'].'/core/securityheader.php');
require_once($_SERVER['DOCUMENT_ROOT'].'/core/class.validation.php');

$errorlink=$_SERVER['DOCUMENT_ROOT'].'/includes/401.webp';
$filename=$errorlink;
$debug=false;

$validation = new Validation();

$validation->addVerification('hash','sha256','hash');	
$validation->addVerification('type','string','type',2,3);
$validation->addVerification('time','string','time',0,14);

$validation->Validate(true);

if($debug)
{
	echo $validation->Message();
	echo print_r($_GET,true);
}

if(is_session_valid() AND $validation->isValidated())
{
	require_once($_SERVER['DOCUMENT_ROOT'].'/includes/functions.php');
	
	if(!empty($_GET['time']))
	{	
		$full_dir.='trash/'.$_GET['time'].'_';
	}
	
	if($_GET['type']=="sd")
	{
		$path=$full_dir.$_GET['hash'].".webp";
		
		if (file_exists($path)) $filename = $path;
	}
	
	if($debug) echo $path;
	
	if($_GET['type']=="hd")
	{	
		require_once($_SERVER['DOCUMENT_ROOT'].'/core/class.easypdo.php');

		$EasyPDO = new EasyPDO($_SESSION['DB']);

		$EasyPDO->addFields('file_original_name');
		$EasyPDO->addConditionalData('hash',$_GET['hash']);
		$array_files=$EasyPDO->select('photos', 'file_hash=:hash');
		
		if($array_files['status']===true)
		{
			$filenametest = $full_dir.$array_files['datas'][0]['file_original_name'];
			
			if ($filenametest && file_exists($filenametest)) 
			{
				$filename=$filenametest;
			}
		}		
	}
}


if($debug)
{
	echo $filename;
}
else
{
	if($filename!=$errorlink)
	{
		header("Cache-Control: public, max-age=86400, immutable");
		header("Expires: " . gmdate("D, d M Y H:i:s", time()+86400) . " GMT");
	}

	header('Content-Type: ' . mime_content_type($filename));
	readfile($filename);
}

?>