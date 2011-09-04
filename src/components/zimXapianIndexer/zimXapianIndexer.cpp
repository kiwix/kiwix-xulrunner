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

#include "IZimXapianIndexer.h"

#include "nsXPCOM.h"
#include "nsEmbedString.h"
#include "nsIURI.h"

#include "nsIServiceManager.h"
#include "nsIFile.h"
#include "nsCOMPtr.h"
#include "nsIProperties.h"
#include "nsDirectoryServiceDefs.h"

#include <kiwix/xapianIndexer.h>

using namespace std;

class ZimXapianIndexer : public IZimXapianIndexer {

public:
  NS_DECL_ISUPPORTS
  NS_DECL_IZIMXAPIANINDEXER
  
  ZimXapianIndexer();

private:
  ~ZimXapianIndexer();
  kiwix::XapianIndexer* indexer;
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
NS_IMETHODIMP ZimXapianIndexer::StartIndexing(const nsACString &unixZimFilePath, 
					      const nsACString &winZimFilePath, 
					      const nsACString &unixXapianDirectoryPath, 
					      const nsACString &winXapianDirectoryPath, 
					      PRBool *retVal) {

  *retVal = PR_FALSE;

  const char *cZimFilePath;
  const char *cXapianDirectoryPath;
#ifdef _WIN32
  NS_CStringGetData(winZimFilePath, &cZimFilePath);
  NS_CStringGetData(winXapianDirectoryPath, &cXapianDirectoryPath);
#else
  NS_CStringGetData(unixZimFilePath, &cZimFilePath);
  NS_CStringGetData(unixXapianDirectoryPath, &cXapianDirectoryPath);
#endif

  /* Create the indexer */
  try {    
    this->indexer = new kiwix::XapianIndexer(cZimFilePath, cXapianDirectoryPath);
    if (this->indexer != NULL) {
      *retVal = PR_TRUE;
    }
  } catch (exception &e) {
    cerr << e.what() << endl;
  }

  return NS_OK;
}

/* Index next percent */
NS_IMETHODIMP ZimXapianIndexer::IndexNextPercent(PRBool *retVal) {
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
NS_IMETHODIMP ZimXapianIndexer::StopIndexing(PRBool *retVal) {
  *retVal = PR_TRUE;
  return NS_OK;
}

#if GECKO_VERSION == 2

NS_GENERIC_FACTORY_CONSTRUCTOR(ZimXapianIndexer)
NS_DEFINE_NAMED_CID(IZIMXAPIANINDEXER_IID);
static const mozilla::Module::CIDEntry kZimXapianIndexerCIDs[] = {
  { &kIZIMXAPIANINDEXER_IID, false, NULL, ZimXapianIndexerConstructor },
  { NULL }
};

static const mozilla::Module::ContractIDEntry kZimXapianIndexerContracts[] = {
  { "@kiwix.org/zimXapianIndexer", &kIZIMXAPIANINDEXER_IID },
  { NULL }
};

static const mozilla::Module kZimXapianIndexerModule = {
  mozilla::Module::kVersion,
  kZimXapianIndexerCIDs,
  kZimXapianIndexerContracts,
  NULL
};

NSMODULE_DEFN(nsZimXapianIndexer) = &kZimXapianIndexerModule;
NS_IMPL_MOZILLA192_NSGETMODULE(&kZimXapianIndexerModule)
#else
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
#endif
