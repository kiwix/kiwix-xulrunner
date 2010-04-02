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
    return openFile(currentBook.path, true);
}

/* Return the homepage of a ZIM file */
/* TODO: as long as the welcome page is not saved in the ZIM file, this will return the first page */
function getCurrentZimFileHomePageUrl() {
    var homePageUrl;

    if (currentZimAccessor) {
	var url = new Object();

	/* Return the welcome path if exists */
	currentZimAccessor.getMainPageUrl(url);
	if (url.value != undefined && url.value != '') {
	    return "zim://" + url.value;
	}

	/* Otherwise resturn the first page */
	var content = new Object();
	currentZimAccessor.reset();
	currentZimAccessor.getNextArticle(url, content);
	homePageUrl = "zim://" + url.value;
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