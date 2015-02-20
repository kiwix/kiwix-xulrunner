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

/* DOM Element accessors */
function getWindow() { return document.getElementById("main"); }
function getTabHeaders() { return document.getElementById("tab-headers"); }
function getSearchBox() { return document.getElementById("textbox-search"); }
function getHomeButton() { return document.getElementById("button-home"); }
function getBookmarksButton() { return document.getElementById("button-bookmarks"); }
function getFindButton() { return document.getElementById("button-search-article"); }
function getFullscreenButton() { return document.getElementById("button-fullscreen"); }
function getPrintButton() { return document.getElementById("button-print"); }
function getSearchInPlaceButton() { return document.getElementById("button-search-article"); }
function getBackButton() { return document.getElementById("button-back"); }
function getZoomInButton() { return document.getElementById("button-zoom-in"); }
function getZoomOutButton() { return document.getElementById("button-zoom-out"); }
function getLibraryButton() { return document.getElementById("button-library"); }
function getFindBar() { return document.getElementById("find-bar"); }
function getNextButton() { return document.getElementById("button-next"); }
function getSearchLabel() { return document.getElementById("search-label"); }
function getCheckIntegrityMenuItem() { return document.getElementById("tools-checkIntegrity"); }
function getLaunchIndexingMenuItem() { return document.getElementById("tools-launchIndexing"); }
function getLoadRandomArticleMenuItem() { return document.getElementById("tools-randomArticle"); }
function getPurgeHistoryMenuItem() { return document.getElementById("tools-purgeHistory"); }
function getProgressBar() { return document.getElementById("progress-bar"); }
function getProgressBarLabel() { return document.getElementById("progress-bar-label"); }
function getBookmarksBar() { return document.getElementById("bookmarks-bar"); }
function getBookmarksList() { return document.getElementById("bookmarks-list"); }
function getNotesBox() { return document.getElementById("notesTextBox"); }
function GetBookmarksSetsList() { return document.getElementById('bookmarks-sets-list'); }
function getBookmarksSetsPopup() { return document.getElementById('bookmarks-sets'); }
function getInvertedColorsMenuItem() { return document.getElementById("display-inverted-colors"); }

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
	activateToolbarButton(getZoomInButton());
	activateToolbarButton(getZoomOutButton());
}

function desactivateZoomButtons() {
	desactivateToolbarButton(getZoomInButton());
	desactivateToolbarButton(getZoomOutButton());
}


