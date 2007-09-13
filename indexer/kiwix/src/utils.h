#ifndef UTILS_H_
#define UTILS_H_

#include <glib.h>
#include <string.h>
#include <stdio.h>
#include <stdlib.h>

typedef guint32 intOffset;
typedef guint32 intIndex;

void Utf8toAscii( unsigned char *c );
void Utf8toAsciiNoCase( unsigned char *c );

gint g_strlen( const char *c );

void* gg_malloc( gint sz );

void createDirOrDie( const char *dir );

char getDigitFromIdx( gint idx );

void getDirFromPath( const char *path, char *dir );

gint getDepthFromPath( const char *path );

char* getPathFromIdx( gint idx, char *path );

const char *cutRoot( const char *root, const char *path );

int strpatternlowcase( char *src, char *pattern );

int lowercase( char *c );

char upcase( char c );

typedef struct {
	int* index;
	int  maxElements;
} elementCounter;

elementCounter* elementCounterNew( int maxElements );
void elementCounterDelete( elementCounter* ec );
void elementCounterReset( elementCounter* ec );
void elementCounterPush( elementCounter* ec, int element );
void elementCounterPushs( elementCounter* ec, int element, int factor );
int elementCounterGetElement( elementCounter* ec, int idx );
int elementCounterGetCount( elementCounter* ec, int idx );
void elementCounterSetCount( elementCounter* ec, int idx, int count );
void elementCounterSort( elementCounter* ec );

#endif /*UTILS_H_*/
