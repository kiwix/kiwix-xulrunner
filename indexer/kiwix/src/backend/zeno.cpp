#ifdef HAVE_LIBZENO

extern "C" {

#include "zeno.h"
#include "../htmlbuffer.h"

}

#include <zeno/file.h>
#include <zeno/article.h>

static zeno::File * zenofile = NULL;
static zeno::size_type zenocount = 0;
static zeno::size_type zenoindex = 0;

static gchar * prefix;

static gboolean zenoParserInit( const gchar * root ) {
	gchar * tmp;

	if ( ! g_str_has_suffix( root, ".zeno" )) return FALSE;

	prefix = (gchar *) malloc(strlen(root) + 2);
	tmp = g_stpcpy( prefix, root);
	*tmp = '_';

	zenofile = new zeno::File( root );
	zenocount = zenofile->getCountArticles();
	zenoindex = 0;

	return TRUE;
}

static const gchar * zenoParserGetNext() {

	if ( zenoindex >= zenocount ) return NULL;

	zeno::Article a = zenofile->getArticle( zenoindex++ );
	std::string s = a.getUrl().toUtf8();
	return g_strdup(s.c_str());
}

static gint zenoParserGetCurrentIndex() {

	return zenoindex;
}

static gint zenoHtmlBufLoad( htmlBuffer *buffer, const char* fileName ) {
	char ns;
	gchar title[1024];

	sscanf(fileName, "%c/%[^\n]", &ns, title);

	zeno::Article a = zenofile->getArticle( ns, title );
	std::string s = a.getData();

	buffer->fileLength = buffer->bufLength = s.size();
	strcpy(buffer->buffer, s.c_str());
	buffer->curs = buffer->buffer;
	buffer->inTag = 0;

	return 0;
}

static const gchar * zenoSavePrefix( void ) {

	return prefix;
}

static void zenoResetBody( htmlBuffer *buffer ) {
	
  htmlReset( buffer, "<p", "<div class=\"printfooter\">" );
}

static void zenoResetTitle( htmlBuffer *buffer ) {

  htmlReset( buffer, "<xxx", "</xxx>" );
}

static void zenoGetTitle( gint idx, htmlBuffer *buffer, char * title, gint titlelength ) {
	zeno::Article a = zenofile->getArticle( idx );
	zeno::QUnicodeString t = a.getTitle();
	std::string s = t.toUtf8();
	const char * c = s.c_str();

	g_strlcpy( title, c, titlelength );
}

backend_struct zenoBackend = {
	zenoParserInit,
	zenoParserGetNext,
	zenoParserGetCurrentIndex,
	zenoHtmlBufLoad,
	zenoSavePrefix,
	zenoResetTitle,
	zenoResetBody,
	zenoGetTitle
};

#endif
