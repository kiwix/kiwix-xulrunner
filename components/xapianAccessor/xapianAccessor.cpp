#include "xpcom-config.h"
#include "nsIGenericFactory.h"
#include "IXapianAccessor.h"
#include <stdio.h>
#include <stdlib.h>
#include <string>

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

#include "splitString.h"

using namespace std;

class XapianAccessor : public IXapianAccessor {

public:
  NS_DECL_ISUPPORTS
  NS_DECL_IXAPIANACCESSOR
  
  XapianAccessor();

private:
  ~XapianAccessor();

  MyHtmlParser htmlParser;
  Xapian::WritableDatabase writableDatabase;
  Xapian::Database readableDatabase;
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

/* Open Xapian writable database */
NS_IMETHODIMP XapianAccessor::OpenWritableDatabase(const char* directory, PRBool *retVal) {
  *retVal = PR_TRUE;

  try {
      this->writableDatabase = Xapian::WritableDatabase(directory, Xapian::DB_CREATE_OR_OVERWRITE);
  } catch (...) {
    *retVal = PR_FALSE;
  }
}

/* Close Xapian writable database */
NS_IMETHODIMP XapianAccessor::CloseWritableDatabase(PRBool *retVal) {
  try {
    this->writableDatabase.flush();
  } catch(...) {
  }

  *retVal = PR_TRUE;
}

/* Open Xapian readbale database */
NS_IMETHODIMP XapianAccessor::OpenReadableDatabase(const char* directory, PRBool *retVal) {
  *retVal = PR_TRUE;

  try {
    this->readableDatabase = Xapian::Database(directory);
  } catch (...) {
    *retVal = PR_FALSE;
  }
}

/* Close Xapian writable database */
NS_IMETHODIMP XapianAccessor::CloseReadableDatabase(PRBool *retVal) {
  *retVal = PR_TRUE;
}

/* Create xapian db from zeno file */
NS_IMETHODIMP XapianAccessor::AddArticleToDatabase(const char *url, const char *content, PRBool *retVal) {
  this->htmlParser.reset();

  try {
    this->htmlParser.parse_html(content, "UTF-8", true);
  } catch(...) {
  }
  
  /* Put the data in the document */
  Xapian::Document document;
  document.set_data(this->htmlParser.title);
  
  /* Index the title */
  indexer.set_document(document);
  if (!this->htmlParser.title.empty()) {
    indexer.index_text(this->htmlParser.title, 2);
    indexer.increase_termpos(100);
  }
  
  /* Index the content */
  if (!this->htmlParser.dump.empty()) {
    indexer.index_text(this->htmlParser.dump);
  }
  
  /* add to the database */
  this->writableDatabase.add_document(document);
  
  *retVal = PR_TRUE;
}

/* Search strings in the database */
NS_IMETHODIMP XapianAccessor::Search(const char *search, PRBool *retVal) {

  /* Create the enquire object */
  Xapian::Enquire enquire(this->readableDatabase);
  
  /* Create the query term vector */
  std::vector<std::string> queryTerms = split(search, " ");

  /* Create query object */
  Xapian::Query query(Xapian::Query::OP_OR, queryTerms.begin(), queryTerms.end());

  /* Set the query in the enquire object */
  enquire.set_query(query);

  cout << "Performing query `" <<
         query.get_description() << "'" << endl;

  
  /* Get the results */
  Xapian::MSet matches = enquire.get_mset(0, 10);

  Xapian::MSetIterator i;
  for (i = matches.begin(); i != matches.end(); ++i) {
    cout << "Document ID " << *i << "\t";
    cout << i.get_percent() << "% ";
    Xapian::Document doc = i.get_document();
    cout << "[" << doc.get_data() << "]" << endl;
  }

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
