#!/usr/local/bin/php
<?php

	$moulin_lang	= "fr";
	$moulin_proj	= "encyclopedia";
	$master_proj	= "encyclopedia";
	$rtl			= false;
	$namespace		= array('id' => 0, 'name' => '');
//	$block_size		= 10485760;
	
	require $moulin_lang . '_common.php';

	array_push($INCLUDED_NS, array('raw' => "Portail", 'url' => "Portail", 'ns' => 'portal'));
	array_push($INCLUDED_NS, array('raw' => "Référence", 'url' => "R%C3%A9f%C3%A9rence", 'ns' => 'reference'));

	array_push($EXCLUDED_NS, array('raw' => "Discussion Portail", 'url' => "Discussion_Portail"));
	array_push($EXCLUDED_NS, array('raw' => "Projet", 'url' => "Projet"));
	array_push($EXCLUDED_NS, array('raw' => "Discussion Projet", 'url' => "Discussion_Projet"));
	array_push($EXCLUDED_NS, array('raw' => "Discussion Référence", 'url' => "Discussion_R%C3%A9f%C3%A9rence"));

	include '../crawler.php';

?>
