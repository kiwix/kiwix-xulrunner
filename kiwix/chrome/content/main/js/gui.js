/* Global variables */
var _zoomFactor             = 1.2;      /* Factor by which font is magnified or reduced with zoomIn() & zommOut() */
var _winIsFullScreen        = false;    /* Stores fullscreen state*/
var _platform		    = GuessOS ();
var _applicationFD          = GetApplicationFolder ();
var _runMode		    = GetRunMode ();
var _firstRun		    = GetFirstRun ();
var _cleanOnClose	    = GetCleanOnClose ();
var _firstSideBar	    = true;

var _languagesHash           = Array();
_languagesHash['fr-FR']      = "Français";
_languagesHash['de-DE']      = "Deutsch";
_languagesHash['en-US']      = "English";
_languagesHash['zh']         = "中文";
_languagesHash['es-ES']      = "Español";
_languagesHash['it-IT']      = "Italiano";
_languagesHash['ar']         = "العربية";
_languagesHash['fa']         = "فارسی";
_languagesHash['he-IL']      = "עברית";
_languagesHash['pt-PT']      = "Português";

/* Return the window object */
function getWindow() {
    return document.getElementById("main");
}

/* Return the HTML rendering object */
function getHtmlRenderer() {
    return document.getElementById("html-renderer");  
}

/* Load an url in the HTML rendere */
function loadContent(url) {
    return getHtmlRenderer().loadURI(url, null, null);
}

/* Return the Search input box object */
function getSearchBox() {
    return document.getElementById("textbox-search");
}

/* Return the Search button object */
function getSearchButton() {
    return document.getElementById("button-search");
}

/* Return the Home button object */
function getHomeButton() {
    return document.getElementById("button-home");
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
    getSearchButton().disabled = false;
    getSearchButton().className = "";
}

/* Desactivate Search GUI elements */
function desactivateGuiSearchComponents() {
    getSearchLabel().collapsed = false;
    getSearchBox().disabled = true;
    getSearchButton().disabled = true;
    getSearchButton().className = "disabled";
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

/* Change result side bar visibility status */
function changeResultsBarVisibilityStatus(visible) {

    if (visible == undefined) {
	visible = !settings.displayResultsBar();
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
    } else {
	var splitter = document.getElementById('results-splitter');
	if (splitter != null) {
	    splitter.parentNode.removeChild(splitter);
	}
	document.getElementById('results-bar').collapsed = true;
    }

    document.getElementById('display-resultsbar').setAttribute('checked', visible);
    settings.displayResultsBar(visible);
}

/* Allowing zoom function by combining mouse & ctrl */
function mouseScroll(aEvent) {
    if (aEvent.ctrlKey) {
	if (aEvent.detail>0) { zoomOut() } ;
	if (aEvent.detail<0) { zoomIn() } ;
	aEvent.preventDefault();
	aEvent.stopPropagation();
    }
}

/* Return true if the URL is internal */
function isInternalUrl(url) {
    if (url.href.indexOf("zim://", 0)==0 || url.href.indexOf("javascript:", 0)==0) {
	return true;
    } else {
	return false;
    }
}

/* Update the status bar if mouse is over a link */
function mouseOver(aEvent) {
    var url = aEvent.target;

    if (url instanceof HTMLSpanElement && 
	url.parentNode instanceof HTMLAnchorElement) {
        url = url.parentNode;
    }

    if (url instanceof HTMLAnchorElement) {
	/* To be sure that nothing else is already displayed */
	clearStatusBar();

	document.getElementById("address-bar").value = url.href.replace(":///", "://");
	
	if (isInternalUrl(url)) {
	    document.getElementById('book-icon').collapsed = false;
	} else {
	    document.getElementById('earth-icon').collapsed = false;
	}
    }
}

/* Update the status bar if mouse is out of a link */
function mouseOut(aEvent) {
    var url = aEvent.target;

    if (url instanceof HTMLAnchorElement) {
	clearStatusBar();
    }
}

/* Is called every time an (external|internal) url is clicked */
function openUrl(aEvent) {
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
	openUrlWithExternalBrowser(url);
	aEvent.preventDefault();
	aEvent.stopPropagation();
	
	/* Purge the history of the last entry */
	getHtmlRenderer().sessionHistory.PurgeHistory(1);
    } else {
	activateBackButton();
    }
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

/* Back to the previous rendered page */
function pageBack() {
    try {
	var htmlRenderer = getHtmlRenderer();
	htmlRenderer.stop();
	htmlRenderer.goBack();
	
	/* activate if necessary the next button */
	activateNextButton();

	/* desactivate if necessary the back button */
	if (htmlRenderer.sessionHistory.index <= 1) {
	    desactivateBackButton();
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
	htmlRenderer.stop();
	htmlRenderer.goForward();

	/* activate if necessary the back button */
	activateBackButton();

	/* desactivate if necessary the next button */
	if (htmlRenderer.sessionHistory.index >= (htmlRenderer.sessionHistory.count-2)) {
	    desactivateNextButton();
	}
    } catch (exception) {
	displayErrorDialog(exception);
	return false;
    }
    return true;
}

/* Open and add ZIM file to the manager */
function manageNewZimFile() {
    /* Create the file picker object */
    var nsIFilePicker = Components.interfaces.nsIFilePicker;
    var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
    fp.init(window, "Select a File", nsIFilePicker.modeOpen);

    /* Add filters */
    fp.appendFilter("ZIM files","*.zim");

    /* Show the dialog and get the file path */
    var res = fp.show();

    /* Get the file path */
    if (res == nsIFilePicker.returnOK) {

	/* Try to open the ZIM file */
	var zimAccessor = loadZimFile(fp.file.path);
	if (zimAccessor != undefined) {
	    var zimFilePath = fp.file.path;
	    settings.zimFilePath(zimFilePath);

	    /* Clear the results bar */
	    emptyResultsList();

	    /* Ask to index if this files has not already an index */
	    if (!existsSearchIndex(zimFilePath)) {
		desactivateGuiSearchComponents();
		manageIndexZimFile();
		changeResultsBarVisibilityStatus(false);
	    } else {
		activateGuiSearchComponents();
	    }

	    /* Load the ZIM file welcome page */
	    goHome();

	    /* Activate the Home button and desactivate the next/back buttons */
	    activateHomeButton();
	    desactivateBackButton();
	    desactivateNextButton();

	    /* Purge the history */
	    getHtmlRenderer().sessionHistory.PurgeHistory(getHtmlRenderer().sessionHistory.count);
	}
    } else {
	return false;
    }

    return true;
}

/* Manage the change of the locale with the GUI */
function manageChangeLocale(locale) {
    if ((settings.locale() != locale) && 
	!(settings.locale() == undefined && locale == "en-US")) {
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
    /* Query available and selected locales */
    var chromeRegisteryService = Components.classes["@mozilla.org/chrome/chrome-registry;1"].getService();
    var xulChromeRegistery = chromeRegisteryService.QueryInterface(Components.interfaces.nsIXULChromeRegistry);
    var toolkitChromeRegistery = chromeRegisteryService.QueryInterface(Components.interfaces.nsIToolkitChromeRegistry);
    
    /* Get informations about locales */
    var selectedLocale = settings.locale() || xulChromeRegistery.getSelectedLocale("main");
    var availableLocales = toolkitChromeRegistery.getLocalesForPackage("main");
    
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
