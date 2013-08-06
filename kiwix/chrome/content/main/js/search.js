/*
 * Copyright 2011 Emmanuel Engelhart <kelson@kiwix.org>
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU  General Public License as published by
 * the Free Software Foundation; either version 3 of the License, or
 * any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston,
 * MA 02110-1301, USA.
 */

/* Global variables */
var _currentlyIndexedBook = undefined;
var _indexerObserverId = undefined;
var _zimIndexer = undefined;

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

    return undefined;
}

/* Return true if an indexing process runs currently */
function isIndexing() {
    return _currentlyIndexedBook != undefined;
}

/* Return the directory path where the search index is stored */
function getSearchIndexDirectory(zimFilePath) {
    var dir = appendToPath(settings.dataDirectory());
    dir = appendToPath(dir, "index");
    return (zimFilePath === undefined) ?
	dir : appendToPath(dir, getSearchIndexDirectoryName(zimFilePath));
}

/* Return the name of the search index directory */
function getSearchIndexDirectoryName(zimFilePath) {
    var file = Components.classes["@mozilla.org/file/local;1"].
	createInstance(Components.interfaces.nsILocalFile);
    file.initWithPath(zimFilePath);
    return file.leafName + ".idx";
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
function manageIndexCurrentBook(noConfirmation) {
    var currentBook = library.getCurrentBook();

    if (isIndexing()) {
	displayErrorDialog(getProperty("alreadyIndexingError"));
    } else if (!currentBook) {
	displayErrorDialog(getProperty("noActiveZimFile"));
    } else {
	var doNotAskAnymore = new Object();
        doNotAskAnymore.value = false;

	if (noConfirmation ||
	    displayConfirmDialogEx(getProperty("indexZimFileConfirm"), undefined, 
				   getProperty("doNotAskAnymore"), doNotAskAnymore)) {
    	    // if launched too early, index crash on OSX.
	    if (env.isMac()) {
		setTimeout(indexCurrentBook, 3000);
	    } else {
		setTimeout(indexCurrentBook, 0);
	    }

	    /* Disable indexing launch menu */
	    getLaunchIndexingMenuItem().disabled = true;
	}

	if (doNotAskAnymore.value) {
	    settings.neverAskToIndex(currentBook.id, true);
	}
    }

    /* Necessary to avoid a flickering in the HTML renderer */
    getHtmlRenderer().reload();
    
    return undefined;
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
function indexCurrentBook() {
    var currentBook = library.getCurrentBook();
    var zimFilePath = currentBook.path;
    var zimFileId = currentBook.id;
    var settingsRootPath = settings.getRootPath();
    var backend = settings.defaultSearchBackend();
    var indexTmpDirectory = getTmpSearchIndexDirectory();
    var indexDirectoryName = getSearchIndexDirectoryName(zimFilePath);
    var indexDirectory = getSearchIndexDirectory(zimFilePath);
    
    /* Remove the xapian tmp directory */
    if (isDirectory(indexTmpDirectory)) {
	deleteFile(indexTmpDirectory);
    } 
    
    /* Check if the index directory exists and is valid (more robust, in case of the library file is wrong) */
    if (!isDirectory(indexDirectory) && !openSearchIndex(indexDirectory, true)) {
	
	/* Delete indexDirectory if necessary - can happens in case of corrupted index */
	if (isDirectory(indexDirectory)) {
	    deleteFile(indexDirectory);
	}
	
	/* Create the ZIM Xapian Indexer */
	if (backend == "clucene") {
	    _zimIndexer = Components.classes["@kiwix.org/zimCluceneIndexer"].getService();
	    _zimIndexer = _zimIndexer.QueryInterface(Components.interfaces.IZimCluceneIndexer);
	} else {
	    _zimIndexer = Components.classes["@kiwix.org/zimXapianIndexer"].getService();
	    _zimIndexer = _zimIndexer.QueryInterface(Components.interfaces.IZimXapianIndexer);
	}
	
	/* Load the ZIM file */
	if (_zimIndexer.start(zimFilePath, indexTmpDirectory)) {
	    setIndexingProgression(0);
	    changeProgressBarVisibilityStatus(true);
	    _currentlyIndexedBook = library.getCurrentBook();
	    startIndexingObserver();
	}
    } else {
	library.setBookIndex(zimFileId, indexDirectory);
    }
    
    return undefined;
}

function setIndexingProgression(progression) {
    getProgressBar().value = progression;
    getProgressBarLabel().value = getProperty("indexing") + " (" + progression + "%)";
    return undefined;
}

function checkIndexing() {
    var progression = new Object();
    _zimIndexer.getProgression(progression);

    if (_zimIndexer.isRunning()) {
	setIndexingProgression(progression.value)
    } else {
	if (progression.value == 100) {
	    setIndexingProgression(100);
	    
	    /* Move the xapian tmp directory to the well named xapian directory */
	    moveFile(getTmpSearchIndexDirectory(), 
		     getSearchIndexDirectory(), 
		     getSearchIndexDirectoryName(_currentlyIndexedBook.path)); 
	    
	    /* Save the information in the library */
	    library.setBookIndex(_currentlyIndexedBook.id, getSearchIndexDirectory(_currentlyIndexedBook.path));
	    
	    /* Last actions */
	    sendNotification(getProperty("information"), getProperty("endOfIndexing"));
	    isIndexing(false);
	    changeProgressBarVisibilityStatus(false);
	    stopIndexingObserver();
	    _currentlyIndexedBook = undefined;
	    _indexerObserverId = undefined;
	    _zimIndexer = undefined;
	}
    }

    return undefined;
}

function startIndexingObserver() {
    _indexerObserverId = window.setInterval("checkIndexing()", 1000);
    return undefined;
}

function stopIndexingObserver() {
    clearInterval(_indexerObserverId);
    return undefined;
}

function openSearchIndex(path, quiet) {
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

    /* Open the search engine index */
    if (!indexAccessor.openReadableDatabase(path, path)) {
	if (!quiet) {
	    L.error("Not able to open xapian database " + path);
	}
	return false;    
    }

    return indexAccessor;
}

/* Function called by clicking on the search button */
function manageSearchInIndex(stringToSearch, start, end) {
    if (stringToSearch == undefined) {
	stringToSearch = getSearchBox().value;
	
	/* Tip to allow full text search from suggestions also if the stringToSearch matchs a title */
	var l = stringToSearch.length - 1;
	if (stringToSearch[l] == ' ')
            getSearchBox().value = stringToSearch.substring(0, l);
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
	var currentBook = library.getCurrentBook();

	if (!checkSearchIndex()) {
	    if (!settings.neverAskToIndex(currentBook.id)) {
		manageIndexCurrentBook();
	    }
	    return undefined;
	} else {
	    if (start == undefined)
		start = 0;
	    
	    if (end == undefined)
		end = start + 20;
	
	    /* Make the search and display results */
	    loadContent("search://?pattern=" + stringToSearch + "&start=" + start + "&end=" + end);
	}
    }

    return undefined;
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
    return (currentBook && currentBook.indexPath.length > 0 && 
	    openSearchIndex(currentBook.indexPath, true));
}