#include <stdio.h>
#include <stdlib.h>
#include <string>
#include <xapian.h>

#include <unaccent.h>

#include "xpcom-config.h"
#include "nsIGenericFactory.h"
#include "nsXPCOM.h"
#include "nsEmbedString.h"
#include "nsIURI.h"
#include "nsIServiceManager.h"
#include "nsIFile.h"
#include "nsCOMPtr.h"
#include "nsIProperties.h"
#include "nsDirectoryServiceDefs.h"
#include "IXapianAccessor.h"

#include "splitString.h"

using namespace std;

struct Result
{
  string url;
  string title;
  int score;
}; 

class XapianAccessor : public IXapianAccessor {

public:
  NS_DECL_ISUPPORTS
  NS_DECL_IXAPIANACCESSOR
  
  XapianAccessor();

private:
  ~XapianAccessor();

  Xapian::Database readableDatabase;
  Xapian::Stem stemmer;
  std::vector<Result> results;
  std::vector<Result>::iterator resultOffset;
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(XapianAccessor, IXapianAccessor)

/* Constructor */
XapianAccessor::XapianAccessor() {
  stemmer = Xapian::Stem("english");
}

/* Destructor */
XapianAccessor::~XapianAccessor() {
}

/* Open Xapian readable database */
NS_IMETHODIMP XapianAccessor::OpenReadableDatabase(const nsACString &directory, PRBool *retVal) {
  *retVal = PR_TRUE;

  const char *directoryPath;
  NS_CStringGetData(directory, &directoryPath);

  try {
    this->readableDatabase = Xapian::Database(directoryPath);
  } catch (...) {
    *retVal = PR_FALSE;
  }
  return NS_OK;
}

/* Close Xapian writable database */
NS_IMETHODIMP XapianAccessor::CloseReadableDatabase(PRBool *retVal) {
  *retVal = PR_TRUE;
  return NS_OK;
}


/* Search strings in the database */
NS_IMETHODIMP XapianAccessor::Search(const nsACString &search, PRUint32 resultsCount, PRBool *retVal) {
  /* Reset the results */
  this->results.clear();
  this->resultOffset = this->results.begin();

  /* Create the enquire object */
  Xapian::Enquire enquire(this->readableDatabase);

  /* Create the query term vector */
  const char *csearch;
  NS_CStringGetData(search, &csearch, NULL);
  std::vector<std::string> queryTerms = split(removeAccents(csearch), " -*()[]");
  
  /* Create query object */
  Xapian::Query query(Xapian::Query::OP_OR, queryTerms.begin(), queryTerms.end());

  /* Set the query in the enquire object */
  enquire.set_query(query);

  cout << "Performing query `" <<
         query.get_description() << "'" << endl;
  
  /* Get the results */
  Xapian::MSet matches = enquire.get_mset(0, resultsCount);

  Xapian::MSetIterator i;
  for (i = matches.begin(); i != matches.end(); ++i) {
    Xapian::Document doc = i.get_document();

    Result result;
    result.url = doc.get_data();
    result.title = doc.get_value(0);
    result.score = i.get_percent();

    this->results.push_back(result);

    cout << "Document ID " << *i << "   \t";
    cout << i.get_percent() << "% ";
    cout << "\t[" << doc.get_data() << "] - " << doc.get_value(0) << endl;
  }

  /* Set the cursor to the begining */
  this->resultOffset = this->results.begin();

  *retVal = PR_TRUE;
  return NS_OK;
}

/* Reset the results */
NS_IMETHODIMP XapianAccessor::Reset(PRBool *retVal) {
  this->results.clear();
  this->resultOffset = this->results.begin();
  *retVal = PR_TRUE;
  return NS_OK;
}

/* Get next result */
NS_IMETHODIMP XapianAccessor::GetNextResult(nsACString &url, nsACString &title, PRUint32 *score, PRBool *retVal) {
  *retVal = PR_FALSE;

  if (this->resultOffset != this->results.end()) {

    /* url */
    url = nsDependentCString(this->resultOffset->url.c_str(), 
			       this->resultOffset->url.length());

    /* title */
    title = nsDependentCString(this->resultOffset->title.c_str(), 
			       this->resultOffset->title.length());

    /* score */
    *score =  this->resultOffset->score;

    /* increment the cursor for the next call */
    this->resultOffset++;

    *retVal = PR_TRUE;
  }
  return NS_OK;
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
