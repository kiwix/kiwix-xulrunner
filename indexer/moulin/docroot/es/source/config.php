<?php

$wgSitename         = "Wikisource";
$wgLanguageCode		= "es";

## The URL base path to the directory containing the wiki;
## defaults for all runtime URL paths are based off of this.
$wgScriptPath       = "/wiki";
if ($_ENV['CRAWLER'])
    $wgArticlePath      = "moulin://source/".$wgLanguageCode."/$1";
else
    $wgArticlePath      = "/".$wgLanguageCode."/source/index.php/$1";

$wgDBname           = "reg_".$wgLanguageCode."_source";
$wgDBuser           = "reg";
$wgDBpassword       = "reg";

$wgUploadDirectory	= "./images/".$wgLanguageCode;
$wgUploadPath		= "/wiki/images/".$wgLanguageCode;
$wgMathPath         = $wgUploadPath;
$wgMathDirectory    = $wgUploadDirectory;
$wgTmpDirectory     = $wgUploadDirectory;

?>
