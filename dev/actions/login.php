<?php

header('Location: ../index.php');

define("SESSION_TOKEN", "no-mandatory-session");
require_once($_SERVER['DOCUMENT_ROOT'].'/core/securityheader.php');
require_once($_SERVER['DOCUMENT_ROOT'].'/core/class.easypdo.php');

$structureversion=1;

create_session();
$_SESSION["USER"] = hash('sha256', "eliott.trotebas@gmail.com" . "salt_to_generate");
$_SESSION["DB"] = 'sqlite:'.$_SERVER['DOCUMENT_ROOT'].'/multimedia/'.$_SESSION["USER"].'.'.$structureversion.'.db';


$EasyPDO = new EasyPDO($_SESSION['DB']);

//iniitalize

if (!file_exists($_SERVER['DOCUMENT_ROOT'].'/multimedia/'.$_SESSION["USER"])) {
    mkdir($_SERVER['DOCUMENT_ROOT'].'/multimedia/'.$_SESSION["USER"], 0777, true); // Le 3ème paramètre `true` permet de créer les répertoires parents si nécessaire
}

if (!file_exists($_SERVER['DOCUMENT_ROOT'].'/multimedia/'.$_SESSION["USER"].'/trash')) {
    mkdir($_SERVER['DOCUMENT_ROOT'].'/multimedia/'.$_SESSION["USER"].'/trash', 0777, true); // Le 3ème paramètre `true` permet de créer les répertoires parents si nécessaire
}

//file_status 0 = normal
//file_status 1 = archived
//file_status 2 = trashed

$EasyPDO->execbdd("CREATE TABLE IF NOT EXISTS photos (
  id INTEGER PRIMARY KEY,
  file_original_name TEXT UNIQUE,
  file_orientation INTEGER DEFAULT 0,
  file_hash TEXT,
  file_status INTEGER DEFAULT 0,
  file_size INTEGER DEFAULT 0,
  file_type INTERGER DEFAULT 0,
  
  time_added_at TEXT,
  time_taken_at TEXT,
  time_status TEXT,
  
  tag_status INTEGER DEFAULT 0,
  tag_continent TEXT,
  tag_country TEXT,
  tag_city TEXT,
  tag_place TEXT,
  tag_activity TEXT,
  tag_comment TEXT,
  tag_people TEXT,
  tag_other TEXT)");

?>