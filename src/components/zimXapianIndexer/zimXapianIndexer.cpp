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
NS_IMETHODIMP ZimXapianIndexer::StartIndexing(const nsACString &zimFilePath, 
					      const nsACString &xapianDirectoryPath, 
					      PRBool *retVal) {
  *retVal = PR_FALSE;
  const char *cZimFilePath;
  NS_CStringGetData(zimFilePath, &cZimFilePath);
  const char *cXapianDirectoryPath;
  NS_CStringGetData(xapianDirectoryPath, &cXapianDirectoryPath);

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

