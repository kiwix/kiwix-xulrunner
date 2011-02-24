function testDownload() {
    var client = new xmlrpc_client ("rpc", "localhost", "6800", "http");
    var param = new xmlrpcval("/tmp/test.torrent", "base64");
    var msg = new xmlrpcmsg("aria2.addTorrent", [ param ]);
    client.send(msg);
}