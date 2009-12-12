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

/* Return an application config parameter */
function getApplicationProperty(name) {
    var prefs = Components.classes["@mozilla.org/preferences-service;1"]
	.getService(Components.interfaces.nsIPrefBranch);
    return prefs.getCharPref(name);
}

/* Return the installation prefix */
function getInstallationPrefix() {
    return getApplicationProperty("kiwix.install.prefix");
}
 
/* initialization function */
function init() {
    /* Check the XPCOM registration */
    if (Components.classes["@kiwix.org/zimAccessor"] == undefined)
	dump("Unable to register the zimAccessor XPCOM, Kiwix will be unable to read ZIM files.\n");
    if (Components.classes["@kiwix.org/xapianAccessor"] == undefined)
	dump("Unable to register the xapianAccessor XPCOM, Kiwix will be unable to provide the search engine.\n");
    if (Components.classes["@kiwix.org/zimXapianIndexer"] == undefined)
	dump("Unable to register the zimXapianIndexer XPCOM, Kiwix will be unable to index ZIM files.\n");

    /* Set the size and position of the window */
    configureWindowGeometry(this);

    /* Populates localization languages to the menu-languages */
    populateLanguagesMenu();

    /* Populates the last open menu */
    populateLastOpenMenu();

    /* Save the current language (necessary if the profile does not exists) */
    settings.locale(getCurrentLocale());

    /* Add mouse scroll listener to allow zoon in/out with the mouse for example */
    getHtmlRenderer().addEventListener("DOMMouseScroll", htmlRendererMouseScroll, false);
    getHtmlRenderer().addEventListener("mouseover", htmlRendererMouseOver, true);
    getHtmlRenderer().addEventListener("mouseout", htmlRendererMouseOut, true);
    getHtmlRenderer().addEventListener("DOMActivate", htmlRendererOpenUrl, true);
    
    /* Add mouse scroll listener to the results bar */
    getResultsList().addEventListener("DOMMouseScroll", resultsListMouseScroll, false);

    // register WebProgress listener
    var dls = Components.classes["@mozilla.org/docloaderservice;1"]
	.getService(nsIWebProgress);
    dls.addProgressListener (UIBrowserProgressListener,
			     nsIWebProgress.NOTIFY_LOCATION |
			     nsIWebProgress.NOTIFY_STATE_DOCUMENT);

    /* Apply GUI settings */
    if (settings.displayStatusBar() != undefined) { changeStatusBarVisibilityStatus(settings.displayStatusBar()); }
    if (settings.displayFullScreen() != undefined) { if (settings.displayFullScreen()) { UIToggleFullScreen(); } }
    if (settings.displayBookmarksBar() === true) { UIToggleBookmarksBar(); }

    /* Load the welcome page of the ZIM file */
    goHome();

    /* Current Zim ID */
    var currentZimId = settings.currentZimId();
    var currentBook = library.getBookById(currentZimId);

    if (currentBook) {
	dump(currentBook.indexType + "\n");
    }

    /* Check if there is a search index */
    if (currentBook != undefined &&
	currentBook.indexPath != undefined &&
	currentBook.indexPath != "") {
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
    var currentZimId = settings.currentZimId();
    var currentBook = library.getBookById(currentZimId);

    /* Security check */
    if (!currentBook) {
	return;
    }

    /* Try to load the ZIM file and retrieve the home page */
    var zimAccessor = loadZimFile(currentBook.path);

    if (zimAccessor != undefined) {
	var url = new Object();

	/* Return the welcome path if exists */
	zimAccessor.getMainPageUrl(url);
	if (url.value != undefined && url.value != '') {
	    return "zim://" + url.value;
	}

	/* Otherwise resturn the first page */
	var content = new Object();
	zimAccessor.reset();
	zimAccessor.getNextArticle(url, content);
	return "zim://" + url.value;
    } else {
	/* File as moved or was deleted */
	settings.currentZimId("");
	library.deleteBookById(currentZimId);
    }

    return undefined;
}

/* Load a ramdom page */
function loadRandomArticle() {
    var currentZimId = settings.currentZimId();
    var currentBook = library.getBookById(currentZimId);

    /* Security check */
    if (!currentBook) {
	return;
    }

    /* Try to load the ZIM file and retrieve the home page */
    var zimAccessor = loadZimFile(currentBook.path);

    if (zimAccessor != undefined) {
	var url = new Object();

	zimAccessor.getRandomPageUrl(url);
	if (url.value != undefined && url.value != '') {
	    url.value = "zim://" + url.value;
	}

	loadContent(url.value);
	activateBackButton();
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
    var resolvedUrl = ioService.newURI(url, null, null);
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

/* Check if a file exists */
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

/* Decode URL */
function decodeUrl (text) {
    var string = "";
    var i = 0;
    var c = 0;
    var c1 = 0;
    var c2 = 0;
    var utftext = unescape(text);
    
    while ( i < utftext.length ) {
	
	c = utftext.charCodeAt(i);
	
	if (c < 128) {
	    string += String.fromCharCode(c);
	    i++;
	}
	else if((c > 191) && (c < 224)) {
	    c2 = utftext.charCodeAt(i+1);
	    string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
	    i += 2;
	}
	else {
	    c2 = utftext.charCodeAt(i+1);
	    c3 = utftext.charCodeAt(i+2);
	    string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
	    i += 3;
	}
	
    }
    
    return string;
}

/* Merge two path, this is essential for the compatibility between nix & win */
function appendToPath(path, file) {
    var dir = Components.classes["@mozilla.org/file/local;1"] 
                       .createInstance(Components.interfaces.nsILocalFile);
    dir.initWithPath(path);
    dir.append(file);
    return dir.path;
}

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
