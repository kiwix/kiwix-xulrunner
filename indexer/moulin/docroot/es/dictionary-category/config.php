<?php

$wgSitename         = "Wikcionario";
$wgLanguageCode		= "es";

## The URL base path to the directory containing the wiki;
## defaults for all runtime URL paths are based off of this.
$wgScriptPath       = "/wiki";
if ($_ENV['CRAWLER'])
    $wgArticlePath      = "moulin://dictionary/".$wgLanguageCode."/$1";
else
    $wgArticlePath      = "/".$wgLanguageCode."/dictionary/index.php/$1";

$wgDBname           = "reg_".$wgLanguageCode."_dictionary";
$wgDBuser           = "reg";
$wgDBpassword       = "reg";

$wgUploadDirectory	= "./images/".$wgLanguageCode;
$wgUploadPath		= "/wiki/images/".$wgLanguageCode;
$wgMathPath         = $wgUploadPath;
$wgMathDirectory    = $wgUploadDirectory;
$wgTmpDirectory     = $wgUploadDirectory;

// only for dictionary
$wgCapitalLinks = false;

?>
