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
	var content = loadBinaryResource(message.parameters[0], message.parameters[1]);
	message = new WorkerMessage("downloadedBookList", [ content, message.callbackParameters[0], message.callbackParameters[1] ]);
	postMessage(message);
    } else if (message.id == "downloadMetalink") {
	var content = loadBinaryResource(message.parameters[0], message.parameters[1]);
	message = new WorkerMessage("downloadedMetalink", [ message.callbackParameters[0], content ]);
	postMessage(message);
    }
};
