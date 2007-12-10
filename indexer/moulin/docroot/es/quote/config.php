<?php

$wgSitename         = "Wikiquote";
$wgLanguageCode		= "es";

## The URL base path to the directory containing the wiki;
## defaults for all runtime URL paths are based off of this.
$wgScriptPath       = "/wiki";
if ($_ENV['CRAWLER'])
    $wgArticlePath      = "moulin://quote/".$wgLanguageCode."/$1";
else
    $wgArticlePath      = "/".$wgLanguageCode."/quote/index.php/$1";

$wgDBname           = "reg_".$wgLanguageCode."_quote";
$wgDBuser           = "reg";
$wgDBpassword       = "reg";

$wgUploadDirectory	= "./images/".$wgLanguageCode;
$wgUploadPath		= "/wiki/images/".$wgLanguageCode;
$wgMathPath         = $wgUploadPath;
$wgMathDirectory    = $wgUploadDirectory;
$wgTmpDirectory     = $wgUploadDirectory;

?>
