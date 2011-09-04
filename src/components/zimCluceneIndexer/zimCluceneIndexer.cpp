/*
 * Copyright 2011 Emmanuel Engelhart <kelson@kiwix.org>
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU  General Public License as published by
 * the Free Software Foundation; either version 3 of the License, or
 * any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston,
 * MA 02110-1301, USA.
 */

#include "xpcom-config.h"

#if GECKO_VERSION == 2
#if !defined(NS_ATTR_MALLOC)
  #define NS_ATTR_MALLOC
  #endif

#if !defined(NS_WARN_UNUSED_RESULT)
  #define NS_WARN_UNUSED_RESULT
  #endif

#if !defined(MOZ_CPP_EXCEPTIONS)
  #define MOZ_CPP_EXCEPTIONS
  #endif

  #include "mozilla/ModuleUtils.h"
  #include "nsIClassInfoImpl.h"
#else
  #include "nsIGenericFactory.h"
#endif

#include "IZimCluceneIndexer.h"

#include "nsXPCOM.h"
#include "nsEmbedString.h"
#include "nsIURI.h"

#include "nsIServiceManager.h"
#include "nsIFile.h"
#include "nsCOMPtr.h"
#include "nsIProperties.h"
#include "nsDirectoryServiceDefs.h"

#include <kiwix/cluceneIndexer.h>

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
NS_IMETHODIMP ZimCluceneIndexer::StartIndexing(const nsACString &unixZimFilePath, 
					      const nsACString &winZimFilePath, 
					      const nsACString &unixCluceneDirectoryPath, 
					      const nsACString &winCluceneDirectoryPath, 
					      PRBool *retVal) {

  *retVal = PR_FALSE;

  const char *cZimFilePath;
  const char *cCluceneDirectoryPath;
#ifdef _WIN32
  NS_CStringGetData(winZimFilePath, &cZimFilePath);
  NS_CStringGetData(winCluceneDirectoryPath, &cCluceneDirectoryPath);
#else
  NS_CStringGetData(unixZimFilePath, &cZimFilePath);
  NS_CStringGetData(unixCluceneDirectoryPath, &cCluceneDirectoryPath);
#endif

  /* Create the indexer */
  try {    
    this->indexer = new kiwix::CluceneIndexer(cZimFilePath, cCluceneDirectoryPath);
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

#if GECKO_VERSION == 2

NS_GENERIC_FACTORY_CONSTRUCTOR(ZimCluceneIndexer)
NS_DEFINE_NAMED_CID(IZIMCLUCENEINDEXER_IID);
static const mozilla::Module::CIDEntry kZimCluceneIndexerCIDs[] = {
  { &kIZIMCLUCENEINDEXER_IID, false, NULL, ZimCluceneIndexerConstructor },
  { NULL }
};

static const mozilla::Module::ContractIDEntry kZimCluceneIndexerContracts[] = {
  { "@kiwix.org/zimCluceneIndexer", &kIZIMCLUCENEINDEXER_IID },
  { NULL }
};

static const mozilla::Module kZimCluceneIndexerModule = {
  mozilla::Module::kVersion,
  kZimCluceneIndexerCIDs,
  kZimCluceneIndexerContracts,
  NULL
};

NSMODULE_DEFN(nsZimCluceneIndexer) = &kZimCluceneIndexerModule;
NS_IMPL_MOZILLA192_NSGETMODULE(&kZimCluceneIndexerModule)
#else
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
#endif
