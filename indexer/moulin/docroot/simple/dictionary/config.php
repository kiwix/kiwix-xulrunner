<?php

$wgSitename         = "Wiktionary";

## The URL base path to the directory containing the wiki;
## defaults for all runtime URL paths are based off of this.
$wgScriptPath       = "/wiki";
if ($_ENV['CRAWLER'])
    $wgArticlePath      = "moulin://dictionary/simple/$1";
else
    $wgArticlePath      = "/simple/dictionary/index.php/$1";

$wgDBname           = "simple_dictionary";
$wgDBuser           = "root";
$wgDBpassword       = "";

$wgLanguageCode = "simple";

// only for dictionary
$wgCapitalLinks = false;

$wgUploadDirectory	= "./images/simple";
$wgUploadPath		= "/wiki/images/simple";
$wgMathPath         = $wgUploadPath;
$wgMathDirectory    = $wgUploadDirectory;
$wgTmpDirectory     = $wgUploadDirectory;

?>
