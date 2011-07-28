/* Global variables */
var _isIndexing = false;                /* To know if a ZIM file is currently indexing */
var _loadPageScoreThreshold = 90;       /* Only first result with a high score are loaded */ 

/* Open the "find in page" dialog window */
function find() {
    var findBar = getFindBar();
    if (findBar.hidden) {
	findBar.open(findBar.FIND_NORMAL);
	findBar.startFind();
    } else {
	findBar.close();
	getSearchBox().focus();
    }
}

/* Return true if an indexing process runs currently */
function isIndexing(value) {
    if (value != undefined)
	_isIndexing = value;

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
    return (isDirectory(indexDirectorypath));
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

    /* Necessary to avoid a flickering in the HTML renderer */
    getHtmlRenderer().reload();
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
		sendNotification(getProperty("information"), getProperty("endOfIndexing"));
		changeProgressBarVisibilityStatus(false);
		isIndexing(false);
	    }
	}
    }
    
    /* ZIM indexing task */
    var zimIndexerTask = {
	run: function() {
	    var currentBook = library.getCurrentBook();
	    var zimFilePath = currentBook.path;
	    var zimFileId = currentBook.id;
	    var indexTmpDirectory = getTmpSearchIndexDirectory();
	    var indexDirectoryName = getSearchIndexDirectoryName(zimFilePath);
	    var indexDirectory = getSearchIndexDirectory(zimFilePath);
	    var progressBar = getProgressBar();
	    var settingsRootPath = settings.getRootPath();
	    var backend = settings.defaultSearchBackend();

	    /* show the indexing progress bar */
	    proxiedZimIndexerObserver.notifyObservers(this, "startIndexing", "");

	    /* Remove the xapian tmp directory */
	    if (isFile(indexTmpDirectory)) 
		deleteFile(indexTmpDirectory);	    

	    /* Create the ZIM Xapian Indexer */
	    if (backend == "clucene") {
		zimIndexer = Components.classes["@kiwix.org/zimCluceneIndexer"].getService();
		zimIndexer = zimIndexer.QueryInterface(Components.interfaces.IZimCluceneIndexer);
	    } else {
		zimIndexer = Components.classes["@kiwix.org/zimXapianIndexer"].getService();
		zimIndexer = zimIndexer.QueryInterface(Components.interfaces.IZimXapianIndexer);
	    }

	    /* Load the ZIM file */
	    zimIndexer.startIndexing(zimFilePath, indexTmpDirectory);

	    /* Default start value */
	    var currentProgressBarPosition = 0;
	    proxiedZimIndexerObserver.notifyObservers(this, "indexingProgress", currentProgressBarPosition);

	    /* Check if the index directory exits (more robust, in case of the library file is wrong) */
	    if (!isDirectory(indexDirectory)) {

		/* Add each article of the ZIM file in the xapian database */
		while (zimIndexer.indexNextPercent()) {
		    proxiedZimIndexerObserver.notifyObservers(this, "indexingProgress", currentProgressBarPosition);
		    currentProgressBarPosition++;
		}
		
		/* Move the xapian tmp directory to the well named xapian directory */
		moveFile(indexTmpDirectory, settingsRootPath, indexDirectoryName); 
	    }
	    
	    /* Save the information in the library */
	    library.setBookIndex(zimFileId, appendToPath(settingsRootPath, indexDirectoryName));

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

function openSearchIndex(path) {
    var backend = settings.defaultSearchBackend();
    var indexAccessor;

    /* Create the xapian accessor */
    if (backend == "clucene") {
	indexAccessor = Components.classes["@kiwix.org/cluceneAccessor"].getService();
	indexAccessor = indexAccessor.QueryInterface(Components.interfaces.ICluceneAccessor);
    } else {
	indexAccessor = Components.classes["@kiwix.org/xapianAccessor"].getService();
	indexAccessor = indexAccessor.QueryInterface(Components.interfaces.IXapianAccessor);
    }

    /* Open the xapian readable database */
    if (!indexAccessor.openReadableDatabase(path))
	return;    

    return indexAccessor;
}

/* Function called by clicking on the search button */
function manageSearchInIndex(stringToSearch, start, end) {
    if (stringToSearch == undefined) {
	stringToSearch = getSearchBox().value;
	
	/* Tip to allow full text search from suggestions also if the stringToSearch matchs a title */
	if (stringToSearch[stringToSearch.length-1] == ' ')
	    getSearchBox().value = stringToSearch.substring(0, stringToSearch.length-1);
    }

    if (stringToSearch != "") {
	/* Try to load the article */
	if (loadArticleFromTitle(stringToSearch))
	    return true;

	/* Try to ucfirst the strintToSearch */
	if (loadArticleFromTitle(stringToSearch[0].toUpperCase() + stringToSearch.substring(1)))
	    return true;

	/* Try to uppercase the strintToSearch */
	if (loadArticleFromTitle(stringToSearch.toUpperCase()))
	    return true;

	/* Try to lowercase the strintToSearch */
	if (loadArticleFromTitle(stringToSearch.toLowerCase()))
	    return true;

	/* Try to lowercase the strintToSearch and ucfirst */
	if (loadArticleFromTitle(stringToSearch[0].toUpperCase() + stringToSearch.toLowerCase().substring(1)))
	    return true;


	/* Check if a search index exists */
	if (!checkSearchIndex()) {
	    manageIndexZimFile();
	    return;
	}
	
	if (start == undefined)
	    start = 0;
	
	if (end == undefined)
	    end = start + 20;
	
	/* Make the search and display results */
	var currentBook = library.getCurrentBook();
	loadContent("search://?pattern=" + stringToSearch + "&start=" + start + "&end=" + end);
    }
}

/* Calculate Levenshtein distance between two strings */
function computeLevenshteinDistance (s1, s2) {
    if (s1 == s2) return 0;

    s1 = s1.replace(" ", "");
    s2 = s2.replace(" ", "");

    var s1_len = s1.length;
    var s2_len = s2.length;
    if (s1_len === 0) return s2_len;
    if (s2_len === 0) return s1_len;

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
    for (s1_idx=0; s1_idx<s1_len+1; s1_idx++) 
        v0[s1_idx] = s1_idx;

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
              if (b < m_min) m_min = b;
              if (c < m_min) m_min = c;
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
    return (currentBook && currentBook.indexPath && openSearchIndex(currentBook.indexPath));
}