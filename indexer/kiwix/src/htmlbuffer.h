#ifndef HTMLBUFFER_H_
#define HTMLBUFFER_H_

#include <glib.h>
#include <stdio.h>
#include <stdlib.h>

#define TITLE_BAD_TAG "<meta http-equiv=\"refresh\""

#define HTML_BUFFER_SIZE 1000000

typedef struct {
	char buffer[HTML_BUFFER_SIZE];
	int fileLength, bufLength;
	char *curs;
	int  inTag;
} htmlBuffer;

int  htmlEobuf( htmlBuffer *buffer );
void htmlGetNextWord( htmlBuffer *buffer, char *word, gint maxlen );
int  htmlCheckBadMarkers( htmlBuffer *buffer );
void htmlReset( htmlBuffer *buffer, gchar *beginMarker, gchar *endMarker );

#endif /*HTMLBUFFER_H_*/
