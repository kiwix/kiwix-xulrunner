#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include "index.h"
#include "engine.h"

void *gg_malloc( long size ) {

  return malloc( size );	
}

void gg_free( void *ptr ) {
	
	free( ptr );
}

int main(int argc, char** argv) {

  char query[256];
  char *curs = query;
  engine sEngine;
  sEngine.load( "/home/fcoulon/devel/kiwix-cd/html" );

  if ( argc > 1 )
  {
    for ( int i = 1 ; i < argc ; i++ ) {
       strcpy(curs, argv[i]);
       curs += strlen( curs );
       *curs++ = ' ';
    }
    *curs = 0;
    printf( "Querying %s\n", query );
    listElements *res = sEngine.search( query );
    for ( int i = 0 ; (i < res->length())&&(i<24) ; i++ ) 
      printf( "%s : %d\n", sEngine.getArticleName( res, i ), res->count(i) );
  } else {
    sEngine.debugWords();
  }
}
