#ifndef WORDINDEX_H_
#define WORDINDEX_H_

#include "utils.h"
#include "common.h"
#include "backend/backend.h"

typedef struct SwordMapEntry {

	gchar *word;
	intIndex  index;
	gint  nbOccurence, nbTextOccurence, lastArticleOccurence;
	intIndex  article[WORD_MAX_ARTICLE];
	intIndex  topArticle;
	
	struct SwordMapEntry *next;
} wordMapEntry;

typedef struct {
	
	wordMapEntry* entry[WORD_HACK_SIZE];
	intOffset size;
	wordMapEntry** index;
} wordMap;

typedef struct {
	
	intIndex vocabulaire[WORD_MAX_ARTICLE_VOCAB+2];
	intIndex topWord;
} articleMapEntry;

typedef struct {
	
	articleMapEntry *index;
	intOffset size;
} articleMap;

extern wordMap* wmArticle;
extern articleMap* amArticle;

void wikiBuildWordArticleMap( backend_struct * backend );

#endif /*WORDINDEX_H_*/
