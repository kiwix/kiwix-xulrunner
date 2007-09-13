#ifndef INDEX_H_
#define INDEX_H_

#include <stdio.h>
#include "list.h"
#include "common.h"

#ifdef _POSIX_
#define SLASH_CHAR '/'
#define SLASH_HTML "/html"
#else
#define SLASH_CHAR '\\'
#define SLASH_HTML "\\html"
#endif

class wordMap {
	
public:
  wordMap();
  ~wordMap();
  void load( FILE* in );
  intIndex  getIndex( const char *word );
  const char *getWord( intIndex idx );
  void wordCompletion( const char *word, char *result, int maxlen );
  int  getHack( const char *word );
  void debug();
  int  bValid;
  
protected:
  int  parseWord( const char* word );

  char *name;
  intOffset  offset[WORD_HACK_SIZE];
  char *map, *curs;
};

class articleMap {
	
public:
  articleMap();
  ~articleMap();
  void load( FILE* in );
  const char* getName( intIndex idx );
  const char* getTitle( intIndex idx );
  int  bValid;
  
protected:
  intOffset  *offset;
  char *map;
  int  size;
};

class wordIndex {
	
public:
  wordIndex();
  ~wordIndex();
  void load( FILE* in );
  listElements* getArticles( intIndex idx );
  listElements* getTitles( intIndex idx );
  void  debug();
  int  bValid;
    
protected:
  intIndex*  entry( int idx );
  int  size;
  intOffset  *offset;
  intIndex   *index;
};

class articleIndex {
	
public:
  articleIndex();
  ~articleIndex();
  void load( FILE* in );
  listElements* getWords( intIndex idx );
  listElements* getTitles( intIndex idx );
  int length() {return size;}
  int  bValid;
    
protected:
  intOffset  size;
  intIndex   *index;
  int        *len;
};

#endif /*INDEX_H_*/
