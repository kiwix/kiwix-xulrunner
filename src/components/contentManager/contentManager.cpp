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

NS_IMETHODIMP ContentManager::OpenLibraryFromFile(nsILocalFile *file, PRBool readOnly, PRBool *retVal) {
  *retVal = PR_TRUE;
  nsString path;
  file->GetPath(path);
  const PRUnichar *wcPath = ToNewUnicode(path);
  const char *cPath = ToNewUTF8String(path);
  bool returnValue = true;

  try {
    returnValue = this->manager.readFile(cPath, readOnly == PR_TRUE ? true : false);
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

NS_IMETHODIMP ContentManager::WriteLibraryToFile(nsILocalFile *file, PRBool *retVal) {
  *retVal = PR_TRUE;
  nsString path;
  file->GetPath(path);
  const PRUnichar *wcPath = ToNewUnicode(path);
  const char *cPath = ToNewUTF8String(path);
  bool returnValue = true;

  try {
    returnValue = this->manager.writeFile(cPath);
  } catch (exception &e) {
    cerr << e.what() << endl;
    *retVal = PR_FALSE;
  }

  *retVal = (returnValue ? PR_TRUE : PR_FALSE);

  return NS_OK;
}

NS_IMETHODIMP ContentManager::AddBookFromPath(nsILocalFile *file, PRBool *retVal) {
  *retVal = PR_TRUE;
  nsString path;
  file->GetPath(path);
  const PRUnichar *wcPath = ToNewUnicode(path);
  const char *cPath = ToNewUTF8String(path);
  bool returnValue = true;

  try {
    returnValue = this->manager.addBookFromPath(cPath);
  } catch (exception &e) {
    cerr << e.what() << endl;
    *retVal = PR_FALSE;
  }

  *retVal = (returnValue ? PR_TRUE : PR_FALSE);

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
					  nsACString &indexType, PRBool *retVal) {
  *retVal = PR_FALSE;
  const char *cid;
  NS_CStringGetData(id, &cid);

  try {
    kiwix::Book book;
    if (this->manager.getBookById(cid, book)) {
      path = nsDependentCString(book.path.data(), book.path.size());
      title = nsDependentCString(book.title.data(), book.title.size());
      indexPath = nsDependentCString(book.indexPath.data(), book.indexPath.size());

      string indexTypeString = "";
      if (book.indexType == kiwix::XAPIAN) {
	indexTypeString = "xapian";
      } else if (book.indexType == kiwix::CLUCENE) {
	indexTypeString = "clucene";
      }
      indexType = nsDependentCString(indexTypeString.data(), indexTypeString.size());

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

NS_IMETHODIMP ContentManager::ListBooks(const nsACString &mode, PRBool *retVal) {
  *retVal = PR_FALSE;
  const char *cmode;
  NS_CStringGetData(mode, &cmode);
  
  try {
    kiwix::supportedListMode listMode;
    if (std::string(cmode) == "lastOpen") {
      listMode = kiwix::LASTOPEN;
    } else if ( std::string(cmode) == "remote") {
      listMode = kiwix::REMOTE;
    } else {
      listMode = kiwix::LOCAL;
    }
    if (this->manager.listBooks(listMode)) {
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
