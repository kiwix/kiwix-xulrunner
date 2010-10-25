#include "xpcom-config.h"
#include "nsIGenericFactory.h"
#include "IZimCluceneIndexer.h"

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

class ZimCluceneIndexer : public IZimCluceneIndexer {

public:
  NS_DECL_ISUPPORTS
  NS_DECL_IZIMCLUCENEINDEXER
  
  ZimCluceneIndexer();

private:
  ~ZimCluceneIndexer();
  kiwix::Indexer* indexer;
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(ZimCluceneIndexer, IZimCluceneIndexer)

/* Constructor */
ZimCluceneIndexer::ZimCluceneIndexer() 
: indexer(NULL) {
}

/* Destructor */
ZimCluceneIndexer::~ZimCluceneIndexer() {
  if (this->indexer != NULL) {
    delete this->indexer;
  }
}

/* Start indexing */
NS_IMETHODIMP ZimCluceneIndexer::StartIndexing(const nsACString &zimFilePath, 
					      const nsACString &cluceneDirectoryPath, 
					      PRBool *retVal) {
  *retVal = PR_FALSE;
  const char *cZimFilePath;
  NS_CStringGetData(zimFilePath, &cZimFilePath);
  const char *cCluceneDirectoryPath;
  NS_CStringGetData(cluceneDirectoryPath, &cCluceneDirectoryPath);

  /* Create the indexer */
  try {    
    this->indexer = new kiwix::Indexer(cZimFilePath, cCluceneDirectoryPath);
    if (this->indexer != NULL) {
      *retVal = PR_TRUE;
    }
  } catch (exception &e) {
    cerr << e.what() << endl;
  }

  return NS_OK;
}

/* Index next percent */
NS_IMETHODIMP ZimCluceneIndexer::IndexNextPercent(PRBool *retVal) {
  *retVal = PR_FALSE;

  try {
    if (this->indexer->indexNextPercent()) {
      *retVal = PR_TRUE;
    }
  } catch (exception &e) {
    cerr << e.what() << endl;
  }
  
  return NS_OK;
}

/* Stop indexing. TODO: using it crashs the soft under windows. Have to do it in indexNextPercent() */
NS_IMETHODIMP ZimCluceneIndexer::StopIndexing(PRBool *retVal) {
  *retVal = PR_TRUE;
  return NS_OK;
}

NS_GENERIC_FACTORY_CONSTRUCTOR(ZimCluceneIndexer)

static const nsModuleComponentInfo components[] =
{
   { "zimCluceneIndexer",
     IZIMCLUCENEINDEXER_IID,
     "@kiwix.org/zimCluceneIndexer",
     ZimCluceneIndexerConstructor
   }
};

NS_IMPL_NSGETMODULE(nsZimCluceneIndexer, components)

