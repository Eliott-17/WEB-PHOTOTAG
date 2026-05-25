<?php

define("SESSION_MAX_LIFE_ID", 600); //10 minute
define("SESSION_MAX_LIFE_INACTIVE", 60*60*24*15); //15 jours

if(stristr($_SERVER['DOCUMENT_ROOT'], 'dev')) //environement dev par aborescente répertoire
{
	define("ENV", "DEV");
	define("DIM", "max");
	define("ERR","On");
}

if(stristr($_SERVER['DOCUMENT_ROOT'], 'wamp64')) //sur wamp la bdd doit être locale
{
	define("BDD", "LOC");	
	if(!defined("ERR")) define("ERR","On");
}


?>