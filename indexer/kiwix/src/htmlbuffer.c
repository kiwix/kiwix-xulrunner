#include "htmlbuffer.h"
#include "utils.h"
#include <zlib.h>

int  isSeparator( char c ) {

  return (c==' ')||(c==10)||(c==13);
}

int isNotWord( unsigned char c ) {

  return (c < 'A')||( (c>'Z')&&(c<'a') )||( (c>'z') );
}

#define BUF_EOF (buffer->curs >= buffer->buffer + buffer->fileLength)
#define BUF_CURS (*(buffer->curs))

static void bufInc( htmlBuffer *buffer ) {
	
    gchar c = BUF_CURS;
  	if ( c == '>' ) buffer->inTag = 0;
  	buffer->curs++;
  	if ( c == '<' ) buffer->inTag = 1;
}

int  htmlEobuf( htmlBuffer *buffer ) {

  return BUF_EOF;
}

void htmlFindNextTag( htmlBuffer *buffer ) {

  bufInc(buffer);
  while ( (!BUF_EOF)&&(BUF_CURS!='<') ) buffer->curs++;
  buffer->inTag = 1;
}

void htmlFindNextNonTag( htmlBuffer *buffer ) {

  if ( !buffer->inTag ) return;
  while ( (!BUF_EOF)&&(buffer->inTag) ) bufInc(buffer);
}

void htmlFindNextWord( htmlBuffer *buffer ) {

  while ( (!BUF_EOF)&&((buffer->inTag)||(isNotWord(BUF_CURS) ))) bufInc(buffer);
}

void htmlFindNextNonWord( htmlBuffer *buffer ) {

  while ( (!BUF_EOF)&&(!isNotWord(BUF_CURS)&&(!buffer->inTag))) bufInc(buffer);
}

void htmlGetUntilNextTag( htmlBuffer *buffer, gchar *word, gint maxlen ) {

  gchar *wordin;
  gint wordlen;

  gchar *ocurs = buffer->curs;
   htmlFindNextNonTag( buffer );
   wordin = buffer->curs;
   htmlFindNextTag( buffer );
   strcpystop( word, wordin, buffer->curs, maxlen );
   wordlen = buffer->curs - wordin;
  buffer->curs = ocurs;
}

void htmlGetNextWord( htmlBuffer *buffer, gchar *word, gint maxlen ) {

  gchar *wordin;
  gint wordlen;

  do {
   htmlFindNextWord( buffer );
   wordin = buffer->curs;
   htmlFindNextNonWord( buffer );
   strcpystop( word, wordin, buffer->curs, maxlen );
   wordlen = buffer->curs - wordin;
  } while ( (!BUF_EOF)&&(((wordlen<3)||(wordlen>36)) ));
  Utf8toAscii( word );
}

void htmlReset( htmlBuffer *buffer, gchar *beginMarker, gchar *endMarker ) {

  gchar* curs;
  buffer->curs = buffer->buffer;
  buffer->inTag = 0;
  buffer->fileLength = buffer->bufLength;
  
  do {
  	htmlFindNextTag(buffer);
  } while ( (!BUF_EOF) && !strpatternlowcase( buffer->curs, beginMarker ) );
  
  curs = buffer->curs;
  do {
  	htmlFindNextTag(buffer);
  } while ( (!BUF_EOF) && !strpatternlowcase( buffer->curs, endMarker ) );
  buffer->fileLength = buffer->curs-buffer->buffer;
  buffer->curs = curs;
  buffer->inTag = 1;
}

int  htmlCheckBadMarkers( htmlBuffer *buffer ) {

  do {
    htmlFindNextTag(buffer);
  } while ( (!BUF_EOF) && !strpatternlowcase( buffer->curs, TITLE_BAD_TAG ) );
  return BUF_EOF;
}

/*


int  isQuote( char c ) {

  return (c=='\'')||(c=='"');
}


void htmlFindNextQuote( htmlBuffer *buffer ){

  while ( (buffer->curs < buffer->fileLength)&&(!isQuote(buffer->buffer[buffer->curs]) )) {
    buffer->curs++;
    if ( buffer->buffer[buffer->curs] == '>' ) {
      printf( "unclosed property\n" );
      buffer->inTag = 0;
      return;
    }
  }
}



void htmlFindNextProperty( htmlBuffer *buffer, char *path, int maxpath ) {

  char *property;
  int lenpath;

  while ( buffer->curs < buffer->fileLength ) {

    char c = buffer->buffer[buffer->curs];

    if ( c == '<' ) buffer->inTag = 1;
    if ( c == '>' ) buffer->inTag = 0;
    if ( isSeparator( c ) && (buffer->inTag = 1) ) buffer->inTag = 2;
    if ( (c == '=')&&(buffer->inTag == 2) ) {

      htmlFindNextNonSeparator( buffer );
      if ( isQuote(buffer->buffer[buffer->curs])) {

	buffer->curs++;
	goto quote_reached;
      }
    }
  }
 quote_reached:
  property = buffer->curs;
  htmlFindNextQuote( buffer );
  lenpath = buffer->curs - property;
  if ( lenpath > maxpath ) lenpath = maxpath;
  if ( buffer->inTag == 0 ) *path = 0; 
  else str_ncpy( path, property, lenpath );
  buffer->curs = property;
  if ( buffer->inTag ) buffer->inTag = 1;
}
*/
