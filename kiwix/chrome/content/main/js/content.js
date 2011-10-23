/*
 * Copyright 2011 Emmanuel Engelhart <kelson@kiwix.org>
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

var _selectedLibraryContentItem = undefined;
var aria2Client = new xmlrpc_client ("rpc", "localhost", "42042", "http");
var aria2Process = null;
var jobTimer = null;
var downloader = new Worker("js/downloader.js");
var aria2StartCount = 0;
var downloadsResumed = false;
var _oldWindowTitle = "";
var checkDownloaderId;
var checkDownloadStatusId;

downloader.onmessage = function(event) {
    var message = event.data;
    if (message.id == "downloadedMetalink") {
	addMetalink(message.parameters[0], message.parameters[1]);
    } else if (message.id == "downloadedBookList") {
	var xml = message.parameters[0];
	if (xml == undefined || xml == "") {
	    dump("Unable to download the Metalink...\n");
	} else {
	    /* Backup the 'old' number of available books */
	    var oldRemoteBookCount = library.getRemoteBookCount();

	    /* Load the remote library xml in content manager */
	    library.readFromText(xml, false);

	    /* Get count of local&remote books */
	    var localBookCount = library.getLocalBookCount();
	    var remoteBookCount = library.getRemoteBookCount();

	    /* Populate the book list ? */
	    var doPopulateRemoteBookList = message.parameters[1];
	    if (doPopulateRemoteBookList) {
		populateRemoteBookList();
		populateLibraryFilters();
	    }
	    
	    /* If no local content but remote, change the default view */
	    if (localBookCount == 0 && remoteBookCount > 0)
		selectLibraryMenu("library-menuitem-remote")
	    
	    /* New content are available online */
	    if (oldRemoteBookCount < remoteBookCount) {
		
		/* Save library (library.xml in the user profile) */
		library.writeToFile();

		/* First start - online */
		if (oldRemoteBookCount == 0) {
		    if (displayConfirmDialog("They are new content available for download, do you want to see them?")) {
			showRemoteBooks();
		    }
		}
		
		/* New content released online */
		else {
		    sendNotification(getProperty("information"), "They are new content available for download.");
		}
	    }
	}
    }
};

downloader.onerror = function(message) {
};

function addMetalink(id, metalinkContent) {
    /* Make a cache if necessary */
    if (!isFile(appendToPath(settings.getRootPath(), id + ".metalink")))
    	writeFile(appendToPath(settings.getRootPath(), id + ".metalink"), metalinkContent);

    /* Tell aria2c to start the download */
    var param = new xmlrpcval(metalinkContent, "base64");
    var msg = new xmlrpcmsg("aria2.addMetalink", [ param ]);
    var response = aria2Client.send(msg);
    
    /* If aria2c not running then exception */
    try {
	var gid = response.val.arrayMem(0).scalarVal();
	/* set the gid */
	settings.setDownloadProperty(id, "gid", gid);
    } catch (error) {
    }
}

function isDownloaderRunning() {
    return (aria2Process != null && aria2Process.exitValue < 0);
}

function checkDownloader() {
    if (!isDownloaderRunning()) {
	/* Check if aria2c is not already started */
	var openPort = true;
	try {
	    var req = new XMLHttpRequest();
	    req.open('GET', "http://localhost:42042/", false);
	    req.send(null);
	} catch(error) {
	    openPort = false;
	}
	
	if (openPort == true) {
	    return true;
	} else {
	    /* Need to wait wide usage of aria2c 1.11 or higher before using this version of the aria2c command line */
	    var args = [ "--enable-rpc", "--rpc-listen-port=42042", "--dir=" + settings.getRootPath(), "--log=" + getDownloaderLogPath(), "--allow-overwrite=true", "--disable-ipv6=true", "--quiet=true", "--always-resume=true", "--max-concurrent-downloads=42", "--min-split-size=1M", "--rpc-max-request-size=6M" ];

	    /* For backward compatibility */
	    if (aria2StartCount > 0) {
		args = [ "--enable-xml-rpc", "--xml-rpc-listen-port=42042", "--dir=" + settings.getRootPath(), "--log=" + getDownloaderLogPath(), "--allow-overwrite=true", "--disable-ipv6=true", "--quiet=true", "--always-resume=true", "--max-concurrent-downloads=42", "--xml-rpc-max-request-size=6M" ];
	    }
	    
	    startDownloader(args);
	}
    } else if (!downloadsResumed && library.getRemoteBookCount() > 0) {
	resumeDownloads();
    }
}

function startDownloader(args) {
    var binaryPath;
    
    var ariaBinaryPath = whereis(env.isWindows() ? "aria2c.exe" : "aria2c");
    if (ariaBinaryPath == undefined) {
	dump("Unable to find the aria2c binary.\n");
	return;
    }
    
    if (env.isWindows()) {
	binaryPath = whereis("chp.exe");
	if (binaryPath == undefined) {
	    dump("Unable to find the chp binary.\n");
	    return;
	}
	
	args.splice(0, 0, ariaBinaryPath);
    } else {
	binaryPath = ariaBinaryPath;
    }
    
    var binary = Components.classes["@mozilla.org/file/local;1"]
	.createInstance(Components.interfaces.nsILocalFile);
    binary.initWithPath(binaryPath);
    
    aria2Process = Components.classes["@mozilla.org/process/util;1"]
	.createInstance(Components.interfaces.nsIProcess);
    aria2Process.init(binary);

    aria2Process.run(false, args, args.length);
    aria2StartCount += 1;
}

function stopDownloader() {
    if (aria2Process != null) {
	if (env.isWindows()) {
	    var taskkillBinaryPath = whereis("taskkill.exe");
	    var chpBinaryPath = whereis("chp.exe");

	    var binary = Components.classes["@mozilla.org/file/local;1"]
		.createInstance(Components.interfaces.nsILocalFile);
	    binary.initWithPath(chpBinaryPath);
	    
	    var process = Components.classes["@mozilla.org/process/util;1"]
		.createInstance(Components.interfaces.nsIProcess);
	    process.init(binary);
	    
	    process.run(true, [ taskkillBinaryPath, "/PID", aria2Process.exitValue ], 3);
	} else if (aria2Process != null) {
	    try {
		aria2Process.kill();
	    } catch (error) {
	    }
	}
    }
}

function getAriaDownloadStatus(gid) {
    var param1 = new xmlrpcval(gid, "base64");
    var param2 = new xmlrpcval("gid", "base64");
    var param3 = new xmlrpcval("status", "base64");
    var arr = [param2, param3];
    var param4 = new xmlrpcval(arr, 'array');
    var msg = new xmlrpcmsg("aria2.tellStatus", [ param1, param4 ]);
    var response = aria2Client.send(msg);
    return (response.val != 0 ? response.val.structMem('status').scalarVal() : "");
}

function getAriaDownloadPath(gid) {
    var param = new xmlrpcval(gid, "base64");
    var msg = new xmlrpcmsg("aria2.getFiles", [ param ]);
    var response = aria2Client.send(msg);
    var path = (response.val != 0 ? response.val.arrayMem(0).structMem('path').scalarVal() : "");

    /* There is a bug on certain version of aria2c by the concatenating of path */
    if (env.isWindows()) {
	path = path.replace(/\//g, '\\');
    }

    return path;
}

function startDownload(url, id) {
    if (isFile(appendToPath(settings.getRootPath(), id + ".metalink"))) {
	addMetalink(id, readFile(appendToPath(settings.getRootPath(), id + ".metalink")));
    } else {
	var message = new WorkerMessage("downloadMetalink", [ url ], [ id ] );
	downloader.postMessage(message);
    }
}

function stopDownload(index) {
    var param = new xmlrpcval(index, "base64");
    var msg = new xmlrpcmsg("aria2.remove", [ param ]);
    var response = aria2Client.send(msg);
}

function pauseDownload(index) {
    var param = new xmlrpcval(index, "base64");
    var msg = new xmlrpcmsg("aria2.pause", [ param ]);
    var response = aria2Client.send(msg);
}

function resumeDownload(index) {
    var param = new xmlrpcval(index, "base64");
    var msg = new xmlrpcmsg("aria2.unpause", [ param ]);
    var response = aria2Client.send(msg);
}

function moveDownloadPositionToTop(index) {
    var param1 = new xmlrpcval(index, "base64");
    var param2 = new xmlrpcval(0, "base64");
    var param3 = new xmlrpcval("POS_SET", "base64");
    var msg = new xmlrpcmsg("aria2.changePosition", [ param1, param2, param3 ]);
    var response = aria2Client.send(msg);
}

function removeDownload(index) {
    var param = new xmlrpcval(index, "base64");
    var msg = new xmlrpcmsg("aria2.remove", [ param ]);
    var response = aria2Client.send(msg);
}

function getDownloadStatus() {
    /* Get Kiwix list of downloads */
    var kiwixDownloadsString = settings.downloads();
    var kiwixDownloads = settings.unserializeDownloads(kiwixDownloadsString);
    var kiwixDownloadsCount = kiwixDownloads.length;

    /* Get aria2 active downloads */
    var ariaDownloadsCount = 0;
    var ariaResponse;
    if (kiwixDownloadsCount > 0 && aria2Process != null) {
	var ariaMessage = new xmlrpcmsg("aria2.tellActive");
	ariaResponse = aria2Client.send(ariaMessage);
	if (typeof ariaResponse.val == "object") {
	    ariaDownloadsCount = ariaResponse.val.arraySize();
	}
    }

    /* Get through all known downloads */
    for (var i=0; i<kiwixDownloadsCount; i++) {
	var kiwixDownload = kiwixDownloads[i];
	var book = library.getBookById(kiwixDownload.id);
	var box = document.getElementById("library-content-item-" + book.id);

	/* In case of a ZIM file where open and at the same time already downloading */
	if (book.path != "") {
	    manageStopDownload(book.id);
	}

	/* Download is running */
	if (kiwixDownload.status == 1) {

	    /* Find the corresponding ariaDownload */
	    var ariaDownload = undefined;
	    for (var j=0; j<ariaDownloadsCount; j++) {
		var currentAriaDownload = ariaResponse.val.arrayMem(j);
		var ariaDownloadGid = currentAriaDownload.structMem('gid').scalarVal();
		if (ariaDownloadGid == kiwixDownload.gid) {
		    ariaDownload = currentAriaDownload;
		}
	    }

	    if (ariaDownload != undefined) {
		/* Retrieve infos */
		var ariaDownloadSpeed = ariaDownload.structMem('downloadSpeed').scalarVal();
		var ariaDownloadCompleted = ariaDownload.structMem('completedLength').scalarVal();

		/* Update download status lebel */
		var downloadStatusLabel = document.getElementById("download-status-label-" + book.id);
		var downloadStatusLabelString = "Preparing download...";

		/* Download started */
		if (ariaDownloadCompleted > 0 || ariaDownloadSpeed > 0) {

		    /* Update the settings */
		    settings.setDownloadProperty(kiwixDownload.id,  "completed", ariaDownloadCompleted);

		    /* Compute the remaining time */
		    var remaining = (book.size * 1024 - ariaDownloadCompleted) / ariaDownloadSpeed;
		    var remainingHours = (remaining >= 3600 ? parseInt(remaining / 3600) : 0);
		    remaining = parseInt(remaining - (remainingHours * 3600));
		    var remainingMinutes = (remaining >= 60 ? parseInt(remaining / 60) : 0);
		    remaining = parseInt(remaining - (remainingMinutes * 60));
		    
		    /* Update the download status string */
		    downloadStatusLabelString = (remainingHours > 0 || remainingMinutes > 0 || remaining > 0 ? "Time remaining: " : "") + (remainingHours > 0 ? remainingHours + " hours" : "") + (remainingHours > 0 && remainingMinutes > 0 ? ", " : "") + (remainingMinutes > 0 ? remainingMinutes + " minutes" : "") + (remainingHours == 0 && remainingMinutes > 0 && remaining > 0 ? ", " : "") + (remainingHours == 0 && remaining > 0 ? remaining + " seconds" : "") + (remainingHours > 0 || remainingMinutes > 0 || remaining > 0 ? " – " : "") + formatFileSize(ariaDownloadCompleted) + " of " + formatFileSize(book.size * 1024) + (ariaDownloadSpeed != undefined && ariaDownloadSpeed > 0 ? " (" + formatFileSize(ariaDownloadSpeed) + "/s)" : ""); 
		}
		downloadStatusLabel.setAttribute("value", downloadStatusLabelString);
	    } else {
		var ariaDownloadStatus = getAriaDownloadStatus(kiwixDownload.gid);
		if (ariaDownloadStatus == "complete") {
		    var ariaDownloadPath = getAriaDownloadPath(kiwixDownload.gid);
		    ariaDownloadPath = ariaDownloadPath.replace(/\\/g, "\\\\"); /* Necessary to avoid escaping */
		    library.setBookPath(kiwixDownload.id, ariaDownloadPath);
		    populateLocalBookList();
		    populateRemoteBookList();
		    settings.setDownloadProperty(kiwixDownload.id,  "id", "");
		    removeDownload(kiwixDownload.gid);
    		    sendNotification(getProperty("information"), "Download of '" + book.title + "'is finished.");
   		    sendNotification("Feedback", "Help us, why did you downloaded " + book.title, 
				     "http://input.kiwix.org/whycontent.html?version=" + book.url);
		} else if (ariaDownloadStatus == "waiting") {
		}
	    }
	}
	
	/* Download is paused */
	var downloadStatusLabel = document.getElementById("download-status-label-" + kiwixDownload.id);
	if (downloadStatusLabel != undefined && kiwixDownload.status == 0 && kiwixDownload.completed > 1) { 
	    downloadStatusLabel.setAttribute("value", "Paused – " + formatFileSize(kiwixDownload.completed) + " of " + formatFileSize(book.size * 1024));
	}
	
	/* Set the progressbar */
	var progressbar = document.getElementById("progressbar-" + book.id);
	if (progressbar != undefined) {
	    var progressbarValue = 0;
	    if (kiwixDownload.completed != undefined && kiwixDownload.completed != "0" && kiwixDownload.completed != "")
		progressbarValue = kiwixDownload.completed / (book.size * 1024) * 100;
	    progressbar.setAttribute("value", progressbarValue);
	}
    }
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
	filesize = formatNumber(filesize / 1073741824, 2, '.', '') + ' GB';
    } else {
	if (filesize >= 1048576) {
	    filesize = formatNumber(filesize / 1048576, 2, '.', '') + ' MB';
	} else {
	    if (filesize >= 1024) {
		filesize = formatNumber(filesize / 1024, 0) + ' KB';
	    } else {
		filesize = formatNumber(filesize, 0) + ' bytes';
	    };
	};
    };

    return filesize;
};

function manageRemoveContent(id) {
    if (displayConfirmDialog("Are you sure you want to remove this content?")) {
	var book = library.getBookById(id);

	if (library.getCurrentId() == id) {
	    manageUnload(true, true);
	}

	if (book != undefined) {
	    deleteFile(book.path);
	    deleteFile(book.indexPath);
	    
	    if (book.url != "") {
		library.setBookPath(id, "");
		library.setBookIndex(id, "");
	    } else {
		library.deleteBookById(id);
	    }

	    populateLocalBookList();
	    populateRemoteBookList();
	}
    }
};
    
function manageStopDownload(id) {
    if (displayConfirmDialog("Are you sure you want to stop this download?")) {
	configureLibraryContentItemVisuals(id, "online");
	
	/* Get corresponding gid */
	var kiwixDownloadGid = settings.getDownloadProperty(id, "gid");
	
	/* Stop the download */
	stopDownload(kiwixDownloadGid);
	var path = getAriaDownloadPath(kiwixDownloadGid);
	deleteFile(path);
	deleteFile(path + ".aria2");
	deleteFile(appendToPath(settings.getRootPath(), id + ".metalink"));
	
	/* Remove Kiwix download */
	settings.setDownloadProperty(id, "id", "");
    }
}

function configureLibraryContentItemVisuals(id, mode) {
    if (mode == "download") {
	var downloadButton = document.getElementById("download-button-" + id);
	downloadButton.setAttribute("style", "display: none;");
	var loadButton = document.getElementById("load-button-" + id);
	loadButton.setAttribute("style", "display: none;");
	var removeButton = document.getElementById("remove-button-" + id);
	removeButton.setAttribute("style", "display: none;");
	var playButton = document.getElementById("play-button-" + id);
	playButton.setAttribute("style", "display: none;");
	var pauseButton = document.getElementById("pause-button-" + id);
	pauseButton.setAttribute("style", "display: block;");
	var downloadStatusLabel = document.getElementById("download-status-label-" + id);
	downloadStatusLabel.setAttribute("value", "Preparing download...");
	var detailsDeck = document.getElementById("download-deck-" + id);
	detailsDeck.setAttribute("selectedIndex", "1");
    } else if (mode == "online") {
	var downloadButton = document.getElementById("download-button-" + id);
	downloadButton.setAttribute("style", "display: block;");
	var detailsDeck = document.getElementById("download-deck-" + id);
	detailsDeck.setAttribute("selectedIndex", "0");
	var loadButton = document.getElementById("load-button-" + id);
	loadButton.setAttribute("style", "display: none;");
	var removeButton = document.getElementById("remove-button-" + id);
	removeButton.setAttribute("style", "display: none;");
    } else if (mode == "offline") {
	var downloadButton = document.getElementById("download-button-" + id);
	downloadButton.setAttribute("style", "display: none;");
	var detailsDeck = document.getElementById("download-deck-" + id);
	detailsDeck.setAttribute("selectedIndex", "0");
	var loadButton = document.getElementById("load-button-" + id);
	loadButton.setAttribute("style", "display: block;");
	var removeButton = document.getElementById("remove-button-" + id);
	removeButton.setAttribute("style", "display: block;");
    }
}

function manageStartDownload(id, completed) {
    settings.addDownload(id);
    configureLibraryContentItemVisuals(id, "download");

    var book = library.getBookById(id);
    var progressbar = document.getElementById("progressbar-" + id);
    if (completed != undefined && completed != "0" && completed != "") {
	var percent = completed / (book.size * 1024) * 100;
	progressbar.setAttribute("value", percent);
    } else {
	progressbar.setAttribute("value", 0);
    }
    
    startDownload(book.url, book.id);
}

function manageResumeDownload(id) {
    /* User Interface update */
    var pauseButton = document.getElementById("pause-button-" + id);
    pauseButton.setAttribute("style", "display: block;");
    var playButton = document.getElementById("play-button-" + id);
    playButton.setAttribute("style", "display: none;");

    /* Search the corresponding kiwix download */
    settings.setDownloadProperty(id, "status", "1");
    var gid = settings.getDownloadProperty(id, "gid");

    /* Resume the download */
    if (gid != undefined) {
	var downloadStatusLabel = document.getElementById("download-status-label-" + id);
	downloadStatusLabel.setAttribute("value", "Resuming download...");
	
	if (getAriaDownloadStatus(gid) == "paused") {
	    resumeDownload(gid);
	} else {
	    var book = library.getBookById(id);
	    startDownload(book.url, book.id);
	}
    }
}

function managePauseDownload(id) {
    /* User Interface update */
    var pauseButton = document.getElementById("pause-button-" + id);
    pauseButton.setAttribute("style", "display: none;");
    var playButton = document.getElementById("play-button-" + id);
    playButton.setAttribute("style", "display: block;");
    var downloadButton = document.getElementById("download-button-" + id);
    downloadButton.setAttribute("style", "display: none;");
    var detailsDeck = document.getElementById("download-deck-" + id);
    detailsDeck.setAttribute("selectedIndex", "1");

    /* Search the corresponding kiwix download */
    settings.setDownloadProperty(id, "status", "0");
    var gid = settings.getDownloadProperty(id, "gid");

    /* Pause the download */
    pauseDownload(gid);
}

function createLibraryItem(book) {
    var spacer = document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul", 
					  "spacer");
    spacer.setAttribute("flex", "1");

    /* Create item box */
    var box = document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul", 
				       "richlistitem");
    box.setAttribute("class", "library-content-item");
    box.setAttribute("id", "library-content-item-" + book.id);
    box.setAttribute("onclick", "selectLibraryContentItem(this);");
    
    var hbox = document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul", 
					"hbox");
    hbox.setAttribute("flex", "1");
    box.appendChild(hbox);
    
    var faviconBox = document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul", 
					      "box");
    faviconBox.setAttribute("class", "library-content-item-favicon");
    if (book.favicon != "")
	faviconBox.setAttribute("style", "background-image: " + book.favicon);
    hbox.appendChild(faviconBox);
    
    var detailsBox = document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul", 
					      "vbox");
    detailsBox.setAttribute("flex", "1");
    detailsBox.setAttribute("class", "library-content-item-details");
    hbox.appendChild(detailsBox);
    
    var titleLabel = document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul", 
					      "textbox");
    titleLabel.setAttribute("class", "library-content-item-title");
    titleLabel.setAttribute("readonly", true);
    titleLabel.setAttribute("size", 100);
    titleLabel.setAttribute("value", book.title || book.path);

    detailsBox.appendChild(titleLabel);
    
    var description = document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul", 
					       "textbox");
    description.setAttribute("class", "library-content-item-description");
    description.setAttribute("readonly", true);
    description.setAttribute("size", 100);
    description.setAttribute("value", book.description);
    detailsBox.appendChild(description);
    
    var grid = document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul", 
					"grid");
    var columns = document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul", 
					   "columns");
    
    var leftColumn = document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul", 
					      "column");
    leftColumn.setAttribute("style", "width: 400px");
    
    var sizeLabel = document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul", 
					     "label");
    sizeLabel.setAttribute("class", "library-content-item-detail");
    sizeLabel.setAttribute("value", "Size: " + formatFileSize(book.size * 1024) + " (" + formatNumber(book.articleCount, 0, '', '.') + " articles, " + formatNumber(book.mediaCount, 0, '', '.') + " medias)");
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
    
    var detailsDeck = document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul", 
					       "deck");
    detailsDeck.setAttribute("selectedIndex", "0");
    detailsDeck.setAttribute("id", "download-deck-" + book.id);
    detailsDeck.appendChild(grid);
    
    var downloadBox = document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul", 
					       "vbox");

    var progressmeterBox = document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul", 
						    "hbox");
    progressmeterBox.setAttribute("flex", "1");
    var progressmeter = document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul", 
						 "progressmeter");
    progressmeter.setAttribute("flex", "1");
    progressmeter.setAttribute("id", "progressbar-" + book.id);
    progressmeterBox.appendChild(progressmeter);
    downloadBox.appendChild(progressmeterBox);
    
    var pauseButton = document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul", 
					       "button");
    pauseButton.setAttribute("id", "pause-button-" + book.id);
    pauseButton.setAttribute("class", "pause mini-button");
    pauseButton.setAttribute("tooltiptext", "Pause download");
    pauseButton.setAttribute("onclick", "event.stopPropagation(); managePauseDownload('" + book.id + "')");
    progressmeterBox.appendChild(pauseButton);
    
    var playButton = document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul", 
					      "button");
    playButton.setAttribute("id", "play-button-" + book.id);
    playButton.setAttribute("class", "play mini-button");
    playButton.setAttribute("tooltiptext", "Resume download");
    playButton.setAttribute("onclick", "event.stopPropagation(); manageResumeDownload('" + book.id + "')");
    progressmeterBox.appendChild(playButton);
    
    var cancelButton = document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul", 
						"button");
    cancelButton.setAttribute("class", "cancel mini-button");
    cancelButton.setAttribute("tooltiptext", "Cancel download");
    cancelButton.setAttribute("onclick", "event.stopPropagation(); manageStopDownload('" + book.id + "')");
    progressmeterBox.appendChild(cancelButton);
    
    var downloadStatusLabel = document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul", 
						       "label");
    downloadStatusLabel.setAttribute("id", "download-status-label-" + book.id);
    downloadStatusLabel.setAttribute("value", "download details...");
    downloadBox.appendChild(downloadStatusLabel);
    
    detailsDeck.appendChild(downloadBox);
    detailsBox.appendChild(detailsDeck);
    
    /* Button box */
    var buttonBox = document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul", 
					     "vbox");
    buttonBox.setAttribute("style", "margin: 5px;");
    buttonBox.appendChild(spacer.cloneNode(true));
    
    var removeButton = document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul", 
						"button");
    removeButton.setAttribute("label", "Remove");
    removeButton.setAttribute("id", "remove-button-" + book.id);
    removeButton.setAttribute("onclick", "event.stopPropagation(); manageRemoveContent('" + book.id + "')");
    buttonBox.appendChild(removeButton);

    var loadButton = document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul", 
					      "button");
    loadButton.setAttribute("label", "Load");
    loadButton.setAttribute("id", "load-button-" + book.id);
    loadButton.setAttribute("onclick", "event.stopPropagation(); manageOpenFile('" + book.path.replace(/\\/g, '\\\\') + "')");
    buttonBox.appendChild(loadButton);
    
    var downloadButton = document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul", 
						  "button");
    downloadButton.setAttribute("label", "Download");
    downloadButton.setAttribute("id", "download-button-" + book.id);
    downloadButton.setAttribute("onclick", "event.stopPropagation(); manageStartDownload('" + book.id + "')");
    buttonBox.appendChild(downloadButton);

    hbox.appendChild(buttonBox);
    return box
}

function populateBookList(container) {
    var book;
    var backgroundColor = "#FFFFFF";

    /* Autotection of the container if necessary */
    if (container == undefined) {
	container = getCurrentBookListContainer()
    }
    
    /* Remove the child nodes */
    while (container.firstChild) {
	container.removeChild(container.firstChild);
    };

    /* Apply filter/sorting */
    var mode = container.id == "library-content-local" ? "local" : "remote";
    var sortBy = getBookListSortBy();
    var maxSize = getBookListContentMaxSize();
    var publisher = getBookListPublisherFilter();
    var language = getBookListLanguageFilter();
    var search = getBookListSearchFilter();
    library.listBooks(mode, sortBy, maxSize, language, publisher, search);

    /* Go through all books */
    book = library.getNextBookInList();
    while (book != undefined) {
	
	var box = createLibraryItem(book);
	box.setAttribute("style", "background-color: " + backgroundColor + ";");

	/* Add the new item to the UI */
	container.appendChild(box);

        if (book.path != "") {
           configureLibraryContentItemVisuals(book.id, "offline");
        } else {
           var downloadStatus = settings.getDownloadProperty(book.id, "status");
           if (downloadStatus != undefined) {
             configureLibraryContentItemVisuals(book.id, "download");
           } else {
             configureLibraryContentItemVisuals(book.id, "online");
           }
        }

	/* Compute new item background color */
	backgroundColor = (backgroundColor == "#FFFFFF" ? "#EEEEEE" : "#FFFFFF");
	book = library.getNextBookInList();
    }
}

function populateLocalBookList() {
    populateBookList(document.getElementById("library-content-local"));
}

function populateRemoteBookList() {
    populateBookList(document.getElementById("library-content-remote"));
}

function populateLibraryFilters() {
    var languages = library.getBooksLanguages();
    var languageMenu = document.getElementById('library-filter-language');
    
    for(var index=0; index<languages.length; index++) {
	if (languages[index].length > 0) {
	    var menuItem = document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul",
						    "menuitem");
	    menuItem.setAttribute("value", languages[index]);
	    menuItem.setAttribute("label", _languagesHash[languages[index]] ? _languagesHash[languages[index]] : languages[index]);
	    languageMenu.firstChild.insertBefore(menuItem, languageMenu.firstChild.lastChild.nextSibling);
	}
    }
    
    var publishers = library.getBooksPublishers();
    var publisherMenu = document.getElementById('library-filter-publisher');
    for(var index=0; index<publishers.length; index++) {
	if (publishers[index].length > 0) {
	    var menuItem = document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul",
						    "menuitem");
	    menuItem.setAttribute("value", publishers[index]);
	    menuItem.setAttribute("label", publishers[index]);
	    publisherMenu.firstChild.insertBefore(menuItem, languageMenu.firstChild.lastChild.nextSibling);
	}
    }
}
    
function downloadRemoteBookList(populateRemoteBookList, resumeDownloads) {
    populateRemoteBookList = (populateRemoteBookList == undefined ? false : populateRemoteBookList);
    resumeDownloads = (resumeDownloads == undefined ? false : resumeDownloads);

    var libraryUrls = settings.libraryUrls().split(';');
    for(var index=0; index<libraryUrls.length; index++) {
	var libraryUrl = libraryUrls[index];
	var message = new WorkerMessage("downloadBookList", [ libraryUrl ], [ populateRemoteBookList, resumeDownloads ]);
	downloader.postMessage(message);
    }
}

function populateContentManager(populateRemoteBookList, resumeDownloads) {
    populateLocalBookList();
    selectLibraryMenu("library-menuitem-local");
    downloadRemoteBookList(populateRemoteBookList, resumeDownloads);
}

function isLibraryVisible() {
    var libraryButton = getLibraryButton();
    return libraryButton.getAttribute('checked') == "true";
}

/* Show/hide library manager */
function toggleLibrary(visible) {
    var libraryButton = getLibraryButton();
    var renderingPage = document.getElementById("rendering-page");
    var libraryPage = document.getElementById("library-page");
    var newWindowTitle = "Content manager - Kiwix";
    
    if (visible == undefined) {
	visible = isLibraryVisible() ? false : true;
    } else if (visible == isLibraryVisible()) {
	return;
    }

    if (!visible) {
	activateHomeButton();
	activateBackButton();
	activateNextButton();
	activateZoomButtons();
	activateFullscreenButton();
	activateToolbarButton(getPrintButton());
	activateToolbarButton(getSearchInPlaceButton());
	activateToolbarButton(getBookmarksButton())
	libraryButton.setAttribute('checked', false);
	renderingPage.hidden = false;
	libraryPage.hidden = true;
	activateGuiSearchComponents();
	if (getWindow().getAttribute("title") == newWindowTitle)
	    getWindow().setAttribute("title", _oldWindowTitle);
    } else {
	desactivateHomeButton();
	desactivateBackButton();
	desactivateNextButton();
	desactivateZoomButtons();
	desactivateFullscreenButton();
	desactivateToolbarButton(getPrintButton());
	desactivateToolbarButton(getSearchInPlaceButton());
	desactivateToolbarButton(getBookmarksButton())
	libraryButton.setAttribute('checked', true);
	renderingPage.hidden = true;
	libraryPage.hidden = false;
	desactivateGuiSearchComponents();
	_oldWindowTitle = getWindow().getAttribute("title");
	getWindow().setAttribute("title", newWindowTitle);

	/* Reinitialize the scrollbar - seems to be necessary */
	var libraryDeck = document.getElementById("library-deck");
	libraryDeck.selectedPanel.ensureIndexIsVisible(libraryDeck.selectedPanel.selectedIndex); 
    }
}

function resumeDownloads() {
    /* Erase gids */
    settings.eraseDownloadGids();

    /* Resume */
    var downloadsString = settings.downloads();
    var downloadsArray = settings.unserializeDownloads(downloadsString);
    for(var index=0; index<downloadsArray.length; index++) {
	var download = downloadsArray[index];
	if (download.status == 1) {
	    manageStartDownload(download.id, download.completed);
	} else {
	    managePauseDownload(download.id);
	}
    }

    downloadsResumed = true;
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
    populateBookList();
    selectLibraryContentItem(libraryDeck.selectedPanel.firstChild);
}

function selectLibraryContentItem(box) {
    if (box == undefined)
	return;

    if (_selectedLibraryContentItem != undefined && box == _selectedLibraryContentItem) {
	return;
    } else {
	if (_selectedLibraryContentItem != undefined)
	    _selectedLibraryContentItem.setAttribute("style", _selectedLibraryContentItem.backGroundColorBackup);

	box.backGroundColorBackup = box.getAttribute("style");
	box.setAttribute("style", "background-color: Highlight;");
	box.parentNode.selectedItem = box;
	_selectedLibraryContentItem = box;
	var libraryDeck = document.getElementById("library-deck");
	libraryDeck.selectedPanel.ensureIndexIsVisible(libraryDeck.selectedPanel.selectedIndex); 
    }
}

function startDownloadObserver() {
    checkDownloaderId = window.setInterval("checkDownloader()", 1000);
    checkDownloadStatusId = window.setInterval("getDownloadStatus()", 1000);
}

function stopDownloaderObserver() {
    clearInterval(checkDownloaderId);
    clearInterval(checkDownloadStatusId);
}

function showLocalBooks() {
    selectLibraryMenu("library-menuitem-local");
    toggleLibrary(true);
}

function showRemoteBooks() {
    selectLibraryMenu("library-menuitem-remote");
    toggleLibrary(true);
}

function getCurrentBookListContainer() {
    if (isLibraryVisible) {
	return document.getElementById("library-deck").selectedPanel;
    }
}

function getBookListSortBy() {
    return document.getElementById("library-sortby").selectedItem.getAttribute("value");
}

function getBookListContentMaxSize() {
    return document.getElementById("library-content-maxsize").value > 0 ? 
	document.getElementById("library-content-maxsize").value : 99;
}

function getBookListPublisherFilter() {
    return document.getElementById('library-filter-publisher').value;
}

function getBookListLanguageFilter() {
    return document.getElementById('library-filter-language').value;
}

function getBookListSearchFilter() {
    return document.getElementById('library-filter-search').value;
}
