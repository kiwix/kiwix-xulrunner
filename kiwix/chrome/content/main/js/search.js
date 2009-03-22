/* Global variables */
var findInPageObject = null;            /* Object for the find in page dialog window */
var _isIndexing = false;                /* To know if a ZIM file is currently indexing */

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

/* Return true if an indexing process runs currently */
function isIndexing(value) {
    if (value != undefined) {
	_isIndexing = value;
    }

    return _isIndexing;
}

/* Return the directory path where the search index is stored */
function getSearchIndexDirectory(zimFilePath) {
    var fileSize = getFileSize(zimFilePath);
    return settings.getRootPath() + getSearchIndexDirectoryName(zimFilePath);
}

/* Return the name of the search index directory */
function getSearchIndexDirectoryName(zimFilePath) {
    var fileSize = getFileSize(zimFilePath);
    return fileSize + "index/";
}

/* Return the tmp directory path where the search index is build */
function getTmpSearchIndexDirectory() {
    return settings.getRootPath() + "tmpindex/";
}

/* Return true if there is already a search index */
function existsSearchIndex(zimFilePath) {
    var indexDirectorypath = getSearchIndexDirectory(zimFilePath);
    if (isDirectory(indexDirectorypath)) {
	return true;
    }
    return false;
}

/* Show a dialog box to ask if the user want to index the ZIM file now */
function manageIndexZimFile() {
    if (isIndexing()) {
	displayErrorDialog(getProperty("alreadyIndexingError"));
    } else if (settings.zimFilePath() == undefined) {
	displayErrorDialog(getProperty("noActiveZimFile"));
    } else if (displayConfirmDialog(getProperty("indexZimFileConfirm"))) {
	indexZimFile(settings.zimFilePath(), getSearchIndexDirectory(settings.zimFilePath()));
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
		isIndexing(true);
		progressBar.collapsed = false;
	    } else if (topic == "stopIndexing") {
		displayErrorDialog(getProperty("endOfIndexing"), getProperty("information"))
		progressBar.collapsed = true;
		isIndexing(false);
		activateGuiSearchComponents();
	    }
	}
    }
    
    /* ZIM indexing task */
    zimIndexerTask = {
	run: function() {
	    var zimFilePath = settings.zimFilePath();
	    var xapianTmpDirectory = getTmpSearchIndexDirectory();
	    var xapianDirectoryName = getSearchIndexDirectoryName(zimFilePath);
	    var xapianDirectory = getSearchIndexDirectory(zimFilePath);
	    var progressBar = getProgressBar();
	    var settingsRootPath = settings.getRootPath();

	    /* show the indexing progress bar */
	    proxiedZimIndexerObserver.notifyObservers(this, "startIndexing", "");

	    /* Remove the xapian tmp directory */
	    if (isFile(xapianTmpDirectory)) {
		deleteFile(xapianTmpDirectory);
	    }
	    
	    /* Create the zim accessor */
	    zimAccessor = Components.classes["@kiwix.org/zimAccessor"].getService();
	    zimAccessor = zimAccessor.QueryInterface(Components.interfaces.IZimAccessor);
	    
	    /* Create the xapian accessor */
	    xapianAccessor = Components.classes["@kiwix.org/xapianAccessor"].getService();
	    xapianAccessor = xapianAccessor.QueryInterface(Components.interfaces.IXapianAccessor);
	    
	    /* Load the ZIM file */
	    zimAccessor.loadFile(zimFilePath);
	    
	    /* Open the xapian writable database */
	    xapianAccessor.openWritableDatabase(xapianTmpDirectory);

	    /* Get the total number of article */
	    var articleCountObject = new Object();
	    zimAccessor.getArticleCount(articleCountObject);
	    var articleCount = articleCountObject.value;

	    /* Add each article of the ZIM file in the xapian database */
	    var url = new Object();
	    var content = new Object();
	    var articleCounter = 0;
	    var progressBarPadding = 5;
	    var currentProgressBarPosition = progressBarPadding;
	    var newProgressBarPosition = currentProgressBarPosition;

	    /* Default start value */
	    proxiedZimIndexerObserver.notifyObservers(this, "indexingProgress", newProgressBarPosition);

	    while (zimAccessor.getNextArticle(url, content)) {
		dump("Indexing " + url.value + "...\n");
		currentProgressBarPosition = articleCounter++ / articleCount * (100 - progressBarPadding) + 1;
		if (currentProgressBarPosition > newProgressBarPosition + 1) {
		    newProgressBarPosition = currentProgressBarPosition;
		    proxiedZimIndexerObserver.notifyObservers(this, "indexingProgress", newProgressBarPosition);
		}
		xapianAccessor.addArticleToDatabase(url.value, content.value);
	    }
	    
	    /* Close the xapian writable database */
	    xapianAccessor.closeWritableDatabase();

	    /* Move the xapian tmp directory to the well named xapian directory */
	    moveFile(xapianTmpDirectory, settingsRootPath, xapianDirectoryName); 
	   
	    /* Fill the progress bar */
	    proxiedZimIndexerObserver.notifyObservers(this, "indexingProgress", 100);

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
    /* Empty the results list */
    emptyResultsList();

    /* Create the xapian accessor */
    xapianAccessor = Components.classes["@kiwix.org/xapianAccessor"].getService();
    xapianAccessor = xapianAccessor.QueryInterface(Components.interfaces.IXapianAccessor);

    /* Open the xapian readable database */
    xapianAccessor.openReadableDatabase(xapianDirectory);

    /* Make a search */
    xapianAccessor.search(query, 28);

    /* Get the result */
    var url = new Object();
    var title = new Object();
    var score = new Object();

    /* Try to get the first result */
    xapianAccessor.getNextResult(url, title, score);

    if (url.value != "") {
	/* Display the first result (best score) */
	loadArticle("zim://" + url.value);

	/* Display all the results in the results sidebar */
	changeResultsBarVisibilityStatus(true);
	do {
	    addResultToList(url.value, title.value, score.value);
	} while (xapianAccessor.getNextResult(url, title, score));
    } else {
	changeResultsBarVisibilityStatus(false);
	displayErrorDialog(getProperty("noResultsError"), getProperty("information"));
    }	
    
    /* Close the xapian readable databse */
    xapianAccessor.closeReadableDatabase();
}

/* Function called by clicking on the search button */
function manageSearchInIndex() {
    var stringToSearch = getSearchBox().value.toLowerCase();

    if (stringToSearch == "") {
	displayErrorDialog(getProperty("emptySearchStringError"));
    } else {
	/* Make the search and display results */
	searchInIndex(stringToSearch, getSearchIndexDirectory(settings.zimFilePath()));
    }

    /* Clear search textbox */
    getSearchBox().value = "";

    return true;
}