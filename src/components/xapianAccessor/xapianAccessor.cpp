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
#include "nsXPCOM.h"
#include "nsEmbedString.h"
#include "nsIURI.h"
#include "nsIServiceManager.h"
#include "nsIFile.h"
#include "nsCOMPtr.h"
#include "nsIProperties.h"
#include "nsDirectoryServiceDefs.h"
#include "IXapianAccessor.h"

#include <string>
#include "kiwix/xapianSearcher.h"

class XapianAccessor : public IXapianAccessor {

public:
  NS_DECL_ISUPPORTS
  NS_DECL_IXAPIANACCESSOR
  
  XapianAccessor();

private:
  ~XapianAccessor();
  kiwix::XapianSearcher *searcher;

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

/* Registration */
static NS_METHOD XapianAccessorRegistration(nsIComponentManager *aCompMgr,
                                      nsIFile *aPath,
                                      const char *registryLocation,
                                      const char *componentType,
                                      const nsModuleComponentInfo *info) {
  return NS_OK;
}

/* Unregistration */
static NS_METHOD XapianAccessorUnregistration(nsIComponentManager *aCompMgr,
                                        nsIFile *aPath,
                                        const char *registryLocation,
                                        const nsModuleComponentInfo *info) {
  return NS_OK;
}

/* Open Xapian readable database */
NS_IMETHODIMP XapianAccessor::OpenReadableDatabase(const nsACString &directory, PRBool *retVal) {
  *retVal = PR_TRUE;
  
  const char *directoryPath;
  NS_CStringGetData(directory, &directoryPath);
  
  try {
    this->searcher = new kiwix::XapianSearcher(directoryPath);
  } catch (...) {
    std::cerr << "Not able to open xapian database " << directoryPath << std::endl;
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
    std::string searchString = std::string(csearch);
    this->searcher->search(searchString, resultsCount);
  } catch (exception &e) {
    std::cerr << e.what() << std::endl;
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
    std::cerr << e.what() << std::endl;
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
    std::cerr << e.what() << std::endl;
  }

  return NS_OK;
}

NS_GENERIC_FACTORY_CONSTRUCTOR(XapianAccessor)

static const nsModuleComponentInfo components[] =
{
   { "xapianAccessor",
     IXAPIANACCESSOR_IID,
     "@kiwix.org/xapianAccessor",
     XapianAccessorConstructor,
     XapianAccessorRegistration,
     XapianAccessorUnregistration
   }
};

NS_IMPL_NSGETMODULE(nsXapianAccessor, components)
