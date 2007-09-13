#ifndef ENGINE_H_
#define ENGINE_H_

#include <stdio.h>
#include "index.h"

class engine {

public:
  void load( const char *root );
  listElements *search( const char *query );
  const char *getArticleName( listElements *res, int pos );
  const char *getArticleTitle( listElements *res, int pos );
  const char *getVocSpe( int pos );
  void wordCompletion( const char *word, char *buf, int maxlen );
  int  getScore( listElements *res, int pos );
  void debugWords();
  int  bValid;

protected:
  wordMap wm;
  wordIndex wi;
  articleMap am;
  articleIndex ai;
  listElements *vocSpe;
};



#endif
