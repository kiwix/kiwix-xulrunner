#include <glib.h>
#include <glib/gstdio.h>
#include "filenameindex.h"
#include "wordindex.h"
#include "htmlbuffer.h"

int main(int argc, char **argv) {

  static gchar defaultroot[] = "/home/fcoulon/devel/kiwix-devel/html";
  char *root;

  if ( argc > 1 ) root = argv[1];
  else root = defaultroot;
  printf( "Root = %s\n", root );
  wikiFniBuild( root );
  wikiBuildWordArticleMap( root );
  
  return 0;
}
