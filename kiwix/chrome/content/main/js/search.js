/* Global variables */
var findInPageObject = null;            /* Object for the find in page dialog window */
var _isIndexing = false;                /* To know if a ZIM file is currently indexing */
var _loadPageScoreThreshold = 90;       /* Only first result with a high score are loaded */ 

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
    return appendToPath(settings.getRootPath(), getSearchIndexDirectoryName(zimFilePath));
}

/* Return the name of the search index directory */
function getSearchIndexDirectoryName(zimFilePath) {
    var zimAccessor = openZimFile(zimFilePath);
    var zimId = new Object();
    zimAccessor.getId(zimId);
    return zimId.value + ".index";
}

/* Return the tmp directory path where the search index is build */
function getTmpSearchIndexDirectory() {
    return appendToPath(settings.getRootPath(), "tmpindex");
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
    var currentBook = library.getCurrentBook();

    if (isIndexing()) {
	displayErrorDialog(getProperty("alreadyIndexingError"));
    } else if (!currentBook) {
	displayErrorDialog(getProperty("noActiveZimFile"));
    } else if (displayConfirmDialog(getProperty("indexZimFileConfirm"))) {
	indexZimFile(currentBook.path, getSearchIndexDirectory(currentBook.path));
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
    var progressBarLabel = getProgressBarLabel();
    var proxiedZimIndexerObserver;

    /* ZIM indexer observer */
    var zimIndexerObserver = {
	observe : function (subject, topic, data) {
	    if (topic == "indexingProgress") {
		progressBar.value = data;
		progressBarLabel.value = getProperty("indexing") + " (" + Math.round(data) + "%)";
	    } else if (topic == "startIndexing") {
		isIndexing(true);
		changeProgressBarVisibilityStatus(true);
	    } else if (topic == "stopIndexing") {
		displayErrorDialog(getProperty("endOfIndexing"), getProperty("information"))
		changeProgressBarVisibilityStatus(false);
		isIndexing(false);
		activateGuiSearchComponents();
	    }
	}
    }
    
    /* ZIM indexing task */
    var zimIndexerTask = {
	run: function() {
	    var currentBook = library.getCurrentBook();
	    var zimFilePath = currentBook.path;
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

	    /* Create the ZIM Xapian Indexer */
	    zimXapianIndexer = Components.classes["@kiwix.org/zimXapianIndexer"].getService();
	    zimXapianIndexer = zimXapianIndexer.QueryInterface(Components.interfaces.IZimXapianIndexer);

	    /* Load the ZIM file */
	    zimXapianIndexer.startIndexing(zimFilePath, xapianTmpDirectory);

	    /* Default start value */
	    var currentProgressBarPosition = 0;
	    proxiedZimIndexerObserver.notifyObservers(this, "indexingProgress", currentProgressBarPosition);
	    
	    /* Add each article of the ZIM file in the xapian database */
	    while (zimXapianIndexer.indexNextPercent()) {
		dump("Indexing " + currentProgressBarPosition + "%...\n");
		proxiedZimIndexerObserver.notifyObservers(this, "indexingProgress", currentProgressBarPosition);
		currentProgressBarPosition += 1;
	    }
	    dump("Indexing finished");

	    /* Move the xapian tmp directory to the well named xapian directory */
	    moveFile(xapianTmpDirectory, settingsRootPath, xapianDirectoryName); 

	    /* Save the information in the library */
	    library.setIndexById(library.current, 
				 appendToPath(settingsRootPath, xapianDirectoryName), "xapian_flint");

	    /* Fill the progress bar */
	    proxiedZimIndexerObserver.notifyObservers(this, "indexingProgress", 100);

	    /* Hide the indexing progress bar */
	    proxiedZimIndexerObserver.notifyObservers(this, "stopIndexing", "");
	
            /* Remove the observer */
            proxiedZimIndexerObserver.removeObserver(zimIndexerObserver, "indexingProgress");
            proxiedZimIndexerObserver.removeObserver(zimIndexerObserver, "stopIndexing");
            proxiedZimIndexerObserver.removeObserver(zimIndexerObserver, "startIndexing");
	    zimIndexerObserver = null;		
            proxiedZimIndexerObserver = null;
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

/* Try to open search index */
function openSearchIndex(path) {

    /* Create the xapian accessor */
    var xapianAccessor = Components.classes["@kiwix.org/xapianAccessor"].getService();
    xapianAccessor = xapianAccessor.QueryInterface(Components.interfaces.IXapianAccessor);

    /* Open the xapian readable database */
    if (!xapianAccessor.openReadableDatabase(path)) {
	return;
    }

    return xapianAccessor;
}

/* Search a pattern in the index */
function searchInIndex(query, xapianDirectory) {
    /* Empty the results list */
    emptyResultsList();

    /* Get the xapian accessor */
    var xapianAccessor = openSearchIndex(xapianDirectory);

    /* Security check */
    if (!xapianAccessor) return;

    /* Make a search */
    xapianAccessor.search(query, 28);

    /* Get the result */
    var url = new Object();
    var title = new Object();
    var score = new Object();

    /* Build the result array */
    var results = new Array;
    while (xapianAccessor.getNextResult(url, title, score)) {
	var result = new Array;
	result.push(url.value);
	result.push(title.value);
	result.push(score.value);
	results.push(result);
    }

    /* Try to get the first result */
    xapianAccessor.getNextResult(url, title, score);

    if (results.length > 0) {
	var firstUrl = results[0][0];
	var firstTitle = results[0][1];
	var firstScore = results[0][2];

	/* Display the first result if the search pattern eq to the first result */
	if (query.toLowerCase() == firstTitle.toLowerCase()) {
	    loadContent("zim://" + firstUrl);
	}

	/* Display the first result (best score) if its accuracy is high*/
	else if (firstScore > _loadPageScoreThreshold) {

	    /* Check if the Levenshtein distance is not too bad */
	    var distance = computeLevenshteinDistance(query.toLowerCase(), 
						      firstTitle.toLowerCase());
	    var threshold = query.length;
	    if (distance < threshold) {
		loadContent("zim://" + firstUrl);
	    }

	    /* Last chance */
	    else if (results.length > 1) {
		var secondTitle = results[1][1];
		
		if (firstTitle.toLowerCase().indexOf(query.toLowerCase()) > -1 &&
		    secondTitle.toLowerCase().indexOf(query.toLowerCase()) == -1) {
		    loadContent("zim://" + firstUrl);
		}
	    }

	    /* If only one result load it */
	    else {
		loadContent("zim://" + firstUrl);
	    }
	}

	/* Display all the results in the results sidebar */
	changeResultsBarVisibilityStatus(true);
	for (var index=0; index<results.length; index++) {
	    addResultToList(results[index][0], results[index][1], results[index][2]);
	};
    } else {
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
	var currentBook = library.getCurrentBook();
	searchInIndex(stringToSearch, currentBook.indexPath);
    }

    /* Clear search textbox */
    getSearchBox().value = "";

    return true;
}

/* Calculate Levenshtein distance between two strings */
function computeLevenshteinDistance (s1, s2) {
    if (s1 == s2) {
        return 0;
    }

    s1 = s1.replace(" ", "");
    s2 = s2.replace(" ", "");

    var s1_len = s1.length;
    var s2_len = s2.length;
    if (s1_len === 0) {
        return s2_len;
    }
    if (s2_len === 0) {
        return s1_len;
    }

    /* begin static */
    var split = false;
    try{
        split=!('0')[0];
    } catch (e){
        split=true; /* Earlier IE may not support access by string index */
    }

    /* end static */
    if (split){
        s1 = s1.split('');
        s2 = s2.split('');
    }

    var v0 = new Array(s1_len+1);
    var v1 = new Array(s1_len+1);

    var s1_idx=0, s2_idx=0, cost=0;
    for (s1_idx=0; s1_idx<s1_len+1; s1_idx++) {
        v0[s1_idx] = s1_idx;
    }

    var char_s1='', char_s2='';
    for (s2_idx=1; s2_idx<=s2_len; s2_idx++) {
        v1[0] = s2_idx;
        char_s2 = s2[s2_idx - 1];

        for (s1_idx=0; s1_idx<s1_len;s1_idx++) {
            char_s1 = s1[s1_idx];
            cost = (char_s1 == char_s2) ? 0 : 1;
            var m_min = v0[s1_idx+1] + 1;
            var b = v1[s1_idx] + 1;
            var c = v0[s1_idx] + cost;
            if (b < m_min) {
                m_min = b; }
            if (c < m_min) {
                m_min = c; }
            v1[s1_idx+1] = m_min;
        }
        var v_tmp = v0;
        v0 = v1;
        v1 = v_tmp;
    }

    return v0[s1_len];
}

/* Check if we have a current search index */
function checkSearchIndex() {
    var currentBook = library.getCurrentBook();
    if (currentBook && currentBook.indexPath && openSearchIndex(currentBook.indexPath)) return true;
    return false;
}
