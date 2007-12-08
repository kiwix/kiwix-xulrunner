<?php

$wgSitename         = "ویکی‌پدی";

## The URL base path to the directory containing the wiki;
## defaults for all runtime URL paths are based off of this.
$wgScriptPath       = "/wiki";
if ($_ENV['CRAWLER'])
    $wgArticlePath      = "moulin://books/fa/$1";
else
    $wgArticlePath      = "/fa/books-category/index.php/$1";

$wgDBname           = "fa_books";
$wgDBuser           = "root";
$wgDBpassword       = "";

$wgLanguageCode = "fa";

?>
