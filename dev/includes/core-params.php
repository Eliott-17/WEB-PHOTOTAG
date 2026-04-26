<?php

define("SESSION_MAX_LIFE_ID", 15); //15 sec
define("SESSION_MAX_LIFE_INACTIVE", 900); //60*15 min =900 secondes

ini_set('session.use_strict_mode', 1);

if(stristr($_SERVER['DOCUMENT_ROOT'], 'dev')) //environement dev par aborescente répertoire
{
	define("ENV", "DEV");
	define("DIM", "max");
	error_reporting(E_ALL);
}

if(stristr($_SERVER['DOCUMENT_ROOT'], 'wamp64')) //sur wamp la bdd doit être locale
{
	define("BDD", "LOC");	
}

define("ERR", E_ALL);

?>