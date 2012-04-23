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

#if GECKO_VERSION > 1
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

#if GECKO_VERSION > 9
  #define mozbool bool
#else
  #define mozbool PRBool
#endif

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
NS_IMETHODIMP XapianAccessor::OpenReadableDatabase(const nsACString &unixDirectory, 
						   const nsACString &winDirectory, mozbool *retVal) {
  *retVal = PR_TRUE;
  
  const char *directoryPath;
#ifdef _WIN32
  NS_CStringGetData(winDirectory, &directoryPath);
#else
  NS_CStringGetData(unixDirectory, &directoryPath);
#endif

  try {
    this->searcher = new kiwix::XapianSearcher(directoryPath);
  } catch (...) {
    *retVal = PR_FALSE;
  }

  return NS_OK;
}

/* Close Xapian writable database */
NS_IMETHODIMP XapianAccessor::CloseReadableDatabase(mozbool *retVal) {
  *retVal = PR_TRUE;
  return NS_OK;
}

/* Search strings in the database */
NS_IMETHODIMP XapianAccessor::Search(const nsACString &search, PRUint32 resultStart, PRUint32 resultEnd, mozbool *retVal) {
  *retVal = PR_TRUE;
  const char *csearch;
  NS_CStringGetData(search, &csearch, NULL);

  try {
    std::string searchString = std::string(csearch);
    this->searcher->search(searchString, resultStart, resultEnd);
  } catch (exception &e) {
    std::cerr << e.what() << std::endl;
    *retVal = PR_FALSE;
  }

  return NS_OK;
}

/* Reset the results */
NS_IMETHODIMP XapianAccessor::Reset(mozbool *retVal) {
  *retVal = PR_TRUE;

  try {
    this->searcher->reset();
  } catch (exception &e) {
    std::cerr << e.what() << std::endl;
    *retVal = PR_FALSE;
  }

  return NS_OK;
}

/* Return the result as HTML */
NS_IMETHODIMP XapianAccessor::GetHtml(nsACString &html, mozbool *retVal) {
  *retVal = PR_TRUE;

  try {
    std::string htmlStr =  this->searcher->getHtml();
    html = nsDependentCString(htmlStr.c_str(), 
			      htmlStr.length());
  } catch (exception &e) {
    std::cerr << e.what() << std::endl;
    *retVal = PR_FALSE;
  }

  return NS_OK;
}

/* Get next result */
NS_IMETHODIMP XapianAccessor::GetNextResult(nsACString &url, nsACString &title, 
					    PRUint32 *score, mozbool *retVal) {
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

#if GECKO_VERSION > 1

NS_GENERIC_FACTORY_CONSTRUCTOR(XapianAccessor)
NS_DEFINE_NAMED_CID(IXAPIANACCESSOR_IID);
static const mozilla::Module::CIDEntry kXapianAccessorCIDs[] = {
     { &kIXAPIANACCESSOR_IID, false, NULL, XapianAccessorConstructor },
     { NULL }
};

static const mozilla::Module::ContractIDEntry kXapianAccessorContracts[] = {
     { "@kiwix.org/xapianAccessor", &kIXAPIANACCESSOR_IID },
     { NULL }
};

static const mozilla::Module kXapianAccessorModule = {
     mozilla::Module::kVersion,
     kXapianAccessorCIDs,
     kXapianAccessorContracts,
     NULL
};

NSMODULE_DEFN(nsXapianAccessor) = &kXapianAccessorModule;
NS_IMPL_MOZILLA192_NSGETMODULE(&kXapianAccessorModule)
#else
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
#endif

