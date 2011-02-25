var aria2Client = new xmlrpc_client ("rpc", "localhost", "6800", "http");

function loadBinaryResource(url) {
    var req = new XMLHttpRequest();
    req.open('GET', url, false);
    req.overrideMimeType('text/plain; charset=x-user-defined');
    req.send(null);
    if (req.status != 200) return '';
    return req.responseText;
}

function startDownload(url) {
    var torrentContent = loadBinaryResource(url);
    var param = new xmlrpcval(torrentContent, "base64");
    var msg = new xmlrpcmsg("aria2.addTorrent", [ param ]);
    var response = aria2Client.send(msg);
    return response.val.scalarVal();
}

function stopDownload(index) {
    var param = new xmlrpcval(index, "base64");
    var msg = new xmlrpcmsg("aria2.remove", [ param ]);
    var response = aria2Client.send(msg);
}