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

NS_IMETHODIMP ContentManager::OpenLibraryFromFile(nsILocalFile *file, PRBool *retVal) {
  *retVal = PR_TRUE;
  nsString path;
  file->GetPath(path);
  const PRUnichar *wcPath = ToNewUnicode(path);
  const char *cPath = ToNewUTF8String(path);
  bool returnValue = true;

  try {
    returnValue = this->manager.readFile(cPath);
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
