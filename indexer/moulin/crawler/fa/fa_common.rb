
# 

LOCALIZED_STRINGS = {
    :NSCategory => {:raw => "رده", :url => "%D8%B1%D8%AF%D9%87"},
	:NSImage	=> {:raw => "تصویر", :url => "%D8%AA%D8%B5%D9%88%DB%8C%D8%B1"}
    }

# transform external links to other projects to internal links
INCLUDED_PROJECTS = [
{:url => "http://fa.wikipedia.org/wiki/%D8%B1%D8%AF%D9%87:", :internal => "moulin://encyclopedia-category/fa/"},
{:url => "http://fa.wikipedia.org/wiki/", :internal => "moulin://encyclopedia/fa/"},
{:url => "http://fa.wikibooks.org/wiki/%D8%B1%D8%AF%D9%87:", :internal => "moulin://books-category/fa/"},
{:url => "http://fa.wikibooks.org/wiki/", :internal => "moulin://books/fa/"},
{:url => "http://fa.wikiquote.org/wiki/%D8%B1%D8%AF%D9%87:", :internal => "moulin://quote-category/fa/"},
{:url => "http://fa.wikiquote.org/wiki/", :internal => "moulin://quote/fa/"},
{:url => "http://fa.wikisource.org/wiki/%D8%B1%D8%AF%D9%87:", :internal => "moulin://source-category/fa/"},
{:url => "http://fa.wiksource.org/wiki/", :internal => "moulin://source/fa/"}
]

EXCLUDED_NS = [
{:raw => "مدیا", :url => "%D9%85%D8%AF%DB%8C%D8%A7"},	#MEDIA
{:raw => "ویژه", :url => "%D9%88%DB%8C%DA%98%D9%87"},	#SPECIAL	
{:raw => "بحث", :url => "%D8%A8%D8%AD%D8%AB"},	#TALK
{:raw => "کاربر", :url => "%DA%A9%D8%A7%D8%B1%D8%A8%D8%B1"},	#USER
{:raw => "بحث کاربر", :url => "%D8%A8%D8%AD%D8%AB%20%DA%A9%D8%A7%D8%B1%D8%A8%D8%B1"},	#USER_TALK
{:raw => "ویکی‌نسک", :url => "%D9%88%DB%8C%DA%A9%DB%8C%E2%80%8C%D9%86%D8%B3%DA%A9"},	#books
{:raw => "بحث ویکی‌نسک", :url => "%D8%A8%D8%AD%D8%AB%20%D9%88%DB%8C%DA%A9%DB%8C%E2%80%8C%D9%86%D8%B3%DA%A9"},	#books_TALK
{:raw => "ویکی‌پدیا", :url => "%D9%88%DB%8C%DA%A9%DB%8C%E2%80%8C%D9%BE%D8%AF%DB%8C%D8%A7"},	#encyclopedia
{:raw => "بحث ویکی‌پدیا", :url => "%D8%A8%D8%AD%D8%AB%20%D9%88%DB%8C%DA%A9%DB%8C%E2%80%8C%D9%BE%D8%AF%DB%8C%D8%A7"},	#encyclopedia_TALK
{:raw => "ویکی‌گفتاورد", :url => "%D9%88%DB%8C%DA%A9%DB%8C%E2%80%8C%DA%AF%D9%81%D8%AA%D8%A7%D9%88%D8%B1%D8%AF"},	#quote
{:raw => "بحث ویکی‌گفتاورد", :url => "%D8%A8%D8%AD%D8%AB%20%D9%88%DB%8C%DA%A9%DB%8C%E2%80%8C%DA%AF%D9%81%D8%AA%D8%A7%D9%88%D8%B1%D8%AF"},	#quote_TALK
{:raw => "ویکی‌نبشته", :url => "%D9%88%DB%8C%DA%A9%DB%8C%E2%80%8C%D9%86%D8%A8%D8%B4%D8%AA%D9%87"},	#source
{:raw => "بحث ویکی‌نبشته", :url => "%D8%A8%D8%AD%D8%AB%20%D9%88%DB%8C%DA%A9%DB%8C%E2%80%8C%D9%86%D8%A8%D8%B4%D8%AA%D9%87"},	#source_TALK
{:raw => "تصویر", :url => "%D8%AA%D8%B5%D9%88%DB%8C%D8%B1"},	#IMAGE
{:raw => "بحث تصویر", :url => "%D8%A8%D8%AD%D8%AB%20%D8%AA%D8%B5%D9%88%DB%8C%D8%B1"},	#IMAGE_TALK
{:raw => "مدیاویکی", :url => "%D9%85%D8%AF%DB%8C%D8%A7%D9%88%DB%8C%DA%A9%DB%8C"},	#MEDIAWIKI
{:raw => "بحث مدیاویکی", :url => "%D8%A8%D8%AD%D8%AB%20%D9%85%D8%AF%DB%8C%D8%A7%D9%88%DB%8C%DA%A9%DB%8C"},	#MEDIAWIKI_TALK
{:raw => "الگو", :url => "%D8%A7%D9%84%DA%AF%D9%88"},	#TEMPLATE
{:raw => "بحث الگو", :url => "%D8%A8%D8%AD%D8%AB%20%D8%A7%D9%84%DA%AF%D9%88"},	#TEMPLATE_TALK 
{:raw => "راهنما", :url => "%D8%B1%D8%A7%D9%87%D9%86%D9%85%D8%A7"},	#HELP
{:raw => "بحث راهنما", :url => "%D8%A8%D8%AD%D8%AB%20%D8%B1%D8%A7%D9%87%D9%86%D9%85%D8%A7"},	#HELP_TALK 
{:raw => "بحث رده", :url => "%D8%A8%D8%AD%D8%AB%20%D8%B1%D8%AF%D9%87"}	#CATEGORY_TALK
]
