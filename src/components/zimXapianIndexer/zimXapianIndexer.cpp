#include "xpcom-config.h"
#include "nsIGenericFactory.h"
#include "IZimXapianIndexer.h"

#include "nsXPCOM.h"
#include "nsEmbedString.h"
#include "nsIURI.h"

#include "nsIServiceManager.h"
#include "nsIFile.h"
#include "nsCOMPtr.h"
#include "nsIProperties.h"
#include "nsDirectoryServiceDefs.h"

#include <kiwix/indexer.h>

using namespace std;

class ZimXapianIndexer : public IZimXapianIndexer {

public:
  NS_DECL_ISUPPORTS
  NS_DECL_IZIMXAPIANINDEXER
  
  ZimXapianIndexer();

private:
  ~ZimXapianIndexer();
  kiwix::Indexer* indexer;
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(ZimXapianIndexer, IZimXapianIndexer)

/* Constructor */
ZimXapianIndexer::ZimXapianIndexer() 
: indexer(NULL) {
}

/* Destructor */
ZimXapianIndexer::~ZimXapianIndexer() {
  if (this->indexer != NULL) {
    delete this->indexer;
  }
}

/* Start indexing */
NS_IMETHODIMP ZimXapianIndexer::StartIndexing(const nsACString &zimFilePath, 
					      const nsACString &xapianDirectoryPath, 
					      PRBool *retVal) {
  *retVal = PR_TRUE;
  const char *cZimFilePath;
  NS_CStringGetData(zimFilePath, &cZimFilePath);
  const char *cXapianDirectoryPath;
  NS_CStringGetData(xapianDirectoryPath, &cXapianDirectoryPath);

  /* Create the indexer */
  try {    
    this->indexer = new kiwix::Indexer(cZimFilePath, cXapianDirectoryPath);
    if (this->indexer != NULL) {
      this->indexer->startIndexing();
      *retVal = PR_TRUE;
    } else {
      *retVal = PR_FALSE;
    }
  } catch(...) {
    *retVal = PR_FALSE;
  }

  return NS_OK;
}

/* Index next percent */
NS_IMETHODIMP ZimXapianIndexer::IndexNextPercent(PRBool *retVal) {
  if (this->indexer->indexNextPercent()) {
    *retVal = PR_TRUE;
  } else {
    *retVal = PR_FALSE;
  }
  
  return NS_OK;
}

/* Stop indexing. TODO: using it crashs the soft under windows. Have to do it in indexNextPercent() */
NS_IMETHODIMP ZimXapianIndexer::StopIndexing(PRBool *retVal) {
  *retVal = PR_TRUE;
  return NS_OK;
}

NS_GENERIC_FACTORY_CONSTRUCTOR(ZimXapianIndexer)

static const nsModuleComponentInfo components[] =
{
   { "zimXapianIndexer",
     IZIMXAPIANINDEXER_IID,
     "@kiwix.org/zimXapianIndexer",
     ZimXapianIndexerConstructor
   }
};

NS_IMPL_NSGETMODULE(nsZimXapianIndexer, components)

