
# 
LOCALIZED_STRINGS = {
    :NSCategory => {:raw => "Categoría", :url => "Categor%C3%ADa"},
	:NSImage	=> {:raw => "Imagen", :url => "Imagen"},
	:NSPortal	=> {:raw => "Portal", :url => "Portal"},
	:NSAppendix	=> {:raw => "Anexo", :url => "Anexo"},
    }

# only projects-wide NS to include
INCLUDED_NS = [
	{:raw => "Categoría", :url => "Categor%C3%ADa", :ns => "category"},
]

# transform external links to other projects to internal links
INCLUDED_PROJECTS = [
{:url => "http://es.wikipedia.org/wiki/Categoría:", :internal => "moulin://encyclopedia-category/es/"},
{:url => "http://es.wikipedia.org/wiki/Portal:", :internal => "moulin://encyclopedia-portal/es/"},
{:url => "http://es.wikipedia.org/wiki/Anexo:", :internal => "moulin://encyclopedia-appendix/es/"},
{:url => "http://es.wikipedia.org/wiki/", :internal => "moulin://encyclopedia/es/"},
{:url => "http://es.wikibooks.org/wiki/Categoría:", :internal => "moulin://books-category/es/"},
{:url => "http://es.wikibooks.org/wiki/", :internal => "moulin://books/es/"},
{:url => "http://es.wikiquote.org/wiki/Categoría:", :internal => "moulin://quote-category/es/"},
{:url => "http://es.wikiquote.org/wiki/", :internal => "moulin://quote/es/"},
{:url => "http://es.wiktionary.org/wiki/Categoría:", :internal => "moulin://dictionary-category/es/"},
{:url => "http://es.wiktionary.org/wiki/", :internal => "moulin://dictionary/es/"},
{:url => "http://es.wikisource.org/wiki/Categoría:", :internal => "moulin://source-category/es/"},
{:url => "http://es.wikisource.org/wiki/", :internal => "moulin://source/es/"},
{:url => "http://es.wikiversity.org/wiki/Categoría:", :internal => "moulin://university-category/es/"},
{:url => "http://es.wikiversity.org/wiki/", :internal => "moulin://university/es/"}
]

EXCLUDED_NS = [
{:raw => "Media", :url => "Media"},	#MEDIA
{:raw => "Especial", :url => "Especial"},	#SPECIAL	
{:raw => "Discusión", :url => "Discusi%C3%B3n"},	#TALK
{:raw => "Usuario", :url => "Usuario"},	#USER
{:raw => "Usuario Discusión", :url => "Usuario_Discusi%C3%B3n"},	#USER_TALK
{:raw => "Wikipedia", :url => "Wikipedia"},	#encyclopedia
{:raw => "Wikipedia Discusión", :url => "Wikipedia_Discusi%C3%B3n"},	#encyclopedia_TALK
{:raw => "Wikilibros", :url => "Wikilibros"},	#books
{:raw => "Wikilibros Discusión", :url => "Wikilibros_Discusi%C3%B3n"},	#books_TALK
{:raw => "Wikcionario", :url => "Wikcionario"},	#dictionary
{:raw => "Wikcionario Discusión", :url => "Wikcionario_Discusi%C3%B3n"},	#dictionary_TALK
{:raw => "Wikiquote", :url => "Wikiquote"},	#quote
{:raw => "Wikiquote Discusión", :url => "Wikiquote_Discusi%C3%B3n"},	#quote_TALK
{:raw => "Wikisource", :url => "Wikisource"},	#quote
{:raw => "Wikisource Discusión", :url => "Wikisource_Discusi%C3%B3n"},	#source_TALK
{:raw => "Wikiversidad", :url => "Wikiversidad"},	#quote
{:raw => "Wikiversidad Discusión", :url => "Wikiversidad_Discusi%C3%B3n"},	#source_TALK
{:raw => "Imagen", :url => "Imagen"},	#IMAGE
{:raw => "Imagen Discusión", :url => "Image_Discusi%C3%B3n"},	#IMAGE_TALK
{:raw => "MediaWiki", :url => "MediaWiki"},	#MEDIAWIKI
{:raw => "MediaWiki Discusión", :url => "MediaWiki_Discusi%C3%B3n"},	#MEDIAWIKI_TALK
{:raw => "Plantilla", :url => "Plantilla"},	#TEMPLATE
{:raw => "Plantilla Discusión", :url => "Plantilla_Discusi%C3%B3n"},	#TEMPLATE_TALK 
{:raw => "Ayuda", :url => "Ayuda"},	#HELP
{:raw => "Ayuda Discusión", :url => "Ayuda_Discusi%C3%B3n"},	#HELP_TALK 
{:raw => "Categoría Discusión", :url => "Categor%C3%ADa_Discusi%C3%B3n"},	#CATEGORY_TALK

{:raw => "Wikiproyecto", :url => "Wikiproyecto"},	#WIKIPEDIA ES PROYECTO
{:raw => "Wikiproyecto Discusión", :url => "Wikiproyecto_Discusi%C3%B3n"},	#PROYECTO_TALK 

{:raw => "Wikiversidad", :url => "Wikiversidad"},	#WIKIBOOKS ES WIKIVERSIDAD
{:raw => "Wikiversidad Discusión", :url => "Wikiversidad_Discusi%C3%B3n"}	#WIKIVERSIDAD_TALK
]

