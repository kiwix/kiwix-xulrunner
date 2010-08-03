#include "xpcom-config.h"
#include "nsIGenericFactory.h"
#include "IZimIndexer.h"

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

class ZimIndexer : public IZimIndexer {

public:
  NS_DECL_ISUPPORTS
  NS_DECL_IZIMINDEXER
  
  ZimIndexer();

private:
  ~ZimIndexer();
  kiwix::Indexer* indexer;
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(ZimIndexer, IZimIndexer)

/* Constructor */
ZimIndexer::ZimIndexer() 
: indexer(NULL) {
}

/* Destructor */
ZimIndexer::~ZimIndexer() {
  if (this->indexer != NULL) {
    delete this->indexer;
  }
}

/* Start indexing */
NS_IMETHODIMP ZimIndexer::StartIndexing(const nsACString &zimPath, 
					const nsACString &indexPath,
					const nsACString &backend, 
					PRBool *retVal) {
  *retVal = PR_FALSE;
  return NS_OK;
}

/* Index next percent */
NS_IMETHODIMP ZimIndexer::GetStatus(PRUint32 *count, PRBool *retVal) {
  *retVal = PR_FALSE;
  return NS_OK;
}

/* Stop indexing. TODO: using it crashs the soft under windows. Have to do it in indexNextPercent() */
NS_IMETHODIMP ZimIndexer::StopIndexing(PRBool *retVal) {
  *retVal = PR_TRUE;
  return NS_OK;
}

NS_GENERIC_FACTORY_CONSTRUCTOR(ZimIndexer)

static const nsModuleComponentInfo components[] =
{
   { "zimIndexer",
     IZIMINDEXER_IID,
     "@kiwix.org/zimIndexer",
     ZimIndexerConstructor
   }
};

NS_IMPL_NSGETMODULE(nsZimIndexer, components)

