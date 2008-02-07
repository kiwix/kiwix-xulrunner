/*  moulin - offline wikipedia distro
    Copyright (C) 2006-2007, Kunnafoni Foundation and contributors
    
    Contributor(s):
        LinterWeb (France)
        Emmanuel Engelhart
        reg <reg@nurv.fr>

    This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation; either version 2 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program; if not, write to the Free Software
    Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307  USA */

/*
 * set of variables and functions to handle
 * the moulin interactions.
 * requierments:
 *  - global.js
 * 	- L class (logger.js)
 */

// will hold all the UI elem we want to keep in memory.  
var moulinUI = {};
moulinUI.macResizeInterval	= null;
moulinUI.findInPageDatas	= null;
moulinUI.findBarOpened		= false;
moulinUI.textZoomFactor		= 1.3;
moulinUI.searchEngine		= 'encyclopedia';
moulinUI.winIsFullScreen	= false;
moulinUI.sideBarIsVisible	= false;
var gFindBar				= null; // findbar binding

/* UI functions */

function UIInitElements () {
	// the <browser> containing webpages.
	moulinUI.browser			= UIGetBrowser ();
	moulinUI.searchField		= UIGetSearchField ();
	moulinUI.searchEngineButton	= UIGetSearchEngineButton ();
	moulinUI.sideBar			= UIGetSideBar ();
	moulinUI.bookmarkListBox	= UIGetBookmarkListBox ();
	moulinUI.notesTextBox		= UIGetNotesTextBox ();
	gFindBar					= document.getElementById("FindToolbar");
}

function UIGetBrowser () {
	return document.getElementById ('content-browser');
}

function UIGetSearchField () {
	return document.getElementById ('searchbar');
}

function UIGetSideBar () {
	return document.getElementById ('moulin-sidebar');
}

function UIGetSearchEngineButton () {
	return document.getElementById ('search');
}

function UIGetBookmarkListBox () {
	return document.getElementById ('bookmarkListBox');
}

function UIGetNotesTextBox () {
	return document.getElementById ('notesTextBox');
}

/*
 * on the Mac, page display is buggy at launch
 * resizing the main windows refreshes it correctly
 * so this function is launched (with delay) on init.
 */
function UIResizeWindows () {
	window.fullScreen = 'true';
	try {
		clearInterval (moulinUI.macResizeInterval);
	} catch (e) {
		L.error ("Can't clear interval from UIResizeWindows:" + e.toString ());
	}
}

/*
 * Tells the browser to display it's homepage
 * that the value of the `homepage` attribute, not the initial src.
 */
function UINavGoHome () {
	try {
		moulinUI.browser.goHome ();
	} catch (e) {
		L.info ("can't go home, not set ?:" + e.toString ());
	}
}

/*
 * Launched by toolbar Back button ; forwards to browser
 */
function UINavBack () {
	try {
		moulinUI.browser.stop ();
		moulinUI.browser.goBack ();
		return true;
	} catch (e) {
		return false;
	}
}

/*
 * Launched by toolbar Forward button ; forwards to browser
 */
function UINavForward () {
	try {
		moulinUI.browser.stop ();
		moulinUI.browser.goForward ();
		return true;
	} catch (e) {
		return false;
	}
}

/*
 * Opens the Find in Page dialog.
 */
function UIFindInPage (aMode) {
	// calls the Findbar bindings.
	if (moulinUI.findBarOpened) {
		moulinUI.findBarOpened	= false;
		return gFindBar.close();	
	} else {
		moulinUI.findBarOpened	= true;
		return gFindBar.startFind(aMode);
	}
}

/*
 * Opens the print dialog and print current page.
 */
function UIPrintPage () {
	try {
		return PrintUtils.print ();
		//PrintUtils.printPreview ();
		//PrintUtils.showPageSetup ();
	} catch (e) {
		L.error ("can't call print dialog:" + e.toString ());
		return false;
	}
}

/*
 * Copies in-browser selection to browser pasteboard
 */
function UICopySelection () {
	try {
		moulinUI.browser.contentViewerEdit.copySelection ();
	} catch (e) {
		L.error ("can't copy selection:" + e.toString ());
	}
}

/*
 * selectAll in browser
 */
function UISelectAll () {
	try {
		moulinUI.browser.contentViewerEdit.selectAll ();
	} catch (e) {
		L.error ("can't select all:" + e.toString ());
	}
}

/*
 * Increase all font sizes by factor on page
 */
function UITextBigger () {
	try {
		moulinUI.browser.markupDocumentViewer.textZoom *= moulinUI.textZoomFactor;
	} catch (e) {
		L.error ("can't make text bigger:" + e.toString ());
	}
}

/*
 * Decrease all font sizes by factor on page
 */
function UITextSmaller () {
	try {
		moulinUI.browser.markupDocumentViewer.textZoom /= moulinUI.textZoomFactor;
	} catch (e) {
		L.error ("can't make text smaller:" + e.toString ());
	}
}

function UIFocusOnSearch () {
	try {
		moulinUI.searchField.focus ();
	} catch (e) {
		L.error ("can't focus on search field");
	}
}

/*
 * Opens URL with default browser/handler
 */
function UIOpenExternalURI (url) {
	try { 
		var extps = Components
		.classes ["@mozilla.org/uriloader/external-protocol-service;1"]
		.getService ()
		.QueryInterface (Components.interfaces.nsIExternalProtocolService);
	
		var ioService = Components.classes ["@mozilla.org/network/io-service;1"]
		.getService ().QueryInterface (Components.interfaces.nsIIOService);
	
		extps.loadUrl (ioService.newURI (url, null, null));
	} catch (e) {
		L.error ("can't open url with default browser:" + e.toString ());
	}
}

/*
 * helper to load any URI on browser
 */
function UINavGoTo (url) {
	try {
		moulinUI.browser.loadURI (url, null, null);
	} catch (e) {
		L.error ("can't load URL:" + e.toString ());
	}
}

/*
 * Called by toolbar command : launch a search based on field's value.
 */
function UINavSearch () {
	var searchString = moulinUI.searchField.value;
	var prefs = Components.classes["@mozilla.org/preferences-service;1"]
		.getService(Components.interfaces.nsIPrefBranch);
	var default_language_data = prefs.getCharPref("moulin.datas.language");
	try {
		UINavGoTo ("moulin-search://" + moulinUI.searchEngine + "/" + default_language_data + "/" + searchString);
	} catch (e) {
		L.error (e.toString ());
	}
}

/*
 * Enable/Disable fullscreen mode. Acts as window maximizer on mac.
 */
function UIToggleFullScreen () {
	if (moulinUI.winIsFullScreen) {
		window.fullScreen = false;
		moulinUI.winIsFullScreen = false;
	} else { 
		window.fullScreen = true;
		moulinUI.winIsFullScreen = true;
	}
}

/*
 * Display/Hide the Bookmarks&Notes sidebar.
 */
function UIToggleSideBar () {
	if (moulinUI.sideBarIsVisible) {
		moulinUI.sideBar.hidden = true;
		moulinUI.sideBarIsVisible = false;
	} else {
		WarnOnSideBar ();
		moulinUI.sideBar.hidden = false;
		moulinUI.sideBarIsVisible = true;
	}
}

/*
 * Called by click on a search engine in the SE list.
 * Switch the SE icon on bar and modify search target.
 */
function UIChangeSearchEngine (project) {
	try {
		moulinUI.searchEngineButton
		.style.backgroundImage = 'url(chrome://moulin/content/projects/'+project+'_list.png)';
		//.setAttribute('image', 'chrome://moulin/content/projects/'+project+'_list.png');
		moulinUI.searchEngine = project;
	} catch (e) {
		L.error ("can't change search engine:" + e.toString ());
	}
}

/*
 * Called on window (ie. the App) close.
 * removes the .kunnafoni directory on disk.
 */
function UIDoOnClose () {

	var prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
	var askConfirm = prefs.getBoolPref("moulin.removeprofileonclose.confirm");

	if (askConfirm) {

		var strbundle		= document.getElementById ("strings");
		var exitAlertTitle	= strbundle.getString ("exitAlertTitle");
		//var exitAlertOS		= strbundle.getFormattedString("exitAlert_"+moulinNFO.OS.type, [ moulinNFO.OS.string ]);
		var exitAlert		= strbundle.getString("exitAlert");
		var exitAlertDeleteBtn = strbundle.getString ("exitAlertDeleteBtn");
		var exitAlertKeepBtn = strbundle.getString ("exitAlertKeepBtn");
		var exitAlertCheckBox = strbundle.getString ("exitAlertCheckBox");
	
			var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
                        .getService(Components.interfaces.nsIPromptService);
			var check = {value: false}; // default the checkbox to false

			var flags = prompts.BUTTON_POS_0 * prompts.BUTTON_TITLE_IS_STRING +
						prompts.BUTTON_POS_1 * prompts.BUTTON_TITLE_IS_STRING;

			var button = prompts.confirmEx(null, exitAlertTitle, exitAlert, flags, exitAlertDeleteBtn, exitAlertKeepBtn, "", exitAlertCheckBox, check);
			L.info ('answer: '+button+' check: '+check.value);

			var userWantsDeletion = (button == 0);
			moulinNFO.cleanOnClose = userWantsDeletion;
			moulinNFO.cleanOnClose = userWantsDeletion;
			
			if (check.value) {
				prefs.setBoolPref("moulin.removeprofileonclose.confirm", false);
				prefs.setBoolPref("moulin.removeprofileonclose", userWantsDeletion);
				//moulinNFO.cleanOnClose = GetCleanOnClose ();
			}
	} else {
		L.info ('using stored choice...');	
	}

	if (!moulinNFO.cleanOnClose) {
		L.info ('keeping Bookmarks & Notes...');
		return;
	}
	
	// bookmarks
	L.info ('purging Bookmarks');
	try {
		purgeBookmarks ();
	} catch (e) { L.info (e.toString ()); }

	// Notes
	L.info ('purging Notes');
	try {
		purgeNotes ();
	} catch (e) { L.info (e.toString ()); }

	// history
	L.info ('purging History');
	var globalHistory = Components.classes["@mozilla.org/browser/global-history;2"]
                                      .getService(Components.interfaces.nsIBrowserHistory);
	globalHistory.removeAllPages();
        
	try {
		var os = Components.classes["@mozilla.org/observer-service;1"]
                             .getService(Components.interfaces.nsIObserverService);
		os.notifyObservers(null, "browser:purge-session-history", "");
	}
	catch (e) { }
        
		// Clear last URL of the Open Web Location dialog
	var prefs = Components.classes["@mozilla.org/preferences-service;1"]
                              .getService(Components.interfaces.nsIPrefBranch2);
	try {
		prefs.clearUserPref("general.open_location.last_url");
	}
	catch (e) { }

	// cache
	L.info ('purging Cache');
	const cc = Components.classes;
	const ci = Components.interfaces;
	var cacheService = cc["@mozilla.org/network/cache-service;1"]
                             .getService(ci.nsICacheService);
	try {
		cacheService.evictEntries(ci.nsICache.STORE_ANYWHERE);
	} catch(er) {}

	// cookies (shouldn't be any)
	L.info ('purging Cookies');
	var cookieMgr = Components.classes["@mozilla.org/cookiemanager;1"]
                                  .getService(Components.interfaces.nsICookieManager);
	cookieMgr.removeAll();

}


