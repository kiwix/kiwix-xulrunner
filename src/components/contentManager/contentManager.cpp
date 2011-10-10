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

#include "IContentManager.h"
#include <stdio.h>
#include <stdlib.h>

#include "nsXPCOM.h"
#include "nsEmbedString.h"
#include "nsIURI.h"
#include "nsStringAPI.h"

#include "nsIServiceManager.h"
#include "nsILocalFile.h"
#include "nsCOMPtr.h"
#include "nsIProperties.h"
#include "nsDirectoryServiceDefs.h"

#include <kiwix/manager.h>
#include <pathTools.h>

class ContentManager : public IContentManager {

public:
  NS_DECL_ISUPPORTS
  NS_DECL_ICONTENTMANAGER
  
  ContentManager();

private:
  ~ContentManager();

protected:
  kiwix::Manager manager;
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(ContentManager, IContentManager)

/* Constructor */
ContentManager::ContentManager() {
}

/* Destructor */
ContentManager::~ContentManager() {
}

NS_IMETHODIMP ContentManager::OpenLibraryFromFile(const nsAString &path, PRBool readOnly, PRBool *retVal) {
  *retVal = PR_TRUE;
  bool returnValue = true;
  const char *cPath = strdup(nsStringToCString(path));

  try {
    returnValue = this->manager.readFile(cPath, readOnly == PR_TRUE ? true : false);
  } catch (exception &e) {
    cerr << e.what() << endl;
    *retVal = PR_FALSE;
  }

  free((void*)cPath);
  *retVal = (returnValue ? PR_TRUE : PR_FALSE);

  return NS_OK;
}

NS_IMETHODIMP ContentManager::OpenLibraryFromText(const nsACString &xml, PRBool readOnly, PRBool *retVal) {
  *retVal = PR_TRUE;
  bool returnValue = true;
  const char *cXml;
  NS_CStringGetData(xml, &cXml);

  try {
    returnValue = this->manager.readXml(cXml, readOnly == PR_TRUE ? true : false);
  } catch (exception &e) {
    cerr << e.what() << endl;
    *retVal = PR_FALSE;
  }

  *retVal = (returnValue ? PR_TRUE : PR_FALSE);

  return NS_OK;
}

NS_IMETHODIMP ContentManager::WriteLibrary(PRBool *retVal) {
  *retVal = PR_TRUE;
  bool returnValue = true;

  try {
    returnValue = this->manager.writeFile(this->manager.writableLibraryPath);
  } catch (exception &e) {
    cerr << e.what() << endl;
    *retVal = PR_FALSE;
  }

  *retVal = (returnValue ? PR_TRUE : PR_FALSE);

  return NS_OK;
}

NS_IMETHODIMP ContentManager::WriteLibraryToFile(const nsAString &path, PRBool *retVal) {
  *retVal = PR_TRUE;
  bool returnValue = true;
  const char *cPath = strdup(nsStringToCString(path));

  try {
    returnValue = this->manager.writeFile(cPath);
  } catch (exception &e) {
    cerr << e.what() << endl;
    *retVal = PR_FALSE;
  }

  free((void*)cPath);
  *retVal = (returnValue ? PR_TRUE : PR_FALSE);

  return NS_OK;
}

NS_IMETHODIMP ContentManager::AddBookFromPath(const nsAString &path, PRBool *retVal) {
  *retVal = PR_TRUE;
  bool returnValue = true;

  const char *pathToOpen = strdup(nsStringToCString(path));
  const char *pathToSave = strdup(nsStringToUTF8(path));

  try {
    returnValue = this->manager.addBookFromPath(pathToOpen, pathToSave);
  } catch (exception &e) {
    cerr << e.what() << endl;
    *retVal = PR_FALSE;
  }

  *retVal = (returnValue ? PR_TRUE : PR_FALSE);

  free((void*)pathToOpen);
  free((void*)pathToSave);

  return NS_OK;
}

NS_IMETHODIMP ContentManager::RemoveBookById(const nsACString &id, PRBool *retVal) {
  *retVal = PR_FALSE;
  const char *cid;
  NS_CStringGetData(id, &cid);
  
  try {
    if (this->manager.removeBookById(cid)) {
      *retVal = PR_TRUE;
    }
  } catch (exception &e) {
    cerr << e.what() << endl;
  }
  
  return NS_OK;
}

NS_IMETHODIMP ContentManager::SetCurrentBookId(const nsACString &id, PRBool *retVal) {
  *retVal = PR_FALSE;
  const char *cid;
  NS_CStringGetData(id, &cid);
  
  try {
    if (this->manager.setCurrentBookId(cid)) {
      *retVal = PR_TRUE;
    }
  } catch (exception &e) {
    cerr << e.what() << endl;
  }
  
  return NS_OK;
}

NS_IMETHODIMP ContentManager::GetCurrentBookId(nsACString &id, PRBool *retVal) {
  *retVal = PR_FALSE;
  
  try {
    string current = this->manager.getCurrentBookId();
    id = nsDependentCString(current.data(), current.size());
    *retVal = PR_TRUE;
  } catch (exception &e) {
    cerr << e.what() << endl;
  }
  
  return NS_OK;
}

NS_IMETHODIMP ContentManager::GetBookById(const nsACString &id, 
					  nsACString &path, 
					  nsACString &title,
					  nsACString &indexPath, 
					  nsACString &indexType, 
					  nsACString &description,
					  nsACString &articleCount, 
					  nsACString &mediaCount, 
					  nsACString &size,
					  nsACString &creator,
					  nsACString &date,
					  nsACString &language, 
					  nsACString &favicon, 
					  nsACString &url, PRBool *retVal) {
  *retVal = PR_FALSE;
  const char *cid;
  NS_CStringGetData(id, &cid);

  try {
    kiwix::Book book;

    if (this->manager.getBookById(cid, book)) {
      path = nsDependentCString(book.pathAbsolute.data(), book.pathAbsolute.size());
      title = nsDependentCString(book.title.data(), book.title.size());
      indexPath = nsDependentCString(book.indexPathAbsolute.data(), book.indexPathAbsolute.size());
      articleCount = nsDependentCString(book.articleCount.data(), book.articleCount.size());
      mediaCount = nsDependentCString(book.mediaCount.data(), book.mediaCount.size());
      size = nsDependentCString(book.size.data(), book.size.size());
      creator = nsDependentCString(book.creator.data(), book.creator.size());
      date = nsDependentCString(book.date.data(), book.date.size());
      language = nsDependentCString(book.language.data(), book.language.size());
      url = nsDependentCString(book.url.data(), book.url.size());
      
      string faviconUrl = "";
      if (!book.faviconMimeType.empty()) {
	faviconUrl = "url(data:" + book.faviconMimeType + ";base64," + book.favicon + ")";
      }
      favicon = nsDependentCString(faviconUrl.data(), faviconUrl.size());

      string indexTypeString = "";
      if (book.indexType == kiwix::XAPIAN) {
	indexTypeString = "xapian";
      } else if (book.indexType == kiwix::CLUCENE) {
	indexTypeString = "clucene";
      }
      indexType = nsDependentCString(indexTypeString.data(), indexTypeString.size());

      description = nsDependentCString(book.description.data(), book.description.size());

      *retVal = PR_TRUE;
    }
  } catch (exception &e) {
    cerr << e.what() << endl;
  }
  
  return NS_OK;
}

NS_IMETHODIMP ContentManager::UpdateBookLastOpenDateById(const nsACString &id, PRBool *retVal) {
  *retVal = PR_FALSE;
  const char *cid;
  NS_CStringGetData(id, &cid);
  
  try {
    if (this->manager.updateBookLastOpenDateById(cid)) {
      *retVal = PR_TRUE;
    }
  } catch (exception &e) {
    cerr << e.what() << endl;
  }
  
  return NS_OK;
}

NS_IMETHODIMP ContentManager::GetBookCount(const PRBool localBooks, const PRBool remoteBooks, PRUint32 *count, PRBool *retVal) {
  *retVal = PR_TRUE;
  *count = 0;

  try {
    *count = this->manager.getBookCount(localBooks, remoteBooks);
  } catch (exception &e) {
    cerr << e.what() << endl;
  }

  return NS_OK;
}

NS_IMETHODIMP ContentManager::ListBooks(const nsACString &mode, const nsACString &sortBy, PRBool *retVal) {
  *retVal = PR_FALSE;
  const char *cmode; NS_CStringGetData(mode, &cmode);
  const char *csortBy; NS_CStringGetData(sortBy, &csortBy);
  
  try {

    /* Set the mode enum */
    kiwix::supportedListMode listMode;
    if (std::string(cmode) == "lastOpen") {
      listMode = kiwix::LASTOPEN;
    } else if ( std::string(cmode) == "remote") {
      listMode = kiwix::REMOTE;
    } else {
      listMode = kiwix::LOCAL;
    }

    /* Set the sortBy enum */
    kiwix::supportedListSortBy listSortBy;
    if (std::string(csortBy) == "publisher") {
      listSortBy = kiwix::PUBLISHER;
    } else if ( std::string(csortBy) == "date") {
      listSortBy = kiwix::DATE;
    } else if ( std::string(csortBy) == "size") {
      listSortBy = kiwix::SIZE;
    } else {
      listSortBy = kiwix::TITLE;
    }

    if (this->manager.listBooks(listMode, listSortBy)) {
      *retVal = PR_TRUE;
    }
  } catch (exception &e) {
    cerr << e.what() << endl;
  }
  

  return NS_OK;
}

NS_IMETHODIMP ContentManager::GetListNextBookId(nsACString &id, PRBool *retVal) {
  *retVal = PR_FALSE;
  
  try {
    if (!this->manager.bookIdList.empty()) {
      string idString = *(this->manager.bookIdList.begin());
      id = nsDependentCString(idString.data(), idString.size());
      this->manager.bookIdList.erase(this->manager.bookIdList.begin());
      *retVal = PR_TRUE;
    }
  } catch (exception &e) {
    cerr << e.what() << endl;
  }
  
  return NS_OK;
}

NS_IMETHODIMP ContentManager::SetBookIndex(const nsACString &id, const nsAString &path, const nsACString &indexType, PRBool *retVal) {
  *retVal = PR_FALSE;

  const char *cid;
  NS_CStringGetData(id, &cid);
  const char *cindexType;
  NS_CStringGetData(indexType, &cindexType);
  const char *pathToSave = strdup(nsStringToUTF8(path));

  try {
    kiwix::supportedIndexType iType;
    if (std::string(cindexType) == "clucene") {
      iType = kiwix::CLUCENE;
    } else {
      iType = kiwix::XAPIAN;
    }

    if (this->manager.setBookIndex(cid, pathToSave, iType)) {
      *retVal = PR_TRUE;
    }
  } catch (exception &e) {
    cerr << e.what() << endl;
  }
  
  free((void*)pathToSave);

  return NS_OK;
}

NS_IMETHODIMP ContentManager::SetBookPath(const nsACString &id, const nsAString &path, PRBool *retVal) {
  *retVal = PR_FALSE;

  const char *cid;
  NS_CStringGetData(id, &cid);
  const char *pathToSave = strdup(nsStringToUTF8(path));

  try {
    if (this->manager.setBookPath(cid, pathToSave)) {
      *retVal = PR_TRUE;
    }
  } catch (exception &e) {
    cerr << e.what() << endl;
  }
  
  free((void*)pathToSave);

  return NS_OK;
}

#if GECKO_VERSION == 2

NS_GENERIC_FACTORY_CONSTRUCTOR(ContentManager)
NS_DEFINE_NAMED_CID(ICONTENTMANAGER_IID);
static const mozilla::Module::CIDEntry kContentManagerCIDs[] = {
  { &kICONTENTMANAGER_IID, false, NULL, ContentManagerConstructor },
  { NULL }
};

static const mozilla::Module::ContractIDEntry kContentManagerContracts[] = {
  { "@kiwix.org/contentManager", &kICONTENTMANAGER_IID },
  { NULL }
};

static const mozilla::Module kContentManagerModule = {
  mozilla::Module::kVersion,
  kContentManagerCIDs,
  kContentManagerContracts,
  NULL
};

NSMODULE_DEFN(nsContentManager) = &kContentManagerModule;
NS_IMPL_MOZILLA192_NSGETMODULE(&kContentManagerModule)
#else
NS_GENERIC_FACTORY_CONSTRUCTOR(ContentManager)

static const nsModuleComponentInfo components[] =
{
   { "contentManager",
     ICONTENTMANAGER_IID,
     "@kiwix.org/contentManager",
     ContentManagerConstructor
   }
};

NS_IMPL_NSGETMODULE(nsContentManager, components)
#endif
