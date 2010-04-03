#include "xpcom-config.h"
#include "nsIGenericFactory.h"
#include "nsXPCOM.h"
#include "nsEmbedString.h"
#include "nsIURI.h"
#include "nsIServiceManager.h"
#include "nsIFile.h"
#include "nsCOMPtr.h"
#include "nsIProperties.h"
#include "nsDirectoryServiceDefs.h"
#include "IXapianAccessor.h"

#include "kiwix/searcher.h"
#include <string>

class XapianAccessor : public IXapianAccessor {

public:
  NS_DECL_ISUPPORTS
  NS_DECL_IXAPIANACCESSOR
  
  XapianAccessor();

private:
  ~XapianAccessor();
  kiwix::Searcher *searcher;

};

/* Implementation file */
NS_IMPL_ISUPPORTS1(XapianAccessor, IXapianAccessor)

/* Constructor */
XapianAccessor::XapianAccessor() :
searcher(NULL) {
}

/* Destructor */
XapianAccessor::~XapianAccessor() {
  if (this->searcher != NULL) {
    delete this->searcher;
  }
}

/* Open Xapian readable database */
NS_IMETHODIMP XapianAccessor::OpenReadableDatabase(const nsACString &directory, PRBool *retVal) {
  *retVal = PR_TRUE;
  
  const char *directoryPath;
  NS_CStringGetData(directory, &directoryPath);
  
  try {
    this->searcher = new kiwix::Searcher(directoryPath);
  } catch (...) {
    cerr << "Not able to open xapian database " << directoryPath <<  endl;
    *retVal = PR_FALSE;
  }

  return NS_OK;
}

/* Close Xapian writable database */
NS_IMETHODIMP XapianAccessor::CloseReadableDatabase(PRBool *retVal) {
  *retVal = PR_TRUE;
  return NS_OK;
}


/* Search strings in the database */
NS_IMETHODIMP XapianAccessor::Search(const nsACString &search, PRUint32 resultsCount, PRBool *retVal) {
  *retVal = PR_TRUE;
  const char *csearch;
  NS_CStringGetData(search, &csearch, NULL);

  try {
    this->searcher->search(csearch, resultsCount);
  } catch (exception &e) {
    cerr << e.what() << endl;
    *retVal = PR_FALSE;
  }

  return NS_OK;
}

/* Reset the results */
NS_IMETHODIMP XapianAccessor::Reset(PRBool *retVal) {
  *retVal = PR_TRUE;

  try {
    this->searcher->reset();
  } catch (exception &e) {
    cerr << e.what() << endl;
    *retVal = PR_FALSE;
  }

  return NS_OK;
}

/* Get next result */
NS_IMETHODIMP XapianAccessor::GetNextResult(nsACString &url, nsACString &title, 
					    PRUint32 *score, PRBool *retVal) {
  *retVal = PR_FALSE;
  std::string urlStr;
  std::string titleStr;
  unsigned int scoreInt;

  try {
    if (this->searcher->getNextResult(urlStr, titleStr, scoreInt)) {
      
      /* url */
      url = nsDependentCString(urlStr.c_str(), 
			       urlStr.length());
      
      /* title */
      title = nsDependentCString(titleStr.c_str(), 
				 titleStr.length());
      
      /* score */
      *score = scoreInt;

      *retVal = PR_TRUE;
    }
  } catch (exception &e) {
    cerr << e.what() << endl;
  }

  return NS_OK;
}

NS_GENERIC_FACTORY_CONSTRUCTOR(XapianAccessor)

static const nsModuleComponentInfo components[] =
{
   { "xapianAccessor",
     IXAPIANACCESSOR_IID,
     "@kiwix.org/xapianAccessor",
     XapianAccessorConstructor
   }
};

NS_IMPL_NSGETMODULE(nsXapianAccessor, components)
