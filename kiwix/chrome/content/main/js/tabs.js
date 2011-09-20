var currentTabId = "00000000";

/* adds a css class to an element */
function addClass(elem, className) {
    var classes = elem.className.split(' ');
    for (var i=0; i < classes.length; i++) {
        if (className.toLowerCase() == classes[i].toLowerCase())
            return;
    }
    elem.className += ' ' + className;
    elem.className = elem.className.trim();
}

/* removes a css class from an element */
function removeClass(elem, className) {
    var newClass = "";
    var classes = elem.className.split(' ');
    for (var i=0; i < classes.length; i++) {
        if (className.toLowerCase() != classes[i].toLowerCase())
            newClass += classes[i] + ' ';
    }
    elem.className = newClass.trim();
}

/* Display the tab header */
function showTabHeaders() {
    var tabHeaders = document.getElementById("tab-headers");
    tabHeaders.style.display = "block";
}

function tabsAreVisible() {
    return document.getElementById('tab-headers').style.display != 'none';
}

/* Make the tabs (in)visible */
function changeTabsVisibilityStatus(set_visible, save) {
    var tabHeaders = document.getElementById("tab-headers");
    var is_visible = tabsAreVisible();
    var vis_value = (set_visible == undefined ? !is_visible : set_visible);
    var main = document.getElementById('main');
    tabHeaders.style.display = (vis_value == true ? "block" : "none");
    document.getElementById('display-tabs').setAttribute('checked', vis_value);
    if (vis_value) {
        removeClass(main, 'notabs');
        addClass(main, 'tabs');
    } else {
        removeClass(main, 'tabs');
        addClass(main, 'notabs');
    }
    if (save) 
	settings.displayTabs(vis_value);
}

/* Add a new tab */
function openNewTab(focus) {
    focus = (focus == undefined ? true : focus);
    changeTabsVisibilityStatus(true);

    var id=randomString();

    var newHtmlRenderer = document.createElement("browser");
    newHtmlRenderer.setAttribute("type", "content");
    newHtmlRenderer.setAttribute("flex", "1");
    newHtmlRenderer.id = "html-renderer-" + id; 

    var addButton = document.getElementById('tabs-add-button');

    var tabPanels = document.getElementById("tab-panels"); 
    var newTabPanel = document.createElement("tabpanel");
    newTabPanel.id = "tab-panel-" + id; 
    newTabPanel.appendChild(newHtmlRenderer);
    if (tabPanels.lastChild == null)
        tabPanels.appendChild(newTabPanel);
    else
        tabPanels.insertBefore(newTabPanel, tabPanels.lastChild.nextSibling);

    var tabHeaders = document.getElementById("tab-headers");
    var newTabHeader = document.createElement("tab");
    newTabHeader.id = "tab-header-" + id; 
    newTabHeader.setAttribute("onclick", "switchTab(null, this)");
    newTabHeader.setAttribute("class", "tab-header");

    var closeButton = document.createElement("toolbarbutton");
    closeButton.id = 'tab-close-button-' + id;
    closeButton.setAttribute('oncommand', 'closeThatTab("'+ id +'")');
    closeButton.setAttribute('class', 'tabs-close-button');

    var newTabHeaderLabel = document.createElement("label");
    newTabHeaderLabel.setAttribute("class", "tab-header-label");
    newTabHeaderLabel.setAttribute("crop", "right");
    newTabHeader.appendChild(newTabHeaderLabel);
    tabHeaders.insertBefore(newTabHeader, addButton);
    tabHeaders.insertBefore(closeButton, tabHeaders.lastChild);

    initHtmlRendererEventListeners(id);

    if (focus)
	switchTab(id);

    return id;
}

function closeCurrentTab() {
    closeThatTab(currentTabId);
}

function closeThatTab(tabId) {
    var tabs = document.getElementById("tabs");
    var tabHeaders = document.getElementById("tab-headers");
    var tabPanels = document.getElementById("tab-panels");
    var tabPanel = document.getElementById("tab-panel-" + tabId);
    var tabHeader = document.getElementById("tab-header-" + tabId);
    var closeButton = document.getElementById('tab-close-button-' + tabId);

    // default fall back destination
    var newCurrentTab = '000000';

    // we try to get next tab on right as destination
    // if there's none, we get the one on left.
    // *anyway* if current page is not the one removed, we stay there.
    try { var rightTab = closeButton.nextSibling; } catch (e) { var rightTab = null; }
    if (rightTab.id == 'tabs-add-button') {
        // no tab on the right, let's retrieve the one on the left.
        try {
            leftTab = closeButton.previousSibling.previousSibling.previousSibling;
            newCurrentTab = tabIDfromID(leftTab.id);
        } catch (e) { var leftTab = null; }
    } else {
        newCurrentTab = tabIDfromID(rightTab.id);
    }

    // remove tab elements including close button.
	tabHeaders.removeChild(tabHeader);
	tabPanels.removeChild(tabPanel);
    tabHeaders.removeChild(closeButton);

    // if current page is not the one being deleted
    // we stay where we are.
    if (currentTabId != tabId)
        newCurrentTab = currentTabId;

    // if we removed all tabs, disable tab mode and display help page.
    if (document.getElementsByTagName('tab').length == 0) {
	manageUnload(true);
        showHelp(true);
        changeTabsVisibilityStatus(false, true);
        _restore_tab = null;
        return;
    }

    switchTab(newCurrentTab, null);
}

function tabIDfromID(id) {
    var x = id.split('tab-header-', 2);
    return x[1];
}

/* Switch Tab */
function switchTab(tabId, tab) {
    if (tabId == null)
        var tabId = tabIDfromID(tab.id);
    var tabBox = document.getElementById("tab-box");
    var tabHeader = document.getElementById("tab-header-" + tabId);
    var tabPanel = document.getElementById("tab-panel-" + tabId);
    tabBox.selectedTab = tabHeader;
    tabBox.selectedPanel = tabPanel;
    currentTabId = tabId;
    updateHistoryNavigationButtons();
    getFindBar().browser = getHtmlRenderer();
    var title = getHtmlRenderer(tabId).contentTitle;
    setWindowsTitle(title);

    if (_winIsFullScreen)
        addFSEventToTab(tabId);
}

/* Update the tab header */
function updateTabHeader(tabId) {
    var tabHeaderId = "tab-header-" + tabId;
    var tabHeader = document.getElementById(tabHeaderId);
    var title = getHtmlRenderer(tabId).contentTitle;
    var titleNode = tabHeader.childNodes[0];
    titleNode.setAttribute("value", title);
    tabHeader.setAttribute("tooltiptext", title);
    setWindowsTitle(title);
}

/* Update windows title */
function setWindowsTitle(title) {
    if (title != "") {
	document.title = title + " - " + getWindow().getAttribute("titlemodifier");
    }
}

/* Return the HTML rendering object */
function getHtmlRenderer(tabId) {
    if (tabId == undefined) {
	tabId = currentTabId;
    }
    return document.getElementById("html-renderer-" + tabId);  
}

/* Create new tab. open it and adjust UI */
function switchToNewTab() {
    openNewTab();
    getSearchBox().value = '';
    getSearchBox().focus();
}

/* Close all tabs */
function closeAllTabs(noConfirm) {
    var tabHeaders = getTabHeaders().getElementsByTagName('tab');
    var tabHeadersLength = tabHeaders.length

    if (tabHeadersLength > 1) {
	if (noConfirm || displayConfirmDialog("This will close all your tabs. Are you sure you want to continue?", "Close tabs")) {
	    for (var i=tabHeadersLength-1; i>0; i--) {
		var node = tabHeaders[i];
		var id = node.getAttribute('id').replace("tab-header-", "");
		closeThatTab(id);
	    }
	} else {
	    return false;
	}
    }
    
    return true;
}

/* return tab (tab-panel elem) from tabId */
function tabById(tabId) {
    return document.getElementById('tab-panel-' + tabId);
}

/* Add FullScreen MouseOver Event to tab's HTML renderer */
function addFSEventToTab(tabId) {
    var tab = tabById(tabId);
    var html = tab.getElementsByTagName('browser');
    html = html[0];
    html.addEventListener("mouseover", hideFullScreenToolBox, false);
}

/* Remove FullScreen MouseOver Event from tab's HTML renderer */
function removeFSEventFromTab(tabId) {
    try {
        var tab = tabById(tabId);
        var html = tab.getElementsByTagName('browser');
        html = html[0];
    } catch (e) {
        html = getHtmlRenderer();
    }
    html.removeEventListener("mouseover", hideFullScreenToolBox, false);
}

/* Launch removeFSEventFromTab for all tabs */
function removeFSEventFromTabs() {
    var alltabs = document.getElementsByTagName('tabpanel');
    for (var i=0; i < alltabs.length ; i++) {
        removeFSEventFromTab(alltabs[i].id);
    }
}

/* Switch to the tab before */
function tabBack() {
    var tabHeaders = getTabHeaders().getElementsByTagName('tab');
    var tabHeadersLength = tabHeaders.length;

    if (tabHeadersLength > 1) {
	for (var i=0; i<tabHeadersLength; i++) {
	    var node = tabHeaders[i];
	    var id = tabIDfromID(node.getAttribute('id'));
	    if (id == currentTabId) {
		if (i>0) {
		    id = tabIDfromID(tabHeaders[i-1].getAttribute('id'));
		} else {
		    id = tabIDfromID(tabHeaders[tabHeadersLength-1].getAttribute('id'));
		}
		switchTab(id);
		return true;
	    }
	}
    }

    return false;
}

/* Switch to next tab */
function tabNext() {
    var tabHeaders = getTabHeaders().getElementsByTagName('tab');
    var tabHeadersLength = tabHeaders.length;

    if (tabHeadersLength > 1) {
	for (var i=0; i<tabHeadersLength; i++) {
	    var node = tabHeaders[i];
	    var id = tabIDfromID(node.getAttribute('id'));
	    if (id == currentTabId) {
		if (i<tabHeadersLength-1) {
		    id = tabIDfromID(tabHeaders[i+1].getAttribute('id'));
		} else {
		    id = tabIDfromID(tabHeaders[0].getAttribute('id'));
		}
		switchTab(id);
		return true;
	    }
	}
    }

    return false;
}

/* Save and load all tabs content */
function manageSaveTabs() {
    if (settings.saveTabs()) {
	saveTabs();
    } else {
	settings.savedTabs("");
    }
}

function saveTabs() {
    var tabPanels = document.getElementById("tab-panels"); 
    var browsers = tabPanels.getElementsByTagName('browser');
    var savedTabs = ""
    for (var i=0; i < browsers.length ; i++) {
	var browser = browsers[i];
	var scrollY = browser.contentWindow.scrollY;
	var uri = browser.currentURI;
	savedTabs += (browser == getHtmlRenderer() ? "F" : "") + scrollY + "|" + uri.spec + ";";
    }
    settings.savedTabs(savedTabs);
}

function restoreTabs() {
    var tabPanels = document.getElementById("tab-panels"); 
    var savedTabsString = settings.savedTabs();
    var savedTabs = savedTabsString.split(';');
    for (var i=0; i < savedTabs.length; i++) {
	var uri = savedTabs[i];
	if (uri != "") {
	    var focus = false;
	    if (uri.substring(0, 1) == "F") {
		focus = true;
		uri = uri.substring(1);
	    }

	    var tmp = uri.split('|');
	    var scrollY = tmp[0];
	    uri = tmp[1];

	    var id;
	    if (i > 0) {
		manageOpenUrlInNewTab(uri, focus, scrollY);
	    } else {
		manageOpenUrl(uri, undefined, scrollY);
	    }
	}
    }
}
