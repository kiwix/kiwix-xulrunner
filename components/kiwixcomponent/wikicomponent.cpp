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

#include "xpcom-config.h"
#include "nsIGenericFactory.h"
#include "IWikiComponent.h"
#include "engine.h"
#include "list.h"
#include <stdio.h>
#include <stdlib.h>

#include "nsXPCOM.h"
#include "nsIServiceManager.h"
#include "nsIFile.h"
#include "nsCOMPtr.h"
#include "nsIProperties.h"
#include "nsDirectoryServiceDefs.h"
#include "nsEmbedString.h"
  
#define WIKI_CID \
{ 0x05ac4aac, 0xb792, 0x49b8, \
{ 0xb8, 0x48, 0x5e, 0xa9, 0x27, 0x1c, 0x49, 0x66}}

#ifdef _POSIX_
#define SLASH_CHAR '/'
#define SLASH_HTML "/html"
#else
#define SLASH_CHAR '\\'
#define SLASH_HTML "\\html"
#endif

class WikiSearch : public iWikiSearch {
public:
  WikiSearch();
  virtual ~WikiSearch();
  NS_DECL_ISUPPORTS
  NS_DECL_IWIKISEARCH
  
protected:
  int bInit;
  int nCompletion;
  engine *searchEngine;
  listElements *res;
  char   rootPath[512];
  char   completions[1024];
  char  *completionEntry[128];
};

void *gg_malloc( long size ) {

  return NS_Alloc( size );	
}

void gg_free( void *ptr ) {
	
  NS_Free( ptr );
}

WikiSearch::WikiSearch() {

  /* Open services for getting our absolute path */

    searchEngine = NULL;
    nsresult rv;
    nsIServiceManager* servMan;
    rv = NS_GetServiceManager(&servMan);
    if (NS_FAILED(rv)) return ;
    nsIProperties* directoryService;
    rv = servMan->GetServiceByContractID(
    NS_DIRECTORY_SERVICE_CONTRACTID,
    NS_GET_IID(nsIProperties),
    (void**)&directoryService);
    if (NS_FAILED(rv)) return ;

    nsIFile *theFile;
    rv = directoryService->Get("resource:app",
                          NS_GET_IID(nsIFile),
                          (void**)&theFile);
    if (NS_FAILED(rv)) return ;

    nsEmbedCString path;
    theFile->GetNativePath(path);
    NS_RELEASE(servMan);
    NS_RELEASE(directoryService);
    NS_RELEASE(theFile);

  /* Translate <path> to get absolute path to root (the 'html' directory) */

    strcpy( rootPath, path.get() );
    printf( "%s\n", rootPath );
/*  char* c = rootPath;
    char* lastSlash;
    for ( ; *c ; c++ ) if ( *c == SLASH_CHAR ) lastSlash = c; */
    strcat( rootPath, SLASH_HTML );
//  strcpy( lastSlash, SLASH_HTML );
    printf( "root = %s\n", rootPath );

    searchEngine = new engine();
    searchEngine->load( rootPath );
    res = NULL;
}

WikiSearch::~WikiSearch() {

  if ( searchEngine ) delete searchEngine;
}

char *allocEmptyStr() {
 /* generate a NS_alloced empty string to pass through xp-com */

  char *c = (char*)NS_Alloc(1);
  *c = 0;
  return c;
}

char *allocStr( const char *c ) {
 /* duplicates the local string <c> into a NS_allocated string to pass through xp-com */

  char *rt = (char*)NS_Alloc( strlen(c)+1 );
  strcpy( rt, c );
  return rt;
}

NS_IMETHODIMP WikiSearch::GetRootPath(char **_retval) {
 /* returns path to the root (html) directory */

  *_retval = allocStr(rootPath);
  return NS_OK;
}

NS_IMETHODIMP WikiSearch::Search(const nsACString & word, PRUint32 *_retval) {
 /* search query for the phrase <word> - returns the number of results */

  if ( !searchEngine->bValid ) {
  	*_retval = 1;
  	return NS_OK;
  }

  char query[256];
  int  len = word.EndReading() - word.BeginReading();
  if ( len > 256 ) len = 256;
  memcpy( query, word.BeginReading(), len );
  query[len]=0;

  if ( res ) delete res;
  res = searchEngine->search( query );
  *_retval = res->length();
    
  return NS_OK;
}

NS_IMETHODIMP WikiSearch::GetResult(PRUint32 idx, char **_retval) {
 /* get the result number <idx> as article relative path */

  if ( !searchEngine->bValid ) {
  	*_retval = allocEmptyStr();
  	return NS_OK;
  }
  const char *retSearch = searchEngine->getArticleName( res, idx );
  *_retval = allocStr(retSearch);
  return NS_OK;
}

NS_IMETHODIMP WikiSearch::GetTitle(PRUint32 idx, char **_retval) {
 /* get the result number <idx> as article title */

  if ( !searchEngine->bValid ) {
  	*_retval = allocStr("Could not load search index");
  	return NS_OK;
  }
  const char *retSearch = searchEngine->getArticleTitle( res, idx );
  *_retval = allocStr(retSearch);
  return NS_OK;
}

NS_IMETHODIMP WikiSearch::GetScore(PRUint32 idx, PRUint32 *_retval) {
 /* get the score of result number <idx> */

  if ( !searchEngine->bValid ) {
  	*_retval = 0;
  	return NS_OK;
  }
  *_retval = searchEngine->getScore( res, idx );
  return NS_OK;
}

NS_IMETHODIMP WikiSearch::GetVocSpe(PRUint32 idx, char **_retval) {
 /* returns the specific word number <idx> wrt last query */

  if ( !searchEngine->bValid ) {
  	*_retval = allocEmptyStr();
  	return NS_OK;
  }
  const char *retSearch = searchEngine->getVocSpe( idx );
  if ( !retSearch ) *_retval = allocEmptyStr();
  else *_retval = allocStr(retSearch);
  return NS_OK;
}

static int completionCompare( char **s1, char **s2 ) {

  return (strlen( *s1 ) > strlen( *s2 ))? +1 : -1;
}

NS_IMETHODIMP WikiSearch::CompletionStart(const nsACString & word, PRUint32 *_retval) {
 /* Start a completion query for word <word> - returns the number of completions found */

  char query[256];
  int  len = word.EndReading() - word.BeginReading();
  if ( len > 256 ) len = 256;
  memcpy( query, word.BeginReading(), len );
  query[len]=0;

    searchEngine->wordCompletion( query, completions, 1024 );
    char *c = completions;
    nCompletion = 0;
    while ( *c ) {
      completionEntry[ nCompletion ] = c;  
      c+=strlen(c)+1;
      nCompletion++;
    }
    qsort( completionEntry, nCompletion, sizeof( char* ), 
           (int(*) (const void*, const void*))completionCompare );

    *_retval = nCompletion;
    return NS_OK;
}

NS_IMETHODIMP WikiSearch::GetCompletion(PRUint32 idx, char **_retval) {
 /* Continues a completion query - gets result <idx> */

    if ( idx >= nCompletion ) {
      *_retval = allocEmptyStr();
      return NS_OK;
    }
    *_retval = allocStr( completionEntry[idx] );
    return NS_OK;
}

NS_IMPL_ISUPPORTS1(WikiSearch, iWikiSearch)

NS_GENERIC_FACTORY_CONSTRUCTOR(WikiSearch)

static const nsModuleComponentInfo components[] =
{
   { "WikiComponent",
     WIKI_CID,
     "@linterweb.com/wikicomponent",
     WikiSearchConstructor
   }
};

NS_IMPL_NSGETMODULE(nsWikiModule, components)
