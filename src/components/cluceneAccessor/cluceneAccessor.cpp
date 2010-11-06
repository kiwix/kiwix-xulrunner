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
#include "ICluceneAccessor.h"

#include "kiwix/cluceneSearcher.h"
#include <string>

class CluceneAccessor : public ICluceneAccessor {

public:
  NS_DECL_ISUPPORTS
  NS_DECL_ICLUCENEACCESSOR
  
  CluceneAccessor();

private:
  ~CluceneAccessor();
  kiwix::CluceneSearcher *searcher;

};

/* Implementation file */
NS_IMPL_ISUPPORTS1(CluceneAccessor, ICluceneAccessor)

/* Constructor */
CluceneAccessor::CluceneAccessor() :
searcher(NULL) {
}

/* Destructor */
CluceneAccessor::~CluceneAccessor() {
  if (this->searcher != NULL) {
    delete this->searcher;
  }
}

/* Registration */
static NS_METHOD CluceneAccessorRegistration(nsIComponentManager *aCompMgr,
                                      nsIFile *aPath,
                                      const char *registryLocation,
                                      const char *componentType,
                                      const nsModuleComponentInfo *info) {
  return NS_OK;
}

/* Unregistration */
static NS_METHOD CluceneAccessorUnregistration(nsIComponentManager *aCompMgr,
                                        nsIFile *aPath,
                                        const char *registryLocation,
                                        const nsModuleComponentInfo *info) {
  return NS_OK;
}

/* Open Clucene readable database */
NS_IMETHODIMP CluceneAccessor::OpenReadableDatabase(const nsACString &directory, PRBool *retVal) {
  *retVal = PR_TRUE;
  
  const char *directoryPath;
  NS_CStringGetData(directory, &directoryPath);
  
  try {
    this->searcher = new kiwix::CluceneSearcher(directoryPath);
  } catch (...) {
    cerr << "Not able to open clucene database " << directoryPath <<  endl;
    *retVal = PR_FALSE;
  }

  return NS_OK;
}

/* Close Clucene writable database */
NS_IMETHODIMP CluceneAccessor::CloseReadableDatabase(PRBool *retVal) {
  *retVal = PR_TRUE;
  return NS_OK;
}

/* Search strings in the database */
NS_IMETHODIMP CluceneAccessor::Search(const nsACString &search, PRUint32 resultsCount, PRBool *retVal) {
  *retVal = PR_TRUE;
  const char *csearch;
  NS_CStringGetData(search, &csearch, NULL);

  try {
    std::string searchString = std::string(csearch);
    this->searcher->search(searchString, resultsCount);
  } catch (exception &e) {
    cerr << e.what() << endl;
    *retVal = PR_FALSE;
  }

  return NS_OK;
}

/* Reset the results */
NS_IMETHODIMP CluceneAccessor::Reset(PRBool *retVal) {
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
NS_IMETHODIMP CluceneAccessor::GetNextResult(nsACString &url, nsACString &title, 
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

NS_GENERIC_FACTORY_CONSTRUCTOR(CluceneAccessor)

static const nsModuleComponentInfo components[] =
{
   { "cluceneAccessor",
     ICLUCENEACCESSOR_IID,
     "@kiwix.org/cluceneAccessor",
     CluceneAccessorConstructor,
     CluceneAccessorRegistration,
     CluceneAccessorUnregistration
   }
};

NS_IMPL_NSGETMODULE(nsCluceneAccessor, components)
