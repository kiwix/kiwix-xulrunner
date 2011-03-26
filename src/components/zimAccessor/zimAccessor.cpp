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
#include "IZimAccessor.h"
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

#include <kiwix/reader.h>

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
  if (this->reader != NULL) {
    delete this->reader;
  }
}

NS_IMETHODIMP ZimAccessor::LoadFile(nsILocalFile *file, PRBool *retVal) {
  *retVal = PR_TRUE;
  nsString path;
  file->GetPath(path);
  const PRUnichar *wcPath = ToNewUnicode(path);
  const char *cPath = ToNewUTF8String(path);

  /* Instanciate the ZIM file handler */
  try {
    this->reader = new kiwix::Reader(cPath);
  } catch (exception &e) {
    cerr << e.what() << endl;
    *retVal = PR_FALSE;
  }

  return NS_OK;
}

/* Reset the cursor for GetNextArticle() */
NS_IMETHODIMP ZimAccessor::Reset(PRBool *retVal) {
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
NS_IMETHODIMP ZimAccessor::GetArticleCount(PRUint32 *count, PRBool *retVal) {
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
NS_IMETHODIMP ZimAccessor::GetId(nsACString &id, PRBool *retVal) {
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
NS_IMETHODIMP ZimAccessor::GetRandomPageUrl(nsACString &url, PRBool *retVal) {
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
NS_IMETHODIMP ZimAccessor::GetPageUrlFromTitle(const nsACString &title, nsACString &url, PRBool *retVal) {
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
NS_IMETHODIMP ZimAccessor::GetMainPageUrl(nsACString &url, PRBool *retVal) {
  *retVal = PR_FALSE;
    
  try {
    if (this->reader != NULL) {
      string urlstr = this->reader->getMainPageUrl();

      if (urlstr.empty()) {
	urlstr = this->reader->getFirstPageUrl(); 
      }

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
				      nsACString &value, PRBool *retVal ) {
  const char *cname;
  NS_CStringGetData(name, &cname);
  string valueStr;
  
  try {
    if (this->reader->getMetatag(cname, valueStr)) {
	value = nsDependentCString(valueStr.data(), valueStr.size()); 
	*retVal = PR_TRUE;
    }
  } catch (exception &e) {
    cerr << e.what() << endl;
  }
  
  return NS_OK;
}

/* Get a content from a zim file */
NS_IMETHODIMP ZimAccessor::GetContent(nsIURI *urlObject, nsACString &content, PRUint32 *contentLength, 
				      nsACString &contentType, PRBool *retVal) {

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
    if (this->reader->getContentByUrl(url, contentStr, contentLengthInt, contentTypeStr)) {
      contentType = nsDependentCString(contentTypeStr.data(), contentTypeStr.size()); 
      content = nsDependentCString(contentStr.data(), contentStr.size());
      *contentLength = contentLengthInt;
      *retVal = PR_TRUE;
    }
  } catch (exception &e) {
    cerr << e.what() << endl;
  }
  
  return NS_OK;
}

/* Search titles by prefix*/
NS_IMETHODIMP ZimAccessor::SearchSuggestions(const nsACString &prefix, PRUint32 suggestionsCount, PRBool *retVal) {
  *retVal = PR_FALSE;
  const char *titlePrefix;
  NS_CStringGetData(prefix, &titlePrefix);

  try {
    if (this->reader->searchSuggestions(titlePrefix, suggestionsCount)) {
      *retVal = PR_TRUE;
    }
  } catch (exception &e) {
    cerr << e.what() << endl;
  }

  return NS_OK;
}

/* Get next suggestion */
NS_IMETHODIMP ZimAccessor::GetNextSuggestion(nsACString &title, PRBool *retVal) {
  *retVal = PR_FALSE;
  string titleStr;

  try {
    if (this->reader->getNextSuggestion(titleStr)) {
      title = nsDependentCString(titleStr.c_str(), 
				 titleStr.length());
      *retVal = PR_TRUE;    
    }
  } catch (exception &e) {
    cerr << e.what() << endl;
  }

  return NS_OK;
}

/* Can I check the integrity - for old ZIM file without checksum */
NS_IMETHODIMP ZimAccessor::CanCheckIntegrity(PRBool *retVal) {
  *retVal = PR_FALSE;

  try {
    *retVal = this->reader->canCheckIntegrity() == true ? PR_TRUE : PR_FALSE;
  } catch (exception &e) {
    cerr << e.what() << endl;
  }

  return NS_OK;
}

/* Return true if corrupted, false otherwise */
NS_IMETHODIMP ZimAccessor::IsCorrupted(PRBool *retVal) {
  *retVal = PR_FALSE;

  try {
    *retVal = this->reader->isCorrupted() == true ? PR_TRUE : PR_FALSE;
  } catch (exception &e) {
    cerr << e.what() << endl;
  }

  return NS_OK;
}

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
