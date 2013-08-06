/*
 * Copyright 2011-2012
 * Emmanuel Engelhart <kelson@kiwix.org>
 * Renaud Gaudin <reg@kiwix.org>
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
var _winIsFullScreen        = false;    /* Stores fullscreen state*/
var _showFullScreenToolBar  = false;
var _fullScreenStatusBar    = true;
var _restore_tab            = null;
var _firstSideBar	    = true;
var _isCtrlDown             = false;
var _minWidth               = 1000;
var _minHeight              = 600;

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

/* Load an url in the HTML render element */
function loadContent(url, id, scrollY) {
    var browser = getHtmlRenderer(id);

    try {
	if (areColorsInverted()) {
	    browser.loadURI("chrome://main/content/other/invertColors.html#" + url, null, null);
	} else {
	    browser.loadURI(url, null, null);
	}

	if (scrollY) {
	    browser.setAttribute("initScrollY", scrollY);
	}

    } catch(e) {
	displayErrorDialog(getProperty("loadArticleError"));
	return false;
    }

    // SUGAR: change status of Mark button
    checkIfDocumentIsMarked(url);
    return true;
}

function reloadContent() {
    loadContent(getCurrentUrl());
}

function getCurrentUrl(id) {
    var currentUrl = getHtmlRenderer(id).currentURI.spec;
    return areColorsInverted ? currentUrl.replace(new RegExp("^(.*invertColors.html#)(.*)$", "g"), '$2') : currentUrl;
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

/* Activate history related UI components */
function updateGuiHistoryComponents() {
    if (!isLibraryVisible()) {
	updateHistoryNavigationButtons();

	var browserHistory = Components.classes["@mozilla.org/browser/nav-history-service;1"]
            .getService(Components.interfaces.nsIBrowserHistory);
	getPurgeHistoryMenuItem().disabled = browserHistory.count == 0 ? true : false;;
    } else {
	desactivateBackButton();
	desactivateNextButton();
	getPurgeHistoryMenuItem().disabled = true;
    }
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
    if (settings.windowMaximized()) {
        setTimeout('window.maximize();', 1);
    } else {
	var margin = 50;
	var width = (settings.windowWidth() != undefined && 
		     settings.windowWidth() > _minWidth) ? settings.windowWidth() : screen.width / 100 * 80;
	var height = (settings.windowHeight() != undefined &&
		      settings.windowHeight() > _minHeight) ? settings.windowHeight() : screen.height / 100 * 80;
	var x = (settings.windowX() != undefined && 
		 settings.windowX() > 0 && 
		 settings.windowX() < screen.width - margin) ? settings.windowX() : (screen.width - width) / 2;
	var y = (settings.windowY() != undefined && 
		 settings.windowY() > 0 &&
		 settings.windowY() < screen.height - margin) ? settings.windowY() : (screen.height - height) / 2;
	window.moveTo(x, y);
	window.resizeTo(width, height);

	saveWindowGeometry(this.outerWidth, this.outerHeight, this.screenX, this.screenY, this.windowState);
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
function manageFocusOnSearchBox() {
    var searchBox = getSearchBox();
    if (searchBox.disabled == false) {
	searchBox.focus();
    } else {
	manageIndexCurrentBook();
    }
}

function focusOnSearchBox() {
    var searchBox = getSearchBox();
    if (searchBox.disabled == false) {
	searchBox.focus();
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
	    updateGuiHistoryComponents();
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

function getDefaultZoomFactor() {
    return settings.isHighDPI() ? 2 : 1;
}

/* Zoom normal */
function zoomOriginal() {
    // getHtmlRenderer().markupDocumentViewer.textZoom = 1;
    // settings.zoomFactor(library.getCurrentId(), getHtmlRenderer().markupDocumentViewer.textZoom);
    getHtmlRenderer().markupDocumentViewer.fullZoom = getDefaultZoomFactor();
    settings.zoomFactor(library.getCurrentId(), getHtmlRenderer().markupDocumentViewer.fullZoom);
}

/* Zoom in (bigger font) */
function zoomIn() {
    // getHtmlRenderer().markupDocumentViewer.textZoom += 0.1;
    // settings.zoomFactor(library.getCurrentId(), getHtmlRenderer().markupDocumentViewer.textZoom);
    getHtmlRenderer().markupDocumentViewer.fullZoom += 0.1;
    settings.zoomFactor(library.getCurrentId(), getHtmlRenderer().markupDocumentViewer.fullZoom);
}

/* Zoom out (smaller font) */
function zoomOut() {
    // getHtmlRenderer().markupDocumentViewer.textZoom -= 0.1;
    // settings.zoomFactor(library.getCurrentId(), getHtmlRenderer().markupDocumentViewer.textZoom);
    getHtmlRenderer().markupDocumentViewer.fullZoom -= 0.1;
    settings.zoomFactor(library.getCurrentId(), getHtmlRenderer().markupDocumentViewer.fullZoom);
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
	getFullscreenButton().setAttribute("tooltiptext", getProperty("quitFullscreen"));
    } else {
	toolBox.removeEventListener("mouseover", showFullScreenToolBox, false);
	//getHtmlRenderer().removeEventListener("mouseover", hideFullScreenToolBox, false);

	removeFSEventFromTabs();

	toolBox.setAttribute("style", "height: auto;");
	showFullScreenToolBox(_fullScreenStatusBar);
	changeStatusBarVisibilityStatus(_fullScreenStatusBar);
	document.getElementById('menu-bar').collapsed = false;
	showFullScreenToolBox();
	getFullscreenButton().setAttribute("tooltiptext", getProperty("fullscreen"));
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
    var browser = getHtmlRenderer();

    if (areColorsInverted() && browser.contentDocument.getElementsByTagName("iframe").length > 0) {
	const gClipboardHelper = Components.classes["@mozilla.org/widget/clipboardhelper;1"]
	    .getService(Components.interfaces.nsIClipboardHelper);
	var iframe = browser.contentDocument.getElementsByTagName("iframe")[0];
	gClipboardHelper.copyString(iframe.contentDocument.getSelection());
    } else {
	browser.contentViewerEdit.copySelection();
    }
}

/* Select all content of the page */
function selectAll() {
    var browser = getHtmlRenderer();

    if (areColorsInverted() && browser.contentDocument.getElementsByTagName("iframe").length > 0) {
	var iframe = browser.contentDocument.getElementsByTagName("iframe")[0];
	var content = iframe.contentDocument;
	var range = content.createRange();
	range.selectNodeContents(iframe.contentWindow.document.body);
	var selection = iframe.contentWindow.getSelection();
	selection.removeAllRanges();
	selection.addRange(range);
    } else {
	browser.contentViewerEdit.selectAll();
    }
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
function pageBack(openInNewTab) {
    try {
	var htmlRenderer = getHtmlRenderer();

	if (htmlRenderer.canGoBack == true) {
	    htmlRenderer.stop();

	    /* Open in current or new Tab */
	    if (openInNewTab) {
		var url = htmlRenderer.sessionHistory.getEntryAtIndex(htmlRenderer.sessionHistory.index-1, false).URI.spec;
		manageOpenUrlInNewTab(url);
	    } else {
		htmlRenderer.goBack();
	    }

	    /* update the UI */
	    updateGuiHistoryComponents();
	}
    } catch (exception) {
	displayErrorDialog(exception);
	return false;
    }
    return true;
}

/* Next to the next rendered page */
function pageNext(openInNewTab) {
    try { 
	var htmlRenderer = getHtmlRenderer();
	if (htmlRenderer.canGoForward == true) {
	    htmlRenderer.stop();

	    /* Open in current or new Tab */
	    if (openInNewTab) {
		var url = htmlRenderer.sessionHistory.getEntryAtIndex(htmlRenderer.sessionHistory.index+1, false).URI.spec;
		manageOpenUrlInNewTab(url);
	    } else {
		htmlRenderer.goForward();
	    }
	    
	    /* update the UI */
	    updateGuiHistoryComponents();
	}
    } catch (exception) {
	displayErrorDialog(exception);
	return false;
    }
    return true;
}

/* Unload (the current Book) */
function manageUnload(clearCurrentAccessor, help) {
    managePurgeHistory();
    
    /* Empty the search box */
    getSearchBox().value = "";
    getSearchBox().disabled = true;

    if (clearCurrentAccessor) {
	desactivateHomeButton();
	library.setCurrentId("");
	if (currentZimAccessor != undefined) {
	    currentZimAccessor.unload();
	    currentZimAccessor = undefined;
	}
	getLoadRandomArticleMenuItem().disabled = true;
	getCheckIntegrityMenuItem().disabled = true;
	getLaunchIndexingMenuItem().disabled = true;
    } 

    if (help) {
	showHelp(false, false);
    }
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
	filePicker.appendFilter("Library files","*.xml");
	
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

	/* OSX prepends path with URL */
	path = path.replace('file://localhost', '');
    }

    /* Load library file */
    if (path.match(/^.*\.xml$/i)) {
	var oldLocalBookCount = library.getLocalBookCount();
	if (library.readFromFile(path, true)) {
	    var newLocalBookCount = library.getLocalBookCount();
	    var localBookCountDiff = newLocalBookCount - oldLocalBookCount;
	    if (displayConfirmDialog("Library XML file was loaded successfuly.\n" + localBookCountDiff + " local content is/are newly availablle in the library.\nDo you want to open your library now?")) {
		populateBookList();
		showLocalBooks();
		settings.addCustomLibraryPath(path);
	    }
	} else {
	    displayErrorDialog("Kiwix failed to open the library XML file '" + path + "' library XML file. The file is maybe corrupted?");
	}
    }

    /* Load ZIM file */
    else {
	/* Close all tabs */
	if (!closeAllTabs()) {
	    return true;
	}
	
	/* Replace .zimaa by .zim */
	path = path.replace(new RegExp("^(.*)(\.zimaa)$", "g"), '$1.zim');
	
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
	    
	    /* Force to hide the library manager an update it */
	    toggleLibrary(false);
	    populateLocalBookList();
	    populateLibraryFilters();	
	    
	    /* Populate the lastopen menu */
	    populateLastOpenMenu();
	    
	    /* Clear the history just after the homepage loading - only this time */
	    addOneShotEventListener(getHtmlRenderer(), "pageshow", function() { managePurgeHistory() }, true);
	    
	    /* Load the welcome page of the ZIM file */
	    goHome();
	    
	    /* Activate the Home button and desactivate the next/back buttons */
	    activateHomeButton();
	    
	    /* Set the zoom */
	    getHtmlRenderer().markupDocumentViewer.fullZoom = 
		settings.zoomFactor(library.getCurrentId()) != undefined ? settings.zoomFactor(library.getCurrentId()) : getDefaultZoomFactor();
	    
	    /* Ask to index if this files has not already an index */
	    if (!isIndexing() && !noSearchIndexCheck && !checkSearchIndex()) {
		manageIndexCurrentBook();
	    }
	    
	    /* Update the search bar */
	    updateGuiSearchComponents();
	    
	    /* verify if we can check the integrity */
	    getCheckIntegrityMenuItem().disabled = !canCheckIntegrity();
	    
	    /* Allow to index the file */
	    getLaunchIndexingMenuItem().disabled = checkSearchIndex();
	    
	    /* Enable load random article */
	    getLoadRandomArticleMenuItem().disabled = false;
	} else {
	    displayErrorDialog(getProperty("loadZimFileError", path));
	    return false;
	}
    }

    return true;
}

/* Got the welcome page of the current zim file */
function goHome(openInNewTab) {
    var homeUrl = getCurrentZimFileHomePageUrl();

    if (homeUrl) {
	var htmlRenderer = getHtmlRenderer();

	/* Open in current or new Tab */
	if (openInNewTab) {
	    manageOpenUrlInNewTab(homeUrl);
	} else {
	    manageOpenUrl(homeUrl);
	}
	
	/* activate if necessary the back button */
	updateGuiHistoryComponents();
    } else {
	showHelp();
    }
}

/* Manage the change of the locale with the GUI */
function manageChangeLocale(locale) {
    var localeBackup = settings.locale();
    if (locale && (settings.locale() != locale)) {
	settings.locale(locale);

	/* Rollback the checked locale in the menu  */
	if (!restart()) {
	    settings.locale(localeBackup);
	    populateLanguagesMenu();
	}
    }
}

/* Display the about dialog box */
function showAbout() {
    var win = window.openDialog('about.xul','','centerscreen,resizable=no,scrollbars=no,modal,width=350,height=380');
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

    /* Set the trigger Node */
    document.popupNode = target;

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

    /* Copy Link address */
    var copyLinkAddressMenuItem = document.getElementById("browser-contextual-menu-copylinkaddress");
    var url = getNodeLinkUrl(target);
    if (url != undefined) {
//	if (!isInternalUrl(url)) {
	    copyLinkAddressMenuItem.setAttribute("style", "display: visible;");
	    copyLinkAddressMenuItem.setAttribute("onclick", "copyTextToClipboard(\"" + url.replace("\"", "\\\"") + "\")");
//	} else {
//	    copyLinkAddressMenuItem.setAttribute("style", "display: none;");
//	}
    } else {
	copyLinkAddressMenuItem.setAttribute("style", "display: none;");
    }    

    /* Selected text */
    var copySelectedTextMenuItem = document.getElementById("browser-contextual-menu-copyselectedtext");
    var searchForMenuItem = document.getElementById("browser-contextual-menu-searchfor");
    var selectedText = document.commandDispatcher.focusedWindow.
	getSelection().toString().replace(/(\r\n|\n|\r)/gm, " ");

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

    /* Mute/Audible HTML5 Video */
    var muteMenuItem = document.getElementById("browser-contextual-menu-mute");
    var audibleMenuItem = document.getElementById("browser-contextual-menu-audible");
    audibleMenuItem.setAttribute("style", "display: none;");
    muteMenuItem.setAttribute("style", "display: none;");
    if (target.localName == "video") {
	var isAudible = !target.muted;
	if (isAudible) {
	    muteMenuItem.setAttribute("style", "display: visible;");
	} else {
	    audibleMenuItem.setAttribute("style", "display: visible;");
	}
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
    return (promptService.confirmEx(window, title, message, flags, null, null, null, 
				   checkboxMessage, checkboxValue) == 0);
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
	} else {
	    menuItem.setAttribute('checked', false);
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

    if (settingsLocale.match(/chrome/) == undefined) {
	return settingsLocale;
    } else {
	settings.locale(chromeLocale);
	return chromeLocale;
    }
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

/* Basic User Interface initialisation */
function initUserInterface() {
    /* Init languages regexps */
    buildLanguagesRegexHash();
    
    /* Set a class on main window based on platform string */
    document.getElementById("main").className = env.platform.type;

    /* Set the size and position of the window */
    configureWindowGeometry(this);
    
    /* Populates localization languages to the menu-languages */
    populateLanguagesMenu();
    
    /* Same for the skins */
    populateSkinsMenu();
    
    /* Apply UI settings */
    if (settings.displayStatusBar() != undefined) { changeStatusBarVisibilityStatus(settings.displayStatusBar()); }
    if (settings.displayFullScreen() != undefined) { if (settings.displayFullScreen()) { UIToggleFullScreen(); } }
    if (settings.displayBookmarksBar() === true) { UIToggleBookmarksBar(); }
    if (settings.invertedColors() === true) { toggleInvertedColors(true); }
    changeTabsVisibilityStatus(settings.displayTabs());

	function removeElement(elem_id) {
		var elem = null;
		try {
			elem = document.getElementById(elem_id);
		} catch(e) {
			return false;
		}
		var parent = null;
		try {
			parent = elem.parentNode;
		} catch(e) { return false; }
		try {
			parent.removeChild(elem);
		} catch(e) {
			dump(e);
			return false;
		}
		return true;
	}

	/* Mac OSX specific customisations */
	if (env.isMac()) {
		removeElement("file-quit");
		removeElement("file-sep");
		removeElement("edit-transliteration");
		removeElement("file-preferences");
		removeElement("pref-sep");
		removeElement("help-about");
		removeElement("about-sep");
	
        /* OSX keyboard shortcut */
        var keys = document.getElementsByTagName("key");
        for (var i=0; i<keys.length; i++) {
            if (keys[i].hasAttribute('modifiers')) {
                var mod = keys[i].getAttribute('modifiers');
                if (mod.match(/control/i)) {
                    keys[i].setAttribute('modifiers', mod.replace('control', 'meta'));	
                }
            }
        }

        /* OSX Fullscreen shortcuts */
        var fkey = document.getElementById("fullscreen-key");
        fkey.setAttribute('modifiers', 'meta,shift');
        fkey.setAttribute('keycode', 'F');
    }

    /* Sugar customisations */
    if (env.isSugar()) {
        if (settings.isHighDPI()) {
            document.getElementById("main").className = document.getElementById("main").className + " highdpi";
            zoomOriginal();
        }
        
        /* Remove the whole menubar (File, Edition, ...) */
        menu = document.getElementById('menu-bar');
        menu.setAttribute("style", "display: none;");
    }

    /* Last part */
    populateLastOpenMenu();
}

function startDragOnWindows(event) {
    return event.dataTransfer.types.contains("text/html");
}

/* Drop file on windows to open it */
function dropOnWindows(aEvent) {
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
    htmlRenderer.addEventListener("pageshow", updateGuiHistoryComponents, true);
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

    /* Avoid too small window */
    if (screen.width > _minWidth && screen.height > _minHeight) {
	window.addEventListener("resize", function() {
	    if(window.outerWidth > 100 && window.outerWidth < _minWidth) {
		window.resizeTo(_minWidth, window.outerHeight);
	    }

	    if (window.outerHeight > 100 && window.outerHeight < _minHeight) {
		window.resizeTo(window.outerWidth, _minHeight);
	    }
	}, false);
    }
}

function handleWindowKeyDown(aEvent) {
    var keyCode = aEvent.keyCode;

    /* ctrl */
    if (keyCode == 17) 
	_isCtrlDown = true;
}

function handleWindowKeyUp(aEvent) {
    var keyCode = aEvent.keyCode;

    /* ctrl */
    if (keyCode == 17) 
	_isCtrlDown = false;
}

function isCtrlDown() {
    return _isCtrlDown;
}

function applyInitScroll(browser) {
    var initScrollY = browser.getAttribute("initScrollY");
    if (initScrollY > 0) {
	if (areColorsInverted() && browser.contentDocument.getElementsByTagName("iframe").length > 0) {
	    var iframe = browser.contentDocument.getElementsByTagName("iframe")[0];
	    iframe.onload = function() { iframe.contentWindow.scrollTo(0, 420); };
	} else {
	    browser.contentWindow.scroll(0, initScrollY); 
	}

	browser.setAttribute("initScrollY", undefined);
    }
}

function handleKeyPress(aEvent) {
    var keyCode = aEvent.keyCode;
    
    if (isLibraryVisible()) {
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
    } else {
	/* BACKSPACE goBack() on Windows only */
	if (keyCode == 8 && env.isWindows() && 
	    document.activeElement.tagName != "html:input" &&
	    document.activeElement.tagName != "html:textarea"
	   ) {
	    pageBack();
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
    /* Init all event handlers related to the HTML render Zone */
    initHtmlRendererEventListeners();
   
    /* Register WebProgress listener */
    var dls = Components.classes["@mozilla.org/docloaderservice;1"]
	.getService(nsIWebProgress);
    dls.addProgressListener(UIBrowserProgressListener,
			    nsIWebProgress.NOTIFY_LOCATION |
			    nsIWebProgress.NOTIFY_STATE_DOCUMENT);

    /* Finbar event */
    getFindBar().addEventListener("DOMAttrModified", toggleFindBarButton, true);

    /* Deal with key press */
    document.getElementById("main").addEventListener("keypress", handleKeyPress, true);

    /* Intercept global keydown and keyup events */
    getWindow().addEventListener("keydown", handleWindowKeyDown, true);
    getWindow().addEventListener("keydown", handleWindowKeyUp, true);

    /* Launch the part of the initialisation process which should run after the window is there */
    var gOS = Components.classes["@mozilla.org/observer-service;1"].
	getService(Components.interfaces.nsIObserverService);
    var observer = {
	observe: function(subject, topic, data) {
	    gOS.removeObserver(this, "xul-window-visible");
            if (!env.isSugar()) {
		manageDownloadRemoteBookList();
            }
	}
    }
    gOS.addObserver(observer, "xul-window-visible", false);    
    
    /* Kiwix called with ZIM file path on command line */
    document.addEventListener("onZimArg", function(e) { loadContentFromCommandLine(e.data) }, false);
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
    var defaultFilename = getTitle().replace(RegExp("( )", "g"), "_") + ".pdf";
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
    var webBrowserPrint = getHtmlRenderer().contentWindow
	.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
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
    var skinBackup = settings.skin();

    if (askPermissionToRestart(getProperty("changeSkinNeedRestart"))) {
	settings.skin(name);
	restart(true);
    } else {
	/* Rollback the checked skin in the menu  */
	settings.skin(skinBackup);
	populateSkinsMenu();
    }
}

function manageCheckIntegrity() {
    if (checkIntegrity()) {
	displayInfoDialog(getProperty("integrityCheckSuccessful"));
    } else {
	displayErrorDialog(getProperty("integrityCheckFailed"));
    }
}

function sendNotification(title, message, link, callback) {
    try {
	var listener = {  
	    observe: function(subject, topic, data) {  
		if (topic == "alertclickcallback" && link != undefined)
		    openUrlWithExternalBrowser(link);
		if (callback && typeof(callback) === "function")
		    callback(subject, topic, data);
	    }  
	}  

	var alertsService = Components.classes["@mozilla.org/alerts-service;1"].  
            getService(Components.interfaces.nsIAlertsService);  
	alertsService.showAlertNotification("chrome://mozapps/skin/downloads/downloadIcon.png",
					    title, message,
                                            link != undefined, link, listener, "");  
	
    } catch (error) {
        if (link)
            message = message + "\n" + link;
	displayInfoDialog(message, title);
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

function emptySearchBox() {
    getSearchBox().value = '';
}

/* SUGAR: Update search box label with page name */
function lostFocusOnSearchBox() {
    if (env.isSugar()) {
        getSearchBox().value = getTitle();
    }
}

function areColorsInverted() {
    return getInvertedColorsMenuItem().getAttribute('checked') == 'true';
}

function toggleInvertedColors(value) {
    if (value == undefined) {
	value = !areColorsInverted();
    }

    return getInvertedColorsMenuItem().setAttribute('checked', value);
}