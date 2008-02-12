<?php

	$LOCALIZED_STRINGS	=	array (
		'NSCategory'	=>	array ( 'raw' => "Catégorie",	'url' => "Cat%C3%A9gorie" ),
		'NSImage'		=>	array ( 'raw' => "Image",		'url' => "Image" ),
		'NSPortal'		=>	array ( 'raw' => "Portail",		'url' => "Portail" ),
		'NSAppendix'	=>	array ( 'raw' => "Référence",	'url' => "R%C3%A9f%C3%A9rence" ),
	);

	# only projects-wide NS to include
	$INCLUDED_NS		=	array (
		array ( 'raw'	=>	"Catégorie", 'url' => "Cat%C3%A9gorie", 'ns'  => 'category'),
	);

	# transform external links to other projects to internal links
	$INCLUDED_PROJECTS	= array (
		array ( 'url'	=> "http://fr.wikipedia.org/wiki/Catégorie:",	'internal' => "moulin://encyclopedia-category/fr/"),
		array ( 'url'	=> "http://fr.wikipedia.org/wiki/Portail:",		'internal' => "moulin://encyclopedia-portal/fr/"),
		array ( 'url'	=> "http://fr.wikipedia.org/wiki/Référence:",	'internal' => "moulin://encyclopedia-appendix/fr/"),
		array ( 'url'	=> "http://fr.wikipedia.org/wiki/",				'internal' => "moulin://encyclopedia/fr/"),
		array ( 'url'	=> "http://fr.wiktionary.org/wiki/Catégorie:",	'internal' => "moulin://dictionary-category/fr/"),
		array ( 'url'	=> "http://fr.wiktionary.org/wiki/Annexe:",		'internal' => "moulin://dictionary-appendix/fr/"),
		array ( 'url'	=> "http://fr.wiktionary.org/wiki/Portail:",	'internal' => "moulin://dictionary-portal/fr/"),
		array ( 'url'	=> "http://fr.wiktionary.org/wiki/",			'internal' => "moulin://dictionary/fr/"),
		array ( 'url'	=> "http://fr.wikibooks.org/wiki/Catégorie:",	'internal' => "moulin://books-category/fr/"),
		array ( 'url'	=> "http://fr.wikibooks.org/wiki/",				'internal' => "moulin://books/fr/"),
		array ( 'url'	=> "http://fr.wikiquote.org/wiki/Catégorie:",	'internal' => "moulin://quote-category/fr/"),
		array ( 'url'	=> "http://fr.wikiquote.org/wiki/Référence:",	'internal' => "moulin://quote-reference/fr/"),
		array ( 'url'	=> "http://fr.wikiquote.org/wiki/",				'internal' => "moulin://quote/fr/"),
		array ( 'url'	=> "http://fr.wikisource.org/wiki/Catégorie:",	'internal' => "moulin://source-category/fr/"),
		array ( 'url'	=> "http://fr.wikisource.org/wiki/",			'internal' => "moulin://source/fr/"),
		array ( 'url'	=> "http://fr.wikiversity.org/wiki/Catégorie:",	'internal' => "moulin://university-category/fr/"),
		array ( 'url'	=> "http://fr.wikiversity.org/wiki/Faculté:",	'internal' => "moulin://university-faculty/fr/"),
		array ( 'url'	=> "http://fr.wikiversity.org/wiki/Département:",'internal'=> "moulin://university-department/fr/"),
		array ( 'url'	=> "http://fr.wikiversity.org/wiki/",			'internal' => "moulin://university/fr/"),
	);

	$EXCLUDED_NS		= array (
		array ( 'raw'	=>	"Media",					'url' => "Media"),
		array ( 'raw'	=>	"Special",					'url' => "Special"),
		array ( 'raw'	=>	"Discuter",					'url' => "Discuter"),
		array ( 'raw'	=>	"Utilisateur",				'url' => "Utilisateur"),
		array ( 'raw'	=>	"Discussion Utilisateur",	'url' => "Discussion_Utilisateur"),
		array ( 'raw'	=>	"Wikipédia",				'url' => "Wikip%C3%A9dia"),
		array ( 'raw'	=>	"Discussion Wikipédia",		'url' => "Discussion_Wikip%C3%A9dia"),
		array ( 'raw'	=>	"Wiktionnaire",				'url' => "Wiktionnaire"),
		array ( 'raw'	=>	"Discussion Wiktionnaire",	'url' => "Discussion_Wiktionnaire"),
		array ( 'raw'	=>	"Wikilivres",				'url' => "Wikilivres"),
		array ( 'raw'	=>	"Discussion Wikilivres",	'url' => "Discussion_Wikilivres"),
		array ( 'raw'	=>	"Wikiquote",				'url' => "Discussion_Wikiquote"),
		array ( 'raw'	=>	"Wikisource",				'url' => "Wikisource"),
		array ( 'raw'	=>	"Discussion Wikisource",	'url' => "Discussion_Wikisource"),
		array ( 'raw'	=>	"Wikiversité",				'url' => "Wikiversit%C3%A9"),
		array ( 'raw'	=>	"Discussion Wikiversité",	'url' => "Discussion_Wikiversit%C3%A9"),
//		array ( 'raw'	=>	"Image",					'url' => "Image"),
		array ( 'raw'	=>	"Discussion Image",			'url' => "Discussion_Image"),
		array ( 'raw'	=>	"MediaWiki",				'url' => "MediaWiki"),
		array ( 'raw'	=>	"Discussion MediaWiki",		'url' => "Discussion_MediaWiki"),
		array ( 'raw'	=>	"Modèle",					'url' => "Mod%C3%A8le"),
		array ( 'raw'	=>	"Discussion Modèle",		'url' => "Discussion_Mod%C3%A8le"),
		array ( 'raw'	=>	"Aide",						'url' => "Discussion_Aide"),
		array ( 'raw'	=>	"Discussion Aide",			'url' => "Discussion_Aide"),
		array ( 'raw'	=>	"Discussion Catégorie",		'url' => "Discussion_Cat%C3%A9gorie"),
	);

?>
