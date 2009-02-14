#include "xpcom-config.h"
#include "nsIGenericFactory.h"
#include "IXapianAccessor.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

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
  
#include <xapian.h>
#include <xapian/myhtmlparse.h>

using namespace std;

class XapianAccessor : public IXapianAccessor {

public:
  NS_DECL_ISUPPORTS
  NS_DECL_IXAPIANACCESSOR
  
  XapianAccessor();

private:
  ~XapianAccessor();

  MyHtmlParser htmlParser;
  Xapian::WritableDatabase database;
  Xapian::Stem stemmer;
  Xapian::TermGenerator indexer;
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(XapianAccessor, IXapianAccessor)

/* Constructor */
XapianAccessor::XapianAccessor() {}

/* Destructor */
XapianAccessor::~XapianAccessor() {
}

/* Open Xapian database */
NS_IMETHODIMP XapianAccessor::OpenDatabase(const char* directory, PRBool *retVal) {
  try {
    this->database = Xapian::WritableDatabase(directory, Xapian::DB_CREATE_OR_OVERWRITE);
  } catch(...) {
  }

  *retVal = PR_TRUE;
}

/* Open Xapian database */
NS_IMETHODIMP XapianAccessor::CloseDatabase( PRBool *retVal) {
  try {
    this->database.flush();
  } catch(...) {
  }

  *retVal = PR_TRUE;
}

/* Create xapian db from zeno file */
NS_IMETHODIMP XapianAccessor::AddArticleToDatabase(const char *url, const char *content, PRBool *retVal) {
  this->htmlParser.reset();

  try {
    this->htmlParser.parse_html(content, "UTF-8", true);
  } catch(...) {
  }

  /*
  std::cout << "Title:" << this->htmlParser.title << "\n";
  std::cout << "Keywords:" << this->htmlParser.keywords << "\n";
  std::cout << "Dump:" << this->htmlParser.dump << "\n";
  std::cout << "Sample:" << this->htmlParser.sample << "\n";
  */

  // Put the data in the document
  Xapian::Document document;
  document.set_data(this->htmlParser.title);
  
  // Index the title
  indexer.set_document(document);
  if (!this->htmlParser.title.empty()) {
    indexer.index_text(this->htmlParser.title, 2);
    indexer.increase_termpos(100);
  }
  
  // Index the content
  if (!this->htmlParser.dump.empty()) {
    indexer.index_text(this->htmlParser.dump);
  }

  // add to the database
  this->database.add_document(document);

  *retVal = PR_TRUE;
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
