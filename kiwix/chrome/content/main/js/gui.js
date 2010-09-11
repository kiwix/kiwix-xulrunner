/* Global variables */
var _zoomFactor             = 1.2;      /* Factor by which font is magnified or reduced with zoomIn() & zommOut() */
var _winIsFullScreen        = false;    /* Stores fullscreen state*/
var _applicationFD          = GetApplicationFolder ();
var _runMode		    = getRunMode ();
var _firstRun		    = GetFirstRun ();
var _firstSideBar	    = true;

var _languagesHash          = Array();
_languagesHash['fr-FR']     = "Français";
_languagesHash['de-DE']     = "Deutsch";
_languagesHash['en-US']     = "English";
_languagesHash['zh']        = "中文";
_languagesHash['es-ES']     = "Español";
_languagesHash['it-IT']     = "Italiano";
_languagesHash['ar']        = "العربية";
_languagesHash['faool']        = "فارسی";
_languagesHash['he-IL']     = "עברית";
_languagesHash['pt-PT']     = "Português";

/* Return the window object */
function getWindow() {
    return document.getElementById("main");
}

/* Load an url in the HTML render element */
function loadContent(url) {
    try {
	getHtmlRenderer().loadURI(url, null, null);
    } catch(e) {
	displayErrorDialog(getProperty("loadArticleError"));
	return false;
    }
    return true;
}

/* Return the Search input box object */
function getSearchBox() {
    return document.getElementById("textbox-search");
}

/* Return the Home button object */
function getHomeButton() {
    return document.getElementById("button-home");
}

/* Return the results button */
function getResultsButton() {
    return document.getElementById("button-results");
}

/* Return the bookmarks button */
function getBookmarksButton() {
    return document.getElementById("button-bookmarks");
}

/* Return the Back button object */
function getBackButton() {
    return document.getElementById("button-back");
}

/* Return the Next button object */
function getNextButton() {
    return document.getElementById("button-next");
}

/* Return the label "masking" the search button and textbox */
function getSearchLabel() {
    return document.getElementById("search-label");
}

/* Return the Progress meter object */
function getProgressBar() {
    return document.getElementById("progress-bar");
}

/* Return the Progress meter label */
function getProgressBarLabel() {
    return document.getElementById("progress-bar-label");
}

/* Return the results side bar */
function getResultsBar() {
    return document.getElementById("results-bar");
}

/* Return the list of results */
function getResultsList() {
    return document.getElementById("results-list");
}

/* Return the bookmarks side bar */
function getBookmarksBar() {
    return document.getElementById("bookmarks-bar");
}

/* Return the list of bookmarks */
function getBookmarksList() {
    return document.getElementById("bookmarks-list");
}

/* Return Notes text box */
function getNotesBox() {
    return document.getElementById("notesTextBox");
}

/* Return Bookmarks Sets menulist */
function GetBookmarksSetsList() {
    return document.getElementById('bookmarks-sets-list');
}

/* Return Bookmarks Sets menupopup */
function getBookmarksSetsPopup() {
    return document.getElementById('bookmarks-sets');
}

/* Save window geometry */
function saveWindowGeometry(width, height, x, y, windowState) {
    var maximized = (windowState == 1);
    settings.windowMaximized(maximized);
    if (maximized)
        return;
    settings.windowWidth(width);
    settings.windowHeight(height);
    settings.windowX(x);
    settings.windowY(y);
}

/* Compute position and size of the window */
function configureWindowGeometry(window) {
    var width = settings.windowWidth() || screen.width / 100 * 80;
    var height = settings.windowHeight() || screen.height / 100 * 80;
    var x = (settings.windowX() != undefined) ? settings.windowX() : (screen.width - width) / 2;
    var y = (settings.windowY() != undefined) ? settings.windowY() : (screen.height - height) / 2;

    window.resizeTo(width, height);
    window.moveTo(x, y);
    if (settings.windowMaximized()) {
        setTimeout('window.maximize();', 1);
    }
}

/* Activate Search GUI elements */
function activateGuiSearchComponents() {
    getSearchLabel().collapsed = true;
    getSearchBox().disabled = false;
    activateResultsButton();
}

/* Desactivate Search GUI elements */
function desactivateGuiSearchComponents() {
    getSearchLabel().collapsed = false;
    getSearchBox().disabled = true;
    changeResultsBarVisibilityStatus(false);
    desactivateResultsButton();
}

/* Activate home button */
function activateHomeButton() {
    getHomeButton().disabled = false; 
    getHomeButton().className = "";  
}

/* Desactivate home button */
function desactivateHomeButton() {
    getHomeButton().disabled = true;
    getHomeButton().className = "disabled";
}

/* Activate results button */
function activateResultsButton() {
    getResultsButton().disabled = false;
    getResultsButton().className = "";
}

/* Desactivate results button */
function desactivateResultsButton() {
    getResultsButton().disabled = true;
    getResultsButton().className = "disabled";
}

/* Activate back button */
function activateBackButton() {
    getBackButton().disabled = false;
    getBackButton().className = "";
}

/* Desactivate back button */
function desactivateBackButton() {
    getBackButton().disabled = true;
    getBackButton().className = "disabled";
}

/* Activate next button */
function activateNextButton() {
    getNextButton().disabled = false;
    getNextButton().className = "";
}

/* Desactivate next button */
function desactivateNextButton() {
    getNextButton().disabled = true;
    getNextButton().className = "disabled";
}

/* Get the focus on the search textbox */
function focusOnSearchBox() {
    var searchBox = getSearchBox();
    if (searchBox.disabled == false) {
	searchBox.focus();
    } else {
	manageIndexZimFile();
    }
}

/* Change result side bar visibility status */
function changeResultsBarVisibilityStatus(visible) {

    if (visible == undefined) {
	visible = document.getElementById('results-bar').collapsed;
    }
    
    // hide bookmarks if visible
    if (visible && !getBookmarksBar().hidden) {
        UIToggleBookmarksBar();
    }

    var resultsBar = document.getElementById('results-bar');
    if (visible) {
	if (!document.getElementById('results-splitter')) {
	    var splitter = document.createElement('splitter');
	    splitter.setAttribute('id', 'results-splitter');
	    resultsBar.parentNode.insertBefore(splitter, resultsBar.nextSibling);
	}
	resultsBar.collapsed = false;
	getResultsButton().setAttribute('checked', true);
    } else {
	var splitter = document.getElementById('results-splitter');
	if (splitter != null) {
	    splitter.parentNode.removeChild(splitter);
	}
	document.getElementById('results-bar').collapsed = true;
	getResultsButton().setAttribute('checked', false);
    }

    document.getElementById('display-resultsbar').setAttribute('checked', visible);
}


/* Return true if the URL is internal */
function isInternalUrl(url) {
    if (url.href.indexOf("zim://", 0)==0 || url.href.indexOf("javascript:", 0)==0) {
	return true;
    } else {
	return false;
    }
}

/* Allowing to navigate through the results list with the mouse wheel */
function resultsListMouseScroll(aEvent) {
    var resultsList = getResultsList();

    if (resultsList.currentIndex >= 0) {
	var newIndex = resultsList.currentIndex;
	if (aEvent.detail > 0 && newIndex > 0) {
	    newIndex++;
	} else if (aEvent.detail < 0 && newIndex < (resultsList.itemCount-1)) { 
	    newIndex--;
	}
	resultsList.selectItem(resultsList.getItemAtIndex(newIndex));
	resultsList.scrollToIndex(newIndex);
    }
}

/* Allowing zoom/history function by combining mouse & ctrl */
function htmlRendererMouseScroll(aEvent) {
    
    /* Deal with the left/right click*/
    if (aEvent.detail == -1 || aEvent.detail>0) {
	pageBack();
	aEvent.preventDefault();
	aEvent.stopPropagation();
    } else if (aEvent.detail == 1 || aEvent.detail<0) {
	pageNext();
	aEvent.preventDefault();
	aEvent.stopPropagation();
    }

    /* Deal with the roll + ctrl */
    if (aEvent.ctrlKey) {
	if (aEvent.detail>0) { zoomOut() } ;
	if (aEvent.detail<0) { zoomIn() } ;
	aEvent.preventDefault();
	aEvent.stopPropagation();
    }

    /* Deal with the roll + shift*/
    if (aEvent.shiftKey) {
	if (aEvent.detail>0) { pageNext() } ;
	if (aEvent.detail<0) { pageBack() } ;
	aEvent.preventDefault();
	aEvent.stopPropagation();
    }
}

/* Update the status bar if mouse is over a link */
function htmlRendererMouseOver(aEvent) {
    var url = aEvent.target;

    if (url instanceof HTMLSpanElement && 
	url.parentNode instanceof HTMLAnchorElement) {
        url = url.parentNode;
    }

    if (url instanceof HTMLAnchorElement) {
	/* To be sure that nothing else is already displayed */
	clearStatusBar();

	document.getElementById("address-bar").value = decodeUrl(url.href.replace(":///", "://"));
	
	if (isInternalUrl(url)) {
	    document.getElementById('book-icon').collapsed = false;
	} else {
	    document.getElementById('earth-icon').collapsed = false;
	}
    }
}

/* Update the status bar if mouse is out of a link */
function htmlRendererMouseOut(aEvent) {
    var url = aEvent.target;

    if (url instanceof HTMLAnchorElement) {
	clearStatusBar();
    }
}

/* Double Click event handler */
function htmlRendererMouseUp(aEvent) {
    var url = aEvent.target;

    if (url instanceof HTMLAnchorElement && aEvent.button == 1) {
	if (url.href.indexOf("zim://",0) != 0) {
	    htmlRendererOpenUrl(aEvent);
	} else {
	    changeTabsVisibilityStatus(true);
	    openNewTab();
	    htmlRendererOpenUrl(aEvent);
	}
    }
}

/* Is called every time an (external|internal) url is clicked */
function htmlRendererOpenUrl(aEvent) {
    var url = aEvent.target;

    if (url instanceof HTMLAnchorElement) {
	clearStatusBar();
    }

    /* Return in case of javascript */
    if (url.href.indexOf("javascript:",0) == 0) {
	return;
    }

    /* Open with extern browser if not an internal link */
    if (url.href.indexOf("zim://",0) != 0) {
	openUrlWithExternalBrowser(url.href);
	aEvent.preventDefault();
	aEvent.stopPropagation();
	
	/* Purge the history of the last entry */
	getHtmlRenderer().sessionHistory.PurgeHistory(1);
    } else { /* If the a ZIM url */
	if (loadContent(url.href)) {
	    activateBackButton();
	}
    }


    return;
}

/* Clear the status bar */
function clearStatusBar() {
    document.getElementById("address-bar").value = "";
    document.getElementById('earth-icon').collapsed = true;
    document.getElementById('book-icon').collapsed = true;
}

/* Zoom normal */
function zoomOriginal() {
    getHtmlRenderer().markupDocumentViewer.textZoom = 1;
}

/* Zoom in (bigger font) */
function zoomIn() {
    getHtmlRenderer().markupDocumentViewer.textZoom *= _zoomFactor;
}

/* Zoom out (smaller font) */
function zoomOut() {
    getHtmlRenderer().markupDocumentViewer.textZoom /= _zoomFactor;
}

/*
 * Enable/Disable fullscreen mode. Acts as window maximizer on mac.
 */
function UIToggleFullScreen (save) {
	_winIsFullScreen = !_winIsFullScreen;
	
	// Update window state (1s delay for startup)
	setTimeout('window.fullScreen = '+ _winIsFullScreen +';', 1); 
	
	// save preference for restore on restart
	if (save) {
	    settings.displayFullScreen(_winIsFullScreen);
	}
    
    // UI Updates
    try {
        d = document.getElementById('button-fullscreen');
        d.className = (_winIsFullScreen) ? 'fullscreen' : 'normal';
    } catch (e) {}
    try {
        d = document.getElementById('display-fullscreen');
        d.className = (_winIsFullScreen) ? 'menuitem-iconic fullscreen' : 'menuitem-iconic normal';
    } catch (e) {}
    
}

/*
 * Display/Hide the Bookmarks&Notes sidebar.
 */
function UIToggleBookmarksBar () {
    var bar = getBookmarksBar();
    if (bar.hidden) {
	WarnOnSideBar ();
	changeResultsBarVisibilityStatus(false);
    }

    bar.hidden  = !bar.hidden;
    settings.displayBookmarksBar(!bar.hidden);
    getBookmarksButton().setAttribute('checked', !bar.hidden);
}

/* Make the status bar (in)visible */
function changeStatusBarVisibilityStatus(visible, save) {
    if (visible == undefined) {
	visible = document.getElementById('display-statusbar').getAttribute('checked');
    } else {
	document.getElementById('display-statusbar').setAttribute('checked', visible);
    }

    if (visible) {
	document.getElementById('status-bar').collapsed = false;
    } else {
	document.getElementById('status-bar').collapsed = true;
    }

    if (save) {
	settings.displayStatusBar(visible);
    }
}

/* Make the progress bar (in)visible */
function changeProgressBarVisibilityStatus(visible) {
    if (visible == undefined) {
	visible = !getProgressBar().collapsed;
    }

    if (visible) {
        getProgressBar().collapsed = false;
        getProgressBarLabel().collapsed = false;
    } else {
	getProgressBar().collapsed = true;
        getProgressBarLabel().collapsed = true;
    }
    return;
}

/* Set the binary name of the external browser */
function setExternalBrowser() {
    var prefs = Components.classes["@mozilla.org/preferences-service;1"].
	getService().QueryInterface(Components.interfaces.nsIPrefBranch);
    var name = prefs.getCharPref("network.protocol-handler.app.http" );
    var newname = prompt('Enter the path to your external browser',name);
    if (newname != null) 
	prefs.setCharPref("network.protocol-handler.app.http", newname );
}

/* Copy in memory the currently selected content */
function copySelectedContent() {
    getHtmlRenderer().contentViewerEdit.copySelection();
}

/* Select all content of the page */
function selectAll() {
    getHtmlRenderer().contentViewerEdit.selectAll();
}

function updateHistoryNavigationButtons() {
    var htmlRenderer = getHtmlRenderer();

    if (htmlRenderer.canGoBack == true) {
	activateBackButton();
    } else {
	desactivateBackButton();
    }

    if (htmlRenderer.canGoForward == true) {
	activateNextButton();
    } else {
	desactivateNextButton();
    }
}

/* Back to the previous rendered page */
function pageBack() {
    try {
	var htmlRenderer = getHtmlRenderer();

	if (htmlRenderer.canGoBack == true) {
	    htmlRenderer.stop();
	    htmlRenderer.goBack();

	    /* activate if necessary the back button */
	    activateNextButton();

	    /* desactivate if necessary the next button */
	    if (htmlRenderer.canGoBack == false) {
		desactivateBackButton();
	    }
	}
    } catch (exception) {
	displayErrorDialog(exception);
	return false;
    }
    return true;
}

/* Next to the next rendered page */
function pageNext() {
    try { 
	var htmlRenderer = getHtmlRenderer();
	if (htmlRenderer.canGoForward == true) {
	    htmlRenderer.stop();
	    htmlRenderer.goForward();
	    
	    /* activate if necessary the back button */
	    activateBackButton();
	    
	    /* desactivate if necessary the next button */
	    if (htmlRenderer.canGoForward == false) {
		desactivateNextButton();
	    }
	}
    } catch (exception) {
	displayErrorDialog(exception);
	return false;
    }
    return true;
}

/* Try to open a ZIM file */
function openFile(path, noSearchIndexCheck) {

    /* Display file picker if no given file path */
    if (!path) {

	/* Create the file picker object */
	var nsIFilePicker = Components.interfaces.nsIFilePicker;
	var filePicker = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
	filePicker.init(window, "Select a File", nsIFilePicker.modeOpen);
	
	/* Add filters */
	filePicker.appendFilter("ZIM files","*.zim");
	
	/* Set the default path */
	var defaultFilePickerPath = settings.defaultFilePickerPath();
	if (defaultFilePickerPath != undefined && defaultFilePickerPath != "") {
	    var defaultFilePickerPathFile = Components.classes["@mozilla.org/file/local;1"]
		.createInstance(Components.interfaces.nsILocalFile);
	    defaultFilePickerPathFile.initWithPath(defaultFilePickerPath);
	    if (defaultFilePickerPathFile.exists() == true) {
		filePicker.displayDirectory = defaultFilePickerPathFile;
	    }
	}

	/* Show the dialog and get the file path */
	var res = filePicker.show();
	
	/* Get the file path */
	if (res == nsIFilePicker.returnOK) {
	    path = filePicker.file.path;
	    settings.defaultFilePickerPath(filePicker.file.parent.path);
	} else {
	    return false;
	}
    }

    /* Try to open the ZIM file */
    var zimAccessor = openZimFile(path);

    if (zimAccessor) {
	/* Get the MD5 id */
	var zimId = new Object();
	zimAccessor.getId(zimId);
	zimId = zimId.value;

	/* Add the file to the library if necessary */
	var book = library.getBookById(zimId);
	if (!book) {
	    book = library.addBook(zimId, path);
	}

/* Set the file as current */
	library.setCurrentId(zimId);
	
	/* Load the welcome page of the ZIM file */
	goHome();

	/* Activate the Home button and desactivate the next/back buttons */
	activateHomeButton();
	desactivateBackButton();
	desactivateNextButton();
	
	/* Purge the history */
	if (getHtmlRenderer().sessionHistory.count > 0) {
	    getHtmlRenderer().sessionHistory.PurgeHistory(getHtmlRenderer().sessionHistory.count);
	}

	/* Clear the results bar */
	emptyResultsList();

	/* Update the last open menu */
	populateLastOpenMenu();

	/* Ask to index if this files has not already an index */
	if (!noSearchIndexCheck && !checkSearchIndex()) {
	    desactivateGuiSearchComponents();
	    manageIndexZimFile();
	}

	/* update the gui */
	updateGuiSearchComponents();
	
    } else {
	displayErrorDialog(getProperty("loadZimFileError", path));
	return false;
    }

    return true;
}

/* Got the welcome page of the current zim file */
function goHome() {
    var homeUrl = getCurrentZimFileHomePageUrl();
    var htmlRenderer = getHtmlRenderer();

    if (homeUrl) {
	loadContent(homeUrl);
	
	/* activate if necessary the back button */
	if (htmlRenderer.sessionHistory.count > 1) {
	    activateBackButton();
	} else {
	    if (htmlRenderer.sessionHistory.count > 0) {
		htmlRenderer.sessionHistory.PurgeHistory(htmlRenderer.sessionHistory.count);
	    }
	}
    } else {
	showHelp();
    }
}

/* Manage the change of the locale with the GUI */
function manageChangeLocale(locale) {
    if (locale && settings.locale() != locale) {
	settings.locale(locale);
	restart();
    }
}

/* Empty the results list */
function emptyResultsList() {
    var resultsList = getResultsList();

    while (resultsList.hasChildNodes()) {
	resultsList.removeChild( resultsList.lastChild );
    }
}

/* Add a list item to the results list */
function addResultToList(url, title, score) {
    
    /* Get the result list object */
    var resultsList = getResultsList();

    /* Create the scoreslide */
    var slideWidth = score;

    var scoreslide = document.createElement("hbox");
    scoreslide.setAttribute("flex", "0");

    var scoreslidef = document.createElement("box");
    scoreslidef.setAttribute("style", "cursor: pointer; -moz-border-radius: 7px; width: "+slideWidth+"px; background-color: #EEEEEE");
    scoreslide.appendChild(scoreslidef);
    
    /* Set label of the richlist item */
    var titre = document.createElement("label");
    titre.setAttribute("value", title);
    titre.setAttribute("tooltiptext", title + " - " + score + "%");
    titre.setAttribute("flex", "0");
    titre.setAttribute("crop", "end");
    titre.setAttribute("style", "cursor: pointer;");

    /* Create the stack */
    var titrescore = document.createElement("stack");
    titrescore.setAttribute("flex", "0");
    
    /* Generates color problems, todo */
    //titrescore.appendChild(scoreslide);
    
    titrescore.appendChild(titre);

    /* Create a new richlist item */
    var li = document.createElement("richlistitem");
    li.setAttribute("url", url);
    li.setAttribute("flex", "0");
    li.setAttribute("style", "cursor: pointer; padding: 2px;");
    li.appendChild(titrescore);

    /* Add the item to the list */
    resultsList.appendChild(li);

    return true;
}

/* Display the about dialog box */
function showAbout() {
    var win = window.openDialog('about.xul','','resizable=no,scrollbars=no,modal,fullscreen=no,width=350,height=400,chrome=yes');
}

/* Display the help */
function showHelp() {
    if (settings.displayTabs() == true) {
	openNewTab();
    }

    loadContent("chrome://main/locale/help.html");
}

/* Display an error dialog box like alert() */
function displayErrorDialog(message, title) {
    var promptService = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
	.getService(Components.interfaces.nsIPromptService);

    /* Default title */
    if (title == undefined) {
	title = getProperty("error");
    }

    return promptService.alert(window, title, message);
}


/* Display a confirm dialog box like confirm() */
function displayConfirmDialog(message, title) {
    var promptService = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
	.getService(Components.interfaces.nsIPromptService);

    /* Default title */
    if (title == undefined) {
	title = getProperty("confirm");
    }

    return promptService.confirm(window, title, message);
}

/* Fill the languages-menu with all available languages */
function populateLanguagesMenu() {
    /* Get informations about locales */
    var selectedLocale = getCurrentLocale();
    var availableLocales =  getAvailableLocales();
    
    /* Render locale menu items */
    var languagesMenu = document.getElementById("menu-languages");
    
    /* Go through the locale list an update the GUI */
    while(availableLocales.hasMore()) {
	var locale = availableLocales.getNext();
	var label = _languagesHash[locale] == undefined ? locale : _languagesHash[locale];
	var menuItem = document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul", 
						"menuitem");

	menuItem.setAttribute("type", "radio");
	menuItem.setAttribute("value", locale);
	menuItem.setAttribute("label", label);
	menuItem.setAttribute("oncommand", "manageChangeLocale(this.value)");
	
	/* If this the current locale, check and apply it. */
	if (locale == selectedLocale) {
	    menuItem.setAttribute('checked', true);
	}
	
	languagesMenu.appendChild(menuItem);
    }
}

/* Return the current used locale code */
function getCurrentLocale() {
    var chromeRegisteryService = Components.classes["@mozilla.org/chrome/chrome-registry;1"].getService();
    var xulChromeRegistery = chromeRegisteryService.QueryInterface(Components.interfaces.nsIXULChromeRegistry);
    var toolkitChromeRegistery = chromeRegisteryService.QueryInterface(Components.interfaces.nsIToolkitChromeRegistry);
    return settings.locale() || xulChromeRegistery.getSelectedLocale("main");
}

/* Return the available locales */
function getAvailableLocales() {
    var chromeRegisteryService = Components.classes["@mozilla.org/chrome/chrome-registry;1"].getService();
    var xulChromeRegistery = chromeRegisteryService.QueryInterface(Components.interfaces.nsIXULChromeRegistry);
    var toolkitChromeRegistery = chromeRegisteryService.QueryInterface(Components.interfaces.nsIToolkitChromeRegistry);
    return toolkitChromeRegistery.getLocalesForPackage("main");
}

/* Fill the lastopen-menu with all available languages */
function populateLastOpenMenu() {
    /* Render locale menu items */
    var lastOpenMenuTop = document.getElementById("menu-lastopen-top");
    var lastOpenMenu = document.getElementById("menu-lastopen");

    /* Remove the child nodes */
    while (lastOpenMenu.firstChild) {
	lastOpenMenu.removeChild(lastOpenMenu.firstChild);
    };

    /* Get the number of books */
    var len = library.books.length >>> 0;

    /* Disable the menu if no book */
    if (len == 0) {
	lastOpenMenuTop.disabled = true;
    } else {/* Go through the book list an update the GUI */
	lastOpenMenuTop.disabled = false;

	for (var i=len-1 ; i>=0 ; i--) {
	    var book = library.books[i];
	    var label = book.path;
	    var menuItem = document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul", 
						    "menuitem");
	    
	    menuItem.setAttribute("label", label);
	    menuItem.setAttribute("oncommand", "if ('" + book.id + "' != library.getCurrentBook().id) { library.setCurrentId('" + book.id + "'); openCurrentBook(); } ");
	    lastOpenMenu.appendChild(menuItem);
	}
    }
}

/* Initialize the user interface */
function initUserInterface() {
    /* Set the size and position of the window */
    configureWindowGeometry(this);

    /* Populates localization languages to the menu-languages */
    populateLanguagesMenu();

    /* Populates the last open menu */
    populateLastOpenMenu();

    /* Apply GUI settings */
    if (settings.displayStatusBar() != undefined) { changeStatusBarVisibilityStatus(settings.displayStatusBar()); }
    if (settings.displayFullScreen() != undefined) { if (settings.displayFullScreen()) { UIToggleFullScreen(); } }
    if (settings.displayBookmarksBar() === true) { UIToggleBookmarksBar(); }
    if (settings.displayTabs() === true) { changeTabsVisibilityStatus(settings.displayTabs()); }

    /* Activate (or not) the Home button */
    if (getCurrentZimFileHomePageUrl()) {
	activateHomeButton();
    } else {
	desactivateHomeButton();
    }

    /* Update the search bar */
    updateGuiSearchComponents();

    /* Desactivate back/next buttons */
    desactivateBackButton();
    desactivateNextButton();
}

function updateGuiSearchComponents() {
    if (checkSearchIndex()) {
	activateGuiSearchComponents();
    } else {
	desactivateGuiSearchComponents();
    }
}

/* Drop file on windows to open it */
function dropOnWindows (aEvent) {
    var dragService = Components.classes["@mozilla.org/widget/dragservice;1"].getService(Components.interfaces.nsIDragService);
    var dragSession = dragService.getCurrentSession();
    
    /* If sourceNode is not null, then the drop was from inside the application */
    if (dragSession.sourceNode)
	return;
    
    /* Setup a transfer item to retrieve the file data */
    var trans = Components.classes["@mozilla.org/widget/transferable;1"].createInstance(Components.interfaces.nsITransferable);
    trans.addDataFlavor("text/x-moz-url");
    trans.addDataFlavor("application/x-moz-file");
    
    for (var i=0; i<dragSession.numDropItems && i<2; i++) {
	dragSession.getData(trans, i);
	var flavor = {}, data = {}, length = {};
	trans.getAnyTransferData(flavor, data, length);
	if (data) {
	    try {
		var str = data.value.QueryInterface(Components.interfaces.nsISupportsString);

		if (str) {
		    var ios = Components.classes['@mozilla.org/network/io-service;1']
			.getService(Components.interfaces.nsIIOService);
		    var uri = ios.newURI(str.data.split("\n")[0], null, null);
		    var file = uri.QueryInterface(Components.interfaces.nsIFileURL).file;
		    openFile(file.path);
		} else {
		}
	    }
	    catch(e) {
	    }
	}
    }
}

/* Manage the handling of key combination */
function manageKeyCombination(aEvent) {
    if (aEvent.altKey) {
	if (aEvent.keyCode == 37) {
	    pageBack();
	} else if (aEvent.keyCode == 39) { 
	    pageNext();
	}
    }
}

/* Add mouse scroll listener to allow zoon in/out with the mouse for example */
function initHtmlRendererEventListeners() {
    getHtmlRenderer().addEventListener("DOMMouseScroll", htmlRendererMouseScroll, false);
    getHtmlRenderer().addEventListener("mouseover", htmlRendererMouseOver, true);
    getHtmlRenderer().addEventListener("mouseout", htmlRendererMouseOut, true);
    getHtmlRenderer().addEventListener("mouseup", htmlRendererMouseUp, true);
    getHtmlRenderer().addEventListener("keypress", manageKeyCombination, true);
    getHtmlRenderer().addEventListener("DOMActivate", htmlRendererOpenUrl, true);
    getHtmlRenderer().addEventListener("pageshow", updateTabHeader, true);
    getHtmlRenderer().addEventListener("pageshow", updateHistoryNavigationButtons, true);

    /* Necessary to update the tab header */
    getHtmlRenderer().addEventListener("load", updateTabHeader, true);
}

/* Create the necessary listeners */
function initEventListeners() {
    initHtmlRendererEventListeners();
   
    /* Add mouse scroll listener to the results bar */
    getResultsList().addEventListener("DOMMouseScroll", resultsListMouseScroll, false);

    /* register WebProgress listener */
    var dls = Components.classes["@mozilla.org/docloaderservice;1"]
	.getService(nsIWebProgress);
    dls.addProgressListener (UIBrowserProgressListener,
			     nsIWebProgress.NOTIFY_LOCATION |
			     nsIWebProgress.NOTIFY_STATE_DOCUMENT);
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

/* Print the page in a PDF file */
function printPdf() {
    var path;

    /* Prepare the file picker */
    var nsIFilePicker = Components.interfaces.nsIFilePicker;
    var filePicker = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
    filePicker.init(window, "Save page as PDF", nsIFilePicker.modeSave);
    filePicker.appendFilter("PDF", "*.pdf");
    filePicker.defaultExtension = "pdf";
    filePicker.defaultString = content.document.title.replace(RegExp("( )", "g"), "_") + ".pdf";
    
    /* Show the dialog and get the file path */
    var res = filePicker.show();
    
    /* Get the file path */
    if (res == nsIFilePicker.returnOK) {
	path = filePicker.file.path;
    } else {
	return false;
    }

    /* Prepare the PDF printer */
    var webBrowserPrint = window.content.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
	.getInterface(Components.interfaces.nsIWebBrowserPrint);
    var printer = Components.classes["@mozilla.org/gfx/printsettings-service;1"]
	.getService(Components.interfaces.nsIPrintSettingsService);

    var printSettings = printer.newPrintSettings;
    printSettings.printToFile = true;
    printSettings.toFileName = path;
    printSettings.printSilent = true;
    printSettings.outputFormat = Components.interfaces.nsIPrintSettings.kOutputFormatPDF;

    /* Write the PDF */
    webBrowserPrint.print(printSettings, null);
}