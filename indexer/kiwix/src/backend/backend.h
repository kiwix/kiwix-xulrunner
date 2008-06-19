#ifndef BACKEND_H_
#define BACKEND_H_

#include <glib.h>
#include <glib/gstdio.h>
#include "../htmlbuffer.h"

typedef struct {
	gboolean (*parserInit)(const gchar * root);
	const gchar * (*parserGetNext)(void);
	gint (*parserGetCurrentIndex)(void);
	gint (*htmlBufLoad)( htmlBuffer *buffer, const char* fileName );
	const gchar * (*savePrefix)(void);
	void (*resetTitle)( htmlBuffer *buffer );
	void (*resetBody)( htmlBuffer *buffer );
	void (*getTitle)( gint idx, htmlBuffer *buffer, char * title, gint titlelength );
} backend_struct;

backend_struct * backendInit( const gchar * root );

#endif
