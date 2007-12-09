
# 
LOCALIZED_STRINGS = {
    :NSCategory => {:raw => "Category", :url => "Category"},
	:NSImage	=> {:raw => "Image", :url => "Image"}
    }

# transform external links to other projects to internal links
INCLUDED_PROJECTS = [
{:url => "http://simple.wikipedia.org/wiki/Category:", :internal => "moulin://encyclopedia-category/simple/"},
{:url => "http://simple.wikipedia.org/wiki/", :internal => "moulin://encyclopedia/simple/"},
{:url => "http://simple.wikibooks.org/wiki/Category:", :internal => "moulin://books-category/simple/"},
{:url => "http://simple.wikibooks.org/wiki/", :internal => "moulin://books/simple/"},
{:url => "http://simple.wikiquote.org/wiki/Category:", :internal => "moulin://quote-category/simple/"},
{:url => "http://simple.wikiquote.org/wiki/", :internal => "moulin://quote/simple/"},
{:url => "http://simple.wiktionary.org/wiki/Category:", :internal => "moulin://dictionary-category/simple/"},
{:url => "http://simple.wiktionary.org/wiki/", :internal => "moulin://dictionary/simple/"}
]

EXCLUDED_NS = [
{:raw => "Media", :url => "Media"},	#MEDIA
{:raw => "Special", :url => "Special"},	#SPECIAL	
{:raw => "Talk", :url => "Talk"},	#TALK
{:raw => "User", :url => "User"},	#USER
{:raw => "User talk", :url => "User talk"},	#USER_TALK
{:raw => "Wikipedia", :url => "Wikipedia"},	#encyclopedia
{:raw => "Wikipedia talk", :url => "Wikipedia talk"},	#encyclopedia_TALK
{:raw => "Wikibooks", :url => "Wikibooks"},	#books
{:raw => "Wikibooks talk", :url => "Wikibooks talk"},	#books_TALK
{:raw => "Wiktionary", :url => "Wiktionary"},	#dictionary
{:raw => "Wiktionary talk", :url => "Wiktionary talk"},	#dictionary_TALK
{:raw => "Wikiquote", :url => "Wikiquote"},	#quote
{:raw => "Wikiquote talk", :url => "Wikiquote talk"},	#quote_TALK
{:raw => "Image", :url => "Image"},	#IMAGE
{:raw => "Image talk", :url => "Image talk"},	#IMAGE_TALK
{:raw => "MediaWiki", :url => "MediaWiki"},	#MEDIAWIKI
{:raw => "MediaWiki talk", :url => "MediaWiki talk"},	#MEDIAWIKI_TALK
{:raw => "Template", :url => "Template"},	#TEMPLATE
{:raw => "Template talk", :url => "Template talk"},	#TEMPLATE_TALK 
{:raw => "Help", :url => "Help"},	#HELP
{:raw => "Help talk", :url => "Help talk"},	#HELP_TALK 
{:raw => "Category talk", :url => "Category talk"}	#CATEGORY_TALK
]

