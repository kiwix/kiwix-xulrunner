#include "html.h"
#include <zlib.h>
#include "../utils.h"

#define TEXT_MARKER_BEGIN "<body"
#define TEXT_MARKER_END "<div class=\"printfooter\">"
#define TITLE_MARKER_BEGIN "<title"
#define TITLE_MARKER_END "</title"

static gint currentIndex = 0;
static GDir *dir;
static gchar path[512];
static gchar *nameinpath;
static GQueue *dirqueue;
static const gchar * root;
static const gchar * prefix;

static gboolean dirParserInit( const gchar* _root ) {

	if ( g_file_test( _root, G_FILE_TEST_IS_DIR )) {
		gchar * tmp;

		root = strdup(_root);
		prefix = malloc(strlen(root) + 2);
		tmp = g_stpcpy( prefix, root);
		*tmp = '/';

		currentIndex = 0;
		dir = g_dir_open( root, 0, NULL );
		nameinpath = g_stpcpy( path, root );
		*(nameinpath++) = '/';
		dirqueue = g_queue_new();

		return TRUE;
	}

	return FALSE;

}

static const gchar* dirParserGetNext() {

currentIndex++;
while (1) {

	const gchar *name = g_dir_read_name( dir );
	while ( !name ) {
		g_dir_close( dir );
		dir = NULL;
     
		gchar *nextpath = (gchar*)g_queue_pop_head( dirqueue );
		if ( !nextpath ) return NULL;

		dir = g_dir_open( nextpath, 0, NULL );
		nameinpath = g_stpcpy( path, nextpath );
		*(nameinpath++) = '/';
		g_free( nextpath );
		name = g_dir_read_name(dir);
      }
	g_stpcpy( nameinpath, name );
	if ( g_file_test( path, G_FILE_TEST_IS_DIR ) ) {

		if ( *nameinpath != '.' )
			g_queue_push_head( dirqueue, (gpointer)g_strdup( path ) );
		else g_printf( " * Dropping directory %s\n", path );
		
	} else 
	  if ( g_str_has_suffix( path, ".html" ) 
            || g_str_has_suffix( path, ".html.gz" ) ) return cutRoot(root, path);
}}

static gint dirParserGetCurrentIndex() {

	return currentIndex;	
}

static gint htmlBufLoad( htmlBuffer *buffer, const char* relFileName ) {

  gchar* curs;
  FILE *in = NULL;
  gzFile zin = NULL;
  gchar fileName[512];
  gchar * pathFileName;

  pathFileName = g_stpcpy( fileName, root );
  *pathFileName++ = '/';
  g_stpcpy( pathFileName, relFileName );

  if ( g_str_has_suffix( fileName, ".gz" ) )
    zin = gzopen( fileName, "r" );
  else in = fopen( fileName, "r" );
  if (!in && !zin) {
  	printf( "Warning : Cannot open file %s\n", fileName );
  	buffer->fileLength = buffer->bufLength = 0;
  	return 1;
  }
  	
  if (in) buffer->fileLength = fread( buffer->buffer, 1, HTML_BUFFER_SIZE, in );
  else buffer->fileLength = gzread( zin, buffer->buffer, HTML_BUFFER_SIZE );
  buffer->bufLength = buffer->fileLength;
  if ( buffer->fileLength >= HTML_BUFFER_SIZE ) {
 	printf( " Fatal : Found file %s greater than %d octets, change constant HTML_BUFFER_SIZE in src/htmlbuffer.h\n", 
   	  fileName, HTML_BUFFER_SIZE );
   	exit(1);
  }
  buffer->curs = buffer->buffer;
  buffer->inTag = 0;
  if (in) fclose(in); else gzclose(zin);
  return 0;
}

static const gchar * htmlSavePrefix( void ) {

  return prefix;
}

static void htmlResetBody( htmlBuffer *buffer ) {
	
  htmlReset( buffer, TEXT_MARKER_BEGIN, TEXT_MARKER_END );
}

static void htmlResetTitle( htmlBuffer *buffer ) {

  htmlReset( buffer, TITLE_MARKER_BEGIN, TITLE_MARKER_END );
}

static void htmlGetTitle( gint idx, htmlBuffer *buffer, char * title, gint titlelength ) {
	htmlGetUntilNextTag( buffer, title, titlelength );
	Utf8toAsciiNoCase( title );
}

backend_struct htmlBackend = {
	dirParserInit,
	dirParserGetNext,
	dirParserGetCurrentIndex,
	htmlBufLoad,
	htmlSavePrefix,
	htmlResetTitle,
	htmlResetBody,
	htmlGetTitle
};
