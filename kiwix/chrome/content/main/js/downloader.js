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

importScripts('workerMessage.js');

function loadBinaryResource(url) {
    var req = new XMLHttpRequest();
    if (url != undefined && url != "")  { 
	try {
	    req.open('GET', url, false);
	    req.overrideMimeType('text/plain; charset=x-user-defined');
	    req.send(null);
	} catch (error)  {
	}
    }
    return (req.status == 200 ? req.responseText : '');
}

onmessage = function(event) {
    var message = event.data;
    if (message.id == "downloadBookList") {
	var url = message.parameters[0];
	var populateRemoteBookList = message.callbackParameters[0];
	var resumeDownloads = message.callbackParameters[1];
	var content = loadBinaryResource(url);
	message = new WorkerMessage("downloadedBookList", [ content, populateRemoteBookList, resumeDownloads ]);
	postMessage(message);
    } else if (message.id == "downloadMetalink") {
	var url = message.parameters[0];
	var id = message.callbackParameters[0];
	var content = loadBinaryResource(url);
	message = new WorkerMessage("downloadedMetalink", [ id, content ]);
	postMessage(message);
    }
};
