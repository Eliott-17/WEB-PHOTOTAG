<?php

header('Content-Type: application/json; charset=utf-8');

define("SESSION_END_URL", json_encode(["status" => "empty","message" => "Disconnected"]));

require_once($_SERVER['DOCUMENT_ROOT'].'/core/securityheader.php');
require_once($_SERVER['DOCUMENT_ROOT'].'/core/class.easypdo.php');
require_once($_SERVER['DOCUMENT_ROOT'].'/includes/functions.php');

$EasyPDO = new EasyPDO($_SESSION['DB']);

$private_access=TRUE;//true accès utilisateur propriétaire uniquement

$array_file=[];
$array_lib=[];
$array_untaged=[];

if(isset($_GET['hash']))
{
	$EasyPDO->addFields('*');
	$EasyPDO->addConditionalData('hash',$_GET['hash']);
	$array_file=$EasyPDO->select('photos', 'file_hash=:hash');
	
	// Parcourir chaque ligne du résultat
	foreach ($array_file as &$file) {
		// Ajouter la clé 'exif' à chaque ligne
		$file['exif'] = getExifData($full_dir . $file['file_original_name']);
		/*$file['time_friendly'] = formatDateTime($file['time_taken_at']);*/
	}
	unset($file); // Important : rompre la référence après la boucle
}	
else
{
	$EasyPDO->addFields('file_hash');
	$EasyPDO->addFields('time_taken_at');
	$EasyPDO->addFields('file_orientation');

	$array_lib=$EasyPDO->select('photos', 'tag_status = 1 AND time_taken_at != "00000000+0000000000" ORDER BY time_taken_at DESC');

	$EasyPDO->addFields('file_hash');
	$EasyPDO->addFields('time_taken_at');
	$EasyPDO->addFields('file_orientation');

	$array_untaged=$EasyPDO->select('photos', 'tag_status = 0 OR time_taken_at = "00000000+0000000000" ORDER BY time_taken_at DESC, id ASC');
}

echo json_encode([
	"status" => "ok",
	"file" => $array_file,
	"library" => $array_lib,
	"untagged" => $array_untaged,
	"dir" => $_SESSION["USER"]
]);
