<?php

define("NO_MANDATORY_SESSION","set");

require_once($_SERVER['DOCUMENT_ROOT'].'/core/securityheader.php');

$filename=$_SERVER['DOCUMENT_ROOT'].'/includes/401.webp';

if(defined('SESSION_VALID') AND isset($_GET['hash']))
{
	require_once($_SERVER['DOCUMENT_ROOT'].'/core/class.easypdo.php');
	require_once($_SERVER['DOCUMENT_ROOT'].'/includes/functions.php');

	$EasyPDO = new EasyPDO($_SESSION['DB']);

	$EasyPDO->addFields('file_original_name');
	$EasyPDO->addConditionalData('hash',$_GET['hash']);
	$array_files=$EasyPDO->select('photos', 'file_hash=:hash');
	
	$filenametest = $full_dir . $array_files[0]['file_original_name'];
	
	if ($filenametest && file_exists($filenametest)) 
	{
		$filename=$filenametest;
	}

}

header('Content-Type: ' . mime_content_type($filename));
readfile($filename);
?>