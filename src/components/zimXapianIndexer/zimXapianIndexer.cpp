#include "xpcom-config.h"
#include "nsIGenericFactory.h"
#include "IZimXapianIndexer.h"

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

#include <unaccent.h>

using namespace std;

/* Count word */
unsigned int countWords(const string &text) {
  unsigned int numWords = 1;
  for(int i=0; i<text.size();) {
    while(i<text.size() && text[i] != ' ') {
      i++;
    }
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
  float stepSize;
  
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
  stemmer(Xapian::Stem("english")),
  articleCount(0), 
  stepSize(0) {
}

/* Destructor */
ZimXapianIndexer::~ZimXapianIndexer() {
  if (this->zimFileHandler != NULL) {
    delete this->zimFileHandler;
  }
  //this->writableDatabase.~WritableDatabase();
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
  this->stepSize = (float)this->articleCount / (float)100;

  return NS_OK;

}

/* Index next percent */
NS_IMETHODIMP ZimXapianIndexer::IndexNextPercent(PRBool *retVal) {
  *retVal = PR_TRUE;
  float thresholdOffset = this->currentArticleOffset + this->stepSize;
  size_t found;

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
		string content (currentArticle.getData().data(), currentArticle.getData().size());
		this->htmlParser.parse_html(content, "UTF-8", true);
      } catch(...) {
      }
      
      /* if content does not have the noindex meta tag */
      found=this->htmlParser.dump.find("NOINDEX");
      
      if (found == string::npos) {

	/* Set the stemmer */
	/* TODO, autodetect the language */
	//indexer.set_stemmer(stemmer);
	
	/* Put the data in the document */
	Xapian::Document document;
	document.add_value(0, this->htmlParser.title);
	document.set_data(currentArticle.getUrl().getValue().c_str());
	indexer.set_document(document);
	
	/* Debug output */
	std::cout << "Indexing " << currentArticle.getUrl().getValue() << "..." << std::endl;
	
	/* Index the title */
	if (!this->htmlParser.title.empty()) {
	  indexer.index_text_without_positions(removeAccents(this->htmlParser.title.c_str()), 
					       ((this->htmlParser.dump.size() / 100) + 1) / 
					       countWords(this->htmlParser.title) );
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
  }

  /* Write Xapian DB to the disk */
  this->writableDatabase.flush();

  /* increment the offset and set returned value */
  if (this->currentArticleOffset < this->lastArticleOffset) {
    this->currentArticleOffset++;
    *retVal = PR_TRUE;
  } else {
    this->currentArticleOffset = this->firstArticleOffset;
	this->writableDatabase.~WritableDatabase();
    *retVal = PR_FALSE;
  }

  return NS_OK;
}

/* Stop indexing. TODO: using it crashs the soft under windows. Have to do it in indexNextPercent() */
NS_IMETHODIMP ZimXapianIndexer::StopIndexing(PRBool *retVal) {
  *retVal = PR_TRUE;
  //this->writableDatabase.~WritableDatabase();
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

