#include "xpcom-config.h"
#include "nsIGenericFactory.h"
#include "IZimAccessor.h"
#include <stdio.h>
#include <stdlib.h>

#include "nsXPCOM.h"
#include "nsEmbedString.h"
#include "nsIURI.h"

#include "nsIServiceManager.h"
#include "nsIFile.h"
#include "nsCOMPtr.h"
#include "nsIProperties.h"
#include "nsDirectoryServiceDefs.h"

#include <zim/file.h>
#include <zim/article.h>
#include <zim/fileiterator.h>

#include <string>

using namespace std;

class ZimAccessor : public IZimAccessor {

public:
  NS_DECL_ISUPPORTS
  NS_DECL_IZIMACCESSOR
  
  ZimAccessor();

private:
  ~ZimAccessor();

protected:
  zim::File* zimFileHandler;
  zim::size_type firstArticleOffset;
  zim::size_type lastArticleOffset;
  zim::size_type currentArticleOffset;
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(ZimAccessor, IZimAccessor)

/* Constructor */
ZimAccessor::ZimAccessor()
  : zimFileHandler(NULL)
{}

/* Destructor */
ZimAccessor::~ZimAccessor() {
  if (this->zimFileHandler != NULL) {
    delete this->zimFileHandler;
  }
}

/* Load zim file */
NS_IMETHODIMP ZimAccessor::LoadFile(const char *path, PRBool *retVal) {
  *retVal = PR_TRUE;

  try {    
    this->zimFileHandler = new zim::File(path);

    if (this->zimFileHandler != NULL) {
      this->firstArticleOffset = this->zimFileHandler->getNamespaceBeginOffset('A');
      this->lastArticleOffset = this->zimFileHandler->getNamespaceEndOffset('A');
      this->currentArticleOffset = this->firstArticleOffset;
    } else {
      *retVal = PR_FALSE;
    }
  } catch(...) {
    *retVal = PR_FALSE;
  }
  return NS_OK;
}

/* Reset the cursor for GetNextArticle() */
NS_IMETHODIMP ZimAccessor::Reset(PRBool *retVal) {
  *retVal = PR_TRUE;
  this->currentArticleOffset = this->firstArticleOffset;
  return NS_OK;
}

/* Get the count of articles which can be indexed/displayed */
NS_IMETHODIMP ZimAccessor::GetArticleCount(PRUint32 *count, PRBool *retVal) {
  *retVal = PR_TRUE;
  if (this->zimFileHandler != NULL) {
    *count = this->zimFileHandler->getNamespaceCount('A');
  } else {
    *retVal = PR_FALSE;
  }
  return NS_OK;
}

/* List articles for a namespace */
NS_IMETHODIMP ZimAccessor::GetNextArticle(nsACString &url, nsACString &content, PRBool *retVal) {
  try {
    zim::Article currentArticle;
    
    /* get next non redirect article */
    do {
      currentArticle = this->zimFileHandler->getArticle(this->currentArticleOffset);
    } while (currentArticle.isRedirect() && 
	     this->currentArticleOffset != this->lastArticleOffset && 
	     this->currentArticleOffset++);
    
    /* returned values*/
    url = nsDependentCString(currentArticle.getUrl().getValue().c_str(), currentArticle.getUrl().getValue().size());
    content = nsDependentCString(currentArticle.getData().data(), currentArticle.getData().size());

    /* increment the offset and set returned value */
    if (this->currentArticleOffset != this->lastArticleOffset) {
      this->currentArticleOffset++;
      *retVal = PR_TRUE;
    } else {
      this->currentArticleOffset = this->firstArticleOffset;
      *retVal = PR_FALSE;
    }
  }
  catch(...) { }
  return NS_OK;
}

/* Get a content from a zim file */
NS_IMETHODIMP ZimAccessor::GetContent(nsIURI *urlObject, nsACString &content, PRUint32 *contentLength, 
				      nsACString &contentType, PRBool *retVal) {

  /* Convert the URL object to char* string */
  nsEmbedCString urlString;
  urlObject->GetPath(urlString);
  const char *url = urlString.get();
  
  /* Offset to visit the url */
  unsigned int urlLength = strlen(url);
  unsigned int offset = 0;

  /* Ignore the '/' */
  while((offset < urlLength) && (url[offset] == '/')) offset++;

  /* Get namespace */
  char ns[1024];
  unsigned int nsOffset = 0;
  while((offset < urlLength) && (url[offset] != '/')) {
    ns[nsOffset] = url[offset];
    offset++;
    nsOffset++;
  }
  ns[nsOffset] = 0;

  /* Ignore the '/' */
  while((offset < urlLength) && (url[offset] == '/')) offset++;  

  /* Get content title */
  char title[1024];
  unsigned int titleOffset = 0;
  while((offset < urlLength) && (url[offset] != '/')) {
    title[titleOffset] = url[offset];
    offset++;
    titleOffset++;
  }
  title[titleOffset] = 0;

  /* Extract the content from the zim file */
  try {
    zim::Article article = zimFileHandler->getArticle(zimFileHandler->find(ns[0], zim::QUnicodeString(title)).getIndex());

    /* Get the content mime-type */
    contentType = nsDependentCString(article.getMimeType().data(), article.getMimeType().size()); 
    
    /* Get the data */
    content = nsDependentCString(article.getData().data(), article.getArticleSize());
    
    /* Get the data length */
    *contentLength = article.getArticleSize();
  } catch(...) {
  }

  return NS_OK;
}

NS_GENERIC_FACTORY_CONSTRUCTOR(ZimAccessor)

static const nsModuleComponentInfo components[] =
{
   { "zimAccessor",
     IZIMACCESSOR_IID,
     "@kiwix.org/zimAccessor",
     ZimAccessorConstructor
   }
};

NS_IMPL_NSGETMODULE(nsZimAccessor, components)
