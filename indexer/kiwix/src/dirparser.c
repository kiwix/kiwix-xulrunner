#include "dirparser.h"

static gint currentIndex = 0;
static GDir *dir;
static gchar path[512];
static gchar *nameinpath;
static GQueue *dirqueue;

void dirParserInit( const gchar* root ) {
	
	currentIndex = 0;
	dir = g_dir_open( root, 0, NULL );
	nameinpath = g_stpcpy( path, root );
	*(nameinpath++) = '/';
	dirqueue = g_queue_new();
}

const gchar* dirParserGetNext() {

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
            || g_str_has_suffix( path, ".html.gz" ) ) return path;
}}

gint dirParserGetCurrentIndex() {

	return currentIndex;	
}
