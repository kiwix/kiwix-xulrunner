<?php

$_SERVER['SERVER_NAME'] = "pumbaa"; //"172.16.96.128"; //"pumbaa";
$_SERVER['REMOTE_ADDR'] = "127.0.0.1";
//$argv[1] = "/tmp/test";
//$_ENV['CRAWLER'] = "y";
//$_ENV['MLLANG'] = "fa";
//$_ENV['MLPROJECT'] = "encyclopedia";
$_SERVER['PATH_INFO'] = "/" . trim(file_get_contents( $argv[1] ));
//$_SERVER['PATH_INFO'] .= "&redirect=no";
$_GET['redirect'] = "no";
//print $_SERVER['PATH_INFO'];
$moulinLANG = $_ENV['MLLANG']."/".$_ENV['MLPROJECT'];
include '../'.$moulinLANG.'/config.php';
include 'index.php';

?>
