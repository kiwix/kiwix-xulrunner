#include <glib.h>
#include <glib/gstdio.h>
#include "filenameindex.h"
#include "wordindex.h"
#include "htmlbuffer.h"

void usage() {
  printf("Usage: ./kiwixindexer <path>\n");
}

int main(int argc, char **argv) {

  if (argc <= 1 ) {
    usage();
    exit(0);
  }

  char *root = argv[1];

  printf( "Root = %s\n", root );
  wikiFniBuild( root );
  wikiBuildWordArticleMap( root );
  
  return 0;
}
