#include "xpcom-config.h"
#include "nsIGenericFactory.h"
#include "IZimXapianIndexer.h"
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

#include <zim/file.h>
#include <zim/article.h>
#include <zim/fileiterator.h>

#include <xapian.h>
#include "xapian/myhtmlparse.h"

#include <unac.h>

#include <string>

using namespace std;

/* Remove accent */
std::string removeAccents(const char *text) { 
  char* out = 0;
  size_t out_length = 0;
  std::string textWithoutAccent;

  if (!unac_string("UTF8", text, size_t(strlen(text)), &out, &out_length)) {
    textWithoutAccent = out;
    free(out);
  } else {
    textWithoutAccent = text;
  }
  return textWithoutAccent;
}

/* Count word */
unsigned int countWords(const string &text) {
  unsigned int numWords = 0;
  for(int i=0; i<text.size();) {
      while(text[i] != ' ')
	i++;

      numWords++;
      i++;
    }
  return numWords;
}

class ZimXapianIndexer : public IZimXapianIndexer {

public:
  NS_DECL_ISUPPORTS
  NS_DECL_IZIMXAPIANINDEXER
  
  ZimXapianIndexer();

private:
  ~ZimXapianIndexer();

protected:
  zim::File* zimFileHandler;
  zim::size_type firstArticleOffset;
  zim::size_type lastArticleOffset;
  zim::size_type currentArticleOffset;
  zim::Article currentArticle;

  unsigned int articleCount;
  unsigned int stepSize;
  
  Xapian::WritableDatabase writableDatabase;
  Xapian::Stem stemmer;
  Xapian::TermGenerator indexer;
  MyHtmlParser htmlParser;
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(ZimXapianIndexer, IZimXapianIndexer)

/* Constructor */
ZimXapianIndexer::ZimXapianIndexer() 
: zimFileHandler(NULL), 
  articleCount(0), 
  stepSize(0),
  stemmer(Xapian::Stem("english")) {
}

/* Destructor */
ZimXapianIndexer::~ZimXapianIndexer() {
  if (this->zimFileHandler != NULL) {
    delete this->zimFileHandler;
  }
}

/* Start indexing */
NS_IMETHODIMP ZimXapianIndexer::StartIndexing(const char *zimFilePath, 
					      const char *xapianDirectoryPath, 
					      PRBool *retVal) {
  *retVal = PR_TRUE;

  /* Open the ZIM file */
  try {    
    this->zimFileHandler = new zim::File(zimFilePath);

    if (this->zimFileHandler != NULL) {
      this->firstArticleOffset = this->zimFileHandler->getNamespaceBeginOffset('A');
      this->lastArticleOffset = this->zimFileHandler->getNamespaceEndOffset('A');
      this->currentArticleOffset = this->firstArticleOffset;
    } else {
      *retVal = PR_FALSE;
    }
  } catch(...) {
    *retVal = PR_FALSE;
  }

  /* Open the Xapian directory */
  try {
    this->writableDatabase = Xapian::WritableDatabase(xapianDirectoryPath, 
						      Xapian::DB_CREATE_OR_OVERWRITE);
  } catch (...) {
    *retVal = PR_FALSE;
  }

  /* Compute few things */
  this->articleCount = this->zimFileHandler->getNamespaceCount('A');
  this->stepSize = this->articleCount / 100;

  return NS_OK;

}

/* Index next percent */
NS_IMETHODIMP ZimXapianIndexer::IndexNextPercent(PRBool *retVal) {
  *retVal = PR_TRUE;
  unsigned int thresholdOffset = this->currentArticleOffset + this->stepSize;

  while(this->currentArticleOffset < thresholdOffset && 
	this->currentArticleOffset < this->lastArticleOffset) {

    /* get next non redirect article */
    do {
      currentArticle = this->zimFileHandler->getArticle(this->currentArticleOffset);
    } while (this->currentArticleOffset++ &&
	     currentArticle.isRedirect() && 
	     this->currentArticleOffset != this->lastArticleOffset);

    if (!currentArticle.isRedirect()) {

      /* Index the content */
      this->htmlParser.reset();
      
      try {
	this->htmlParser.parse_html(currentArticle.getData().data(), "UTF-8", true);
      } catch(...) {
      }
      
      /* Set the stemmer */
      /* TODO, autodetect the language */
      //indexer.set_stemmer(stemmer);
      
      /* Put the data in the document */
      Xapian::Document document;
      document.add_value(0, this->htmlParser.title);
      document.set_data(currentArticle.getUrl().getValue().c_str());
      indexer.set_document(document);
      
      /* Debug output */
      std::cout << "Indexing " << currentArticle.getUrl().getValue() << "..."<< std::endl;
      
      /* Index the title */
      if (!this->htmlParser.title.empty()) {
	indexer.index_text_without_positions(removeAccents(this->htmlParser.title.c_str()), 
			   ((this->htmlParser.dump.size() / 100) + 1) / countWords(this->htmlParser.title) );
      }
      
      /* Index the keywords */
      if (!this->htmlParser.keywords.empty()) {
	indexer.index_text_without_positions(removeAccents(this->htmlParser.keywords.c_str()), 3);
      }
      
      /* Index the content */
      if (!this->htmlParser.dump.empty()) {
	indexer.index_text_without_positions(removeAccents(this->htmlParser.dump.c_str()));
      }
      
      /* add to the database */
      this->writableDatabase.add_document(document);
    }
  }
  
  /* increment the offset and set returned value */
  if (this->currentArticleOffset < this->lastArticleOffset) {
    this->currentArticleOffset++;
    *retVal = PR_TRUE;
  } else {
    this->currentArticleOffset = this->firstArticleOffset;
    *retVal = PR_FALSE;
  }

  /* Write Xapian DB to the disk */
  this->writableDatabase.flush();

  return NS_OK;
}

NS_GENERIC_FACTORY_CONSTRUCTOR(ZimXapianIndexer)

static const nsModuleComponentInfo components[] =
{
   { "zimXapianIndexer",
     IZIMXAPIANINDEXER_IID,
     "@kiwix.org/zimXapianIndexer",
     ZimXapianIndexerConstructor
   }
};

NS_IMPL_NSGETMODULE(nsZimXapianIndexer, components)
