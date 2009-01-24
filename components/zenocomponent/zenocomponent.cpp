/*  ZenoComponent - XP-COM component for Kiwix, offline reader of Wikipedia
    Copyright (C) 2007-2008, LinterWeb (France), Fabien Coulon, Guillaume Duhamel

    This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation; either version 2 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program; if not, write to the Free Software
    Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307  USA */

#include "xpcom-config.h"
#include "nsIGenericFactory.h"
#include "IZeno.h"
#include <stdio.h>
#include <stdlib.h>

#include "nsXPCOM.h"
#include "nsEmbedString.h"
#include "nsIURI.h"

#include "nsIServiceManager.h"
#include "nsIFile.h"
#include "nsCOMPtr.h"
#include "nsIProperties.h"
#include "nsDirectoryServiceDefs.h"

#include <zeno/files.h>
#include <zeno/article.h>
  
#define ZENO_CID \
{ 0xb2438c49, 0x8840, 0x48fa, \
{ 0xaa, 0x59, 0x00, 0x4a, 0x8f, 0xe6, 0x46, 0x5f}}

class Zeno : public iZeno
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_IZENO

  Zeno();

private:
  ~Zeno();

protected:
  /* additional members */
  std::map<std::string, zeno::Files *> zenopaths;
  void loadZenopathsReal(const char * path, nsIFile * relative = NULL);
  void loadZenopaths();
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(Zeno, iZeno)

void Zeno::loadZenopathsReal(const char * path, nsIFile * relative) {
    char buffer[1024];
    char zenoname[1024];
    char zenopath[1024];
    FILE * tmp = fopen(path, "r");
    if (tmp == NULL) return;
    while(fgets(buffer, 1024, tmp)) {
        char * c = buffer;
        int i = 0;
        int n = strlen(buffer);
        while((i < n) && (*c != ' ')) {
              zenoname[i] = *c;
              i++;
              c++;
        }
        zenoname[i] = '\0';
        c++;
        int j = 0;
        while((i < n) && (*c != '\n')) {
              zenopath[j] = *c;
              i++;
              j++;
              c++;
        }
        zenopath[j] = '\0';
        try {
              zeno::Files * f = new zeno::Files(zenopath);
              zenopaths[zenoname] = f;
        }
        catch(...) { }
    }
    fclose(tmp);
}

void Zeno::loadZenopaths()
{
    nsresult rv;
    nsIServiceManager* servMan;
    rv = NS_GetServiceManager(&servMan);
    if (NS_FAILED(rv)) return;
    nsIProperties* directoryService;
    rv = servMan->GetServiceByContractID( NS_DIRECTORY_SERVICE_CONTRACTID, NS_GET_IID(nsIProperties), (void**)&directoryService);
    if (NS_FAILED(rv)) return;

    nsIFile * theProfileFile, * theApplicationFile;
    rv = directoryService->Get("ProfD", NS_GET_IID(nsIFile), (void**)&theProfileFile);
    if (NS_FAILED(rv)) return;
    rv = directoryService->Get("resource:app", NS_GET_IID(nsIFile), (void**)&theApplicationFile);
    if (NS_FAILED(rv)) return;

    nsIFile * theApplicationBase;
    theApplicationFile->Clone(&theApplicationBase);

    nsEmbedCString toadd("zenopaths");
    theProfileFile->AppendNative(toadd);
    theApplicationFile->AppendNative(toadd);

    nsEmbedCString profilepath, applicationpath;
    theProfileFile->GetNativePath(profilepath);
    theApplicationFile->GetNativePath(applicationpath);

    NS_RELEASE(servMan);
    NS_RELEASE(directoryService);
    NS_RELEASE(theProfileFile);
    NS_RELEASE(theApplicationFile);

    std::map<std::string, zeno::Files *>::iterator it;
    for(it = zenopaths.begin();it != zenopaths.end();it++) {
        delete it->second;
    }
    zenopaths.clear();

    loadZenopathsReal(profilepath.get());
    loadZenopathsReal(applicationpath.get(), theApplicationBase);

    NS_RELEASE(theApplicationBase);
}

Zeno::Zeno()
{
  /* member initializers and constructor code */
}

Zeno::~Zeno()
{
  /* destructor code */

    std::map<std::string, zeno::Files *>::iterator it;

    for(it = zenopaths.begin();it != zenopaths.end();it++) {
        delete it->second;
    }

    zenopaths.clear();
}

/* ACString getArticle (in nsIURI url, out string contentType); */
NS_IMETHODIMP Zeno::GetArticle(nsIURI *url, char **contentType, nsACString & _retval)
{
    nsEmbedCString host;
    url->GetPath(host);
    const char * tmp = host.get();		// tmp + i == //Wikipedia/-/Hauptseite
    char ns;
    char title[1024];
    char zenoname[1024];

    unsigned int i = 0;
    unsigned int j;
    unsigned int n = strlen(tmp);

    // default content type
    *contentType = (char *) NS_Alloc(10);
    strcpy(*contentType, "text/html");

    // default retval
    _retval = "";

    // to fetch an article, we need its namespace and title...
    while((i < n) && (tmp[i] == '/')) i++;	// tmp + i == Wikipedia/-/Hauptseite

    j = 0;
    while((i < n) && (tmp[i] != '/')) {
        zenoname[j] = tmp[i];
        i++;
	j++;
    }
    zenoname[j] = 0;

    while((i < n) && (tmp[i] != '/')) i++;	// tmp + i == /-/Hauptseite

    while((i < n) && (tmp[i] == '/')) i++;	// tmp + i == -/Hauptseite
    if (i == n)
    {
	return NS_OK;
    }
    // namespace
    ns = tmp[i];
    i++;					// tmp + i == /Hauptseite
    if (tmp[i] != '/')
    {
	return NS_OK;
    }
    i++;					// tmp + i == Hauptseite

    // title, we need to replace + by space and decode the url
    j = 0;
    while(i < n)
    {
        char c = tmp[i];
	int decode1;
	int decode2;
	switch(c)
	{
	    case '+':
	        title[j] = ' ';
	        break;
	    case '%':
	        sscanf(tmp + i + 1, "%2x", &decode1);
		title[j] = decode1;
		i += 2;
	        break;
	    default:
	        title[j] = c;
	        break;
	}
	j++;
	i++;
    }
    title[j] = 0;

    if (zenopaths.count(zenoname) == 0) {
        loadZenopaths();
        if (zenopaths.count(zenoname) == 0) return NS_OK;
    }

    // now that we have the namespace and the title, we're ready to fetch the article
    zeno::Article article = zenopaths[zenoname]->getArticle(ns, zeno::QUnicodeString(title));

    // if there's no data in article, return (btw, getDataLen gives compressed data size)
    if (article.getDataLen() == 0) return NS_OK;

    // Now that we have something to return, set the correct mime type
    NS_Free(*contentType);
    std::string mimeType = article.getMimeType();
    const char * mimeTypeC = mimeType.c_str();
    *contentType = (char *) NS_Alloc(strlen(mimeTypeC) + 1);
    strcpy(*contentType, mimeTypeC);

    if (mimeType == "text/html")
    {
        std::string content = article.getData();
        const char * iso_content = content.c_str();

	_retval = nsDependentCString(iso_content, strlen(iso_content));
    }
    else
    {
        std::string content = article.getData();
	std::string::size_type n = content.size();

        char * buffer = (char *) NS_Alloc(n + 1);
        // not using strcpy as data can contains 0
	for(i = 0;i < n;i++)
	{
	    buffer[i] = content[i];
	}

	_retval = nsDependentCString(buffer, i);

	NS_Free(buffer);
    }

    return NS_OK;
}

NS_GENERIC_FACTORY_CONSTRUCTOR(Zeno)

static const nsModuleComponentInfo components[] =
{
   { "Zeno",
     ZENO_CID,
     "@linterweb.com/zeno",
     ZenoConstructor
   }
};

NS_IMPL_NSGETMODULE(nsZenoModule, components)
