<?php

if(!isset($_GET['noredirect'])) header('Location: ../index.php');

define("SESSION_TOKEN", "no-mandatory-session");
require_once($_SERVER['DOCUMENT_ROOT'].'/core/securityheader.php');

destroy_session();

echo "ok";

?>