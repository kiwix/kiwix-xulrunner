/*
 * Copyright 2011 Emmanuel Engelhart <kelson@kiwix.org>, Renaud Gaudin
 * <reg@kiwix.org>
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
var _zoomFactor             = 1.2;      /* Factor by which font is magnified or reduced with zoomIn() & zommOut() */
var _winIsFullScreen        = false;    /* Stores fullscreen state*/
var _showFullScreenToolBar  = false;
var _fullScreenStatusBar    = true;
var _restore_tab            = null;
var _firstSideBar	    = true;

/* WebProgress listener */
const STATE_START =  Components.interfaces.nsIWebProgressListener.STATE_START;
const STATE_STOP =  Components.interfaces.nsIWebProgressListener.STATE_STOP;
const NOTIFY_STATE_DOCUMENT   = Components.interfaces.nsIWebProgress.NOTIFY_STATE_DOCUMENT;
var articleLoadingListener = {
    QueryInterface: function(aIID){
	if (aIID.equals(Components.interfaces.nsIWebProgressListener) ||
	    aIID.equals(Components.interfaces.nsISupportsWeakReference) ||
	    aIID.equals(Components.interfaces.nsISupports))
            return this;
	throw Components.results.NS_NOINTERFACE;
    },

    onStateChange: function(aProgress, aRequest, aFlag, aStatus){
	if(aFlag & STATE_START){
	    window.setCursor('wait'); 
	}
	if(aFlag & STATE_STOP){
	    window.setCursor('auto');
	}
	return 0;
    },

    onLocationChange: function() {return 0;},
    onProgressChange: function() { return 0;},
    onStatusChange: function() {return 0;},
    onSecurityChange: function() {return 0;},
    onLinkIconAvailable: function() {return 0;}
};

/* Return the window object */
function getWindow() {
    return document.getElementById("main");
}

/* Load an url in the HTML render element */
function loadContent(url, id, scrollY) {
    try {
	getHtmlRenderer(id).loadURI(url, null, null);
	if (scrollY)
	    getHtmlRenderer(id).setAttribute("initScrollY", scrollY);
    } catch(e) {
	displayErrorDialog(getProperty("loadArticleError"));
	return false;
    }

    // SUGAR: change status of Mark button
    checkIfDocumentIsMarked(url);
    return true;
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

/* Activate search components only if a book is open */
function updateGuiSearchComponents() {
    if (isBookOpen()) {
	activateGuiSearchComponents();
    } else {
	desactivateGuiSearchComponents();
    }
}

/* Return DOM Element */
function getTabHeaders() { return document.getElementById("tab-headers"); }
function getSearchBox() { return document.getElementById("textbox-search"); }
function getHomeButton() { return document.getElementById("button-home"); }
function getBookmarksButton() { return document.getElementById("button-bookmarks"); }
function getFindButton() { return document.getElementById("button-search-article"); }
function getFullscreenButton() { return document.getElementById("button-fullscreen"); }
function getPrintButton() { return document.getElementById("button-print"); }
function getBookmarksButton() { return document.getElementById("button-bookmarks"); }
function getSearchInPlaceButton() { return document.getElementById("button-search-article"); }
function getBackButton() { return document.getElementById("button-back"); }
function getSizeUpButton() { return document.getElementById("button-sizeup"); }
function getSizeDownButton() { return document.getElementById("button-sizedown"); }
function getLibraryButton() { return document.getElementById("button-library"); }
function getFindBar() { return document.getElementById("find-bar"); }
function getNextButton() { return document.getElementById("button-next"); }
function getSearchLabel() { return document.getElementById("search-label"); }
function getCheckIntegrityMenuItem() { return document.getElementById("tools-checkIntegrity"); }
function getLoadRandomArticleMenuItem() { return document.getElementById("tools-randomArticle"); }
function getProgressBar() { return document.getElementById("progress-bar"); }
function getProgressBarLabel() { return document.getElementById("progress-bar-label"); }
function getBookmarksBar() { return document.getElementById("bookmarks-bar"); }
function getBookmarksList() { return document.getElementById("bookmarks-list"); }
function getNotesBox() { return document.getElementById("notesTextBox"); }
function GetBookmarksSetsList() { return document.getElementById('bookmarks-sets-list'); }
function getBookmarksSetsPopup() { return document.getElementById('bookmarks-sets'); }

/* Des/Activate a button */
function activateToolbarButton(button) {
    button.disabled = false; 
    button.className = "";  
}

function desactivateToolbarButton(button) {
    button.disabled = true; 
    button.className = "disabled";  
}

/* Des/Activate Specific buttons */
function activateHomeButton() { activateToolbarButton(getHomeButton()); }
function desactivateHomeButton() { desactivateToolbarButton(getHomeButton()); }
function activateFullscreenButton() { activateToolbarButton(getFullscreenButton()); }
function desactivateFullscreenButton() { desactivateToolbarButton(getFullscreenButton()); }
function activateBackButton() { activateToolbarButton(getBackButton()); }
function desactivateBackButton() { desactivateToolbarButton(getBackButton()); }
function activateNextButton() { activateToolbarButton(getNextButton()); }
function desactivateNextButton() { desactivateToolbarButton(getNextButton()); }

/* Des/Activate Zoom buttons */
function activateZoomButtons() {
    activateToolbarButton(getSizeUpButton());
    activateToolbarButton(getSizeDownButton());
}

function desactivateZoomButtons() {
    desactivateToolbarButton(getSizeUpButton());
    desactivateToolbarButton(getSizeDownButton());
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
    var width = settings.windowWidth() || screen.width / 100 * 90;
    var height = settings.windowHeight() || screen.height / 100 * 90;
    var x = (settings.windowX() != undefined) ? settings.windowX() : (screen.width - width) / 2;
    var y = (settings.windowY() != undefined) ? settings.windowY() : (screen.height - height) / 2;

    window.resizeTo(width, height);
    window.moveTo(x, y);
    if (settings.windowMaximized()) {
        setTimeout('window.maximize();', 1);
    }
}

/* Search for a custom string */
function searchFor(text) {
    focusOnSearchBox();
    getSearchBox().value = text + " ";
    openNewTab();
    manageSearchInIndex();
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
    return (url.indexOf("zim://", 0)==0 || isJavascriptUrl(url) || 
		url.indexOf("chrome:", 0)==0 || url.indexOf("search://", 0)==0);
}

function isJavascriptUrl(url) {
    return (url.indexOf("javascript:", 0)==0);
}

/* Deal with scroll */
function scrollLineUp() {
    getHtmlRenderer().focus();
    try {
	document.commandDispatcher.getControllerForCommand("cmd_scrollLineUp").doCommand('cmd_scrollLineUp');
    } catch (error) {
    }
}

function scrollLineDown() {
    getHtmlRenderer().focus();
    try {
	document.commandDispatcher.getControllerForCommand("cmd_scrollLineDown").doCommand('cmd_scrollLineDown');
    } catch (error) {
    }
}

function scrollPageUp() {
    getHtmlRenderer().focus();
    try {
	document.commandDispatcher.getControllerForCommand("cmd_scrollPageUp").doCommand('cmd_scrollPageUp');
    } catch (error) {
    }
}

function scrollPageDown() {
    getHtmlRenderer().focus();
    try {
	document.commandDispatcher.getControllerForCommand("cmd_scrollPageDown").doCommand('cmd_scrollPageDown');
    } catch (error) {
    }
}

/* Allowing zoom/history function by combining mouse & ctrl */
function htmlRendererMouseScroll(aEvent) {
    /* Deal the with the scroll in case of alt is pressed */
    if (aEvent.altKey) {

        /* On Mac, alt+scroll raises back() or forward() */
        if (env.isMac()) {
            if (aEvent.detail == -1) {
                pageBack();
                stopEventPropagation(aEvent);
                return;
            } else if (aEvent.detail == 1) {
                pageNext();
                stopEventPropagation(aEvent);
                return;
            }
        }
        
        if (!env.isMac()) {
	    stopEventPropagation(aEvent);
	    return;
        }
    }
        
    /* Deal with the roll + ctrl */
    if (aEvent.ctrlKey) {
	if (aEvent.detail>0) { zoomOut() } ;
	if (aEvent.detail<0) { zoomIn() } ;
	stopEventPropagation(aEvent);
	return;
    }

    /* Deal with the roll + shift*/
    if (aEvent.shiftKey) {
	if (aEvent.detail<0) { pageNext() } ;
	if (aEvent.detail>0) { pageBack() } ;
	stopEventPropagation(aEvent);
	return;
    }
}

/* Update the status bar if mouse is over a link */
function htmlRendererMouseOver(aEvent) {
    var url = getNodeLinkUrl(aEvent.target);

    if (url != undefined) {
	/* To be sure that nothing else is already displayed */
	clearStatusBar();
	
	document.getElementById("address-bar").value = decodeUrl(url.replace(":///", "://"));
	
	if (isInternalUrl(url)) {
	    document.getElementById('book-icon').collapsed = false;
	} else {
	    document.getElementById('earth-icon').collapsed = false;
	}
    }
}

/* Update the status bar if mouse is out of a link */
function htmlRendererMouseOut(aEvent) {
    var url = getNodeLinkUrl(aEvent.target);

    if (url != undefined) {
	clearStatusBar();
    }
}

/* Try to find the link behind a node */
function getNodeLinkUrl(node) {
    while (node.parentNode != undefined &&  !(node instanceof HTMLAnchorElement)) {
        node = node.parentNode;
    }
    return (node instanceof HTMLAnchorElement ? node.href : undefined);
}

/* Mouse (double) Click event handler */
function htmlRendererMouseUp(aEvent) {
    var url = getNodeLinkUrl(aEvent.target);
    var stopPropagation = false;

    if (url != undefined && aEvent.button < 2) {
	if ((aEvent.button == 1 || aEvent.ctrlKey) && isInternalUrl(url) && !isJavascriptUrl(url)) {
	    stopPropagation = manageOpenUrlInNewTab(url);
	} else {
	    stopPropagation = manageOpenUrl(url);
	}

	/* Avoid default handling */
	if (stopPropagation) {
	    stopEventPropagation(aEvent);
	}
    } 
}

function stopEventPropagation(aEvent) {
    aEvent.preventDefault();
    aEvent.stopPropagation();
}

/* Open a link in a new tab */
function manageOpenUrlInNewTab(url, focus, scrollY) {
    focus = (focus == undefined ? true : focus);
    changeTabsVisibilityStatus(true);
    
    var id = openNewTab(focus);
    return manageOpenUrl(url, id, scrollY);
}

/* Open a link. Returns true if everything OK */
function manageOpenUrl(url, id, scrollY) {
    /* Clear status bar */
    if (url == undefined || url == "" || url == "about:blank") {
	return false;
    } else {
	clearStatusBar();
    }

    /* Return in case of javascript */
    if (isJavascriptUrl(url)) {
	return false;
    }

    /* Open with extern browser if not an internal link */
    if (!isInternalUrl(url)) {
	openUrlWithExternalBrowser(url);
    } else { /* If the a ZIM or chrome url */ 	 
	if (loadContent(url, id, scrollY)) { 	 
	    activateBackButton(); 	 
	}
    }
    
    return true;
}

/* Clear the status bar */
function clearStatusBar() {
    document.getElementById("address-bar").value = " ";
    document.getElementById('earth-icon').collapsed = true;
    document.getElementById('book-icon').collapsed = true;
}

/* Zoom normal */
function zoomOriginal() {
    getHtmlRenderer().markupDocumentViewer.textZoom = 1;
    settings.zoomFactor(library.getCurrentId(), getHtmlRenderer().markupDocumentViewer.textZoom);
}

/* Zoom in (bigger font) */
function zoomIn() {
    getHtmlRenderer().markupDocumentViewer.textZoom *= _zoomFactor;
    settings.zoomFactor(library.getCurrentId(), getHtmlRenderer().markupDocumentViewer.textZoom);
}

/* Zoom out (smaller font) */
function zoomOut() {
    getHtmlRenderer().markupDocumentViewer.textZoom /= _zoomFactor;
    settings.zoomFactor(library.getCurrentId(), getHtmlRenderer().markupDocumentViewer.textZoom);
}

/* Fullscreen mode functions */
function hideFullScreenToolBar() {
    if (!_showFullScreenToolBar) {
	document.getElementById('tool-bar').setAttribute("style", "display: none;");
    changeTabsVisibilityStatus(false, false);
    }
}

function showFullScreenToolBar() {
    document.getElementById('tool-bar').setAttribute("style", "display: visible;");
    if (_restore_tab)
        changeTabsVisibilityStatus(true, false);

}

function hideFullScreenToolBox() {
    _showFullScreenToolBar = false;
    if (_restore_tab == null)
        _restore_tab = tabsAreVisible();
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
    _fullScreenStatusBar = settings.displayStatusBar();

    /* Configuration changes */
    if (_winIsFullScreen) {
    _restore_tab = null;
	toolBox.addEventListener("mouseover", showFullScreenToolBox, false);

    addFSEventToTab(currentTabId);
	//getHtmlRenderer().addEventListener("mouseover", hideFullScreenToolBox, false);
	
    toolBox.setAttribute("style", "height: 4px;");
	changeStatusBarVisibilityStatus(false);
	document.getElementById('menu-bar').collapsed = true;
	hideFullScreenToolBox();
	getFullscreenButton().setAttribute("tooltiptext", "Windowed");
    } else {
	toolBox.removeEventListener("mouseover", showFullScreenToolBox, false);
	//getHtmlRenderer().removeEventListener("mouseover", hideFullScreenToolBox, false);

    removeFSEventFromTabs();

	toolBox.setAttribute("style", "height: auto;");
	showFullScreenToolBox(_fullScreenStatusBar);
	changeStatusBarVisibilityStatus(_fullScreenStatusBar);
	document.getElementById('menu-bar').collapsed = false;
	showFullScreenToolBox();
	getFullscreenButton().setAttribute("tooltiptext", "Fullscreen");
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

/* Make the status bar (in)visible */
function changeStatusBarVisibilityStatus(visible, save) {

    var bar = document.getElementById('status-bar');

    // if user don't know what he wants
    // assume he wants to toggle
    if (visible == undefined)
        visible = !bar.collapsed;
    else
        visible = !visible;

    bar.collapsed  = visible;
    if (save) {
        settings.displayStatusBar(!visible);
    }

    document.getElementById('display-statusbar').setAttribute('checked', !visible);
}

/* Make the progress bar (in)visible */
function changeProgressBarVisibilityStatus(visible) {
    if (visible == undefined) {
	visible = !getProgressBar().collapsed;
    }

    var sb = document.getElementById('status-bar');

    if (visible) {
        getProgressBar().collapsed = false;
        getProgressBarLabel().collapsed = false;
        if (env.isSugar())
            sb.style.display = 'block';
    } else {
    	getProgressBar().collapsed = true;
        getProgressBarLabel().collapsed = true;
        if (env.isSugar())
            sb.style.display = 'none';
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

    // SUGAR: Update search box label with page name
    if (env.isSugar()) {
        checkIfDocumentIsMarked(getHtmlRenderer().currentURI.spec);
        getSearchBox().value = htmlRenderer.contentTitle;
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

/* Unload (the current Book) */
function manageUnload(clearCurrentAccessor, help) {
    desactivateBackButton();
    desactivateNextButton();
    
    /* Purge the history */
    if (getHtmlRenderer() != undefined && getHtmlRenderer().sessionHistory.count > 0) {
	getHtmlRenderer().sessionHistory.PurgeHistory(getHtmlRenderer().sessionHistory.count);
    }
    
    /* Empty the search box */
    getSearchBox().value = "";
   
    if (clearCurrentAccessor) {
	desactivateHomeButton();
	library.setCurrentId("");
	currentZimAccessor = undefined;
	getLoadRandomArticleMenuItem().disabled = true;
	getCheckIntegrityMenuItem().disabled = true;
    } 

    if (help) {
	showHelp(false, false);
    }

    /* Re-arrange the last open files */
    populateLastOpenMenu();
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
	    settings.defaultFilePickerPath(filePicker.file.parent.path);
	} else {
	    return false;
	}
    }

    /* Close all tabs */
    if (!closeAllTabs()) {
	return true;
    }

    /* OSX prepends path with URL */
    path = path.replace('file://localhost', '');

    /* Replace .zimaa by .zim */
    path = path.replace(".zimaa", ".zim");

    /* Try to open the ZIM file */
    var zimAccessor = openZimFile(path);

    if (zimAccessor) {
	manageUnload();

	/* Get the MD5 id */
	var zimId = new Object();
	zimAccessor.getId(zimId);
	zimId = zimId.value;

	/* Update library */
	var book = library.getBookById(zimId);
	if (!book) {
	    library.addBook(zimId, path);
	} else {
	    library.setBookPath(zimId, path);
	}
	library.updateBookLastOpenDateById(zimId);
	library.setCurrentId(zimId);

	/* Populate the lastopen menu */
	populateLastOpenMenu();

	/* Force to hide the library manager an update it*/
	toggleLibrary(false);
	populateLibraryFilters();	
	
	/* Load the welcome page of the ZIM file */
	goHome();

	/* Activate the Home button and desactivate the next/back buttons */
	activateHomeButton();

	/* Set the zoom */
	getHtmlRenderer().markupDocumentViewer.textZoom = 
	    settings.zoomFactor(library.getCurrentId()) != undefined ? settings.zoomFactor(library.getCurrentId()) : 1;

	/* Ask to index if this files has not already an index */
	if (!isIndexing() && !noSearchIndexCheck && !checkSearchIndex()) {
	    manageIndexZimFile();
	}
	
	/* Update the search bar */
	updateGuiSearchComponents();

	/* verify if we can check the integrity */
	getCheckIntegrityMenuItem().disabled = !canCheckIntegrity();
	
	/* Enable load random article */
	getLoadRandomArticleMenuItem().disabled = false;
    } else {
	displayErrorDialog(getProperty("loadZimFileError", path));
	return false;
    }

    return true;
}

/* Got the welcome page of the current zim file */
function goHome() {
    var homeUrl = getCurrentZimFileHomePageUrl();

    if (homeUrl) {
	var htmlRenderer = getHtmlRenderer();
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
function showHelp(createTab, hideLibrary) {
    if (createTab) { 
	openNewTab();
    }

    /* Force to hide the library manager */
    if (hideLibrary) {
	toggleLibrary(false);
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

    /* Image target */
    var saveImageAsMenuItem = document.getElementById("browser-contextual-menu-saveimageas");
    if (target.localName == "img") {
	var src = target.getAttribute("src");
	saveImageAsMenuItem.setAttribute("onclick", "manageImageDownload(\"" + src.replace("\"", "\\\"") + "\")");
	saveImageAsMenuItem.setAttribute("style", "display: visible;");
    } else {
	saveImageAsMenuItem.setAttribute("style", "display: none;");
    }

    /* Target with a link */
    var openLinkInNewTabMenuItem = document.getElementById("browser-contextual-menu-openlinkinnewtab");
    var url = getNodeLinkUrl(target);
    if (url != undefined) {
	if (isInternalUrl(url) && !isJavascriptUrl(url)) {
	    openLinkInNewTabMenuItem.setAttribute("style", "display: visible;");
	    openLinkInNewTabMenuItem.setAttribute("onclick", "manageOpenUrlInNewTab(\"" + url.replace("\"", "\\\"") + "\")");
	} else {
	    openLinkInNewTabMenuItem.setAttribute("style", "display: none;");
	}
    } else {
	openLinkInNewTabMenuItem.setAttribute("style", "display: none;");
    }

    /* Selected text */
    var copySelectedTextMenuItem = document.getElementById("browser-contextual-menu-copyselectedtext");
    var searchForMenuItem = document.getElementById("browser-contextual-menu-searchfor");
    var selectedText = document.commandDispatcher.focusedWindow.getSelection().toString();
    if (selectedText.length > 0) {
	copySelectedTextMenuItem.setAttribute("style", "display: visible;");
	copySelectedTextMenuItem.setAttribute("onclick", "copySelectedContent()");
	searchForMenuItem.setAttribute("style", "display: visible;");
	searchForMenuItem.setAttribute("onclick", "searchFor(\"" + selectedText.replace("\"", "\\\"") + "\")");
    } else {
	copySelectedTextMenuItem.setAttribute("style", "display: none;");
	searchForMenuItem.setAttribute("style", "display: none;");
    }

    /* Select all */
    var selectAllMenuItem = document.getElementById("browser-contextual-menu-selectall");
    if (target.localName != "img" && selectedText.length <= 0 && url == undefined) {
	selectAllMenuItem.setAttribute("style", "display: visible;");
    } else {
	selectAllMenuItem.setAttribute("style", "display: none;");
    }

    /* Show the contextual menu */
    var browserContextualMenu = document.getElementById("browser-contextual-menu");
    browserContextualMenu.openPopupAtScreen(event.screenX, event.screenY, true);

    /* Stop event propagation */
    stopEventPropagation(event);
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

/* Display a confirm dialog box like confirm() but with an additional checkbox */
function displayConfirmDialogEx(message, title, checkboxMessage, checkboxValue) {
    /* Default values */
    title = (title == undefined ? getProperty("confirm") : title);
    checkboxMessage = (checkboxMessage == undefined ? "" : checkboxMessage);
    
    var promptService = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
        .getService(Components.interfaces.nsIPromptService);
    var flags=promptService.BUTTON_TITLE_YES * promptService.BUTTON_POS_0 +
        promptService.BUTTON_TITLE_NO * promptService.BUTTON_POS_1;
    return promptService.confirmEx(window, title, message, flags, null, null, null, checkboxMessage, checkboxValue);
}

/* Fill the languages-menu with all available languages */
function populateLanguagesMenu() {
    /* Get informations about locales */
    var selectedLocale = getCurrentLocale();
    var availableLocales = getAvailableLocales();
    
    /* Render locale menu items */
    var languagesMenu = document.getElementById("menu-languages");
    
    /* Go through the locale list an update the GUI */
    while(availableLocales.hasMore()) {
	var locale = availableLocales.getNext();
	var language = getLanguageNameFromISO(locale);
	var label = language === undefined || language == "" ? locale : language;
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
	
	languagesMenu.insertBefore(menuItem, languagesMenu.firstChild);
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
    var sugarmenutop = document.getElementById('sugar-menu-lastopen-top');
    var sugarmenu = document.getElementById('sugar-menu-lastopen');

    /* Remove the child nodes */
    while (lastOpenMenu.firstChild) {
	lastOpenMenu.removeChild(lastOpenMenu.firstChild);
    };

    if (env.isSugar()) {
	while (sugarmenu.firstChild) {
	    sugarmenu.removeChild(sugarmenu.firstChild);
	};
    }

    /* Prepare the list */
    try {
        library.listBooks("lastOpen");
    } catch(e) {
        dump("Unable to populateLastOpenMenu(): " + e.toString() + "\n");
        return false;
    }
    var book = library.getNextBookInList();

    /* Skip the first, it's already open */
    if (book != undefined && book.id == library.getCurrentId())
	book = library.getNextBookInList();

    /* Disable the menu if no book */
    if (book == undefined) {
	lastOpenMenuTop.disabled = sugarmenutop.disabled = true;
    } else {/* Go through the book list an update the GUI */
	lastOpenMenuTop.disabled = sugarmenutop.disabled = false;

	while (book != undefined) {
	    var label = book.title != "" && book.title != " " ? book.title : book.path;
	    var tooltip = book.path;
	    var menuItem = document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul", 
						    "menuitem");
	    
	    menuItem.setAttribute("label", label);
	    menuItem.setAttribute("tooltip", tooltip);
	    menuItem.setAttribute("oncommand", "library.setCurrentId('" + book.id + "'); openCurrentBook();");
	    lastOpenMenu.appendChild(menuItem);

	    if (env.isSugar()) {
		sugarmenu.appendChild(menuItem);
	    }

	    book = library.getNextBookInList();
	}
    }
}

/* basic UI init so error messages are displayed properly */
function preInitUserInterface() {

    /* Set a class on main window based on platform string */
    document.getElementById("main").className = env.platform.type;
	
    /* Set the size and position of the window */
    configureWindowGeometry(this);

    /* Populates localization languages to the menu-languages */
    populateLanguagesMenu();

    /* Same for the skins */
    populateSkinsMenu();

    /* Populate the library */
    if (!env.isSugar()) {
        try {
            populateContentManager(true, true);
        } catch(e) { dump("Unable to populate Content Manager: " + e.toString() + "\n"); }
    }
}

/* Initialize the user interface */
function initUserInterface() {
    /* Populates the last open menu */
    populateLastOpenMenu();

    /* Apply GUI settings */
    if (settings.displayStatusBar() != undefined) { changeStatusBarVisibilityStatus(settings.displayStatusBar()); }
    if (settings.displayFullScreen() != undefined) { if (settings.displayFullScreen()) { UIToggleFullScreen(); } }
    if (settings.displayBookmarksBar() === true) { UIToggleBookmarksBar(); }

    /* Display tabs or not */
    changeTabsVisibilityStatus(settings.displayTabs());

    /* Desactivate back/next buttons */
    desactivateBackButton();
    desactivateNextButton();
    
    /* Mac OSX specificities disable Print as PDF menu */
    if (env.isMac()) {
        fm = document.getElementById("file-popup");
        fp = document.getElementById("file-print-pdf");
        fm.removeChild(fp);
        fq = document.getElementById("file-quit");
        fm.removeChild(fq);
        fs = document.getElementById("file-sep");
        fm.removeChild(fs);
        em = document.getElementById("edit-popup");
        et = document.getElementById("edit-transliteration");
        em.removeChild(et);
	
        // keyboard shortcut
        keys = document.getElementsByTagName("key");
        for (var i=0; i<keys.length; i++) {
            if (keys[i].hasAttribute('modifiers')) {
                mod = keys[i].getAttribute('modifiers');
                if (mod.match(/control/i)) {
                    keys[i].setAttribute('modifiers', mod.replace('control', 'meta'));	
                }
            }
        }
        // full screen is complete different shortcut
        fkey = document.getElementById("fullscreen-key");
        fkey.setAttribute('modifiers', 'meta,shift');
        fkey.setAttribute('keycode', 'F');
    }

    /* Sugar U.I is slightly different than regular one */
    if (env.isSugar()) {
        // remove menubar (File, Edition, etc)
        menu = document.getElementById('menu-bar');
        menu.setAttribute("style", "display: none;");
    } else {
        /* Start the download observer */
        startDownloadObserver();
    }
}

function postInitUserInterface() {

    /* If there is no file open with the commandline try to open last open book */
    if (currentZimAccessor == undefined) {
	try {
            if (openCurrentBook()) {
	        restoreTabs();
	    } else {
	        library.deleteCurrentBook();
	    }
        } catch(e) { dump("Unable to check current book: " + e.toString() + "\n"); }
    }

    /* Adapt the UI depending of a book is open or not */
    if (currentZimAccessor == undefined) {
	showHelp();
	desactivateHomeButton();
    } else {
	activateHomeButton();
    }
    
    /* Update the search bar */
    updateGuiSearchComponents();
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
		if (env.isMac()) {
                    var file = data.value.QueryInterface(Components.interfaces.nsIFile);
		} else {
        	    var str = data.value.QueryInterface(Components.interfaces.nsISupportsString);
		    
		    if (str) {
			var ios = Components.classes['@mozilla.org/network/io-service;1']
			    .getService(Components.interfaces.nsIIOService);
			var uri = ios.newURI(str.data.split("\n")[0], null, null);
			var file = uri.QueryInterface(Components.interfaces.nsIFileURL).file;
		    }
		}
		if (file)
    		    manageOpenFile(file.path);
	    }
	    catch(e) {
	    }
	}
    }
}

/* Allow to deal with mouse thumb buttons back/forward*/
function handleAppCommandEvent(evt) {
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

function toggleFindBarButton(aEvent) {
    if (aEvent.attrName == 'hidden') {
	getFindButton().setAttribute('checked', !aEvent.newValue);
    }
}

function handleMouseClick(aEvent) {
    var url = getNodeLinkUrl(aEvent.target);
    if (url != undefined && !isJavascriptUrl(url)) {
	stopEventPropagation(aEvent);
    }
}

/* Add mouse scroll listener to allow zoon in/out with the mouse for example */
function initHtmlRendererEventListeners(id) {
    var htmlRenderer =  getHtmlRenderer(id);
    var htmlRendererId = htmlRenderer.id;
    var regexResults = htmlRendererId.match(/html-renderer-(.*)/);
    var id = regexResults[1];

    htmlRenderer.addEventListener("DOMMouseScroll", htmlRendererMouseScroll, false);
    htmlRenderer.addEventListener("mouseover", htmlRendererMouseOver, true);
    htmlRenderer.addEventListener("mouseout", htmlRendererMouseOut, true);
    htmlRenderer.addEventListener("mouseup", htmlRendererMouseUp, true);
    htmlRenderer.addEventListener("pageshow", updateHistoryNavigationButtons, true);
    htmlRenderer.addEventListener("contextmenu", toggleBrowserContextualMenu, true);
    htmlRenderer.addEventListener("AppCommand", handleAppCommandEvent, true);
    htmlRenderer.addEventListener("DOMActivate", handleMouseClick, true); 

    /* Add ProgressListener */
    htmlRenderer.addProgressListener(articleLoadingListener, NOTIFY_STATE_DOCUMENT);

    /* Necessary to update the tab header */
    htmlRenderer.addEventListener("pageshow", function(){ updateTabHeader(id) }, true);
    htmlRenderer.addEventListener("load", function(){ updateTabHeader(id); applyInitScroll(this); }, true);
    
    /* Drag & drop to open a link in a new tab */
    htmlRenderer.addEventListener ("dragend", htmlRendererDrop, true);

    /* Intercept standard behaviour of tabheaders keypress */
    getTabHeaders().addEventListener("keypress", handleTabHeadersKeyPress, true);
}

function applyInitScroll(browser) {
    var initScrollY = browser.getAttribute("initScrollY");
    if (initScrollY) {
	browser.contentWindow.scroll(0, initScrollY); 
	browser.setAttribute("initScrollY", undefined);
    }
}

function handleKeyPress(aEvent) {
    if (isLibraryVisible()) {
	var keyCode = aEvent.keyCode;
	var container = getCurrentBookListContainer();
	var box = _selectedLibraryContentItem;

	/* Escape, quit the library */
	if (keyCode == 27) {
	    toggleLibrary(false);
	    return;
	}

	/* Key focus are on the content */
	if (!_libraryKeyCursorOnMenu) {
	    if (keyCode == 38) {
		box = box == undefined ? container.lastChild : 
		    (box == container.firstChild ? container.firstChild : box.previousSibling);
	    } else if (keyCode == 40) {
		box = box == undefined ? container.getItemAtIndex(container.itemCount - 1) : 
		    (box == container.lastChild ? 
		     container.getItemAtIndex(container.itemCount - 1) : box.nextSibling);
	    } else if (keyCode == 13 && container.id == "library-content-local") {
		var bookId  = box.getAttribute("bookId");
		var book = library.getBookById(bookId);
		if (book != undefined) {
		    manageOpenFile(book.path, true);
		}
	    } else if (keyCode == 37) {
		_libraryKeyCursorOnMenu = true;
	    }

	    if (box != _selectedLibraryContentItem)
		selectLibraryContentItem(box);
	}

	/* Key focus are on the two menus */
	else {
	    if (keyCode == 39) {
		_libraryKeyCursorOnMenu = false;
	    } else if (keyCode == 38 && document.getElementById("library-deck").selectedIndex == 1) {
		selectLibraryMenu("library-menuitem-local");
		_libraryKeyCursorOnMenu = false;
	    } else if (keyCode == 40 && document.getElementById("library-deck").selectedIndex == 0) {
		selectLibraryMenu("library-menuitem-remote");
		_libraryKeyCursorOnMenu = false;
	    }
	}
    }
}

/* Route all keypress event on the tabbox to the HTML renderer */
function handleTabHeadersKeyPress(aEvent) {
    document.getElementById('browser').contentDocument.dispatchEvent();
}

/* Deal with drag & drop to open a link in a new tab */
function htmlRendererDrop(aEvent) {
    var url = getNodeLinkUrl(aEvent.target);
    var tabHeaders = getTabHeaders();

    if (url != undefined) {
	var x1 = tabHeaders.boxObject.screenX;
	var x2 = x1 + tabHeaders.boxObject.width;
	var y1 = tabHeaders.boxObject.screenY;
	var y2 = y1 + tabHeaders.boxObject.height;
	var x = aEvent.screenX;
	var y = aEvent.screenY;
	if (x > x1 && x < x2 && y > y1 && y < y2) {
	    if (isInternalUrl(url)) {
		manageOpenUrlInNewTab(url);
	    }
	}
    }
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

    /* finbar event */
    getFindBar().addEventListener ("DOMAttrModified", toggleFindBarButton, true);

    /* Deal with key press */
    document.getElementById("main").addEventListener("keypress", handleKeyPress, true);
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

function sendNotification(title, message, link) {
    try {
	if (link != undefined) {
	    var listener = {  
		observe: function(subject, topic, data) {  
		    if (topic == "alertclickcallback")
			openUrlWithExternalBrowser(link);
		}  
	    }  
	}

	var alertsService = Components.classes["@mozilla.org/alerts-service;1"].  
            getService(Components.interfaces.nsIAlertsService);  
	alertsService.showAlertNotification("chrome://mozapps/skin/downloads/downloadIcon.png",
					    title, message,
                                            link != undefined, link, listener, "");  
	
    } catch(error) {
        if (link)
            message = message + "\n" + link;
        
	   displayInfoDialog(message   , title);
    }
}

function openSugarOptionsMenu() {
    menu = document.getElementById('sugar-options-menu');
    buttrect = document.getElementById('sugar-button-options').getBoundingClientRect();
    menu.openPopupAtScreen(buttrect.left, buttrect.bottom);
}

function toggleSugarDisplayBar() {
    bar = document.getElementById('sugar-display-toolbar');
    bar.style.display = (bar.style.display == 'block') ? 'none' : 'block';
    butt = document.getElementById('sugar-button-display');
    butt.className = (butt.className == 'open') ? 'close' : 'open';
}

function SugarToggleBookmarkTray() {

}

function testThumbnail() {
    loadContent(thumbnailFromCurrentPage());
}

function thumbnailFromCurrentPage() 
	{
        var thumbnailBG = 'rgb(192,192,192)';
        var size = 100;

        var canvas = document.getElementById('thumbnail-saver-canvas');

		var b   = document.getElementById('html-renderer-00000000');
		var win = b.contentWindow;
		var w   = win.innerWidth;
		var h   = win.innerHeight;
		var aspectRatio = 1 / 0.75;

		var canvasW = Math.floor((aspectRatio < 1) ? (size * aspectRatio) : size );
		var canvasH = Math.floor((aspectRatio > 1) ? (size / aspectRatio) : size );

		var isImage = b.contentDocument.contentType.indexOf('image') == 0;

		canvas.width  = canvasW;
		canvas.height = canvasH;
		canvas.style.width  = canvasW+'px';
		canvas.style.height = canvasH+'px';
		canvas.style.display = 'none';

		var rendered = false;

		var ctx = canvas.getContext('2d');
		ctx.clearRect(0, 0, canvasW, canvasH);
		ctx.save();
		if (!isImage) {
			if (h * canvasW/w < canvasH)
				ctx.scale(canvasH/h, canvasH/h);
			else
				ctx.scale(canvasW/w, canvasW/w);
			ctx.drawWindow(win, 0/*win.scrollX*/, 0/*win.scrollY*/, w, h, thumbnailBG);
		}
		else {
			var image = b.contentDocument.getElementsByTagName('img')[0];
			ctx.fillStyle = thumbnailBG;
			ctx.fillRect(0, 0, canvasW, canvasH);
			var iW = parseInt(image.width);
			var iH = parseInt(image.height);
			var x = 0;
			var y = 0;
			if ((iW / iH) < 1) {
				iW = iW * canvasH / iH;
				x = Math.floor((canvasW - iW) / 2 );
				iH = canvasH;
			}
			else {
				iH = iH * canvasW / iW;
				y = Math.floor((canvasH - iH) / 2 );
				iW = canvasW;
			}
			ctx.drawImage(image, x, y, iW, iH);
		}
		ctx.restore();

        return canvas.toDataURL();
	}

function focusOnSearch() {
    // SUGAR: remove content of search box
    if (env.isSugar())
        getSearchBox().value = '';
}

function LostFocusOnSearch() {
    // SUGAR: Update search box label with page name
    if (env.isSugar())
        getSearchBox().value = getHtmlRenderer().contentTitle;
}
