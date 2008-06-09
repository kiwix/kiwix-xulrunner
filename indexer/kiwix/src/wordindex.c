#include "wordindex.h"
#include "filenameindex.h"
#include "htmlbuffer.h"
#include "utils.h"

wordMap *wmArticle = NULL;
articleMap* amArticle = NULL;

char *forbiddenWords[] = {
 "contents",
 "content",
 "references",
 "reference",
 "this",
 "thi",
 "sometimes",
 "sometime",
 "thus",
 "thu",
 NULL };

wordMapEntry* wordMapEntryNew( const gchar *word, wordMapEntry* next ) {

  wordMapEntry *wme = gg_malloc( sizeof( wordMapEntry ) );

  wme->word = g_strdup( word );
  wme->next = next;
  wme->nbOccurence = 0;
  wme->nbTextOccurence = 0;
  wme->lastArticleOccurence = -1;
  wme->topArticle = 0;
 
  return wme;
}

void wordMapEntryDelete( wordMapEntry *wme ) {

  if ( !wme ) return;
  wordMapEntryDelete( wme->next );
  g_free( wme );
}

wordMapEntry* wordMapEntryGetFromWord( wordMapEntry *wme, const gchar *word ) {

  if ( !wme ) return NULL;
  if ( !strcmp( word, wme->word ) ) return wme;
  return wordMapEntryGetFromWord( wme->next, word );
}

gint wordMapEntryGetLength( wordMapEntry *wme ) {

  if ( !wme ) return 1;
  return wordMapEntryGetLength( wme->next ) + g_strlen( wme->word ) + 1;	
}

void wordMapEntrySave( wordMapEntry *wme, FILE *out ) {

  char zero[1] = "";
  if ( !wme ) fwrite( zero, 1, 1, out );
  else {
  	fwrite( wme->word, g_strlen( wme->word )+1, 1, out );
    wordMapEntrySave( wme->next, out );
  }
}

wordMap* wordMapNew() {

  wordMap *wm = gg_malloc( sizeof( wordMap ) );
  gint i;
  for ( i = 0 ; i < WORD_HACK_SIZE ; i++ ) wm->entry[i] = NULL;
  wm->index = NULL;
  return wm;
}

void wordMapDelete( wordMap * wm ) {

  gint i;
  if ( !wm ) return;
  for ( i = 0 ; i < WORD_HACK_SIZE ; i++ ) wordMapEntryDelete( wm->entry[i] );  	
  if ( wm->index ) g_free( index );
}

wordMapEntry* wordMapGetFromWord( wordMap *wm, const gchar *word ) {

  wordMapEntry *rtwme = wordMapEntryGetFromWord( wm->entry[ wordMapGetHack( word ) ], word );
  if ( rtwme ) return rtwme;
  if (( PLURAL_REMOVE )&&( word[g_strlen(word)-1] == 's' )) {
  	
   	 gchar wordsing[128];
   	 g_stpcpy( wordsing, word );
   	 wordsing[ g_strlen( wordsing ) -1 ] = 0;
   	 return wordMapEntryGetFromWord( wm->entry[ wordMapGetHack( wordsing ) ], wordsing );
  }
  return NULL;
}

wordMapEntry* wordMapGetFromWordCreate( wordMap *wm, const gchar *word ) {

  static int cword = 0;
  gint hack = wordMapGetHack( word );
  wordMapEntry* we = wordMapEntryGetFromWord( wm->entry[ hack ], word );
  
  if ( we ) return we;
  wm->entry[hack] = wordMapEntryNew( word, wm->entry[hack] );
  return wm->entry[hack];
}

gint wordMapEntryCheckRemoval( wordMapEntry* wme, wordMap* wm, gint maxoccurence ) {
	
   int i;
   if ( wme->nbTextOccurence > maxoccurence ) return 1;
   for ( i = 0 ; forbiddenWords[i] ; i++ )
     if ( !strcmp(wme->word, forbiddenWords[i]) ) return 1;
   if ( PLURAL_REMOVE && (wme->word[ g_strlen( wme->word )-1] == 's' )) {
   	
   	 wordMapEntry *wmee;
   	 gchar wordsing[128];
   	 g_stpcpy( wordsing, wme->word );
   	 wordsing[ g_strlen( wordsing ) -1 ] = 0;
   	 if ( wmee = wordMapGetFromWord( wm, wordsing ) ) {
   	 
   	   	wmee->nbTextOccurence += wme->nbTextOccurence;
   	   	wmee->nbOccurence += wme->nbOccurence;
   	   	return 1;
   	 }
   } 
   return 0;
}

void wordMapClean( wordMap *wm, gint maxoccurence ) {

  gint i;
  
  for ( i = 0 ; i < WORD_HACK_SIZE ; i++ ) {
  	
  	wordMapEntry *wme, *nextwme;

  	if (( wm->entry[i] )&&( wm->entry[i]->next ))
   	  for ( wme = wm->entry[i] ; wme->next ;  )
   	  	if ( wordMapEntryCheckRemoval( wme->next, wm, maxoccurence ) ) {
    		nextwme = wme->next->next;
    	  	printf( "cleaning %s\n", wme->next->word );
    		g_free( wme->next );
  	    	wme->next = nextwme;
    	} else wme = wme->next;

  	if ( wm->entry[i] ) 
  	  if ( wordMapEntryCheckRemoval( wm->entry[i], wm, maxoccurence ) ) {
  	  	nextwme = wm->entry[i]->next;
  	  	printf( "top cleaning %s\n", wm->entry[i]->word );
  	  	g_free( wm->entry[i] );
  	  	wm->entry[i] = nextwme;
  	  }
  }	
}

void wordMapSerialize( wordMap *wm ) {

  gint i;
  gint index = 0;
  for ( i = 0 ; i < WORD_HACK_SIZE ; i++ ) {
  	
  	wordMapEntry *wme;
  	for ( wme = wm->entry[i] ; wme ; wme = wme->next )
  	  	wme->index = index++;
  }	
  wm->size = index;
  
  index = 0;
  wm->index = gg_malloc(wm->size*sizeof(wordMapEntry*));
  for ( i = 0 ; i < WORD_HACK_SIZE ; i++ ) {
  	
  	wordMapEntry *wme;
  	for ( wme = wm->entry[i] ; wme ; wme = wme->next )
  	  	wm->index[index++] = wme;
  }	
}

gint wordMapGetHack( const gchar *word ) {

  guint hack = 0;
  const gchar *c = word;
  if ( *c ) hack += 643*(guint)(*c++);
  if ( *c ) hack += 71*(guint)(*c++);
  if ( *c ) hack += 9*(guint)(*c++);

  return hack % WORD_HACK_SIZE;
}

wordMapEntry* wordMapGetFromIndex( wordMap *wm, gint idx ) {

  return wm->index[idx];	
}

void wordMapSave( wordMap *wm, const gchar *filename ) {

  intIndex zeroIndex = 0;
  intOffset  offset[WORD_HACK_SIZE];
  gint  i;
  FILE* out = fopen( filename, "w" );
  if ( !out ) { printf( "Fatal : Can't write to %s\n", 	filename ); exit(1); }
  
  offset[0] = WORD_HACK_SIZE * sizeof( intOffset );
  for ( i = 1 ; i < WORD_HACK_SIZE ; i++ ) 
    offset[i] = offset[i-1] + wordMapEntryGetLength( wm->entry[i-1] ) + sizeof( intIndex );
  fwrite( offset, sizeof( intOffset ), WORD_HACK_SIZE, out );
  
  for ( i = 0 ; i < WORD_HACK_SIZE ; i++ ) {
  	
  	if ( wm->entry[i] ) fwrite( &(wm->entry[i]->index), sizeof( intIndex ), 1, out );
  	else fwrite( &zeroIndex, sizeof( intIndex ), 1, out );
    wordMapEntrySave( wm->entry[i], out );
  }
  fclose( out );
}

void wordMapSaveIndex( wordMap *wm, const gchar *filename ) {

  intOffset *offset;
  gint i,j;
  FILE* out = fopen( filename, "w" );
  if ( !out ) { printf( "Fatal : Can't write to %s\n", 	filename ); exit(1); }

  if ( wm->size > 0 )
    offset = gg_malloc( wm->size * sizeof( intOffset ) );
  else
    offset = gg_malloc( sizeof( intOffset ) );
  
  offset[0] = wm->size * sizeof( intOffset );
  for ( i = 1 ; i < wm->size ; i++ ) 
    offset[i] = offset[i-1] + wm->index[i-1]->topArticle * ARTICLE_CODE_SIZE + sizeof( intIndex );

  if ( wm->size > 0 )
    fwrite( offset, sizeof( intOffset ), wm->size, out );
  else
    fwrite( offset, sizeof( intOffset ), 1, out );
  
  for ( i = 0 ; i < wm->size ; i++ ) {
  
    fwrite( &(wm->index[i]->topArticle), sizeof( intIndex ), 1, out );
    for ( j = 0 ; j < wm->index[i]->topArticle ; j++ ) 
      fwrite( wm->index[i]->article+j, ARTICLE_CODE_SIZE, 1, out );
  }

  fclose( out ); 
  g_free( offset );
}

void articleMapSave( Fni *fni, const gchar *filename ) {
	
  gint i;
  FILE* out = fopen( filename, "w" );
  if ( !out ) { printf( "Fatal : Can't write to %s\n", 	filename ); exit(1); }
  intOffset offset = fni->maxidx * sizeof( intOffset );

  fwrite( &offset, sizeof( intOffset ), 1, out );    
  for ( i = 1 ; i < fni->maxidx ; i++ ) {
  	offset += g_strlen( fniGetFromIdx( fni, i-1 ) )
  	        + g_strlen( fniGetTitleFromIdx( fni, i-1 ) ) + 2;
  	fwrite( &offset, sizeof( intOffset ), 1, out );
  }
  
  for ( i = 0 ; i < fni->maxidx ; i++ ) {
  	
  	const gchar *name = fniGetFromIdx( fni, i );
  	const gchar *title = fniGetTitleFromIdx( fni, i );
  	fwrite( name, g_strlen( name )+1, 1, out );
  	fwrite( title, g_strlen( title )+1, 1, out );
  }
  fclose( out );
}

void articleMapSaveIndex( articleMap *am, const gchar *filename ) {
	
  gint i;
  FILE* out = fopen( filename, "w" );
  if ( !out ) { printf( "Fatal : Can't write to %s\n", 	filename ); exit(1); }
  fwrite( &am->size, sizeof( intOffset ), 1, out );
  	
  for ( i = 0 ; i < am->size ; i++ ) 
      fwrite( am->index[i].vocabulaire, sizeof(intIndex), WORD_MAX_ARTICLE_VOCAB+2, out );

  fclose( out );
}

void wordMapPushArticle( wordMap *wm, gint w, gint a ) {

  if ( w >= 0 ) {
    wordMapEntry* wme = wordMapGetFromIndex( wm, w );
    if ( wme->topArticle >= WORD_MAX_ARTICLE ) return;
    wme->article[ wme->topArticle++ ] = a;
  } 
}

void wordMapPushEndTitles( wordMap *wm ) {

  gint i;
  for ( i = 0 ; i < wm->size ; i++ ) {
  	wordMapEntry *wme  = wm->index[i];
  	if ( wme->topArticle < WORD_MAX_ARTICLE )
    wme->article[ wme->topArticle++ ] = -1;
  }
}

articleMap* articleMapNew( gint size ) {
	
	gint i;
	articleMap* am = gg_malloc( sizeof( articleMap ) );
	am->size = size;
	am->index = gg_malloc( size * sizeof( articleMapEntry ) );
	for ( i = 0 ; i < size ; i++ ) {
  	  am->index[i].vocabulaire[0] = -2;
	  am->index[i].vocabulaire[1] = -1;
	}

	return am;
}

void articleMapAddVocabulary( articleMap *am, gint idx, elementCounter *counter ) {

  gint j;
  gint maxWord;

  maxWord = counter->maxElements / WORD_MAX_ARTICLE_VOCAB_RATIO;
  if ( maxWord > WORD_MAX_ARTICLE_VOCAB ) maxWord = WORD_MAX_ARTICLE_VOCAB;

  for ( j = 0 ; (j < maxWord)&&(elementCounterGetCount( counter, j )>am->size ) ; j++ ) {
  	am->index[idx].vocabulaire[j] = elementCounterGetElement( counter, j );
  }
  am->index[idx].vocabulaire[j++] = -2;
  for ( ; j < maxWord+1 ; j++ ) {
  	am->index[idx].vocabulaire[j] = elementCounterGetElement( counter, j-1 );
  }
  am->index[idx].vocabulaire[j] = -1;
  am->index[idx].topWord = j;
}

void wikiBuildWordArticleMap( const gchar *root ) {

  int i,j;
  gchar rootedFileName[512];
  gchar *pathFileName;
  static htmlBuffer buffer;
  gchar word[96];
  elementCounter *wordCounter = elementCounterNew(ARTICLE_MAX_WORD);

  pathFileName = g_stpcpy( rootedFileName, root );
  *pathFileName++ = '/';

  wmArticle = wordMapNew();
 
  for ( i = 0 ; i < fniArticle->maxidx ; i++ ) {
  	
    gint inTitle = 1;
    g_stpcpy( pathFileName, fniGetFromIdx( fniArticle, i ) );
    htmlBufLoad( &buffer, rootedFileName );

     htmlResetTitle( &buffer );
     while ( !htmlEobuf( &buffer ) ) {
   	
       wordMapEntry *wme;
       htmlGetNextWord( &buffer, word, 96 );
       wme = wordMapGetFromWordCreate( wmArticle, word );
       
       wme->nbOccurence++;
       if ( wme->lastArticleOccurence != i ) {
         wme->nbTextOccurence++;
         wme->lastArticleOccurence = i;
       }
       if (( htmlEobuf( &buffer ) )&&( inTitle )) {
         htmlResetBody( &buffer );
         inTitle = 0;
       }
     }
  }
  printf("polom\n");
  wordMapClean( wmArticle, (gint)(MAX_WORD_ARTICLE_OCCURENCE*fniArticle->maxidx) );
  wordMapSerialize( wmArticle );
  
  amArticle = articleMapNew(fniArticle->maxidx);
  for ( i = 0 ; i < amArticle->size ; i++ ) {
  	
  	int w,j;
  	char title[512];
  	char *ctitle = title;
   	g_stpcpy( pathFileName, fniGetFromIdx( fniArticle, i ) );
  	htmlBufLoad( &buffer, rootedFileName );
        elementCounterReset( wordCounter );
    
        htmlResetTitle( &buffer );
        htmlGetUntilNextTag( &buffer, title, 512 );
        Utf8toAsciiNoCase( title );
        fniSetTitle( fniArticle, i, title );
        while ( !htmlEobuf( &buffer ) ) {
    
  	  wordMapEntry *wme;
          htmlGetNextWord( &buffer, word, 96 );
          wme = wordMapGetFromWord( wmArticle, word );
          if ( wme ) {
            elementCounterPushs( wordCounter, wme->index, TITLE_FACTOR );
            wordMapPushArticle( wmArticle, wme->index, i );
          }
        }
       
        htmlResetBody( &buffer ); 
        while ( !htmlEobuf( &buffer ) ) {
  	
          wordMapEntry *wme;
          htmlGetNextWord( &buffer, word, 96 );
          wme = wordMapGetFromWord( wmArticle, word );
          if ( wme ) elementCounterPush( wordCounter, wme->index );
        }
  	
  	for ( j = 0 ; ( w=elementCounterGetElement(wordCounter,j) )!=-1 ; j++ ) {
  	
  	  elementCounterSetCount(wordCounter, j, 
  	    (amArticle->size*elementCounterGetCount(wordCounter, j))
  	    / wordMapGetFromIndex(wmArticle, w)->nbOccurence);
  	}
  	elementCounterSort(wordCounter);

  	/* BECAUSE THIS CODE WAS SEGFAULTING
  	printf( "Id %d : %s \n", i, fniGetFromIdx( fniArticle, i ) );
  	printf( "  %s %d %s %d %s %d\n\n", wordMapGetFromIndex( wmArticle,
          elementCounterGetElement(wordCounter,0) )->word,
  	  elementCounterGetCount(wordCounter,0),
  	  wordMapGetFromIndex( wmArticle, elementCounterGetElement(wordCounter,1) )->word,
  	  elementCounterGetCount(wordCounter,1),
  	  wordMapGetFromIndex( wmArticle, elementCounterGetElement(wordCounter,2) )->word,
  	  elementCounterGetCount(wordCounter,2) );
         articleMapAddVocabulary( amArticle, i, wordCounter );
	*/
  }
  elementCounterDelete( wordCounter );

  wordMapPushEndTitles( wmArticle );
  for ( j = 0 ; j < WORD_MAX_ARTICLE_VOCAB+2 ; j++ ) {
  
    for ( i = 0 ; i < amArticle->size ; i++ ) {

      if ( j < amArticle->index[i].topWord )
        wordMapPushArticle( wmArticle, amArticle->index[i].vocabulaire[j], i );
    }
  }

  g_stpcpy( pathFileName, "word.map" );
  wordMapSave( wmArticle, rootedFileName );
  g_stpcpy( pathFileName, "word.index" );
  wordMapSaveIndex( wmArticle, rootedFileName );
  g_stpcpy( pathFileName, "article.map" );
  articleMapSave( fniArticle, rootedFileName );
  g_stpcpy( pathFileName, "article.index" );
  articleMapSaveIndex( amArticle, rootedFileName );    
}
