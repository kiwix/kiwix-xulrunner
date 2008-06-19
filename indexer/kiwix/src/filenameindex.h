#ifndef FILENAMEINDEX_H_
#define FILENAMEINDEX_H_

#include <glib.h>
#include <glib/gstdio.h>
#include "utils.h"
#include "backend/backend.h"

typedef struct {
	GArray *table;
	char **titles;
	intOffset maxidx;
} Fni;


extern Fni *fniArticle;
extern Fni *fniImage;
extern Fni *fniTemplate;

Fni* fniNew();

void fniPush( Fni* fni, const gchar* path );

const gchar *fniGetFromIdx( Fni* fni, gint idx );

gint fniGetFromPath( Fni* fni, const gchar *path );

const gchar *fniGetTitleFromIdx( Fni* fni, gint idx );

void fniSetTitle( Fni* fni, gint idx, const char *title );

void wikiFniBuild( backend_struct * backend );

/* void wikiNormalize( const gchar *root, const gchar *dest ); */

#endif /*FILENAMEINDEX_H_*/
