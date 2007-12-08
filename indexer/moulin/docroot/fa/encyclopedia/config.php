<?php

$wgSitename         = "ویکی‌پدی";

## The URL base path to the directory containing the wiki;
## defaults for all runtime URL paths are based off of this.
$wgScriptPath       = "/wiki";
if (isset($_ENV['CRAWLER']))
    $wgArticlePath      = "moulin://encyclopedia/fa/$1";
else
    $wgArticlePath      = "/fa/encyclopedia/index.php/$1";

$wgDBname           = "fa_encyclopedia";
$wgDBuser           = "root";
$wgDBpassword       = "";

$wgLanguageCode = "fa";

$wgUploadPath       = "$wgScriptPath/images/fa";
$wgUploadDirectory	= "$IP/images/fa";
$wgMathPath         = "$wgScriptPath/math";
$wgMathDirectory    = "$wgScriptPath/images/fa";
$wgTmpDirectory     = "$wgScriptPath/images/tmp";
$wgEnableUploads    = true; 



?>
