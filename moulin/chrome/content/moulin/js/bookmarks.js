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


var BookmarkNFO			= {};
BookmarkNFO.currentSet	= null;
BookmarkNFO.defaultSet	= null;
BookmarkNFO.externalSet	= null;
// function passed to Array.some() to test if a bk exists. (indexOf n/a)
BookmarkNFO.itemInSet	= function (element, index, array) { 
	return (element['title'] == this['title'] && element['uri'] == this['uri']);
};

function InitializeBookmarks () {
	// default set is fixed in user's profile
	BookmarkNFO.defaultSet = new BookmarkSet ();
	// loading default file
	var file = Components.classes["@mozilla.org/file/directory_service;1"]
	                     .getService (Components.interfaces.nsIProperties)
	                     .get ("ProfD", Components.interfaces.nsIFile);
	file.append ("bookmarks.moulinbk");
	BookmarkNFO.defaultSet.LoadFromFile (file);
	// displaying default set.
	BookmarkNFO.currentSet = BookmarkNFO.defaultSet;
	try {
		DisplayBookmarkSet (BookmarkNFO.defaultSet);
	} catch (e) {
		L.error( "can't display"+e.toString ());
	}
}


/*
 * getFileContent takes a nsIFile as param and returns its text content.
 */
function getFileContent (file) {
	var dataString = "";

	var fis = Components.classes ["@mozilla.org/network/file-input-stream;1"]
	.createInstance (Components.interfaces.nsIFileInputStream);
	fis.init (file, -1, 0, 0);
	
	var charset = "UTF-8";
	const replacementChar = Components.interfaces.nsIConverterInputStream.DEFAULT_REPLACEMENT_CHARACTER;
	var is = Components.classes ["@mozilla.org/intl/converter-input-stream;1"]
	.createInstance (Components.interfaces.nsIConverterInputStream);
	is.init (fis, charset, 1024, replacementChar);
	var str = {};
	while (is.readString (4096, str) != 0) {
		dataString += str.value;
	}
	return dataString;
}

/*
 * writeToFile takes a nsIFile and text string as params and writes it to the f.
 */
function writeToFile (file, content) {
	var charset = "UTF-8";
	var os = Components.classes["@mozilla.org/intl/converter-output-stream;1"]
	.createInstance(Components.interfaces.nsIConverterOutputStream);
	
	var fos = Components.classes["@mozilla.org/network/file-output-stream;1"]
	.createInstance(Components.interfaces.nsIFileOutputStream);
	fos.init(file, 0x02 | 0x08 | 0x20, 0666, 0); // write, create, truncate

	os.init(fos, charset, 0, 0x0000);

	os.writeString (content);

	os.close ();
	fos.close ();
}

/*
 *  BookmarkSet object
 */
function BookmarkSet () {
	this.items	= [];
	this.file	= null;

	// Load the stored object to this.items
	this.LoadFromFile	= function (file) {
		this.file = file;
		try {
			var fc = this.getFileContent (this.file);
			this.items = MLBookmarks.parse (fc);
		} catch (e) {
			L.error ("can't parse bookmark file");
		}
	};
	// saves items to default file.
	this.save = function () {
		try {
			var fileContent = MLBookmarks.dump (this.items);
			this.writeToFile (this.file, fileContent);
		} catch (e) {
			L.error ("can't parse bookmark file");BookmarkNFO.externalSet
		}
	};
	// retrieves an bookmark from it's index
	this.itemAt = function (i) {
		return this.items [i];
	};
	// remove a bookmark
	this.removeBookmark = function (title, uri) {
		var l = this.items.length;
		var newA = [];
		for (var i=0; i<l; i++) {
			if (this.items[i]['title'] != title && this.items['uri'] != uri) {
				newA.push (this.items[i]);
			}
		}
		this.items = newA;
		this.save ();var testItemInSet = function (element, index, array) { 
		return (element['title'] == this['title'] && element['uri'] == this['uri']);
	}
	};
	// helper functions
	this.getFileContent = getFileContent;
	this.writeToFile	= writeToFile;
};

/*
 * removes items from list box and add new ones. called on set change.
 */
function DisplayBookmarkSet (set) {
	UIEmptyBookmarkListBox ();
	L.info ('changing bookmark set');
	var dbss = set.items.length;
	for (var i = 0; i <= dbss; i++) {
		var bk = set.itemAt(i);
//		L.info ('adding: ' + set.itemAt(i)['title']);
		AddBookmarkLine (set.itemAt(i)['title'], set.itemAt(i)['uri']);
	}
}

function UIEmptyBookmarkListBox () {
	L.info ('emptying bookmark list');
	var l = moulinUI.bookmarkListBox.getRowCount ();
	for (var i=l -1; i>=0; i--) {
//		L.info ('removing from '+moulinUI.bookmarkListBox+' at '+i);
		try {
			moulinUI.bookmarkListBox.removeItemAt(i);
		} catch (e) {
			L.error ('error deleting bookmark: '+e);
		}
	}
}

function UILoadExternalBookmarkFile () {
	var nsIFilePicker = Components.interfaces.nsIFilePicker;
	var fp = Components.classes ["@mozilla.org/filepicker;1"]
	.createInstance(nsIFilePicker);
	fp.init(window, "Select a File", nsIFilePicker.modeOpen);
	//fp.appendFilters(nsIFilePicker.filterXML);
	fp.appendFilter("moulin Bookmarks", "*.moulinbk");
	var res = fp.show();
	if (res == nsIFilePicker.returnOK) {
		var thefile = fp.file;
	} else {
		return false;
	}

	BookmarkNFO.externalSet = new BookmarkSet ();
	BookmarkNFO.externalSet.LoadFromFile (thefile);
	BookmarkNFO.currentSet = BookmarkNFO.externalSet;
	try {
		DisplayBookmarkSet (BookmarkNFO.externalSet);
	} catch (e) {
		L.error( "can't display"+e.toString ());
	}
}


function UIExportCurrentSetToFile () {
	var nsIFilePicker = Components.interfaces.nsIFilePicker;
	var fp = Components.classes ["@mozilla.org/filepicker;1"]
	.createInstance(nsIFilePicker);
	fp.init(window, "Save to a file", nsIFilePicker.modeSave);
	//fp.appendFilters(nsIFilePicker.filterXML);
	fp.defaultString = "*.moulinbk";
	fp.appendFilter("moulin Bookmarks", "*.moulinbk");
	var res = fp.show();
	if (res == nsIFilePicker.returnOK) {
		var thefile = fp.file;
	} else {
		return false;
	}
	
	var fcontent = MLBookmarks.dump (BookmarkNFO.currentSet.items);
	writeToFile (thefile, fcontent) 
}

/*
 * adds bookmark to current set
 */
function AddBookmarkToDatasource (title, uri) {
	if (!BookmarkNFO.currentSet.items.some (BookmarkNFO.itemInSet, {'title':title, 'uri':uri.spec})) {
		BookmarkNFO.currentSet.items.push ({'title':title, 'uri':uri.spec});
		BookmarkNFO.currentSet.save ();
		return true;
	}
	return false;
}

/*
 * removes bookmark from current set
 */
function RemoveBookmarkFromDatasource (title, uri) {
	
	if (BookmarkNFO.currentSet.items.some (BookmarkNFO.itemInSet, {'title':title, 'uri':uri})) {
		try { 
			BookmarkNFO.currentSet.removeBookmark (title, uri);
		} catch (e) {
			L.error (e.toString ());
		}
		return true;
	}

	return false;
}

/*
 * UI function to create bookmark in list
 */
function CreateBookmarkItem (aLabel, aURI, aTooltip) {
	const XUL_NS = "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";
	var listItem = document.createElementNS (XUL_NS, "listitem");
	listItem.setAttribute ("tooltiptext", aTooltip.toString ());
	listItem.setAttribute ("onclick", "onBookmarkItemClicked (this);");
	listItem.setAttribute ("label", aLabel.toString ());
	listItem.setAttribute ("value", aURI.toString ());
	return listItem;
}

/*
 * UI function to create bookmark in list
 */
function AddBookmarkLine (aLabel, aURI) {
	var listItem = CreateBookmarkItem (aLabel, aURI, aLabel);
	moulinUI.bookmarkListBox.appendChild (listItem);
}

/*
 * removes a bookmark from the listbox
 */
function RemoveBookmarkLine (aLabel, aURI) {
	var nbTotal = moulinUI.bookmarkListBox.getRowCount ();
	for (var i = 0; i <= nbTotal; i++) {
		var item = moulinUI.bookmarkListBox.getItemAtIndex (i);
		if (item.getAttribute ('label') == aLabel && item.getAttribute ('value') == aURI) {
			moulinUI.bookmarkListBox.removeItemAt (i);
			return true;	
		}
	}
	return false;
}

/*
 * Called by click on a bk in the list ; calls the browser
 */
function onBookmarkItemClicked (aListItem) {
	uri = aListItem.getAttribute ('value');
	UINavGoTo (uri);
}

/*
 * Called by the "mark" button ; adds to set if not-exist then to the box
 */
function bookmarkCurrentPage () {
	var title	= moulinUI.browser.contentTitle;
	var uri		= moulinUI.browser.currentURI;
	if ( !uri.scheme.match (/^moulin/))
		return false;
	if (AddBookmarkToDatasource (title, uri)) {
		AddBookmarkLine (title, uri.spec);
	}
	return true;
}

/*
 * Called by the "unmark" button ; removes from set if exist then from the box
 */
function removeCurrentBookmark () {
	var selectedItem = moulinUI.bookmarkListBox.selectedItem;
	var title = selectedItem.getAttribute ('label');
	var uri = selectedItem.getAttribute ('value');
	if (RemoveBookmarkFromDatasource (title, uri)) {
		RemoveBookmarkLine (title, uri);
	}
}

function purgeBookmarks () {
	BookmarkNFO.currentSet.items = [];
	BookmarkNFO.currentSet.save ();
}




