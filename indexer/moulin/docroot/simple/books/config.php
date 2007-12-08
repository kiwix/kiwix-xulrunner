<?php

$wgSitename         = "Wikibooks";

## The URL base path to the directory containing the wiki;
## defaults for all runtime URL paths are based off of this.
$wgScriptPath       = "/wiki";
if ($_ENV['CRAWLER'])
    $wgArticlePath      = "moulin://books/simple/$1";
else
    $wgArticlePath      = "/simple/books/index.php/$1";

$wgDBname           = "simple_books";
$wgDBuser           = "root";
$wgDBpassword       = "";

$wgLanguageCode = "simple";

$wgUploadDirectory	= "./images/simple";
$wgUploadPath		= "/wiki/images/simple";
$wgMathPath         = $wgUploadPath;
$wgMathDirectory    = $wgUploadDirectory;
$wgTmpDirectory     = $wgUploadDirectory;

?>
