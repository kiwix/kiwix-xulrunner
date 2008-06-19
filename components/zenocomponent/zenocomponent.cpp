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
  zeno::Files * zenofiles;
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(Zeno, iZeno)

Zeno::Zeno()
{
  /* member initializers and constructor code */

    zenofiles = new zeno::Files("."); // FIXME
}

Zeno::~Zeno()
{
  /* destructor code */

    if (zenofiles) delete zenofiles;
}

/* ACString getArticle (in nsIURI url, out string contentType); */
NS_IMETHODIMP Zeno::GetArticle(nsIURI *url, char **contentType, nsACString & _retval)
{
    nsEmbedCString host;
    url->GetPath(host);
    const char * tmp = host.get();		// tmp + i == //Wikipedia/-/Hauptseite
    char ns;
    char title[1024];

    unsigned int i = 0;
    unsigned int n = strlen(tmp);

    // default content type
    *contentType = (char *) NS_Alloc(10);
    strcpy(*contentType, "text/html");

    // default retval
    _retval = "";

    // to fetch an article, we need its namespace and title...
    while((i < n) and (tmp[i] == '/')) i++;	// tmp + i == Wikipedia/-/Hauptseite
    while((i < n) and (tmp[i] != '/')) i++;	// tmp + i == /-/Hauptseite

    while((i < n) and (tmp[i] == '/')) i++;	// tmp + i == -/Hauptseite
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
    unsigned int j = 0;
    while((i < n) and (tmp[i] != '/'))
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
	        // Ok... this is wrong, each %XX code should be handled
		// independently. Now the examples .zeno files are iso-8859-1(5)
		// encoded and needs a title encoded the same way :/
	        sscanf(tmp + i + 1, "%2x", &decode1);
		switch (decode1) {
			case 0x20:
			case 0x28:
			case 0x29:
				title[j] = decode1;
				i += 2;
				break;
			default:
			        sscanf(tmp + i + 4, "%2x", &decode2);
				title[j] = ((decode1 & 0x3) << 6) | (decode2 & 0x3F);
				i += 5;
				break;
		}
	        break;
	    default:
	        title[j] = c;
	        break;
	}
	j++;
	i++;
    }
    title[j] = 0;

    printf("title: %s\n", title);
    
    // now that we have the namespace and the title, we're ready to fetch the article
    zeno::Article article = zenofiles->getArticle(ns, zeno::QUnicodeString(title));

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
        // We need an extra work for text/html as the examples .zeno files are
	// iso-8859-1(5) encoded... this part should be removed, or at least
	// made optional
        std::string content = article.getData();
        const char * iso_content = content.c_str();
        char * utf8_content;

        n = strlen(iso_content);
        utf8_content = (char *) NS_Alloc(2 * n + 1);
        j = 0;
        for(i = 0;i < n;i++)
        {
            unsigned char c = iso_content[i];
	    if (c > 127)
	    {
                switch(c)
	        {
	            default:
		        utf8_content[j] = ((c & 0xC0) >> 6) | 0xC0;
		        utf8_content[j + 1] = (c & 0x3F) | 0x80;
	        }
	        j += 2;
	    }
	    else
	    {
                utf8_content[j] = iso_content[i];
                j++;
	    }
        }
        utf8_content[j] = 0;

	_retval = nsDependentCString(utf8_content, j + 1);

        NS_Free(utf8_content);
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
