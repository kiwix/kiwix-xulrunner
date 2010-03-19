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

#include <kiwix/reader.h>

class ZimAccessor : public IZimAccessor {

public:
  NS_DECL_ISUPPORTS
  NS_DECL_IZIMACCESSOR
  
  ZimAccessor();

private:
  ~ZimAccessor();

protected:
  kiwix::Reader *reader;
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(ZimAccessor, IZimAccessor)

/* Constructor */
ZimAccessor::ZimAccessor()
: reader(NULL) {
}

/* Destructor */
ZimAccessor::~ZimAccessor() {
  if (this->reader != NULL) {
    delete this->reader;
  }
}

/* Load zim file */
NS_IMETHODIMP ZimAccessor::LoadFile(const nsACString &path, PRBool *retVal) {
  *retVal = PR_TRUE;

  const char *filePath;
  NS_CStringGetData(path, &filePath);

  /* Instanciate the ZIM file handler */
  try {
    this->reader = new kiwix::Reader(filePath);
  } catch (...) {
  }

  if (this->reader == NULL) {
    *retVal = PR_FALSE;
  }

  return NS_OK;
}

/* Reset the cursor for GetNextArticle() */
NS_IMETHODIMP ZimAccessor::Reset(PRBool *retVal) {
  *retVal = PR_TRUE;
  this->reader->reset();
  return NS_OK;
}

/* Get the count of articles which can be indexed/displayed */
NS_IMETHODIMP ZimAccessor::GetArticleCount(PRUint32 *count, PRBool *retVal) {
  *retVal = PR_TRUE;
  if (this->reader != NULL) {
    *count = this->reader->getArticleCount();
  } else {
    *retVal = PR_FALSE;
  }
  return NS_OK;
}

/* Return the UID of the ZIM file */
NS_IMETHODIMP ZimAccessor::GetId(nsACString &id, PRBool *retVal) {
  *retVal = PR_TRUE;

  if (this->reader != NULL) {
    id = nsDependentCString(this->reader->getId().c_str(), 
			    this->reader->getId().size());
  } else {
    *retVal = PR_FALSE;
  }
  return NS_OK;
}

/* Return a random article URL */
NS_IMETHODIMP ZimAccessor::GetRandomPageUrl(nsACString &url, PRBool *retVal) {
  *retVal = PR_TRUE;

  if (this->reader != NULL) {
    string urlstr = this->reader->getRandomPageUrl();
    url = nsDependentCString(urlstr.c_str(), urlstr.size());
  } else {
    *retVal = PR_FALSE;
  }
  return NS_OK;
}

/* Return the welcome page URL */
NS_IMETHODIMP ZimAccessor::GetMainPageUrl(nsACString &url, PRBool *retVal) {
  *retVal = PR_TRUE;

  if (this->reader != NULL) {
    string urlstr = this->reader->getMainPageUrl();
    url = nsDependentCString(urlstr.c_str(), urlstr.size());
  } else {
    *retVal = PR_FALSE;
  }
  return NS_OK;
}

/* Get a content from a zim file */
NS_IMETHODIMP ZimAccessor::GetContent(nsIURI *urlObject, nsACString &content, PRUint32 *contentLength, 
				      nsACString &contentType, PRBool *retVal) {

  /* Convert the URL object to char* string */
  nsEmbedCString urlString;
  urlObject->GetPath(urlString);
  const string url = string(urlString.get());

  /* strings */
  string contentStr;
  string contentTypeStr;
  unsigned int contentLengthInt;

  if (this->reader->getContent(url, contentStr, contentLengthInt, contentTypeStr)) {
    contentType = nsDependentCString(contentTypeStr.data(), contentTypeStr.size()); 
    content = nsDependentCString(contentStr.data(), contentStr.size());
    *contentLength = contentLengthInt;
    *retVal = PR_TRUE;
  } else {
    content="";
    *contentLength = 0;
    *retVal = PR_FALSE;
  }

  return NS_OK;
}

/* Search titles by prefix*/
NS_IMETHODIMP ZimAccessor::SearchSuggestions(const nsACString &prefix, PRUint32 suggestionsCount, PRBool *retVal) {
  const char *titlePrefix;
  NS_CStringGetData(prefix, &titlePrefix);

  if (this->reader->searchSuggestions(titlePrefix, suggestionsCount)) {
    *retVal = PR_TRUE;
  } else {
    *retVal = PR_FALSE;
  }

  return NS_OK;
}

/* Get next suggestion */
NS_IMETHODIMP ZimAccessor::GetNextSuggestion(nsACString &title, PRBool *retVal) {
  *retVal = PR_FALSE;
  
  string titleStr;

  if (this->reader->getNextSuggestion(titleStr)) {
    title = nsDependentCString(titleStr.c_str(), 
			       titleStr.length());
    *retVal = PR_TRUE;    
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
