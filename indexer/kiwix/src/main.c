#include <glib.h>
#include <glib/gstdio.h>
#include "filenameindex.h"
#include "wordindex.h"
#include "htmlbuffer.h"
#include "backend/backend.h"

void usage() {
  printf("Usage: ./kiwixindexer <path>\n");
}

int main(int argc, char **argv) {

  if (argc <= 1 ) {
    usage();
    exit(0);
  }

  char *root = argv[1];
  backend_struct * backend = backendInit( root );

  if ( ! backend ) {
    fprintf(stderr, "don't know how to open %s\n", root);
    return 1;
  }

  printf( "Root = %s\n", root );
  wikiFniBuild( backend );
  wikiBuildWordArticleMap( backend );
  
  return 0;
}
