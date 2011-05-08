var _selectedLibraryContentItem = undefined;
var aria2Client = new xmlrpc_client ("rpc", "localhost", "6800", "http");
var aria2Process = null;

function loadBinaryResource(url) {
    var req = new XMLHttpRequest();
    req.open('GET', url, false);
    req.overrideMimeType('text/plain; charset=x-user-defined');
    req.send(null);
    if (req.status != 200) return '';
    return req.responseText;
}

function startDownloader() {
    var binary = Components.classes["@mozilla.org/file/local;1"]
	.createInstance(Components.interfaces.nsILocalFile);
    binary.initWithPath("/usr/bin/aria2c");
    
    aria2Process = Components.classes["@mozilla.org/process/util;1"]
	.createInstance(Components.interfaces.nsIProcess);
    aria2Process.init(binary);
    
    var args = [ "--enable-xml-rpc", "--log=" + getDownloaderLogPath() ];
    aria2Process.run(false, args, args.length);
}

function stopDownloader() {
    if (aria2Process != null) {
	dump("killing aria2c...\n");    
	aria2Process.kill();
    }
}

function startDownload(url) {

    /* Start downloader if necessary*/
    if (aria2Process == null) {
	startDownloader();
    }

    var backgroundTask = {
	run: function() {
	    var torrentContent = loadBinaryResource(url);
	    var param = new xmlrpcval(torrentContent, "base64");
	    var msg = new xmlrpcmsg("aria2.addTorrent", [ param ]);
	    var response = aria2Client.send(msg);
	    response.val.scalarVal();
	}
    }

    var thread = Components.classes["@mozilla.org/thread-manager;1"]
	.getService(Components.interfaces.nsIThreadManager)
	.newThread(0);
    thread.dispatch(backgroundTask, thread.DISPATCH_NORMAL);
}

function stopDownload(index) {
    var param = new xmlrpcval(index, "base64");
    var msg = new xmlrpcmsg("aria2.remove", [ param ]);
    var response = aria2Client.send(msg);
}

function getDownloadStatus() {
    var msg = new xmlrpcmsg("aria2.tellActive");
    var response = aria2Client.send(msg);
    var downloadStatus = response.val.arrayMem(0);
    alert(downloadStatus.structMem('downloadSpeed').scalarVal());
}

/* Return the tmp directory path where the search index is build */
function getDownloaderLogPath() {
    return appendToPath(settings.getRootPath(), "downloader.log");
}

function formatNumber( number, decimals, dec_point, thousands_sep ) {
    var n = number, c = isNaN(decimals = Math.abs(decimals)) ? 2 : decimals;
    var d = dec_point == undefined ? "," : dec_point;
    var t = thousands_sep == undefined ? "." : thousands_sep, s = n < 0 ? "-" : "";
    var i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "", j = (j = i.length) > 3 ? j % 3 : 0;
    return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
}

function formatFileSize(filesize) {
    if (filesize >= 1073741824) {
	filesize = formatNumber(filesize / 1073741824, 2, '.', '') + ' Gb';
    } else {
	if (filesize >= 1048576) {
	    filesize = formatNumber(filesize / 1048576, 2, '.', '') + ' Mb';
	} else {
	    if (filesize >= 1024) {
		filesize = formatNumber(filesize / 1024, 0) + ' Kb';
	    } else {
		filesize = formatNumber(filesize, 0) + ' bytes';
	    };
	};
    };

    return filesize;
};

function populateContentManager() {
    var container;
    var book;
    var backgroundColor = "#FFFFFF";

    /* Local */
    backgroundColor = "#FFFFFF";
    library.listBooks("local");
    container = document.getElementById("library-content-local");

    /* Remove the child nodes */
    while (container.firstChild) {
	container.removeChild(container.firstChild);
    };

    /* Go through all books */
    book = library.getNextBookInList();
    while (book != undefined) {
	
	/* Create item box */
	var box = document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul", 
					   "box");
	box.setAttribute("class", "library-content-item");
	box.setAttribute("style", "background-color: " + backgroundColor + ";");
	box.setAttribute("onclick", "selectLibraryContentItem(this);");
	
	var hbox = document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul", 
					    "hbox");
	hbox.setAttribute("flex", "1");
	box.appendChild(hbox);

	var faviconBox = document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul", 
						  "box");
	faviconBox.setAttribute("class", "library-content-item-favicon");
	faviconBox.setAttribute("style", "background-image: url('http://tmp.kiwix.org/tmp/wikipedia-icon-48x48.png');");
	hbox.appendChild(faviconBox);

	var detailsBox = document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul", 
						  "vbox");
	detailsBox.setAttribute("flex", "1");
	detailsBox.setAttribute("class", "library-content-item-details");
	hbox.appendChild(detailsBox);

	var titleLabel = document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul", 
						  "label");
	titleLabel.setAttribute("class", "library-content-item-title");
	titleLabel.setAttribute("value", book.title);
	detailsBox.appendChild(titleLabel);

	var description = document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul", 
						   "description");
	description.setAttribute("class", "library-content-item-description");
	description.setAttribute("value", book.description);
	detailsBox.appendChild(description);

	var grid = document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul", 
					    "grid");
	var columns = document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul", 
					       "columns");

	var leftColumn = document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul", 
					      "column");
	leftColumn.setAttribute("style", "width: 300px");

        var sizeLabel = document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul", 
						  "label");
	sizeLabel.setAttribute("class", "library-content-item-detail");
	sizeLabel.setAttribute("value", "Size: " + formatFileSize(book.size) + " (" + book.articleCount + " articles, " + book.mediaCount + " medias)");
	leftColumn.appendChild(sizeLabel);

        var creatorLabel = document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul", 
						  "label");
	creatorLabel.setAttribute("class", "library-content-item-detail");
	creatorLabel.setAttribute("value", "Creator: " + book.creator);
	leftColumn.appendChild(creatorLabel);

	columns.appendChild(leftColumn);

	var rightColumn = document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul", 
						   "column");

        var dateLabel = document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul", 
						 "label");
	dateLabel.setAttribute("class", "library-content-item-detail");
	dateLabel.setAttribute("value", "Created: " + book.date);
	rightColumn.appendChild(dateLabel);

        var languageLabel = document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul", 
						 "label");
	languageLabel.setAttribute("class", "library-content-item-detail");
	languageLabel.setAttribute("value", "Language: " + book.language);
	rightColumn.appendChild(languageLabel);

	columns.appendChild(rightColumn);
	grid.appendChild(columns);
	detailsBox.appendChild(grid);

	/* Button box */
        var buttonBox = document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul", 
						 "vbox");
	buttonBox.setAttribute("style", "margin: 5px;");
        var spacer = document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul", 
					      "spacer");
	spacer.setAttribute("flex", "1");
	buttonBox.appendChild(spacer);

	var downloadButton = document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul", 
						      "button");
	downloadButton.setAttribute("label", "Download");
	buttonBox.appendChild(downloadButton);

	hbox.appendChild(buttonBox);

	<!--
		  <vbox style="margin: 5px;">
		    <spacer flex="1" />
		    <button label="Download" />
		  </vbox>
        -->

	/* Add the new item to the UI */
	container.appendChild(box);

 


	/* Compute new item background color */
	backgroundColor = (backgroundColor == "#FFFFFF" ? "#EEEEEE" : "#FFFFFF");
	book = library.getNextBookInList();
    }

    /* Remote */
    backgroundColor = "#FFFFFF";
    library.listBooks("remote");
    container = document.getElementById("library-content-remote");

    /* Remove the child nodes */
    while (container.firstChild) {
	container.removeChild(container.firstChild);
    };
}

/* Show/hide library manager */
function toggleLibrary() {
    var libraryButton = getLibraryButton();
    var renderingPage = document.getElementById("rendering-page");
    var libraryPage = document.getElementById("library-page");

    if (libraryButton.getAttribute('checked') == "true") {
	libraryButton.setAttribute('checked', false);
	renderingPage.hidden = false;
	libraryPage.hidden = true;
    } else {
	libraryButton.setAttribute('checked', true);
	renderingPage.hidden = true;
	libraryPage.hidden = false;
    }
}

function selectLibraryMenu(menuItemId) {
    var menuItemLocal = document.getElementById("library-menuitem-local");
    var menuItemRemote = document.getElementById("library-menuitem-remote");
    var libraryDeck = document.getElementById("library-deck");

    if (menuItemId == "library-menuitem-local") {
	menuItemLocal.setAttribute("style", "background-color: white;");
	menuItemRemote.setAttribute("style", "background-color: transparent;");
	libraryDeck.selectedIndex = 0;
    } else {
	menuItemLocal.setAttribute("style", "background-color: transparent;");
	menuItemRemote.setAttribute("style", "background-color: white;")
	libraryDeck.selectedIndex = 1;
    }
}

function selectLibraryContentItem(box) {
    if (_selectedLibraryContentItem != undefined) {
	_selectedLibraryContentItem.setAttribute("style", _selectedLibraryContentItem.backGroundColorBackup);
    }

    if (box == _selectedLibraryContentItem) {
	_selectedLibraryContentItem = undefined;
	return;
    } else {
	box.backGroundColorBackup = box.getAttribute("style");
	box.setAttribute("style", "background-color: Highlight;");
	_selectedLibraryContentItem = box;
    }
}


