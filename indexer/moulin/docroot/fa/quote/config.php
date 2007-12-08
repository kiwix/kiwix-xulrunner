<?php

$wgSitename         = "ویکی‌گفتاو";

## The URL base path to the directory containing the wiki;
## defaults for all runtime URL paths are based off of this.
$wgScriptPath       = "/wiki";
if ($_ENV['CRAWLER'])
    $wgArticlePath      = "moulin://quote/fa/$1";
else
    $wgArticlePath      = "/fa/quote/index.php/$1";

$wgDBname           = "fa_quote";
$wgDBuser           = "root";
$wgDBpassword       = "";

$wgLanguageCode = "fa";

$wgUploadPath       = "$wgScriptPath/images/fa";
$wgUploadDirectory	= "$IP/images/fa";
$wgMathPath         = "$wgUploadPath/math";
$wgMathDirectory    = "$wgUploadDirectory/math";
$wgTmpDirectory     = "$wgUploadDirectory/tmp";
$wgEnableUploads    = true; 



?>
