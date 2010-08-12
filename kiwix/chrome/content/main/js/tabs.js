var currentHtmlRendererId = "html-renderer";

/* Display the tab header */
function showTabHeaders() {
    var tabHeaders = document.getElementById("tab-headers");
    tabHeaders.style.display = "block";
}

/* Add a new tab */
function openNewTab() {
    var id=randomString();

    var newHtmlRenderer = document.createElement("browser");
    newHtmlRenderer.setAttribute("type", "content");
    newHtmlRenderer.setAttribute("flex", "1");
    newHtmlRenderer.id = "html-renderer-" + id; 
    currentHtmlRendererId = newHtmlRenderer.id;

    var tabs = document.getElementById("tabs");
    var newTab = document.createElement("tabpanel");
    newTab.id = "tab-" + id; 
    newTab.appendChild(newHtmlRenderer);
    tabs.appendChild(newTab);

    var tabHeaders = document.getElementById("tab-headers");
    var newTabHeader = document.createElement("tab");
    newTabHeader.id = newTab.id + "-header"; 
    newTabHeader.setAttribute("onclick", "currentHtmlRendererId = '" + newHtmlRenderer.id + "'");
    newTabHeader.appendChild(document.createElement("label"));
    tabHeaders.appendChild(newTabHeader);

    initHtmlRendererEventListeners();
    
    var tabBox = tabs.parentNode;
    tabBox.selectedPanel = newTab;
    tabBox.selectedTab = newTabHeader;
}

/* Close current tab */
function closeTab(id) {
    var tabs = document.getElementById("tabs");
    var tabHeaders = document.getElementById("tab-headers");
}

/* Update the tab header */
function updateTabHeader() {
    var tabId = getHtmlRenderer().parentNode.id;
    var tabHeaderId = tabId + "-header";
    var tabHeader = document.getElementById(tabHeaderId);

    var title = getHtmlRenderer().contentTitle;
    var titleNode = tabHeader.childNodes[0];
    titleNode.setAttribute("value", title);
}

/* Return the HTML rendering object */
function getHtmlRenderer() {
    return document.getElementById(currentHtmlRendererId);  
}
