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
    dump("killing aria2c...\n");    
    aria2Process.kill();
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
