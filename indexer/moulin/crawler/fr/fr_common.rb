
LOCALIZED_STRINGS = {
    :NSCategory => {:raw => "Catégorie", :url => "Cat%C3%A9gorie"},
	:NSImage	=> {:raw => "Image", :url => "Image"},
	:NSPortal	=> {:raw => "Portail", :url => "Portail"},
	:NSAppendix	=> {:raw => "Référence", :url => "R%C3%A9f%C3%A9rence"},
    }


# only projects-wide NS to include
INCLUDED_NS = [
	{:raw => "Catégorie", :url => "Cat%C3%A9gorie", :ns => "category"},
]

# transform external links to other projects to internal links
INCLUDED_PROJECTS = [
{:url => "http://fr.wikipedia.org/wiki/Catégorie:", :internal => "moulin://encyclopedia-category/fr/"},
{:url => "http://fr.wikipedia.org/wiki/Portail:", :internal => "moulin://encyclopedia-portal/fr/"},
{:url => "http://fr.wikipedia.org/wiki/Référence:", :internal => "moulin://encyclopedia-appendix/fr/"},
{:url => "http://fr.wikipedia.org/wiki/", :internal => "moulin://encyclopedia/fr/"},
{:url => "http://fr.wiktionary.org/wiki/Catégorie:", :internal => "moulin://dictionary-category/fr/"},
{:url => "http://fr.wiktionary.org/wiki/Annexe:", :internal => "moulin://dictionary-appendix/fr/"},
{:url => "http://fr.wiktionary.org/wiki/Portail:", :internal => "moulin://dictionary-portal/fr/"},
{:url => "http://fr.wiktionary.org/wiki/", :internal => "moulin://dictionary/fr/"},
{:url => "http://fr.wikibooks.org/wiki/Catégorie:", :internal => "moulin://books-category/fr/"},
{:url => "http://fr.wikibooks.org/wiki/", :internal => "moulin://books/fr/"},
{:url => "http://fr.wikiquote.org/wiki/Catégorie:", :internal => "moulin://quote-category/fr/"},
{:url => "http://fr.wikiquote.org/wiki/Référence:", :internal => "moulin://quote-reference/fr/"},
{:url => "http://fr.wikiquote.org/wiki/", :internal => "moulin://quote/fr/"},
{:url => "http://fr.wikisource.org/wiki/Catégorie:", :internal => "moulin://source-category/fr/"},
{:url => "http://fr.wikisource.org/wiki/", :internal => "moulin://source/fr/"},
{:url => "http://fr.wikiversity.org/wiki/Catégorie:", :internal => "moulin://university-category/fr/"},
{:url => "http://fr.wikiversity.org/wiki/Faculté:", :internal => "moulin://university-faculty/fr/"},
{:url => "http://fr.wikiversity.org/wiki/Département:", :internal => "moulin://university-department/fr/"},
{:url => "http://fr.wikiversity.org/wiki/", :internal => "moulin://university/fr/"}
]

EXCLUDED_NS = [
{:raw => "Media", :url => "Media"},	#MEDIA
{:raw => "Special", :url => "Special"},	#SPECIAL	
{:raw => "Discuter", :url => "Discuter"},	#TALK
{:raw => "Utilisateur", :url => "Utilisateur"},	#USER
{:raw => "Discussion Utilisateur", :url => "Discussion_Utilisateur"},	#USER_TALK
{:raw => "Wikipédia", :url => "Wikip%C3%A9dia"},	#encyclopedia
{:raw => "Discussion Wikipédia", :url => "Discussion_Wikip%C3%A9dia"},	#encyclopedia_TALK

{:raw => "Wiktionnaire", :url => "Wiktionnaire"},	#dictionary
{:raw => "Discussion Wiktionnaire", :url => "Discussion_Wiktionnaire"},	#dictionary_TALK
{:raw => "Wikilivres", :url => "Wikilivres"},	#books
{:raw => "Discussion Wikilivres", :url => "Discussion_Wikilivres"},	#books_TALK
{:raw => "Wikiquote", :url => "Wikiquote"},	#quote
{:raw => "Discussion Wikiquote", :url => "Discussion_Wikiquote"},	#quote_TALK
{:raw => "Wikisource", :url => "Wikisource"},	#source
{:raw => "Discussion Wikisource", :url => "Discussion_Wikisource"},	#source_TALK
{:raw => "Wikiversité", :url => "Wikiversit%C3%A9"},	#quote
{:raw => "Discussion Wikiversité", :url => "Discussion_Wikiversit%C3%A9"},	#source_TALK

{:raw => "Image", :url => "Image"},	#IMAGE
{:raw => "Discussion Image", :url => "Discussion_Image"},	#IMAGE_TALK
{:raw => "MediaWiki", :url => "MediaWiki"},	#MEDIAWIKI
{:raw => "Discussion MediaWiki", :url => "Discussion MediaWiki"},	#MEDIAWIKI_TALK
{:raw => "Modèle", :url => "Mod%C3%A8le"},	#TEMPLATE
{:raw => "Discussion Modèle", :url => "Discussion_Mod%C3%A8le"},	#TEMPLATE_TALK 
{:raw => "Aide", :url => "Aide"},	#HELP
{:raw => "Discussion Aide", :url => "Discussion_Aide"},	#HELP_TALK 
{:raw => "Discussion Catégorie", :url => "Discussion_Cat%C3%A9gorie"},	#CATEGORY_TALK
]

