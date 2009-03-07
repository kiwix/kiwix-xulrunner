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
      this->firstArticleOffset = this->zimFileHandler->getNamespaceBeginOffset('0');
      this->lastArticleOffset = this->zimFileHandler->getNamespaceEndOffset('0');
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
    *count = this->zimFileHandler->getNamespaceCount('0');
  } else {
    *retVal = PR_FALSE;
  }
  return NS_OK;
}

/* List articles for a namespace */
NS_IMETHODIMP ZimAccessor::GetNextArticle(char **url, char **content, PRBool *retVal) {
  try {
    zim::Article currentArticle;
    
    /* get next non redirect article */
    do {
      currentArticle = this->zimFileHandler->getArticle(this->currentArticleOffset);
    } while (currentArticle.getRedirectFlag() && 
	     this->currentArticleOffset != this->lastArticleOffset && 
	     this->currentArticleOffset++);
    
    /* returned values*/
    string urlStr = currentArticle.getUrl().getValue();
    *url = (char*) NS_Alloc(urlStr.length()+1);
    strcpy(*url, urlStr.c_str());

    string contentStr = currentArticle.getData();
    *content = (char*) NS_Alloc(contentStr.length()+1);
    strcpy(*content, contentStr.c_str());

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
NS_IMETHODIMP ZimAccessor::GetContent(nsIURI *urlObject, char **contentType, nsACString &_retval) {

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
  zim::Article article = zimFileHandler->getArticle(ns[0], zim::QUnicodeString(title));

  /* Get the data length */
  unsigned int contentLength = article.getDataLen();

  /* Get the content mime-type */
  const char *mimeType = article.getMimeType().c_str();
  *contentType = (char*) NS_Alloc(strlen(mimeType) + 1);
  strcpy(*contentType, mimeType);

  /* Get the data */
  std::string contentString = article.getData();
  std::string::size_type contentStringSize = contentString.size();
  char *content = (char *) NS_Alloc(contentStringSize + 1);
  unsigned inc = 0;
  for(inc = 0; inc < contentStringSize; inc++) {
    content[inc] = contentString[inc];
  }
  _retval = nsDependentCString(content, contentStringSize);
  NS_Free(content);

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
