/* Global variables */
var findInPageObject = null;            /* Object for the find in page dialog window */

/* Open the "find in page" dialog window */
function find() {
    if (!findInPageObject) {
	findInPageObject = new nsFindInstData();
	findInPageObject.browser = getHtmlRenderer();
    }
    
    var searchPattern = '';
    var lastWord = searchPattern.lastIndexOf(" ", searchPattern.length);
    findInPageObject.webBrowserFind.searchString = searchPattern.substring( lastWord+1, searchPattern.length );
    findInPage(findInPageObject);
}

/* Return the homepage of a ZIM file */
function getZimFileHomePageUrl() {
    var url = new Object();
    var content = new Object();
    //zenoAccessor.getNextArticle(url, content);
    //return url;
}

/* Launch the indexation of a ZIM file */
function indexZenoFile(zenoFilePath, xapianDirectory) {
    /* Create the zeno accessor */
    zenoAccessor = Components.classes["@kiwix.org/zenoAccessor"].getService();
    zenoAccessor = zenoAccessor.QueryInterface(Components.interfaces.IZenoAccessor);
    
    /* Create the xapian accessor */
    xapianAccessor = Components.classes["@kiwix.org/xapianAccessor"].getService();
    xapianAccessor = xapianAccessor.QueryInterface(Components.interfaces.IXapianAccessor);
    
    /* Load the zeno file */
    zenoAccessor.loadFile(zenoFilePath);
    
    /* Open the xapian writable database */
    xapianAccessor.openWritableDatabase(xapianDirectory);
    
    /* Add each article of the zeno file in the xapian database */
    var url = new Object();
    var content = new Object();
    while (zenoAccessor.getNextArticle(url, content)) {
	dump(url.value + '\n');
	xapianAccessor.addArticleToDatabase(url.value, content.value);
    }
    
    /* Close the xapian writable databse */
    xapianAccessor.closeWritableDatabase();
}

/* Search a pattern in the index */
function searchInIndex(query, xapianDirectory){
    xapianDirectory = '/tmp/xapian/';
    zenoFilePath = '/var/www/dumps/kiwix_0.5.zeno';
    
    indexZenoFile(zenoFilePath, xapianDirectory);

    /* Create the xapian accessor */
    xapianAccessor = Components.classes["@kiwix.org/xapianAccessor"].getService();
    xapianAccessor = xapianAccessor.QueryInterface(Components.interfaces.IXapianAccessor);

    dump("titi\n");

    /* Open the xapian readable database */
    xapianAccessor.openReadableDatabase(xapianDirectory);

    dump("titdi\n");

    /* Make a search */
    xapianAccessor.search(query);    
    
    dump("titdidddddddddd\n");

    /* Close the xapian readable databse */
    xapianAccessor.closeReadableDatabase();
    
    return;

	/*
	var resCount;
	var result0;
	var corpus = corpusgetactive();
	var wikisearch = getSearchEngine(corpus);
	if (wikisearch == null) return false;

	resCount = wikisearch.search(motR);
        if ( resCount > NB_SEARCH_RETURN ) resCount = NB_SEARCH_RETURN;
        if ( resCount == 0 ) setVisible( "wk-noresult", false );
        for ( var i = 0 ; i < resCount ; i++ ) {
         var score = wikisearch.getScore(i);
         if (( i == 0 )&&( score > AUTO_OPEN_SCORE )&&( !bNoAutoOpen )) 
               goTo(wikisearch.getResult(i));
         bNoAutoOpen = false;
         if ( score < 2 ) break;
         var page = wikisearch.getTitle(i);
         var chemin = "javascript:goTo('"+wikisearch.getResult(i)+"')";
	 addList(page, chemin, score );
        }
        addBackground('wk-resultat');
	return true;
	*/
}
