#include "xpcom-config.h"
#include "nsIGenericFactory.h"
#include "IXapianAccessor.h"
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

#include <zeno/file.h>
#include <zeno/article.h>
  
class XapianAccessor : public IXapianAccessor {

public:
  NS_DECL_ISUPPORTS
  NS_DECL_IXAPIANACCESSOR
  
  XapianAccessor();

private:
  ~XapianAccessor();
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(XapianAccessor, IXapianAccessor)

/* Constructor */
XapianAccessor::XapianAccessor() {}

/* Destructor */
XapianAccessor::~XapianAccessor() {
}

/* Create xapian db from zeno file */
NS_IMETHODIMP XapianAccessor::CreateDb(const char *zenoFilepath, const char *xapianDirectoryPath, nsACString &_retval) {
}

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
