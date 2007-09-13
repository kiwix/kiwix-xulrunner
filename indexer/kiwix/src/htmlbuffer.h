#ifndef HTMLBUFFER_H_
#define HTMLBUFFER_H_

#include <glib.h>
#include <stdio.h>
#include <stdlib.h>

#define TEXT_MARKER_BEGIN "<body"
#define TEXT_MARKER_END "<div class=\"printfooter\">"
#define TITLE_MARKER_BEGIN "<title"
#define TITLE_MARKER_END "</title"
#define TITLE_BAD_TAG "<meta http-equiv=\"refresh\""

#define HTML_BUFFER_SIZE 1000000

typedef struct {
	char buffer[HTML_BUFFER_SIZE];
	int fileLength, bufLength;
	char *curs;
	int  inTag;
} htmlBuffer;

gint htmlBufLoad( htmlBuffer *buffer, char* fileName );
int  htmlEobuf( htmlBuffer *buffer );
void htmlGetNextWord( htmlBuffer *buffer, char *word, gint maxlen );
int  htmlCheckBadMarkers( htmlBuffer *buffer );

#endif /*HTMLBUFFER_H_*/
