/* Global variables */
var _zoomFactor = 1.2;           /* Factor by which font is magnified or reduced with zoomIn() & zommOut() */

/* Return the HTML rendering object */
function getHtmlRenderer() {
    return document.getElementById("html-renderer");  
}

/* Load an url in the HTML rendere */
function loadArticle(url) {
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

/* Return the Progress meter object */
function getProgressBar() {
    return document.getElementById("progress-bar");
}

/* Return the results side bar */
function getResultsBar() {
    return document.getElementById("results-bar");
}

/* Return the list of results */
function getResultsList() {
    return document.getElementById("results-list");
}

/* Activate Search GUI elements */
function activateGuiSearchComponents() {
    getSearchBox().disabled = false;
    var searchButton = getSearchButton();
    searchButton.disabled = false;
    searchButton.removeEventListener("click", manageIndexZimFile, true);
    searchButton.addEventListener("click", manageSearchInIndex, true);
}

/* Desactivate Search GUI elements */
function desactivateGuiSearchComponents() {
    getSearchBox().disabled = true;
    var searchButton = getSearchButton();
    searchButton.disabled = true;
    searchButton.addEventListener("click", manageIndexZimFile, true);
    searchButton.removeEventListener("click", manageSearchInIndex, true);
}

/* Change result side bar visibility status */
function changeResultsBarVisibilityStatus() {
    getResultsBar().collapsed = false;
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
    if (url.href.indexOf("zim://", 0)==0) {
	return true;
    } else {
	return false;
    }
}

/* Update the status bar if mouse is over a link */
function mouseOver(aEvent) {
    var url = aEvent.target;

    if (url instanceof HTMLAnchorElement) {
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

/* Start or end Fullscreen */
function changeFullScreenStatus() {
    if (document.getElementById('display-fullscreen').getAttribute('checked')) {
	setTimeout('window.fullScreen = true;', 1); 
    } else {
	setTimeout('window.fullScreen = false;', 1); 
    }
}

/* Make the status bar (in)visible */
function changeStatusBarVisibilityStatus() {
    if (document.getElementById('display-statusbar').getAttribute('checked')) {
	document.getElementById('status-bar').collapsed = false;
    } else {
	document.getElementById('status-bar').collapsed = true;
    }
}

/* Make the progress bar (in)visible */
function changeProgressBarVisibilityStatus(visible) {
    if (visible == undefined) {
	visible = !getProgressBar().collapsed;
    }

    if (visible) {
        getProgressBar().collapsed = false;
    } else {
	getProgressBar().collapsed = true;
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
    } catch (exception) {
	alert(exception);
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
    } catch (exception) {
	alert(exception);
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
	    settings.zimFilePath(fp.file.path);

	    /* Load the ZIM file welcome page */
	    goHome();

	    /* Ask to index */
	    manageIndexZimFile();
	}
    } else {
	return false;
    }

    return true;
}

/* Empty the results list */
function emptyResultsList() {
    var resultsList = getResultsList();

    while (resultsList.hasChildNodes()) {
	resultsList.removeChild( resultsList.lastChild );
    }
}

/* Add a list item to the results list */
function addResultToList(url, title, score){
    
    // get the result list object
    var resultsList = getResultsList();

    var slideWidth = 200;

    // create the scoreslide
    var scoreslide = document.createElement("hbox");
    scoreslide.setAttribute("flex", "0");
    var scoreslidef = document.createElement("box");
    var slideWidth = score*2; if ( slideWidth > 180 ) slideWidth = 180;
    scoreslidef.setAttribute("class", "score-slide" );
    scoreslidef.setAttribute("style", "cursor:pointer; width:"+slideWidth+"px;");
    scoreslide.appendChild(scoreslidef);
    
    // set label of the richlist item
    var titre = document.createElement("label");
    titre.setAttribute("class", "answer-label");
    titre.setAttribute("value", title);
    titre.setAttribute("tooltiptext", title);
    titre.setAttribute("flex", "0");
    titre.setAttribute("crop", "end");

    // create the stack
    var titrescore = document.createElement("stack");
    titrescore.setAttribute("flex", "0");
    titrescore.appendChild(scoreslide);
    titrescore.appendChild(titre);

    // create a new richlist item
    var li = document.createElement("richlistitem");
    li.setAttribute("onclick", "loadArticle('zim://" + url + "')");
    li.setAttribute("flex", "0");
    li.setAttribute("style", "cursor:pointer;");
    li.appendChild(titrescore);

    // add the item to the list
    resultsList.appendChild(li);

    return true;
}