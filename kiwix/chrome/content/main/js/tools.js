/* Restart Kiwix */
function restart() {
    if (displayConfirmDialog(getProperty("restartConfirm"))) {
	/* Save settings */
	settings.save();

	var applicationStartup = Components.classes["@mozilla.org/toolkit/app-startup;1"]
	    .getService(Components.interfaces.nsIAppStartup);
	applicationStartup.quit(Components.interfaces.nsIAppStartup.eRestart |
				Components.interfaces.nsIAppStartup.eAttemptQuit);
    }
}

/* Quit Kiwix */
function quitKiwix() {
    /* Check if an indexing process is currently running */
    if (isIndexing()) {
	if (!displayConfirmDialog(getProperty("abortIndexingConfirm"))) {
	    return;
	}
    }

    /* Save settings */
    settings.save();

    var forceQuit = 1;
    var appStartup = Components.classes['@mozilla.org/toolkit/app-startup;1'].
    getService(Components.interfaces.nsIAppStartup);

    var quitSeverity = forceQuit ? Components.interfaces.nsIAppStartup.eForceQuit :
	Components.interfaces.nsIAppStartup.eAttemptQuit;
    appStartup.quit(quitSeverity);
}

/* Return the properties object */
function getProperties() {
    return document.getElementById("properties");
}

/* Return the value of a specific property */
function getProperty(name, parameter1, parameter2) {
    var message = getProperties().getString(name);

    if (parameter1 != undefined) {
	message = message.replace("%1", parameter1)
    }
    
    if (parameter2 != undefined) {
	message = message.replace("%2", parameter2)
    }

    return message;
}

/* initialization function */
function init() {
    /* Add mouse scroll listener to allow zoon in/out with the mouse for examle */
    getHtmlRenderer().addEventListener("DOMMouseScroll", mouseScroll, false);
    getHtmlRenderer().addEventListener("mouseover", mouseOver, true);
    getHtmlRenderer().addEventListener("mouseout", mouseOut, true);
    getHtmlRenderer().addEventListener("DOMActivate", openUrl, true);

    /* Apply GUI settings */
    if (settings.displayStatusBar() != undefined) { changeStatusBarVisibilityStatus(settings.displayStatusBar()); }
    if (settings.displayFullScreen() != undefined) { changeFullScreenStatus(settings.displayFullScreen()); }
    if (settings.displayResultsBar() != undefined) { changeResultsBarVisibilityStatus(settings.displayResultsBar()); }

    /* Populates localization languages to the menu-languages */
    populateLanguagesMenu();

    /* Load the welcome page of the ZIM file */
    goHome();

    /* Check if there is a search index */
    if (settings.zimFilePath() != undefined &&
	existsSearchIndex(settings.zimFilePath())) {
	activateGuiSearchComponents();
    } else {
	desactivateGuiSearchComponents();
    }
}

/* try a ZIM file */
function loadZimFile(zimFilePath) {
    /* Create the zim accessor */
    var zimAccessorService = Components.classes["@kiwix.org/zimAccessor"].getService();
    var zimAccessor = zimAccessorService.QueryInterface(Components.interfaces.IZimAccessor);

    /* Load the zim file */
    if (!zimAccessor.loadFile(zimFilePath)) {
	displayErrorDialog(getProperty("loadZimFileError", zimFilePath));
	return undefined;
    }

    return zimAccessor;
}

/* Return the homepage of a ZIM file */
/* TODO: as long as the welcome page is not saved in the ZIM file, this will return the first page */
function getZimFileHomePageUrl() {
    /* Security check */
    if (settings.zimFilePath() == undefined) {
	return;
    }

    /* Try to load the ZIM file and retrieve the home page */
    var zimAccessor = loadZimFile(settings.zimFilePath());

    if (zimAccessor != undefined) {
	var url = new Object();

	zimAccessor.getMainPageUrl(url);
	if (url.value != undefined && url.value != '') {
	    return "zim://" + url.value;
	}

	var content = new Object();
	zimAccessor.reset();
	zimAccessor.getNextArticle(url, content);
	return "zim://" + url.value;
    }

    return undefined;
}

/* Got the welcome page of the current zim file */
function goHome() {
    var homeUrl = getZimFileHomePageUrl();
    
    if (homeUrl != undefined && homeUrl != "") {
	getHtmlRenderer().setAttribute( "homepage", homeUrl);
	getHtmlRenderer().goHome();
    }
}

/* Open the "print" dialog windows */
function print() {
    try{
	PrintUtils.print();
    } catch(exception) {
	displayErrorDialog(exception);
	return false;
    }
    return true;
}

/* Load the page with the external browser */
function openUrlWithExternalBrowser(url) {
    var ioService = Components.classes["@mozilla.org/network/io-service;1"].
	getService(Components.interfaces.nsIIOService);
    var resolvedUrl = ioService.newURI(url.href, null, null);
    var externalProtocolService = Components.
	classes["@mozilla.org/uriloader/external-protocol-service;1"].
	getService(Components.interfaces.nsIExternalProtocolService);
    
    externalProtocolService.loadURI(resolvedUrl, null);
}

/* Check if a directory exists */
function isDirectory(path) {
    var file = Components.classes['@mozilla.org/file/local;1'].createInstance(Components.interfaces.nsILocalFile);
    file.initWithPath(path);
    
    if( file.exists() && file.isDirectory() ) {
	return true;
    }
    return false;
}

/* Return the size of a file */
/* TODO: Buggy with large files and 32 bits */
function getFileSize(path) {
    var fileService = Components.classes["@mozilla.org/file/local;1"].createInstance();
    if (fileService instanceof Components.interfaces.nsILocalFile) {
	fileService.initWithPath(path);
	return fileService.fileSize;
    }
}

/* Delete a file or a directory */
function deleteFile(path) {
    var fileService = Components.classes["@mozilla.org/file/local;1"].createInstance();
    if (fileService instanceof Components.interfaces.nsILocalFile) {
	fileService.initWithPath(path);
	return fileService.remove(true);
    }
}

/* Move a file or a directory */
function moveFile(filePath, newDirectory, newName) {
    var fileService = Components.classes["@mozilla.org/file/local;1"].createInstance();
    var directoryService = Components.classes["@mozilla.org/file/local;1"].createInstance();

    if (fileService instanceof Components.interfaces.nsILocalFile &&
	directoryService instanceof Components.interfaces.nsILocalFile) {
	fileService.initWithPath(filePath);
	directoryService.initWithPath(newDirectory);
	return fileService.moveTo(directoryService, newName);
    }
}

/* Check if a file exists*/
function isFile(filePath) {
    var fileService = Components.classes["@mozilla.org/file/local;1"].createInstance();
    if (fileService instanceof Components.interfaces.nsILocalFile) {
	fileService.initWithPath(filePath);
	return fileService.exists();
    }
}
