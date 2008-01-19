
LOCALIZED_STRINGS = {
    :NSCategory => {:raw => "تصنيف", :url => "%D8%AA%D8%B5%D9%86%D9%8A%D9%81"},
	:NSImage	=> {:raw => "Aide", :url => "%D8%B5%D9%88%D8%B1%D8%A9"},
	:NSPortal	=> {:raw => "بوابة", :url => "%D8%A8%D9%88%D8%A7%D8%A8%D8%A9"},
    }


# only projects-wide NS to include
INCLUDED_NS = [
	{:raw => "تصنيف", :url => "%D8%AA%D8%B5%D9%86%D9%8A%D9%81", :ns => "category"},
]

# transform external links to other projects to internal links
INCLUDED_PROJECTS = [
{:url => "http://ar.wikipedia.org/wiki/تصنيف:", :internal => "moulin://encyclopedia-category/ar/"},
{:url => "http://ar.wikipedia.org/wiki/بوابة:", :internal => "moulin://encyclopedia-portal/ar/"},
{:url => "http://ar.wikipedia.org/wiki/", :internal => "moulin://encyclopedia/ar/"},
{:url => "http://ar.wiktionary.org/wiki/تصنيف:", :internal => "moulin://dictionary-category/ar/"},
{:url => "http://ar.wiktionary.org/wiki/", :internal => "moulin://dictionary/ar/"},
{:url => "http://ar.wikisource.org/wiki/تصنيف:", :internal => "moulin://source-category/ar/"},
{:url => "http://ar.wikisource.org/wiki/", :internal => "moulin://source/ar/"},
]

EXCLUDED_NS = [
{:raw => "ميديا", :url => "%D9%85%D9%8A%D8%AF%D9%8A%D8%A7"},	#MEDIA
{:raw => "خاص", :url => "%D8%AE%D8%A7%D8%B5"},	#SPECIAL	
{:raw => "نقاش", :url => "%D9%86%D9%82%D8%A7%D8%B4"},	#TALK
{:raw => "مستخدم", :url => "%D9%85%D8%B3%D8%AA%D8%AE%D8%AF%D9%85"},	#USER
{:raw => "نقاش المستخدم", :url => "%D9%86%D9%82%D8%A7%D8%B4_%D8%A7%D9%84%D9%85%D8%B3%D8%AA%D8%AE%D8%AF%D9%85"},	#USER_TALK
{:raw => "ويكيبيديا", :url => "%D9%88%D9%8A%D9%83%D9%8A%D8%A8%D9%8A%D8%AF%D9%8A%D8%A7"},	#encyclopedia
{:raw => "نقاش ويكيبيديا", :url => "%D9%86%D9%82%D8%A7%D8%B4_%D9%88%D9%8A%D9%83%D9%8A%D8%A8%D9%8A%D8%AF%D9%8A%D8%A7"},	#encyclopedia_TALK

{:raw => "ويكاموس", :url => "%D9%88%D9%8A%D9%83%D8%A7%D9%85%D9%88%D8%B3"},	#dictionary
{:raw => "نقاش ويكاموس", :url => "%D9%86%D9%82%D8%A7%D8%B4_%D9%88%D9%8A%D9%83%D8%A7%D9%85%D9%88%D8%B3"},	#dictionary_TALK
{:raw => "ويكي مصدر", :url => "%D9%88%D9%8A%D9%83%D9%8A_%D9%85%D8%B5%D8%AF%D8%B1"},	#source
{:raw => "نقاش ويكي مصدر", :url => "%D9%86%D9%82%D8%A7%D8%B4_%D9%88%D9%8A%D9%83%D9%8A_%D9%85%D8%B5%D8%AF%D8%B1"},	#source_TALK

{:raw => "صورة", :url => "%D8%B5%D9%88%D8%B1%D8%A9"},	#IMAGE
{:raw => "نقاش الصورة", :url => "%D9%86%D9%82%D8%A7%D8%B4_%D8%A7%D9%84%D8%B5%D9%88%D8%B1%D8%A9"},	#IMAGE_TALK
{:raw => "ميدياويكي", :url => "%D9%85%D9%8A%D8%AF%D9%8A%D8%A7%D9%88%D9%8A%D9%83%D9%8A"},	#MEDIAWIKI
{:raw => "نقاش ميدياويكي", :url => "%D9%86%D9%82%D8%A7%D8%B4_%D9%85%D9%8A%D8%AF%D9%8A%D8%A7%D9%88%D9%8A%D9%83%D9%8A"},	#MEDIAWIKI_TALK
{:raw => "قالب", :url => "%D9%82%D8%A7%D9%84%D8%A8"},	#TEMPLATE
{:raw => "نقاش القالب", :url => "%D9%86%D9%82%D8%A7%D8%B4_%D8%A7%D9%84%D9%82%D8%A7%D9%84%D8%A8"},	#TEMPLATE_TALK 
{:raw => "مساعدة", :url => "%D9%85%D8%B3%D8%A7%D8%B9%D8%AF%D8%A9"},	#HELP
{:raw => "نقاش المساعدة", :url => "%D9%86%D9%82%D8%A7%D8%B4_%D8%A7%D9%84%D9%85%D8%B3%D8%A7%D8%B9%D8%AF%D8%A9"},	#HELP_TALK 
{:raw => "نقاش التصنيف", :url => "%D9%86%D9%82%D8%A7%D8%B4_%D8%A7%D9%84%D8%AA%D8%B5%D9%86%D9%8A%D9%81"},	#CATEGORY_TALK
]

