<?php

define("SESSION_MAX_LIFE_ID", 600); //10 minute
define("SESSION_MAX_LIFE_INACTIVE", 60*60*24*15); //15 jours
define("ContentSecurityPolicy","default-src 'self'; script-src 'self' 'unsafe-eval'; worker-src 'self' blob:; style-src 'self'; img-src 'self' data: blob:; media-src 'self' blob: data:;");

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