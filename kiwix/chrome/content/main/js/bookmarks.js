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

function XMLFileToBookmarks (file) {
    var fc = getFileContent (file);
    return XMLStringToBookmarks(fc);
}

function XMLStringToBookmarks (xmls) {
    var parser  = new DOMParser();
    var doc     = parser.parseFromString(xmls, "text/xml");
    var root    = doc.firstChild;
    
    var items   = new Array();
    
    var len     = root.childNodes.length;

    for (var i=0 ; i<len ; i++) {
        var title   = root.childNodes[i].getAttribute('title');
        var uri     = root.childNodes[i].getAttribute('uri');
	var book    = root.childNodes[i].getAttribute('book');
        var notes;
        if (root.childNodes[i].firstChild != null)
            notes   = root.childNodes[i].firstChild.nodeValue;
        else
            notes   = new String();

        items.push({title:title, uri:uri, notes:notes, book:book});
    }
    return items;
}

function XMLStringFromBookmarks (object) {
    var parser  = new DOMParser();
    var doc     = parser.parseFromString("<bookmarks />", "text/xml");
    var root    = doc.firstChild;
    var len     = object.length >>> 0;

    for (var i=0 ; i<len ; i++) {
        var item= doc.createElement("bookmark");
        item.setAttribute("title", object[i]['title']);
        item.setAttribute("uri", object[i]['uri']);
        item.setAttribute("book", object[i]['book']);
        var note= doc.createTextNode(object[i]['notes']);
        item.appendChild(note);
        root.appendChild(item);
    }
    
    var serializer = new XMLSerializer();
    var xml = serializer.serializeToString(doc);
    return xml;
}
    

function XMLFileFromBookmarks (file, object) {
    var fileContent = XMLStringFromBookmarks(object);
    return writeToFile (file, fileContent);
}

var BookmarkNFO	            = {};
BookmarkNFO.defaultSetFile  = null;
BookmarkNFO.currentPage	    = null;
BookmarkNFO.currentSet	    = null;
BookmarkNFO.defaultSet	    = null;
BookmarkNFO.externalSet	    = null;
BookmarkNFO.defaultFileStr  = "<bookmarks></bookmarks>";
BookmarkNFO.itemInSet	    = function (element, index, array) { 
                                  	return (element['uri'] == this['uri']);
};

/* Load the bookmar files, should be run at the application startup */
function initBookmarks () {
	
	// Default set stores in user's profile
	BookmarkNFO.defaultSet = new BookmarkSet ();
	
	// loading default file
	var file = Components.classes["@mozilla.org/file/directory_service;1"]
	                     .getService (Components.interfaces.nsIProperties)
	                     .get ("ProfD", Components.interfaces.nsIFile);

	file.append ("bookmarks-notes.xml");
	BookmarkNFO.defaultSetFile  = file.clone();
	if (!file.exists ()) {
		L.info ("Bookmarks file does not exist: creating thumb one");
		writeToFile (file, BookmarkNFO.defaultFileStr);
	}
	BookmarkNFO.defaultSet.LoadFromFile (file);
	
	// displaying default set.
	BookmarkNFO.currentSet = BookmarkNFO.defaultSet;

	try {
		DisplayBookmarkSet (BookmarkNFO.defaultSet);
	} catch (e) {
		L.error( "can't display: "+e.toString ());
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
BookmarkSet.prototype = new Object();
BookmarkSet.prototype.constructor = BookmarkSet;
function BookmarkSet () {
	this.items	= [];
	this.file	= null;

	// Load the stored object to this.items
	this.LoadFromFile	= function (file) {
		this.file = file;
		try {
			this.items  = XMLFileToBookmarks(this.file)
		} catch (e) {
			L.error ("Load can't parse bookmark file: "+e);
		}
	};
	// saves items to default file.
	this.save = function () {
		try {
			XMLFileFromBookmarks(this.file, this.items);
		} catch (e) {
			L.error ("Save can't parse bookmark file: "+e);
		}
	};
	// 
	this.indexFor = function (uri) {
	    var len = this.items.length >>> 0;
        for (var i = 0; i < len; i++)
        {
            if (this.items[i]['uri'] == uri)
                return i;
        }
        return -1;
	}
	// retrieves a bookmark from it's index
	this.itemAt = function (i) {
		return this.items [i];
	};
	// remove a bookmark
	this.remove = function (uri) {
	   if (!this.items.some (BookmarkNFO.itemInSet, {'uri':uri}))
	        return false;

        var newA = [];
        for (var i=0; i<this.items.length;i++) {
            if (this.items[i]['uri'] != uri)
                newA.push(this.items[i]);            
        }
        this.items = newA;
        this.save();
        return true;
	};
	// add a bookmark
        this.add = function(title, uri, book, notes) {
	    if (this.items.some (BookmarkNFO.itemInSet, {'uri':uri}))
	        return false;
	    this.items.push ({'title':title, 'uri':uri, 'book':book, 'notes':notes});
	    this.save ();
	    return true;
	}
	// save note async
	this.update = function (index, item) {
	    for (field in item)
	        this.items[index][field] = item[field];
	    
	    this.save();
	}
	// helper functions
	this.getFileContent = getFileContent;
	this.writeToFile	= writeToFile;
};

/*
 * adds bookmark to current set
 */
function AddBookmarkToDatasource (title, uri) {
    var currentBook = library.getCurrentBook();
    var currentBookId = currentBook != undefined ? currentBook.id : undefined;

    return BookmarkNFO.currentSet.add(title, uri, currentBookId, "");
}

/*
 * removes bookmark from current set
 */
function RemoveBookmarkFromDatasource (uri) {
    return BookmarkNFO.currentSet.remove(uri);
}

/*
 * removes items from list box and add new ones. called on set change.
 */
function DisplayBookmarkSet (set) {
	UIEmptyBookmarkListBox ();
	L.info ("DisplayBookmarkSet");
	//var dbss = set.items.length;
	for (var i in set.items) {
		var bk = set.itemAt(i);
	    AddBookmarkLine (set.itemAt(i)['title'], set.itemAt(i)['uri'], set.itemAt(i)['book']);
	}
}

function UILoadExternalBookmarkFile () {
	var nsIFilePicker = Components.interfaces.nsIFilePicker;
	var fp = Components.classes ["@mozilla.org/filepicker;1"]
	.createInstance(nsIFilePicker);
	fp.init(window, getProperty("selectBookmarkSet"), nsIFilePicker.modeOpen);
	fp.appendFilters(nsIFilePicker.filterXML);
	var res = fp.show();
	if (res == nsIFilePicker.returnOK) {
		var thefile = fp.file;
	} else {
		return false;
	}

    UIAddBookmarkSetLine (thefile);
    LoadExternalBookmarkSet (thefile);
}

/* Create list element for bookmark set */
function UIAddBookmarkSetLine(file) {
    var title   = file.leafName;
    var slist   = getBookmarksSetsPopup();
    var elem    = document.createElement('menuitem');
    elem.setAttribute('label', title.replace(/.xml$/, ""));
    elem.setAttribute('value', file.path);
    elem.setAttribute('oncommand', "UIBookmarkSetSwitch(this.value);");
    slist.appendChild(elem);
    GetBookmarksSetsList().selectedItem = elem;
}

/* Create bookmark set and select */
function UICreateNewBookmarkSet () {
	var nsIFilePicker = Components.interfaces.nsIFilePicker;
	var fp = Components.classes ["@mozilla.org/filepicker;1"]
	.createInstance(nsIFilePicker);
	fp.init(window, getProperty("nameBookmarkSet"), nsIFilePicker.modeSave);
	fp.defaultString = "*.xml";
	fp.appendFilters(nsIFilePicker.filterXML);
	var res = fp.show();
	if (res == nsIFilePicker.returnOK || res == nsIFilePicker.returnReplace) {
		var thefile = fp.file;
	} else {
		return false;
	}
	
	writeToFile (thefile, BookmarkNFO.defaultFileStr);
	
	UIAddBookmarkSetLine (thefile);
    LoadExternalBookmarkSet (thefile);
}

/*
 * Cleans up default file for privacy
 */
function purgeBookmarks () {
	BookmarkNFO.currentSet.items = [];
	BookmarkNFO.currentSet.save ();
}

/* Load Bookmark Set from file */
function LoadExternalBookmarkSet (file) {
    if (!file.exists(file))
        return false;
    
    BookmarkNFO.externalSet = null;
	BookmarkNFO.externalSet = new BookmarkSet ();
	BookmarkNFO.externalSet.LoadFromFile (file);
	BookmarkNFO.currentSet  = BookmarkNFO.externalSet;
	try {
		DisplayBookmarkSet (BookmarkNFO.externalSet);
	} catch (e) {
		L.error( "can't display"+e.toString ());
	}
}

/*******************************************
 ************ User Interface ***************
 ******************************************/

function UIBookmarkFocus (uri) {
    var ind = BookmarkNFO.currentSet.indexFor(uri);
	if (ind != -1) {
        BookmarkNFO.currentPage = uri;
        getBookmarksList().selectedIndex = ind;
        UIToggleNotes(true, ind);
        return true;
	}
	BookmarkNFO.currentPage = null;
	UIToggleNotes(false);
	return false;
}

function UIToggleNotes (enable, index) {
    var nbox = getNotesBox();
    var content;
    if (enable)
        content = BookmarkNFO.currentSet.itemAt(index)['notes'];
    else
        content = new String("");

    nbox.value = content.toString();
    nbox.disabled = !enable;
}

/* called on drop-down menu switch */
function UIBookmarkSetSwitch (filepath) {
    var file;
    if (filepath == 'default')
        file = BookmarkNFO.defaultSetFile;
    else {
        file = Components.classes["@mozilla.org/file/local;1"].
        createInstance(Components.interfaces.nsILocalFile);
        file.initWithPath(filepath);
    }
    if (file != BookmarkNFO.currentSet.file)
        LoadExternalBookmarkSet (file);
}


/*
 * Removes elements from list
 */
function UIEmptyBookmarkListBox () {
	L.info ("UIEmptyBookmarkListBox");
	var lbox    = getBookmarksList();
	while (lbox.firstChild) {
		lbox.removeChild(lbox.firstChild);
    }
}

function UIResetBookmarkSet () {
    purgeBookmarks ();
    UIEmptyBookmarkListBox ();
}

/*
 * Called by click on a bk in the list ; calls the browser
 */
function onBookmarkItemClicked (aListItem) {
    var uri = aListItem.value;
    var bookId = aListItem.getAttribute("book");
    var currentBook = library.getCurrentBook();
    var currentBookId = currentBook != undefined ? currentBook.id : undefined;

    if (bookId != currentBookId) {
	if (displayConfirmDialog("This bookmark is refering to an other content, do you want to load it?")) {
	    var book = library.getBookById(bookId);
	    manageOpenFile(book.path, true);
	} else {
	    return;
	}
    }

    loadContent(uri);
}

/*
 * Called by the "mark" button ; adds to set if not-exist then to the box
 */
function bookmarkCurrentPage () {
    var title = getHtmlRenderer().contentTitle;
    var uri = getHtmlRenderer().currentURI;
    var currentBook = library.getCurrentBook();
    var currentBookId = currentBook != undefined ? currentBook.id : undefined;
    
    if ( !uri.scheme.match (/^zim/))
	return false;
    
    if (AddBookmarkToDatasource (title, uri.spec)) {
	AddBookmarkLine (title, uri.spec, currentBookId);
	UIBookmarkFocus(uri.spec);
    }
    
    // Enable Notes
    return true;
}

/*
 * Save note content before leaving 
 */
function UISaveCurrentNote () {
    var ind     = BookmarkNFO.currentSet.indexFor(BookmarkNFO.currentPage);
    var nbox    = getNotesBox();
    var notes   = nbox.value;
	if (ind != -1) {
        BookmarkNFO.currentSet.update(ind, {'notes': notes});
        return true;
	} else
	    return false;
}

/*
 * Called by the "unmark" button ; removes from set if exist then from the box
 */
function removeCurrentBookmark () {
	try {
    	var uri     = getBookmarksList().selectedItem.getAttribute("value");
    } catch (e) { 
        var uri		= getHtmlRenderer().currentURI.spec; }

	if (RemoveBookmarkFromDatasource (uri)) {
		RemoveBookmarkLine (uri);
	}
}

/*
 * UI function to create bookmark in list
 */
function CreateBookmarkItem (aLabel, aURI, aTooltip) {
	const XUL_NS = "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";
	const HTML_NS= "http://www.w3.org/1999/xhtml";
	var listItem = document.createElementNS (XUL_NS, "listitem");
	listItem.setAttribute ("tooltiptext", aTooltip.toString ());
	listItem.setAttribute ("onclick", "onBookmarkItemClicked (this);");
	listItem.setAttribute ("label", aLabel.toString ());
	listItem.setAttribute ("value", aURI);
	return listItem;
}

/*
 * UI function to create bookmark in list
 */
function AddBookmarkLine (aLabel, aURI, bookId) {
    var listItem = CreateBookmarkItem (aLabel, aURI, aLabel);
    listItem.setAttribute("book", bookId);
    var list    = getBookmarksList();
    var index   = list.childNodes.length;
    list.appendChild (listItem);
    list.selectedIndex  = index;
}

/*
 * removes a bookmark from the listbox
 */
function RemoveBookmarkLine (aURI) {
	var lbox    = getBookmarksList();
	
	for (var i=0; i<lbox.childNodes.length; i++) {
	    var item = lbox.childNodes[i];
	    if (item.getAttribute("value") == aURI) {
            lbox.removeChild(item);
            return true;
        }
    }
	return false;
}

/*
 * Display/Hide the Bookmarks&Notes sidebar.
 */
function UIToggleBookmarksBar(visible) {
    var bar = getBookmarksBar();

    if (bar.hidden) {
	WarnOnSideBar();
    }

    if (visible == undefined) {
	visible = bar.hidden;
    }

    bar.hidden  = !visible;
    settings.displayBookmarksBar(!bar.hidden);
    getBookmarksButton().setAttribute('checked', !bar.hidden);
    sugar_butt = document.getElementById('sugar-button-bookmarks');
    sugar_butt.className = (!bar.hidden) ? 'visible' : 'hidden';
}

function checkIfDocumentIsMarked(url) {
    var mark_butt = document.getElementById('sugar-button-bookmark');
    mark_butt.className = (BookmarkNFO.currentSet.indexFor(url) != -1) ? 'marked' : 'unmarked';
}

function toggleBookmarkStatusForCurrentPage() {
    var url = getHtmlRenderer().currentURI.spec;
    var is_marked = BookmarkNFO.currentSet.indexFor(url) != -1;
    if (is_marked) {
        RemoveBookmarkFromDatasource(url);
        RemoveBookmarkLine(url);
    } else
        bookmarkCurrentPage();
    checkIfDocumentIsMarked(url);
}
