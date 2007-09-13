#ifndef DIRPARSER_H_
#define DIRPARSER_H_

#include <glib.h>
#include <glib/gstdio.h>

void dirParserInit( const gchar* root );

const gchar* dirParserGetNext();

gint dirParserGetCurrentIndex();

#endif /*DIRPARSER_H_*/
