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

/* Returns the directory path where the search index is stored */
function getSearchIndexDirectory() {
    return settings.getRootPath() + "indexes/";
}

/* Return true if there is already a search index */
function existsSearchIndex() {
    var indexDirectorypath = getSearchIndexDirectory();
    if (isDirectory(indexDirectorypath)) {
	return true;
    }
    return false;
}

/* Show a dialog box to ask if the user want to index the ZIM file now */
function doYouWantToIndexNow() {
    if (confirm('Do you want to index your ZIM file now?')) {
	indexZimFile(settings.zimFilePath(), getSearchIndexDirectory());
	activateGuiSearchComponents();
    } else {
    }
}

/* Launch the indexation of a ZIM file */
function indexZimFile(zimFilePath, xapianDirectory) {


 
    var thread = Components.classes["@mozilla.org/thread-manager;1"]
	.getService(Components.interfaces.nsIThreadManager)
	.newThread(0);
    thread.dispatch(backgroundTask, thread.DISPATCH_NORMAL);
    
    return;





    /* Create the zim accessor */
    zimAccessor = Components.classes["@kiwix.org/zimAccessor"].getService();
    zimAccessor = zimAccessor.QueryInterface(Components.interfaces.IZimAccessor);
    
    /* Create the xapian accessor */
    xapianAccessor = Components.classes["@kiwix.org/xapianAccessor"].getService();
    xapianAccessor = xapianAccessor.QueryInterface(Components.interfaces.IXapianAccessor);
    
    /* Load the zim file */
    zimAccessor.loadFile(zimFilePath);
    
    /* Open the xapian writable database */
    xapianAccessor.openWritableDatabase(xapianDirectory);
    
    /* Add each article of the zim file in the xapian database */
    var url = new Object();
    var content = new Object();
    while (zimAccessor.getNextArticle(url, content)) {
	dump(url.value + '\n');
	xapianAccessor.addArticleToDatabase(url.value, content.value);
    }
    
    /* Close the xapian writable databse */
    xapianAccessor.closeWritableDatabase();
}

backgroundTask = {
   run: function() {
	var zimFilePath = settings.zimFilePath();
	var xapianDirectory = getSearchIndexDirectory();

	/* Create the zim accessor */
	zimAccessor = Components.classes["@kiwix.org/zimAccessor"].getService();
	zimAccessor = zimAccessor.QueryInterface(Components.interfaces.IZimAccessor);
	
	/* Create the xapian accessor */
	xapianAccessor = Components.classes["@kiwix.org/xapianAccessor"].getService();
	xapianAccessor = xapianAccessor.QueryInterface(Components.interfaces.IXapianAccessor);
	
	/* Load the zim file */
	zimAccessor.loadFile(zimFilePath);
	
	/* Open the xapian writable database */
	xapianAccessor.openWritableDatabase(xapianDirectory);
	
	/* Add each article of the zim file in the xapian database */
	var url = new Object();
	var content = new Object();
	while (zimAccessor.getNextArticle(url, content)) {
	    dump(url.value + '\n');
	    xapianAccessor.addArticleToDatabase(url.value, content.value);
	}
	
	/* Close the xapian writable databse */
	xapianAccessor.closeWritableDatabase();
	// perform work here that doesn't touch the DOM or anything else that isn't thread safe
    }
}

/* Search a pattern in the index */
function searchInIndex(query, xapianDirectory){
    /* Create the xapian accessor */
    xapianAccessor = Components.classes["@kiwix.org/xapianAccessor"].getService();
    xapianAccessor = xapianAccessor.QueryInterface(Components.interfaces.IXapianAccessor);

    /* Open the xapian readable database */
    xapianAccessor.openReadableDatabase(xapianDirectory);

    /* Make a search */
    xapianAccessor.search(query);

    /* Close the xapian readable databse */
    xapianAccessor.closeReadableDatabase();
}
 function backgroundTask() {
   // Perform a small amount of work
 

 }
 

