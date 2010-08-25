var currentTabId = "00000000";

/* Display the tab header */
function showTabHeaders() {
    var tabHeaders = document.getElementById("tab-headers");
    tabHeaders.style.display = "block";
}

/* Add a new tab */
function openNewTab() {
    var id=randomString();
    var refererTabId = currentTabId;

    var newHtmlRenderer = document.createElement("browser");
    newHtmlRenderer.setAttribute("type", "content");
    newHtmlRenderer.setAttribute("flex", "1");
    newHtmlRenderer.id = "html-renderer-" + id; 

    var tabPanels = document.getElementById("tab-panels");
    var newTabPanel = document.createElement("tabpanel");
    newTabPanel.id = "tab-panel-" + id; 
    newTabPanel.appendChild(newHtmlRenderer);
    tabPanels.insertBefore(newTabPanel, tabPanels.lastChild.nextSibling);

    var tabHeaders = document.getElementById("tab-headers");
    var newTabHeader = document.createElement("tab");
    newTabHeader.id = "tab-header-" + id; 
    newTabHeader.setAttribute("onclick", "switchTab('" + id + "')");
    newTabHeader.setAttribute("refererTabId", refererTabId);
    newTabHeader.setAttribute("class", "tab-header");
    var newTabHeaderLabel = document.createElement("label");
    newTabHeaderLabel.setAttribute("class", "tab-header-label");
    newTabHeaderLabel.setAttribute("crop", "right");
    newTabHeader.appendChild(newTabHeaderLabel);
    tabHeaders.insertBefore(newTabHeader, tabHeaders.lastChild.nextSibling);
    var closeButton = document.getElementById("tabs-close-button");
    tabHeaders.insertBefore(closeButton, tabHeaders.lastChild.nextSibling);

    switchTab(id);

    initHtmlRendererEventListeners();
}

/* Close current tab */
function closeCurrentTab() {
    var tabs = document.getElementById("tabs");
    var tabHeaders = document.getElementById("tab-headers");
    var tabPanels = document.getElementById("tab-panels");
    var currentTabPanel = document.getElementById("tab-panel-" + currentTabId);
    var currentTabHeader = document.getElementById("tab-header-" + currentTabId);
    var refererTabId = currentTabHeader.getAttribute("refererTabId");

    /* Avoid to close the first tab */
    if (refererTabId != "") {
	tabHeaders.removeChild(currentTabHeader);
	tabPanels.removeChild(currentTabPanel);
	
	/* If the referer tab was already closed */
	if ( document.getElementById("tab-panel-" + refererTabId) == undefined) {
	    refererTabId = "00000000";
	}

	switchTab(refererTabId);
    }
}

/* Switch Tab */
function switchTab(tabId) {
    var tabBox = document.getElementById("tab-box");
    var tabPanel = document.getElementById("tab-panel-" +  tabId);
    var tabHeader = document.getElementById("tab-header-" +  tabId);
    tabBox.selectedPanel = tabPanel;
    tabBox.selectedTab = tabHeader;
    currentTabId = tabId;
}

/* Update the tab header */
function updateTabHeader() {
    var tabHeaderId = "tab-header-" + currentTabId;
    var tabHeader = document.getElementById(tabHeaderId);
    var title = getHtmlRenderer().contentTitle;
    var titleNode = tabHeader.childNodes[0];
    titleNode.setAttribute("value", title);
    tabHeader.setAttribute("tooltiptext", title);

    if (title != "") {
	document.title = title + " - " + getWindow().getAttribute("titlemodifier");
    }
}

/* Return the HTML rendering object */
function getHtmlRenderer() {
    return document.getElementById("html-renderer-" + currentTabId);  
}
