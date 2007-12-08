<?php

$wgSitename         = "Wikipedia";

## The URL base path to the directory containing the wiki;
## defaults for all runtime URL paths are based off of this.
$wgScriptPath       = "/wiki";
if (isset($_ENV['CRAWLER']))
    $wgArticlePath      = "moulin://encyclopedia/simple/$1";
else
    $wgArticlePath      = "/simple/encyclopedia/index.php/$1";

$wgDBname           = "simple_encyclopedia";
$wgDBuser           = "root";
$wgDBpassword       = "";

$wgLanguageCode = "simple";

$wgUploadDirectory	= "./images/simple";
$wgUploadPath		= "/wiki/images/simple";
$wgMathPath         = $wgUploadPath;
$wgMathDirectory    = $wgUploadDirectory;
$wgTmpDirectory     = $wgUploadDirectory;

?>
