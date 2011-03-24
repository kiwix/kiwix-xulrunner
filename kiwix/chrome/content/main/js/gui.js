
/* Global variables */
var _zoomFactor             = 1.2;      /* Factor by which font is magnified or reduced with zoomIn() & zommOut() */
var _winIsFullScreen        = false;    /* Stores fullscreen state*/
var _showFullScreenToolBar  = false;
var _fullScreenStatusBar    = true;
var _applicationFD          = GetApplicationFolder ();
var _firstSideBar	    = true;

var _languagesHash          = Array();
_languagesHash['fr-FR']     = "Français";
_languagesHash['de-DE']     = "Deutsch";
_languagesHash['en-US']     = "English";
_languagesHash['zh']        = "中文";
_languagesHash['es-ES']     = "Español";
_languagesHash['it-IT']     = "Italiano";
_languagesHash['ar']        = "العربية";
_languagesHash['fa']        = "فارسی";
_languagesHash['he-IL']     = "עברית";
_languagesHash['pt-PT']     = "Português";
_languagesHash['pl']        = "Język polski";
_languagesHash['ca']        = "Català";
_languagesHash['nl']        = "Nederlands";
_languagesHash['ml']        = "മലയാളം";

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

function getCheckIntegrityMenuItem() {
    return document.getElementById("tools-checkIntegrity");
}

/* Return the Progress meter object */
function getProgressBar() {
    return document.getElementById("progress-bar");
}

/* Return the Progress meter label */
function getProgressBarLabel() {
    return document.getElementById("progress-bar-label");
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
}

/* Desactivate Search GUI elements */
function desactivateGuiSearchComponents() {
    getSearchLabel().collapsed = false;
    getSearchBox().disabled = true;
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

/* Return true if the URL is internal */
function isInternalUrl(url) {
	return (url.href.indexOf("zim://", 0)==0 || url.href.indexOf("javascript:", 0)==0 || 
		url.href.indexOf("chrome:", 0)==0 || url.href.indexOf("search://", 0)==0);
}

/* Allowing zoom/history function by combining mouse & ctrl */
function htmlRendererMouseScroll(aEvent) {
    /* Deal the with the scroll in case of alt is pressed */
    if (aEvent.altKey) {
	aEvent.preventDefault();
	aEvent.stopPropagation();
	return;
    }
    
    /* Deal with the left/right click*/
    if (aEvent.detail == -1) {
	pageBack();
	aEvent.preventDefault();
	aEvent.stopPropagation();
	return;
    } else if (aEvent.detail == 1) {
	pageNext();
	aEvent.preventDefault();
	aEvent.stopPropagation();
	return;
    }
    
    /* Deal with the roll + ctrl */
    if (aEvent.ctrlKey) {
	if (aEvent.detail>0) { zoomOut() } ;
	if (aEvent.detail<0) { zoomIn() } ;
	aEvent.preventDefault();
	aEvent.stopPropagation();
	return;
    }

    /* Deal with the roll + shift*/
    if (aEvent.shiftKey) {
	if (aEvent.detail<0) { pageNext() } ;
	if (aEvent.detail>0) { pageBack() } ;
	aEvent.preventDefault();
	aEvent.stopPropagation();
	return;
    }
}

/* Update the status bar if mouse is over a link */
function htmlRendererMouseOver(aEvent) {
    var url = aEvent.target;
    //    if (url.href.indexOf("http://search/", 0) == 0)
    //	return;
    
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

    while (url.parentNode != undefined &&  !(url instanceof HTMLAnchorElement)) {
        url = url.parentNode;
    }

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
    
    while (url.parentNode != undefined &&  !(url instanceof HTMLAnchorElement)) {
        url = url.parentNode;
    }

    if (url instanceof HTMLAnchorElement) {
	clearStatusBar();
    }

    /* Return in case of javascript */
    if (url.href.indexOf("javascript:",0) == 0) {
	return;
    }

    /* Open with extern browser if not an internal link */
    if (!isInternalUrl(url)) {
	if (url.href.indexOf("http://search/", 0) == 0) {
	    var elements = url.href.split('/');
	    manageSearchInIndex(elements[3], elements[4], elements[5]);
	    aEvent.preventDefault();
	    aEvent.stopPropagation();
	} else {
	    openUrlWithExternalBrowser(url.href);
	    aEvent.preventDefault();
	    aEvent.stopPropagation();

	    /* Purge the history of the last entry */
	    getHtmlRenderer().sessionHistory.PurgeHistory(1);
	}
    } else { /* If the a ZIM or chrome url */ 	 
	if (loadContent(url.href)) { 	 
	    activateBackButton(); 	 
	}
	aEvent.preventDefault();
	aEvent.stopPropagation();
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

/* Fullscreen mode functions */
function hideFullScreenToolBar() {
    if (!_showFullScreenToolBar) {
	document.getElementById('tool-bar').setAttribute("style", "display: none;");
    }
}

function showFullScreenToolBar() {
    document.getElementById('tool-bar').setAttribute("style", "display: visible;");
}

function hideFullScreenToolBox() {
    _showFullScreenToolBar = false;
    delay(hideFullScreenToolBar, 2000);
}

function showFullScreenToolBox() {
    _showFullScreenToolBar = true;
    showFullScreenToolBar();
}

/*
 * Enable/Disable fullscreen mode. Acts as window maximizer on mac.
 */
function UIToggleFullScreen (save) {
    var window = document.getElementById("main");
    var toolBox = document.getElementById('tool-box');

    /* Toggle */
    _winIsFullScreen = !_winIsFullScreen;
    
    /* Configuration changes */
    if (_winIsFullScreen) {
	toolBox.addEventListener("mouseover", showFullScreenToolBox, false);
	getHtmlRenderer().addEventListener("mouseover", hideFullScreenToolBox, false);
	toolBox.setAttribute("style", "height: 4px;");
	_fullScreenStatusBar = settings.displayStatusBar();
	changeStatusBarVisibilityStatus(false);
	document.getElementById('menu-bar').collapsed = true;
	hideFullScreenToolBox();
    } else {
	toolBox.removeEventListener("mouseover", showFullScreenToolBox, false);
	getHtmlRenderer().removeEventListener("mouseover", hideFullScreenToolBox, false);
	toolBox.setAttribute("style", "height: auto;");
	showFullScreenToolBox(_fullScreenStatusBar);
	changeStatusBarVisibilityStatus(_fullScreenStatusBar);
	document.getElementById('menu-bar').collapsed = false;
	showFullScreenToolBox();
    }

    // Update window state (1s delay for startup)
    setTimeout('window.fullScreen = '+ _winIsFullScreen +';', 1); 
    
    // save preference for restore on restart
    if (save) {
	settings.displayFullScreen(_winIsFullScreen);
    }
    
    // UI Updates
    try {
        var button = document.getElementById('button-fullscreen');
        button.className = (_winIsFullScreen) ? 'fullscreen' : 'normal';
    } catch (e) {}
    try {
        var button = document.getElementById('display-fullscreen');
        button.className = (_winIsFullScreen) ? 'menuitem-iconic fullscreen' : 'menuitem-iconic normal';
    } catch (e) {}
    
}

/*
 * Display/Hide the Bookmarks&Notes sidebar.
 */
function UIToggleBookmarksBar () {
    var bar = getBookmarksBar();
    if (bar.hidden) {
	WarnOnSideBar ();
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
function manageOpenFile(path, noSearchIndexCheck) {

    /* Display file picker if no given file path */
    if (!path) {

	/* Create the file picker object */
	var nsIFilePicker = Components.interfaces.nsIFilePicker;
	var filePicker = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
	filePicker.init(window, "Select a File", nsIFilePicker.modeOpen);
	
	/* Add filters */
	filePicker.appendFilter("ZIM files","*.zim; *.zimaa");
	
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
	    path = path.replace(".zimaa", ".zim");
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
	book.last = env.getUnixTime();

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

	/* Update the last open menu */
	populateLastOpenMenu();

	/* Ask to index if this files has not already an index */
	if (!noSearchIndexCheck && !checkSearchIndex()) {
	    desactivateGuiSearchComponents();
	    manageIndexZimFile();
	}

	/* update the gui */
	updateGuiSearchComponents();
	
	/* verify if we can check the integrity */
	getCheckIntegrityMenuItem().disabled = !canCheckIntegrity();

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
    if (locale && (settings.locale() != locale)) {
	settings.locale(locale);
	restart();
    }
}

/* Display the about dialog box */
function showAbout() {
    var win = window.openDialog('about.xul','','centerscreen,resizable=no,scrollbars=no,modal,dialog,width=350,height=380,chrome');
}

/* Display the help */
function showHelp() {
    if (settings.displayTabs()) 
	openNewTab();

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

/* Display an information dialog box like alert() */
function displayInfoDialog(message, title) {
    var promptService = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
	.getService(Components.interfaces.nsIPromptService);

    /* Default title */
    if (title == undefined) {
	title = getProperty("information");
    }

    return promptService.alert(window, title, message);
}

/* Download an url on the hard disk */
function downloadFile(url, path) {
  var ioService = Components.classes["@mozilla.org/network/io-service;1"]
                            .getService(Components.interfaces.nsIIOService);
  var s_uri = ioService.newURI(url, null, null);
  var t_uri = ioService.newURI(path, null, null);
  const nsIWBP = Components.interfaces.nsIWebBrowserPersist;
  var persist = Components.classes['@mozilla.org/embedding/browser/nsWebBrowserPersist;1']
                          .createInstance(Components.interfaces.nsIWebBrowserPersist);
  var flags = nsIWBP.PERSIST_FLAGS_NO_CONVERSION |
              nsIWBP.PERSIST_FLAGS_REPLACE_EXISTING_FILES |
              nsIWBP.PERSIST_FLAGS_BYPASS_CACHE;
  persist.persistFlags = flags;
  persist.saveURI(s_uri, null, null, null, null, t_uri);
}

/* Manage the image download */
function manageImageDownload(url) {
    var path;

    /* Compute the extension */
    var extension = url.replace(RegExp(".*\.(.{3,4})"), "$1");

    /* Prepare the file picker */
    var nsIFilePicker = Components.interfaces.nsIFilePicker;
    var filePicker = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
    filePicker.init(window, "Save image", nsIFilePicker.modeSave);
    filePicker.appendFilters(filePicker.filterImages);

    /* Compute and set up the default filename */
    var defaultFilename = url.replace(RegExp("/I/", "i"), "");
    defaultFilename = defaultFilename.replace(RegExp("\/", "i"), "_");
    filePicker.defaultString = defaultFilename;

    /* Show the dialog and get the file path */
    var res = filePicker.show();
    
    /* Get the file path */
    if (res == nsIFilePicker.returnOK) {
	path = filePicker.file.path;
    } else {
	return false;
    }

    /* Write the image */
    downloadFile('zim://' + url, 'file://' + path);
}

/* Toogle browser contextual menu */
function toggleBrowserContextualMenu(event) {
    var target = event.target;
    
    if (target.localName == "img") {
	var browserContextualMenu = document.getElementById("browser-contextual-menu");
	var browserContextualMenuItem = document.getElementById("browser-contextual-menu-saveimageas");
	var imageUrl = target.getAttribute("src");
	browserContextualMenuItem.setAttribute("onclick", "manageImageDownload('" + imageUrl + "')");
	browserContextualMenu.openPopupAtScreen(event.screenX, event.screenY, true);
  }
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
	menuItem.setAttribute("type", "checkbox");
	menuItem.setAttribute("oncommand", "manageChangeLocale(this.getAttribute('value'));");
	
	/* If this the current locale, check and apply it. */
	if (locale == selectedLocale) {
	    menuItem.setAttribute('checked', true);
	}
	
	languagesMenu.appendChild(menuItem);
    }
}

/* Select the current skin */
function populateSkinsMenu() {
    var currentSkin = settings.skin();
    var skinMenu = document.getElementById("menu-skins");

    for (var i=0; i<skinMenu.children.length; i++) {
	var menuItem = skinMenu.children[i];
	if (menuItem.getAttribute("id") == "skin-" + currentSkin) {
	    menuItem.setAttribute('checked', true);
	}
    }
}

/* Return the current used locale code */
function getCurrentLocale() {
    var chromeRegisteryService = Components.classes["@mozilla.org/chrome/chrome-registry;1"].getService();
    var xulChromeRegistery = chromeRegisteryService.QueryInterface(Components.interfaces.nsIXULChromeRegistry);
    var toolkitChromeRegistery = chromeRegisteryService.QueryInterface(Components.interfaces.nsIToolkitChromeRegistry);
    var settingsLocale = settings.locale();
    var chromeLocale = xulChromeRegistery.getSelectedLocale("main");
    return (settingsLocale.match(/chrome/) ==  undefined ? settingsLocale : chromeLocale);
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
	/* Set a class on main window based on platform string */
	document.getElementById("main").className = env.platform.type;
	
    /* Set the size and position of the window */
    configureWindowGeometry(this);

    /* Populates localization languages to the menu-languages */
    populateLanguagesMenu();

    /* Same for the skins */
    populateSkinsMenu();

    /* Populates the last open menu */
    populateLastOpenMenu();

	/* Mac OSX specificities
	   disable Print as PDF menu */
	if (env.platform.type == "mac") {
		document.getElementById("file-print-pdf").setAttribute('disabled', 'true');
	}

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
		    manageOpenFile(file.path);
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

/* Allow to deal with mouse thumb buttons back/forward*/
function HandleAppCommandEvent(evt) {
    evt.stopPropagation();
    switch (evt.command) {
    case "Back":
	pageBack();
	break;
    case "Forward":
	pageNext();
	break;
    default:
	break;
    }
}

/* Add mouse scroll listener to allow zoon in/out with the mouse for example */
function initHtmlRendererEventListeners() {
    var htmlRenderer =  getHtmlRenderer();
    var htmlRendererId = htmlRenderer.id;
    var regexResults = htmlRendererId.match(/html-renderer-(.*)/);
    var id = regexResults[1];

    htmlRenderer.addEventListener("DOMMouseScroll", htmlRendererMouseScroll, false);
    htmlRenderer.addEventListener("mouseover", htmlRendererMouseOver, true);
    htmlRenderer.addEventListener("mouseout", htmlRendererMouseOut, true);
    htmlRenderer.addEventListener("mouseup", htmlRendererMouseUp, true);
    htmlRenderer.addEventListener("keypress", manageKeyCombination, true);
    htmlRenderer.addEventListener("DOMActivate", htmlRendererOpenUrl, true);
    htmlRenderer.addEventListener("pageshow", updateHistoryNavigationButtons, true);
    htmlRenderer.addEventListener("contextmenu", toggleBrowserContextualMenu, true);
    htmlRenderer.addEventListener("AppCommand", HandleAppCommandEvent, true);

    /* Necessary to update the tab header */
    htmlRenderer.addEventListener("pageshow", function(){ updateTabHeader(id) }, true);
    htmlRenderer.addEventListener("load", function(){ updateTabHeader(id) }, true);
}

/* Deal with the Escape key */
function handleEscape() {
    if (_winIsFullScreen) {
	UIToggleFullScreen(true);
    }
}

/* Create the necessary listeners */
function initEventListeners() {
    initHtmlRendererEventListeners();
   
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

    /* Compute and set up the default filename */
    var defaultFilename = content.document.title.replace(RegExp("( )", "g"), "_") + ".pdf";
    defaultFilename = defaultFilename.replace(RegExp("\/", "i"), "_");
    filePicker.defaultString = defaultFilename;
    
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

function selectSkin(name) {
    if (displayConfirmDialog(getProperty("changeSkinNeedRestart"))) {
	settings.skin(name);
	restart(true);
    }
}

function manageCheckIntegrity() {
    if (checkIntegrity()) {
	displayInfoDialog("The file integrity was succesfuly checked.");
    } else {
	displayErrorDialog("Your file is corrupted.");
    }
}
