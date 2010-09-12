var currentZimAccessor;

/* try a ZIM file */
function openZimFile(path) {
    /* Create the ZIM accessor */
    var zimAccessorService = Components.classes["@kiwix.org/zimAccessor"].getService();
    var zimAccessor = zimAccessorService.QueryInterface(Components.interfaces.IZimAccessor);

    /* Return if not able to open the file */
    if (!zimAccessor.loadFile(path)) return;

    /* Otherwise */
    currentZimAccessor = zimAccessor;

    return currentZimAccessor;
}

/* Load the current ZIM file */
function openCurrentBook() {
    var currentBook = library.getCurrentBook();
    if (!currentBook) return;
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
	    return "zim://" + url.value;
	}
    }

    return homePageUrl;
}

/* Load a ramdom page */
function loadRandomArticle() {
    if (currentZimAccessor != undefined) {
	var url = new Object();

	currentZimAccessor.getRandomPageUrl(url);
	if (url.value != undefined && url.value != '') {
	    url.value = "zim://" + url.value;
	}

	loadContent(url.value);
	activateBackButton();
    }
}