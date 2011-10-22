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
