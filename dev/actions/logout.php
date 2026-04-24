<?php

if(!isset($_GET['noredirect'])) header('Location: ../index.php');

require_once($_SERVER['DOCUMENT_ROOT'].'/core/securityheader.php');

session_destroy();

echo "ok";

?>
