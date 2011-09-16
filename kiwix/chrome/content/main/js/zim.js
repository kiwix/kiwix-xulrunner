var currentZimAccessor;

/* try a ZIM file */
function openZimFile(path) {
    /* Create the ZIM accessor */
    var zimAccessorService = Components.classes["@kiwix.org/zimAccessor"].getService();
    var zimAccessor = zimAccessorService.QueryInterface(Components.interfaces.IZimAccessor);

    /* Return if not able to open the file */
    var file =
	Components.classes["@mozilla.org/file/local;1"].
	createInstance(Components.interfaces.nsILocalFile);
    try {
	file.initWithPath(path);
    } catch(er) {
	return;
    }

    if (isFile(file.path) && zimAccessor.loadFile(file.path)) {
	currentZimAccessor = zimAccessor;
	return currentZimAccessor;
    }
}

/* Load the current ZIM file */
function openCurrentBook() {
    var currentBook = library.getCurrentBook();
    if (!currentBook) return false;
    return manageOpenFile(currentBook.path, true);
}

/* Return the homepage of a ZIM file */
function getCurrentZimFileHomePageUrl() {
    var homePageUrl;

    if (currentZimAccessor) {
	var url = new Object();

	/* Return the welcome path if exists */
	currentZimAccessor.getMainPageUrl(url);
	if (url.value != undefined && url.value != '') {
	    homePageUrl = "zim://" + url.value;	
	}
    }
    
    return homePageUrl;
}

/* Load a ramdom page */
function loadRandomArticle() {
    if (currentZimAccessor != undefined) {
	var url = new Object();
	
	currentZimAccessor.getRandomPageUrl(url);
	if (url.value != undefined && url.value != '')
	    url.value = "zim://" + url.value;	
	
	loadContent(url.value);
	activateBackButton();
    }
}

/* Load article from title */
function loadArticleFromTitle(title) {
    if (currentZimAccessor != undefined) {
	var url = new Object();
	
	currentZimAccessor.getPageUrlFromTitle(title, url);
	if (url.value != undefined && url.value != '') {
	    
	    /* Need to replace the '+' by the escaping value, otherwise will be interpreted as ' ' (see with "C++") */
	    var urlValue = url.value.replace( /\+/g, "%2B");

	    url.value = "zim://" + urlValue;
	    loadContent(url.value);
	    activateBackButton();
	    return true;
	}
    }
    
    return false;
}

/* Check the integrity (with a checksum) of the ZIM file */
function checkIntegrity() {
    if (currentZimAccessor != undefined) {
	if (canCheckIntegrity()) {
	    return !(currentZimAccessor.isCorrupted());
	} else {
	    dump("Unable to check the integrity of the current ZIMf file.\n");
	}
    }
}

/* Verify if the file has a checksum */
function canCheckIntegrity() {
    if (currentZimAccessor != undefined) {
	return currentZimAccessor.canCheckIntegrity();
    }
}

/* Check if a zim file is open */
function isBookOpen() {
    return (currentZimAccessor != undefined);
}