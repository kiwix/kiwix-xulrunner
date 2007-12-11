
# 
LOCALIZED_STRINGS = {
    :NSCategory => {:raw => "Categoría", :url => "Categoría"},
	:NSImage	=> {:raw => "Imagen", :url => "Imagen"},
	:NSPortal	=> {:raw => "Portal", :url => "Portal"},
	:NSAppendix	=> {:raw => "Anexo", :url => "Anexo"},
    }

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
{:raw => "Special", :url => "Special"},	#SPECIAL	
{:raw => "Discusión", :url => "Discusión"},	#TALK
{:raw => "Usuario", :url => "Usuario"},	#USER
{:raw => "Usuario Discusión", :url => "Usuario Discusión"},	#USER_TALK
{:raw => "Wikipedia", :url => "Wikipedia"},	#encyclopedia
{:raw => "Wikipedia Discusión", :url => "Wikipedia Discusión"},	#encyclopedia_TALK
{:raw => "Wikilibros", :url => "Wikilibros"},	#books
{:raw => "Wikilibros Discusión", :url => "Wikilibros Discusión"},	#books_TALK
{:raw => "Wikcionario", :url => "Wikcionario"},	#dictionary
{:raw => "Wikcionario Discusión", :url => "Wikcionario Discusión"},	#dictionary_TALK
{:raw => "Wikiquote", :url => "Wikiquote"},	#quote
{:raw => "Wikiquote Discusión", :url => "Wikiquote Discusión"},	#quote_TALK
{:raw => "Wikisource", :url => "Wikisource"},	#quote
{:raw => "Wikisource Discusión", :url => "Wikisource Discusión"},	#source_TALK
{:raw => "Wikiversidad", :url => "Wikiversidad"},	#quote
{:raw => "Wikiversidad Discusión", :url => "Wikiversidad Discusión"},	#source_TALK
{:raw => "Imagen", :url => "Imagen"},	#IMAGE
{:raw => "Imagen Discusión", :url => "Image Discusión"},	#IMAGE_TALK
{:raw => "MediaWiki", :url => "MediaWiki"},	#MEDIAWIKI
{:raw => "MediaWiki Discusión", :url => "MediaWiki Discusión"},	#MEDIAWIKI_TALK
{:raw => "Plantilla", :url => "Plantilla"},	#TEMPLATE
{:raw => "Plantilla Discusión", :url => "Plantilla Discusión"},	#TEMPLATE_TALK 
{:raw => "Ayuda", :url => "Ayuda"},	#HELP
{:raw => "Ayuda Discusión", :url => "Ayuda Discusión"},	#HELP_TALK 
{:raw => "Categoría Discusión", :url => "Categoría Discusión"},	#CATEGORY_TALK

{:raw => "Wikiproyecto", :url => "Wikiproyecto"},	#WIKIPEDIA ES PROYECTO
{:raw => "Wikiproyecto Discusión", :url => "Wikiproyecto Discusión"},	#PROYECTO_TALK 

{:raw => "Wikiversidad", :url => "Wikiversidad"},	#WIKIBOOKS ES WIKIVERSIDAD
{:raw => "Wikiversidad Discusión", :url => "Wikiversidad Discusión"}	#WIKIVERSIDAD_TALK
]

