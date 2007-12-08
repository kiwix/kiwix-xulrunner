<?php

$wgSitename         = "Wikiquote";

## The URL base path to the directory containing the wiki;
## defaults for all runtime URL paths are based off of this.
$wgScriptPath       = "/wiki";
if ($_ENV['CRAWLER'])
    $wgArticlePath      = "moulin://quote/simple/$1";
else
    $wgArticlePath      = "/simple/quote-category/index.php/$1";

$wgDBname           = "simple_quote";
$wgDBuser           = "root";
$wgDBpassword       = "";

$wgLanguageCode = "simple";

$wgUploadDirectory	= "./images/simple";
$wgUploadPath		= "/wiki/images/simple";
$wgMathPath         = $wgUploadPath;
$wgMathDirectory    = $wgUploadDirectory;
$wgTmpDirectory     = $wgUploadDirectory;

?>
