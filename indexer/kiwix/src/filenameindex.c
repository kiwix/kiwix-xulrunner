#include "filenameindex.h"
#include "dirparser.h"
#include "htmlbuffer.h"
#include "utils.h"

#define PREFIX_IMAGE "Image~"
#define PREFIX_TEMPLATE "Template~"

Fni *fniArticle;
Fni *fniImage;
Fni *fniTemplate;

Fni* fniNew() {
	
	Fni *fni = gg_malloc( sizeof( Fni ) );
	fni->table = g_array_sized_new( FALSE, FALSE, sizeof( gchar* ), 1024 );
	fni->maxidx = 0;
	return fni;
}

void fniDelete( Fni *fni ) {

  g_array_free( fni->table, TRUE );
  g_free( fni );
}

void fniSave( Fni* fni, const gchar* fileName ) {

  FILE *out = fopen( fileName, "w" );  
}

void fniPush( Fni* fni, const gchar* path ) {

  gchar *dupPath = g_strdup(path);
  gchar **pdupPath = &dupPath;
  g_array_insert_vals( fni->table, fni->maxidx, pdupPath, 1 );
  fni->maxidx++;
}

const gchar *fniGetFromIdx( Fni* fni, gint idx ) {

  return g_array_index( fni->table, gchar*, idx );
}

gint fniGetFromPath( Fni* fni, const gchar *path ) {

  gint i;
  for ( i = 0 ; i < fni->maxidx ; i++ ) {
  	
  	if ( !strcmp( path, fniGetFromIdx( fni, i ) ) ) return i;
  }
  return -1;
}

gint fniGetFromSuffix( Fni* fni, const gchar *suffix ) {

  gint i;
  for ( i = 0 ; i < fni->maxidx ; i++ ) {
    
    if ( g_str_has_suffix( fniGetFromIdx( fni, i ), suffix ) ) return i;
  }
  return -1;
}

void wikiFniBuild( const gchar *root ) {

  const gchar *path;
  static htmlBuffer buffer;

  dirParserInit( root );
  fniArticle = fniNew();
  /*  fniImage = fniNew();
      fniTemplate = fniNew(); */

  while (path = dirParserGetNext()) {
    
    if (g_strrstr(path, PREFIX_IMAGE)) 
      /*      fniPush( fniImage, cutRoot( root, path ) ) */;
    else if (g_strrstr(path, PREFIX_TEMPLATE)) 
      /*      fniPush( fniTemplate, cutRoot( root, path ) )*/;
    else {
  	htmlBufLoad( &buffer, path );
        if ( htmlCheckBadMarkers( &buffer ) )
         	fniPush( fniArticle, cutRoot( root, path ) );
    }
  }
  fniArticle->titles = malloc( fniArticle->maxidx * sizeof(char*) );
}

void fniSetTitle( Fni* fni, gint idx, const char *title ) {
  
  fni->titles[idx] = g_strdup( title );
}

const gchar *fniGetTitleFromIdx( Fni* fni, gint idx ) {

  return fni->titles[idx];	
}

#if 0

-------------------------------------------------------------------------
void wikiCopyFiles( const gchar *root, const gchar *dest, Fni *fni ) {
	
  int i;
  gchar rootedpath[512];
  gchar *path;
  gchar rooteddestpath[512];
  gchar *destpath;
  gchar destdir[512];
  static htmlBuffer htmlBuf;
  gchar *curs = buffer;
  gint  fileDepth;
  gchar property[512];
  const gchar *propertyTitle;
  
  destpath = g_stpcpy( rooteddestpath, dest );
  path = g_stpcpy( rootedpath, root );
  (*path++) = '/';
  for ( i = 0 ; i < fni->maxidx ; i++ ) {
  	
  	g_stpcpy( path, fniGetFromIdx( fni, i ));
  	getPathFromIdx(i, destpath);
  	getDirFromPath( rooteddestpath, destdir );
  	fileDepth = getDepthFromPath( path );

    printf( "copying %s to %s\n", rootedpath, rooteddestpath );
    createDirOrDie( destdir );
  	
  	FILE *out = fopen( rooteddestpath, "w" );  	
  	htmlBufLoad( &rootedpath );
    
    while ( !htmlEobuf( &htmlBuf ) ) {
    
      char* curs = htmlBuf.curs;
      htmlFindNextProperty( &htmlBuf, property, 512 );
      fwrite( curs, 1, htmlBuf.curs - curs, out );
      
      propertyTitle = getTitleFromPath( property );
      if ( *propertyTitle ) {

	int i;
	if ( (i=fniGetFromSuffix( fniArticle, propertyTitle ))!=-1 )
      }
    }

  	fclose( out );
  }	
}

void wikiNormalize( const gchar *root, const gchar *dest ) {

  gchar ddest[512];
  gchar *dpath = g_stpcpy( ddest, dest );
  
  g_stpcpy( dpath, "/article" );
  createDirOrDie( ddest );
  wikiCopyFiles( root, ddest, fniArticle );

  g_stpcpy( dpath, "/image-notice" );
  createDirOrDie( ddest );
  wikiCopyFiles( root, ddest, fniImage );

  g_stpcpy( dpath, "/template" );
  createDirOrDie( ddest );
  wikiCopyFiles( root, ddest, fniTemplate );
}

#endif
