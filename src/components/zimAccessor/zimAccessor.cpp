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

#if GECKO_VERSION > 16
  #define mozuint32 uint32_t
#else
  #define mozuint32 PRUint32
#endif

#include <stdio.h>
#include <stdlib.h>

#include <kiwix/reader.h>
#include <pathTools.h>
#include <componentTools.h>

#include "IZimAccessor.h"

#include "nsXPCOM.h"
#include "nsEmbedString.h"
#include "nsIURI.h"
#include "nsStringAPI.h"
#include "nsIServiceManager.h"
#include "nsILocalFile.h"
#include "nsCOMPtr.h"
#include "nsIProperties.h"
#include "nsDirectoryServiceDefs.h"

class ZimAccessor : public IZimAccessor {

public:
  NS_DECL_ISUPPORTS
  NS_DECL_IZIMACCESSOR
  
  ZimAccessor();

private:
  ~ZimAccessor();

protected:
  kiwix::Reader *reader;
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(ZimAccessor, IZimAccessor)

/* Constructor */
ZimAccessor::ZimAccessor()
: reader(NULL) {
}

/* Destructor */
ZimAccessor::~ZimAccessor() {
}

NS_IMETHODIMP ZimAccessor::LoadFile(const nsAString &path, mozbool *retVal) {
  *retVal = PR_TRUE;
  const char *cPath = strdup(nsStringToCString(path));

#ifdef __APPLE__
  string zimaa = string(cPath) + "aa";

  if ( !fileExists(string(cPath)) && !fileExists(zimaa) ) {
    *retVal = PR_FALSE;
    return NS_OK;
  }
#endif

  /* Instanciate the ZIM file handler */
  try {
    this->reader = new kiwix::Reader(cPath);
  } catch (exception &e) {
    cerr << e.what() << endl;
    *retVal = PR_FALSE;
  }

  free((void*)cPath);

  return NS_OK;
}

NS_IMETHODIMP ZimAccessor::Unload(mozbool *retVal) {
  *retVal = PR_TRUE;
  if (this->reader != NULL) {
    delete this->reader;
    this->reader = NULL;
  }
  return NS_OK;
}

/* Reset the cursor for GetNextArticle() */
NS_IMETHODIMP ZimAccessor::Reset(mozbool *retVal) {
  *retVal = PR_TRUE;
  
  try {
    this->reader->reset();
  } catch (exception &e) {
    cerr << e.what() << endl;
    *retVal = PR_FALSE;
  }

  return NS_OK;
}

/* Get the count of articles which can be indexed/displayed */
NS_IMETHODIMP ZimAccessor::GetArticleCount(uint32_t *count, mozbool *retVal) {
  *retVal = PR_FALSE;

  try {
    if (this->reader != NULL) {
	*count = this->reader->getArticleCount();
	*retVal = PR_TRUE;
    }
  } catch (exception &e) {
    cerr << e.what() << endl;
  }  

  return NS_OK;
}

/* Return the UID of the ZIM file */
NS_IMETHODIMP ZimAccessor::GetId(nsACString &id, mozbool *retVal) {
  *retVal = PR_FALSE;

  try {
    if (this->reader != NULL) {
      id = nsDependentCString(this->reader->getId().c_str(), 
			      this->reader->getId().size());
      *retVal = PR_TRUE;
    }
  } catch (exception &e) {
    cerr << e.what() << endl;
  }  

  return NS_OK;
}

/* Return a random article URL */
NS_IMETHODIMP ZimAccessor::GetRandomPageUrl(nsACString &url, mozbool *retVal) {
  *retVal = PR_FALSE;

  try {
    if (this->reader != NULL) {
      string urlstr = this->reader->getRandomPageUrl();
      url = nsDependentCString(urlstr.c_str(), urlstr.size());
      *retVal = PR_TRUE;
    }
  } catch (exception &e) {
    cerr << e.what() << endl;
  }

  return NS_OK;
}

/* Return a page url fronm title */
NS_IMETHODIMP ZimAccessor::GetPageUrlFromTitle(const nsACString &title, nsACString &url, mozbool *retVal) {
  *retVal = PR_FALSE;
  string urlstr;
  const char *ctitle;
  NS_CStringGetData(title, &ctitle);

  try {
    if (this->reader != NULL) {
      if (this->reader->getPageUrlFromTitle(ctitle, urlstr)) {
	url = nsDependentCString(urlstr.c_str(), urlstr.size());
	*retVal = PR_TRUE;
      }
    }
  } catch (exception &e) {
    cerr << e.what() << endl;
  }

  return NS_OK;
}

/* Return the welcome page URL */
NS_IMETHODIMP ZimAccessor::GetMainPageUrl(nsACString &url, mozbool *retVal) {
  *retVal = PR_FALSE;
    
  try {
    if (this->reader != NULL) {
      string urlstr = this->reader->getMainPageUrl();
      url = nsDependentCString(urlstr.c_str(), urlstr.size());
      *retVal = PR_TRUE;
    }
  } catch (exception &e) {
    cerr << e.what() << endl;
  }  

  return NS_OK;
}

/* Get a metatag value */
NS_IMETHODIMP ZimAccessor::GetMetatag(const nsACString &name, 
				      nsACString &value, mozbool *retVal ) {
  const char *cname;
  NS_CStringGetData(name, &cname);
  string valueStr;
  
  try {
    if (this->reader != NULL) {
      if (this->reader->getMetatag(cname, valueStr)) {
	value = nsDependentCString(valueStr.data(), valueStr.size()); 
	*retVal = PR_TRUE;
      }
    }
  } catch (exception &e) {
    cerr << e.what() << endl;
  }
  
  return NS_OK;
}

/* Get a content from a zim file */
NS_IMETHODIMP ZimAccessor::GetContent(nsIURI *urlObject, nsACString &content, uint32_t *contentLength, 
				      nsACString &contentType, mozbool *retVal) {

  *retVal = PR_FALSE;

  /* Convert the URL object to char* string */
  nsEmbedCString urlString;
  urlObject->GetPath(urlString);
  const string url = string(urlString.get());

  /* strings */
  string contentStr;
  string contentTypeStr;
  unsigned int contentLengthInt;

  /* default value */
  content="";
  *contentLength = 0;

  try {
    if (this->reader != NULL) {
      if (this->reader->getContentByUrl(url, contentStr, contentLengthInt, contentTypeStr)) {
	contentType = nsDependentCString(contentTypeStr.data(), contentTypeStr.size()); 
	content = nsDependentCString(contentStr.data(), contentStr.size());
	*contentLength = contentLengthInt;
	*retVal = PR_TRUE;
      }
    }
  } catch (exception &e) {
    cerr << e.what() << endl;
  }
  
  return NS_OK;
}

/* Search titles by prefix*/
NS_IMETHODIMP ZimAccessor::SearchSuggestions(const nsACString &prefix, uint32_t suggestionsCount, mozbool *retVal) {
  *retVal = PR_FALSE;
  const char *titlePrefix;
  NS_CStringGetData(prefix, &titlePrefix);

  try {
    if (this->reader != NULL) {
      if (this->reader->searchSuggestionsSmart(titlePrefix, suggestionsCount)) {
	*retVal = PR_TRUE;
      }
    }
  } catch (exception &e) {
    cerr << e.what() << endl;
  }

  return NS_OK;
}

/* Get next suggestion */
NS_IMETHODIMP ZimAccessor::GetNextSuggestion(nsACString &title, mozbool *retVal) {
  *retVal = PR_FALSE;
  string titleStr;

  try {
    if (this->reader != NULL) {
      if (this->reader->getNextSuggestion(titleStr)) {
	title = nsDependentCString(titleStr.c_str(), 
				   titleStr.length());
	*retVal = PR_TRUE;    
      }
    }
  } catch (exception &e) {
    cerr << e.what() << endl;
  }

  return NS_OK;
}

/* Can I check the integrity - for old ZIM file without checksum */
NS_IMETHODIMP ZimAccessor::CanCheckIntegrity(mozbool *retVal) {
  *retVal = PR_FALSE;

  try {
    if (this->reader != NULL) {
      *retVal = this->reader->canCheckIntegrity() == true ? PR_TRUE : PR_FALSE;
    }
  } catch (exception &e) {
    cerr << e.what() << endl;
  }

  return NS_OK;
}

/* Return true if corrupted, false otherwise */
NS_IMETHODIMP ZimAccessor::IsCorrupted(mozbool *retVal) {
  *retVal = PR_FALSE;

  try {
    if (this->reader != NULL) {
      *retVal = this->reader->isCorrupted() == true ? PR_TRUE : PR_FALSE;
    }
  } catch (exception &e) {
    cerr << e.what() << endl;
  }

  return NS_OK;
}

#if GECKO_VERSION > 1
NS_GENERIC_FACTORY_CONSTRUCTOR(ZimAccessor)
NS_DEFINE_NAMED_CID(IZIMACCESSOR_IID);
static const mozilla::Module::CIDEntry kZimAccessorCIDs[] = {
  { &kIZIMACCESSOR_IID, false, NULL, ZimAccessorConstructor },
  { NULL }
};

static const mozilla::Module::ContractIDEntry kZimAccessorContracts[] = {
  { "@kiwix.org/zimAccessor", &kIZIMACCESSOR_IID },
  { NULL }
};

static const mozilla::Module kZimAccessorModule = {
  mozilla::Module::kVersion,
  kZimAccessorCIDs,
  kZimAccessorContracts,
  NULL
};

NSMODULE_DEFN(nsZimAccessor) = &kZimAccessorModule;
NS_IMPL_MOZILLA192_NSGETMODULE(&kZimAccessorModule)
#else
NS_GENERIC_FACTORY_CONSTRUCTOR(ZimAccessor)

static const nsModuleComponentInfo components[] =
{
   { "zimAccessor",
     IZIMACCESSOR_IID,
     "@kiwix.org/zimAccessor",
     ZimAccessorConstructor
   }
};

NS_IMPL_NSGETMODULE(nsZimAccessor, components)
#endif
