const nsIWebProgress = Components.interfaces.nsIWebProgress;
const nsIWebProgressListener = Components.interfaces.nsIWebProgressListener;

/* Restart Kiwix */
function restart() {
    if (displayConfirmDialog(getProperty("restartConfirm", getProperty("brand.brandShortName")))) {
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
function getProperties(brand) {
    var pid = "properties";
    if (brand == true) { pid  = "brand" + pid; }
    return document.getElementById(pid);
}

/* Return the value of a specific property */
function getProperty(name, parameter1, parameter2) {
    var brand   = false;
    if (name.indexOf("brand.", 0) == 0) {
        name = name.substring("brand.".length);
        brand = true;
    }
    var message = getProperties(brand).getString(name);

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

    /* Set the size and position of the window */
    configureWindowGeometry(this);

    /* Populates localization languages to the menu-languages */
    populateLanguagesMenu();

    /* Add mouse scroll listener to allow zoon in/out with the mouse for examle */
    getHtmlRenderer().addEventListener("DOMMouseScroll", mouseScroll, false);
    getHtmlRenderer().addEventListener("mouseover", mouseOver, true);
    getHtmlRenderer().addEventListener("mouseout", mouseOut, true);
    getHtmlRenderer().addEventListener("DOMActivate", openUrl, true);
    
    // register WebProgress listener
    var dls = Components.classes ["@mozilla.org/docloaderservice;1"]
	.getService (nsIWebProgress);
    dls.addProgressListener (UIBrowserProgressListener,
			     nsIWebProgress.NOTIFY_LOCATION |
			     nsIWebProgress.NOTIFY_STATE_DOCUMENT);

    /* Apply GUI settings */
    if (settings.displayStatusBar() != undefined) { changeStatusBarVisibilityStatus(settings.displayStatusBar()); }
    if (settings.displayFullScreen() != undefined) { if (settings.displayFullScreen()) { UIToggleFullScreen(); } }
    if (settings.displayResultsBar() != undefined) { changeResultsBarVisibilityStatus(settings.displayResultsBar()); }
    if (settings.displayBookmarksBar() === true) { UIToggleBookmarksBar(); }

    /* Load the welcome page of the ZIM file */
    goHome();

    /* Check if there is a search index */
    if (settings.zimFilePath() != undefined &&
	existsSearchIndex(settings.zimFilePath())) {
	activateGuiSearchComponents();
    } else {
	desactivateGuiSearchComponents();
	desactivateHomeButton();
    }

    /* Activate (or not) the Home button */
    if (getZimFileHomePageUrl()) {
	activateHomeButton();
    } else {
	desactivateHomeButton();
    }

    /* Desactivate back/next buttons */
    desactivateBackButton();
    desactivateNextButton();
    
    /* Initialize Bookmarks */
    InitializeBookmarks();

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
    if (settings.zimFilePath() == undefined || settings.zimFilePath() == "") {
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
    } else {
	/* File as moved or was deleted */
	settings.zimFilePath("");
    }

    return undefined;
}

/* Load a ramdom page */
function loadRandomArticle() {
    /* Security check */
    if (settings.zimFilePath() == undefined) {
	return;
    }

    /* Try to load the ZIM file and retrieve the home page */
    var zimAccessor = loadZimFile(settings.zimFilePath());

    if (zimAccessor != undefined) {
	var url = new Object();

	zimAccessor.getRandomPageUrl(url);
	if (url.value != undefined && url.value != '') {
	    url.value = "zim://" + url.value;
	}

	getHtmlRenderer().loadURI(url.value);
    }
}

/* Got the welcome page of the current zim file */
function goHome() {
    var homeUrl = getZimFileHomePageUrl();
    var htmlRenderer = getHtmlRenderer();
    
    if (homeUrl != undefined && homeUrl != "") {
	htmlRenderer.setAttribute("homepage", homeUrl);
	htmlRenderer.goHome();
	
	/* activate if necessary the back button */
	if (htmlRenderer.sessionHistory.count > 1) {
	    activateBackButton();
	} else {
	    htmlRenderer.sessionHistory.PurgeHistory(htmlRenderer.sessionHistory.count);
	}
    } else {
	showHelp();
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

/* Event Listener */
const UIBrowserProgressListener = {

	onStateChange: function osc (aWP, aRequest, aStateFlags, aStatus) {
	},

	onLocationChange: function olc (wp,request,location) {
    	UISaveCurrentNote ();
		UIBookmarkFocus (location.spec);
	},
	
	QueryInterface: function qi (aIID) {
    	if (aIID.equals(nsIWebProgressListener) ||
			aIID.equals(Components.interfaces.nsISupports) ||
			aIID.equals(Components.interfaces.nsISupportsWeakReference)) {
			return this;
		}
    	throw Components.results.NS_ERROR_NO_INTERFACE;
	}
};

/* LiveMode */
function GetRunMode () {
	var live_file = Components.classes["@mozilla.org/file/directory_service;1"].getService(Components.interfaces.nsIProperties).get("resource:app", Components.interfaces.nsIFile);
	live_file.append("live");
	if (live_file.exists ()) {
		return 'live';
	} else {
		return 'install';
	}
}

function GetFirstRun () {
	var first_file = Components.classes["@mozilla.org/file/directory_service;1"]
	                     .getService (Components.interfaces.nsIProperties)
	                     .get ("ProfD", Components.interfaces.nsIFile);

	first_file.append ("moulin_"+_runMode+".launched");
	if (first_file.exists ()) {
		return false;
	} else {
		L.info ("first run ; creating "+first_file.path);
		first_file.create (Components.interfaces.nsIFile.NORMAL_FILE_TYPE, 0600);
		return true;
	}
}

function GetCleanOnClose () {
	var prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
	var removeOnClosePref = prefs.getBoolPref("kiwix.removeprofileonclose");
	return (removeOnClosePref && _runMode == 'live');
}

function AlertOnFirstRun () {
	return true;
}

function WarnOnSideBar () {

	if (_runMode == 'live' && _firstRun && _firstSideBar) {
		_firstSideBar = false;

		var strbundle			= document.getElementById ("strings");
		var welcomeAlertTitle	= strbundle.getString ("welcomeAlertTitle");	
		var welcomeAlert		= strbundle.getString ("welcomeAlert");	

		var prompt = Components.classes["@mozilla.org/network/default-prompt;1"].createInstance(Components.interfaces.nsIPrompt);
		prompt.alert (welcomeAlertTitle, welcomeAlert);
	}
}

/* Returns path application is running from */
function GetApplicationFolder () {
	try {
		return Components.classes ["@mozilla.org/file/directory_service;1"]
		.getService (Components.interfaces.nsIProperties)
		.get ("resource:app", Components.interfaces.nsIFile);
	} catch (e) {
		L.error ("can't get app folder:" + e.toString ());
		return false;
	}
}
/*
 * return [win|mac|unix] depending on the platform running.
 * usefull to trick mac specificities.
 */
function GuessOS () {
    var runtime = Components.classes ["@mozilla.org/xre/app-info;1"]
    .getService(Components.interfaces.nsIXULRuntime);
    var tmp = runtime.OS;
	var platform = {};
    
    if (tmp.match(/^win/i)) { // send condoleances
        platform.type = "win";
        platform.string = tmp;
        return platform;
    }
    if (tmp.match(/^darwin/i)) { // send freedom speech
        platform.type = "mac";
        platform.string = tmp;
        return platform;
    } else { // send drivers
        platform.type = "unix";
        platform.string = tmp;
    }
    return platform;
}
