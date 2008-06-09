/*  KiwixComponent - XP-COM component for Kiwix, offline reader of Wikipedia
    Copyright (C) 2007, LinterWeb (France), Fabien Coulon

    This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation; either version 2 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program; if not, write to the Free Software
    Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307  USA */

#include "index.h"
#include <string.h>

#ifdef ARCH_BIG_ENDIAN

inline void CendianW( char *ptr ) { 
  char a = *((char*)(ptr)); char b = *(((char*)(ptr))+1);
  *(((char*)(ptr))) = *(((char*)(ptr))+4);
  *(((char*)(ptr))+1) = *(((char*)(ptr))+3);
  *(((char*)(ptr))+2) = b;
  *(((char*)(ptr))+3) = a;
}

inline void CendianA( char *ptr ) { char a = *((char*)ptr);
  *(((char*)(ptr))) = *(((char*)(ptr))+1);
  *(((char*)(ptr))+1) = a; 
}

#define endianW( ptr ) CendianW( (char*)(ptr) )
#define endianA( ptr ) CendianA( (char*)(ptr) )
#else
#define endianW( ptr ) (0)
#define endianA( ptr ) (0)
#endif



static long fremains( FILE* in ) {

  long pos = ftell(in);
  fseek( in, 0L, SEEK_END );
  long size = ftell( in );
  fseek( in, pos, SEEK_SET );
  return size - pos;
}

wordMap::wordMap() {

  map = NULL;
  bValid = 0;
}

void wordMap::load( FILE* in ) {

  fread( &offset, sizeof(intOffset), WORD_HACK_SIZE, in );
  int i;
  for ( i = 0 ; i < WORD_HACK_SIZE ; i++ ) {
	endianW( offset+i );
  	offset[i] -= sizeof(intOffset)*WORD_HACK_SIZE;
  }
  	
  long size = fremains( in );
  map = new char[size];
  fread( map, 1, size, in );

  for ( i = 0 ; i < WORD_HACK_SIZE ; i++ ) 
   endianW( map + offset[ i ] );
}

wordMap::~wordMap() {

  if ( map ) delete [] map;	
}

void wordMap::debug() {

  for ( int i = 0 ; i < WORD_HACK_SIZE ; i++ ) {
    printf( "Hack %d -----------------------------\n", i );
    char* c = map + offset[i];
    int idx = *((intIndex*)c);
    int ct = 0;
    c += sizeof(intIndex);
    for (  ; *c ; c++) {
      printf( "%s\n", c );
      c += strlen( c );
      ct++;
    }
    printf ( "%d\n", ct );
  }
}

int wordMap::getHack( const char *word ) {

  unsigned int hack = 0;
  const char *c = word;
  if ( *c ) hack += 643*(intIndex)(*c++);
  if ( *c ) hack += 71*(intIndex)(*c++);
  if ( *c ) hack += 9*(intIndex)(*c++);
  return hack % WORD_HACK_SIZE;
}

const char * wordMap::getWord( intIndex idx ) {

  intIndex i, idxBase;
  for ( i = 1 ; (i < WORD_HACK_SIZE)&&
        *((intIndex*)(map + offset[ i ])) < idx ; i++ );;
  i--;
  curs = map + offset[ i ];
  idxBase = *((intIndex*)curs);
  curs += sizeof( intIndex );
  
  while (( *curs )&&(idxBase<idx)) {
   
    for ( ; *curs ; curs++ ) ;
    idxBase++;
    curs++;
  } 
  if ( *curs ) return curs;
  return NULL;
}

intIndex wordMap::getIndex( const char *word ) {

  curs = map + offset[ getHack( word ) ];
  intIndex *icurs = (intIndex*)curs;
  intIndex index = *icurs;
  curs += sizeof( intIndex );
  
  while ( *curs ) {
    if ( parseWord( word ) ) return index;
    index++;
  }
  return -1;
}

int wordMap::parseWord( const char* word ) {
	
  while (( *curs )&&(*word)&&(*word == *curs)) word++, curs++;
  if (( ! *curs )&&( ! *word )) return 1;
  while (*curs) curs++;
  curs++;
  return 0;
}

void wordMap::wordCompletion( const char *word, char *result, int maxlen ) {

  if ( map == NULL ) {
    *result = 0;
    return;
  }

  char *c = result;
  char *maxc = c+maxlen;
  int len = strlen(word);
  if ( len >= 3 ) {
   curs = map + offset[ getHack( word ) ] + 4;
   while ( *curs ) {
     int clen = strlen(curs);
     if (( !strncmp( curs, word, len ) )&&( maxc-c > clen+2 )) {
          strcpy( c, curs );
           c+=clen+1;
        }
     curs += clen+1; 
   }
  }
  *c=0;
}


articleMap::articleMap() {

  offset = NULL;
  map = NULL;	
  bValid = 0;
}

void articleMap::load( FILE* in ) {

  intOffset offset0;
  fread( &offset0, sizeof(intOffset), 1, in );
  endianW( &offset0 );
  size = offset0 / sizeof(intOffset);
  
  offset = new intOffset[size];
  offset[0] = offset0;
  fread( offset+1, sizeof(intOffset), size-1, in );
  for ( int i = 0 ; i < size ; i++ ) {
    endianW( offset+i );
    offset[i] -= size*sizeof(intOffset);
  }
  
  long fsize = fremains( in );
  map = new char[fsize];
  fread( map, 1, fsize, in );
}

articleMap::~articleMap() {

  if ( offset ) delete [] offset;
  if ( map ) delete [] map;	
}

const char* articleMap::getName( intIndex idx ) {

  return map + offset[idx];
}

const char* articleMap::getTitle( intIndex idx ) {

  char *c = map + offset[idx];
  return c+ strlen(c)+1;	
}

wordIndex::wordIndex() {

  index = NULL;
  offset = NULL;	
  bValid = 0;
}

void wordIndex::load( FILE * in ) {

  intOffset offset0;
  fread( &offset0, sizeof(intOffset), 1, in );
  endianW( &offset0 );
  size = offset0 / sizeof(intOffset );
  
  offset = new intOffset[size];
  offset[0] = offset0;
  fread( offset+1, sizeof(intOffset), size-1, in );

  int i;
  for ( i = 0 ; i < size ; i++ ) {
        endianW( offset + i );
 	offset[i] -= sizeof(intOffset)*size;
  }
 	
  long sz = fremains( in );
  index = new intIndex[sz/sizeof(intIndex)+1];
  fread( index, 1, sz, in );
  for ( i = 0 ; i < size ; i++ ) {

    intIndexArticle *base = (intIndexArticle*)entry(i);
    for ( ; endianA( base ), *base != -1 ; base++ ) ;
  }
}

wordIndex::~wordIndex() {

  if ( index ) delete [] index;
  if ( offset ) delete [] offset;
}

void wordIndex::debug() {

  for ( int i = 0 ; i < size ; i++ ) {
  
    intIndex* e = entry( i );
    printf( "%d : %d articles : ", i, *e );
    for ( int j = 0 ; j < *e ; j++ ) {
    
      printf( "%d ", *(e+j+1) );
    }
    printf("\n");
  }
}

intIndex*  wordIndex::entry( int idx ) {

  return (intIndex*)(((char*)index)+offset[idx]);
}

listElements* wordIndex::getArticles( intIndex idx ) {

  intIndex* e = entry( idx );
  listElements* le = new listElements( *e );
  le->insertAllArrayArticle(e+1,-1);
  return le;
}

listElements* wordIndex::getTitles( intIndex idx ) {

  intIndex* e = entry( idx );
  listElements* le = new listElements( *e );
  le->insertArrayArticle(e+1,-1);
  return le;
}

articleIndex::articleIndex() {

  index = NULL;
  len = NULL;	
  bValid = 0;
}

void articleIndex::load( FILE* in ) {

  fread( &size, sizeof(intOffset), 1, in );
  endianW( &size );
  index = new intIndex[size * (WORD_MAX_ARTICLE_VOCAB+2)];
  fread( index, sizeof(intIndex), size * (WORD_MAX_ARTICLE_VOCAB+2), in );
  len = new int[size];
  
  for ( int i = 0 ; i < size ; i++ ) {
  	
  	intIndex *e = index + i * (WORD_MAX_ARTICLE_VOCAB+2);
  	int j;
  	for ( j = 0 ; endianW( e+j ), e[j] != -1 ; j++ ) ;
  	len[i] = j;
  }
}

articleIndex::~articleIndex() {

  if ( index ) delete [] index;
  if ( len ) delete [] len;
}

listElements* articleIndex::getWords( intIndex idx ) {

  intIndex *e = index + idx * (WORD_MAX_ARTICLE_VOCAB+2);
  listElements* le = new listElements(WORD_MAX_ARTICLE_VOCAB+1);
  le->insertAllArray(e,-2,-1);
  le->setCount(0,4);
  le->setCount(1,4);
  le->setCount(2,3);
  le->setCount(3,2);
  return le;
}

listElements* articleIndex::getTitles( intIndex idx ) {

  intIndex *e = index + idx * (WORD_MAX_ARTICLE_VOCAB+2);
  listElements* le = new listElements(WORD_MAX_ARTICLE_VOCAB+1);
  le->insertArray(e,-2);
  return le;
}
