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
	/* index the ZIM file */
	indexZimFile(settings.zimFilePath(), getSearchIndexDirectory());

	/* make the search textbox editable */
	activateGuiSearchComponents();
    }
}

/* Proxyfy an object */
function proxyfyObject(obj, iid, sync) {
    var flags;

    if (sync || sync == undefined) {
        flags = Components.interfaces.nsIProxyObjectManager.INVOKE_SYNC | 
	    Components.interfaces.nsIProxyObjectManager.FORCE_PROXY_CREATION;
    } else {
        flags = Components.interfaces.nsIProxyObjectManager.INVOKE_ASYNC | 
            Components.interfaces.nsIProxyObjectManager.FORCE_PROXY_CREATION;
    }

    var proxyManager = Components.classes["@mozilla.org/xpcomproxy;1"].
	getService(Components.interfaces.nsIProxyObjectManager);
    var threadManager = Components.classes["@mozilla.org/thread-manager;1"].
	getService(Components.interfaces.nsIThreadManager);

    return proxyManager.getProxyForObject(threadManager.mainThread, iid, obj, flags);
}

/* Launch the indexation of a ZIM file */
function indexZimFile(zimFilePath, xapianDirectory) {
    var progressBar = getProgressBar();
    var proxiedZimIndexerObserver;

    /* ZIM indexer observer */
    var zimIndexerObserver = {
	observe : function (subject, topic, data) {
	    if (topic == "indexingProgress") {
		progressBar.value = data;
	    } else if (topic == "startIndexing") {
		progressBar.collapsed = false;
	    } else if (topic = "stopIndexing") {
		progressBar.collapsed = true;
	    }
	}
    }
    
    /* ZIM indexing task */
    zimIndexerTask = {
	run: function() {
	    var zimFilePath = settings.zimFilePath();
	    var xapianDirectory = getSearchIndexDirectory();
	    var progressBar = getProgressBar();

	    /* show the indexing progress bar */
	    proxiedZimIndexerObserver.notifyObservers(this, "startIndexing", "");
	    
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

	    /* Get the total number of article */
	    var articleCountObject = new Object();
	    zimAccessor.getArticleCount(articleCountObject);
	    var articleCount = articleCountObject.value;

	    /* Add each article of the zim file in the xapian database */
	    var url = new Object();
	    var content = new Object();
	    var articleCounter = 0;
	    var currentProgressBarPosition = 0;
	    var newProgressBarPosition = 0;

	    while (zimAccessor.getNextArticle(url, content)) {
		dump(url.value + "\n");
		currentProgressBarPosition = articleCounter++ / articleCount * 100 + 1;
		if (currentProgressBarPosition > newProgressBarPosition + 1) {
		    newProgressBarPosition = currentProgressBarPosition;
		    proxiedZimIndexerObserver.notifyObservers(this, "indexingProgress", newProgressBarPosition);
		}
		xapianAccessor.addArticleToDatabase(url.value, content.value);
	    }
	    
	    /* Close the xapian writable databse */
	    xapianAccessor.closeWritableDatabase();

	    /* Hide the indexing progress bar */
	    proxiedZimIndexerObserver.notifyObservers(this, "stopIndexing", "");
	}
    }

    /* Create the observer service and add listener*/
    var ObserverService = Components.classes["@mozilla.org/observer-service;1"].
	getService(Components.interfaces.nsIObserverService);
    ObserverService.addObserver(zimIndexerObserver, "indexingProgress", false);
    ObserverService.addObserver(zimIndexerObserver, "stopIndexing", false);
    ObserverService.addObserver(zimIndexerObserver, "startIndexing", false);
    
    /* Proxyfy the observer */
    proxiedZimIndexerObserver = proxyfyObject(ObserverService, Components.interfaces.nsIObserverService);

    /* Create an launch the indexing thread */
    var threadManager = Components.classes["@mozilla.org/thread-manager;1"].
    	getService(Components.interfaces.nsIThreadManager);
    var newThread = threadManager.newThread(0);
    newThread.dispatch(zimIndexerTask, newThread.DISPATCH_NORMAL);
    
    return;
}

/* Search a pattern in the index */
function searchInIndex(query, xapianDirectory){
    return;
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
