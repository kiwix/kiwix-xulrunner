#include "utils.h"

void Utf8toAscii( unsigned char *c ) {

  unsigned char *s = c, *d = c;

  while ( *s ) {
    
    if ( *s <= 127 ) { 
      if (( 'A' <= *s )&&( *s <= 'Z' )) *(d++) = 'a'-'A' + *s;
      else *(d++) = *s;
      s++;
    }
    else if (( 192 <= *s )&&( *s <= 223 )) {
      if ( !*(s+1) ) break;
      int car = (*s-192)*64+(*(s+1)-128);
      if (( 0xC0 <= car )&&( car <= 0xDF )) car += 0x20;
      if (( 0xE0 <= car )&&( car <= 0xE6 )) *(d++) = 'a';
      if (( 0xE7 == car )) *(d++) = 'c';
      if (( 0xE8 <= car )&&( car <= 0xEB )) *(d++) = 'e';
      if (( 0xEC <= car )&&( car <= 0xEF )) *(d++) = 'i';
      if (( 0xF1 == car )) *(d++) = 'n';
      if (( 0xF2 <= car )&&( car <= 0xF6 )) *(d++) = 'o';
      if (( 0xF9 <= car )&&( car <= 0xFC )) *(d++) = 'u';
      if ( 0x100 & car ) {

        if ( car <= 0x105 ) *(d++) = 'a';
        else if ( car <= 0x10D ) *(d++) = 'c';
        else if ( car <= 0x111 ) *(d++) = 'd';
        else if ( car <= 0x11B ) *(d++) = 'e';
        else if ( car <= 0x123 ) *(d++) = 'g';
        else if ( car <= 0x127 ) *(d++) = 'h';
        else if ( car <= 0x131 ) *(d++) = 'i';
        else if ( car <= 0x133 ) { *(d++) = 'i'; *(d++) = 'j'; }
        else if ( car <= 0x135 ) *(d++) = 'j';
        else if ( car <= 0x138 ) *(d++) = 'k';
        else if ( car <= 0x142 ) *(d++) = 'l';
        else if ( car <= 0x14B ) *(d++) = 'n';
        else if ( car <= 0x151 ) *(d++) = 'o';
        else if ( car <= 0x153 ) { *(d++) = 'o'; *(d++) = 'e'; }
        else if ( car <= 0x159 ) *(d++) = 'r';
        else if ( car <= 0x161 ) *(d++) = 's';
        else if ( car <= 0x167 ) *(d++) = 't';
        else if ( car <= 0x173 ) *(d++) = 'u';
        else if ( car <= 0x175 ) *(d++) = 'w';
        else if ( car <= 0x178 ) *(d++) = 'y';
        else if ( car <= 0x17E ) *(d++) = 'z';
      }
      s+=2;
    } else s++;
  }
  *d=0;
}

void Utf8toAsciiNoCase( unsigned char *c ) {

  unsigned char *s = c, *d = c;

  while ( *s ) {
    
    if ( *s <= 127 ) { 
      *(d++) = *s;
      s++;
    }
    else if (( 192 <= *s )&&( *s <= 223 )) {
      if ( !*(s+1) ) break;
      int car = (*s-192)*64+(*(s+1)-128);
      if (( 0xE0 <= car )&&( car <= 0xE5 )) *(d++) = 'a';
      if (( 0xE7 == car )) *(d++) = 'c';
      if (( 0xE8 <= car )&&( car <= 0xEB )) *(d++) = 'e';
      if (( 0xEC <= car )&&( car <= 0xEF )) *(d++) = 'i';
      if (( 0xF2 <= car )&&( car <= 0xF6 )) *(d++) = 'o';
      if (( 0xF9 <= car )&&( car <= 0xFC )) *(d++) = 'u';
      s+=2;
    } else s++;
  }
  *d=0;
}

char upcase( char c ) {

  if (( c >=	'a' )&&( c <= 'z' )) c += 'A'-'a';
  return c;
}

gint g_strlen( const char *c ) {

 gint rt = 0;
 for ( ; *c ; c++ ) rt++;
 return rt;	
}

void* gg_malloc( gint sz ) {

  if ( !sz ) {
        printf( "warning : g_malloc(0)\n" );
	return NULL;
  }
  void* p = g_malloc( sz );
  if ( !p ) {
  	printf( "Fatal : g_malloc failed. Tried to alloc %d\n", sz );
  	exit(1);
  }
  return p;	
}

void str_ncpy( char *dest, char *src, int len ) {

  for ( ; len ; len-- ) *dest++ = *src++;
  *dest = 0;
}

void strcpystop( char *dest, char *src, char *stop, int maxlen ) {

  if ( stop-src > maxlen ) {
  	*dest = 0;
  	return;
  }
  for ( ; src < stop ; ) *dest++ = *src++;
  *dest = 0;
} 

char lowcase( char c ) {

  if (( c>='A' )&&( c<='Z' )) return c + 'a'-'A';
  return c;
}

int lowercase( char *c ) {

  for ( ; *c ; c++ ) if (( *c>='A' )&&( *c<='Z' )) *c+='a'-'A';
}

int strpatternlowcase( char *src, char *pattern ) {

  for ( ; (*src)&&(*pattern) ; src++, pattern++ ) {
  	
  	if ( lowcase(*src) != *pattern ) return 0;
  }
  return !(*pattern);
}

/*
void createDirOrDie( const char *dir ) {
	
  if ( !g_file_test( dir, G_FILE_TEST_IS_DIR ) )
    if ( g_mkdir( dir, S_IRWXU | S_IRWXG | S_IROTH | S_IXOTH ) == -1 ) {

      printf("Fatal : Cannot create directory %s\n", dir );
      exit(1);
    }
} */

char getDigitFromIdx( gint idx ) {

  if ( idx < 10 ) return idx+'0';
  return idx-10 + 'a';	
}

void getDirFromPath( const char *path, char *dir ) {

  const char *c = path;
  char *d = dir;
  char *lastslash = dir;
  
  for ( ; *c ; c++, d++ ) {
  	*d = *c;
  	if 	( *d == '/' ) lastslash = d;
  }
  *lastslash = 0;
}

const char* getTitleFromPath( const char *path ) {

  const char *c = path;
  const char *lastslash = path;
  for ( ; *c ; c++ )
    if 	( *c == '/' ) lastslash = c;
  return lastslash+1;
}

gint getDepthFromPath( const char *path ) {

  const char *c = path;
  gint depth = 0;
  
  for ( ; *c ; c++ ) if (*c=='/') depth++;
  return depth;
}

char* getPathFromIdx( gint idx, char *path ) {

  char *c = path;
  idx += 36;
  *(c++) = '/';
  *(c++) = getDigitFromIdx( idx % 36 );
  *(c++) = '/';
  idx /= 36;
  do {
  	
  	*(c++) = getDigitFromIdx( idx % 36 );
  	idx /= 36;
  } while (idx);
  g_stpcpy(c,".html");
  return path;
}

const char *cutRoot( const char *root, const char *path ) {

  const char *rt = path+g_strlen(root);
  if ( strncmp	(path, root, g_strlen(root) )) 
    g_printf( "* bad rooted file name %s\n", path );
  if (*rt == '/' ) rt++;
  return rt; 
}



elementCounter* elementCounterNew( int maxElements ) {

  elementCounter *ec = g_malloc( sizeof( elementCounter ) );
  
  ec->maxElements = maxElements;
  ec->index = g_malloc( maxElements * 2* sizeof( int ) );
  memset( ec->index, 0xff, maxElements * 2* sizeof( int ) );
  
  return ec;
}

void elementCounterDelete( elementCounter* ec ) {

  g_free( ec->index );
  g_free( ec );	
}

void elementCounterReset( elementCounter* ec ) {

  memset( ec->index, 0xff, ec->maxElements * 2* sizeof( int ) );
}

void elementCounterPushs( elementCounter* ec, int element, int factor ) {
	
  int i;
  for ( i=0 ; (i < ec->maxElements)&&(ec->index[2*i]!=-1) ; i++ ) {
  	
  	if ( ec->index[2*i] == element ) {
  	
  	  ec->index[2*i+1] += factor;
  	  return;	
  	}
  }
  if ( i < ec->maxElements ) {
  	
  	ec->index[2*i] = element;
  	ec->index[2*i+1] = factor;
  }
}

void elementCounterPush( elementCounter* ec, int element ) {

  elementCounterPushs( ec, element, 1 );
}

int elementCounterGetElement( elementCounter* ec, int idx ) {

  if ( idx >= ec->maxElements ) return -1;
  return ec->index[2*idx];
}

int elementCounterGetCount( elementCounter* ec, int idx ) {

  if ( idx >= ec->maxElements ) return -1;
  return ec->index[2*idx+1];
}

void elementCounterSetCount( elementCounter* ec, int idx, int count ) {

  ec->index[2*idx+1] = count;	
}

static int counterSortCompare( const int* v1, const int *v2 ) {
	
	return (*(v1+1)>*(v2+1))?-1:+1;
}

void elementCounterSort( elementCounter* ec ) {

  int num;
  for ( num=0 ; (num < ec->maxElements)&&(ec->index[2*num]!=-1) ; num++ )
  qsort( ec->index, num, 2*sizeof(int), counterSortCompare );
}
