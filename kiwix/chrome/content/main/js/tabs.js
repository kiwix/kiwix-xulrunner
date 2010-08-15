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
    tabPanels.appendChild(newTabPanel);

    var tabHeaders = document.getElementById("tab-headers");
    var newTabHeader = document.createElement("tab");
    newTabHeader.id = "tab-header-" + id; 
    newTabHeader.setAttribute("onclick", "currentTabId = '" + id + "'");
    newTabHeader.setAttribute("refererTabId", refererTabId);
    newTabHeader.appendChild(document.createElement("label"));
    tabHeaders.insertBefore(newTabHeader, tabHeaders.lastChild);

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
}

/* Return the HTML rendering object */
function getHtmlRenderer() {
    return document.getElementById("html-renderer-" + currentTabId);  
}
