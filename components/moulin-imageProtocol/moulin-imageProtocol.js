/*  moulin - offline wikipedia distro
    Copyright (C) 2006-2007, Kunnafoni Foundation and contributors
    
    Contributor(s):
        2004 Thomas Thurman <thomas@thurman.org.uk>
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

/*
 * Mini Logger to output stuff to JS Console.
 */
function L () {};

L.info = function (str) {
	try { 
		Components.classes['@mozilla.org/consoleservice;1']
		.getService (Components.interfaces.nsIConsoleService)
		.logStringMessage (str);
	} catch (e) {
		dump ("can't log info via nsIConsoleService: " + e.toString ());
	}
}

L.error = function (str) {
	try {
		Components.utils.reportError (str);
	} catch (e) {
		dump ("can't log error via reportError: " + e.toString ());
	}
}

const nsIProtocolHandler   = Components.interfaces.nsIProtocolHandler;
const nsIURI               = Components.interfaces.nsIURI;
const nsIStringInputStream = Components.interfaces.nsIStringInputStream;
const nsIChannel           = Components.interfaces.nsIChannel;
const nsIRequest           = Components.interfaces.nsIRequest;
const nsISupports          = Components.interfaces.nsISupports;

const MOULIN_PROTOCOL_HANDLER_CID   = Components.ID("{137510a5-0825-4530-9ca1-e4bc9a33b531}");
const MOULIN_PROTOCOL_HANDLER_CTRID = "@mozilla.org/network/protocol;1?name=moulin-image";


function MoulinChannel (uri)
{
  this.URI = uri;
  this.originalURI = uri;
  this._isPending = true; // why?
  this.stringStream = Components.classes["@mozilla.org/io/string-input-stream;1"].createInstance(nsIStringInputStream);
}

MoulinChannel.prototype.QueryInterface =
function jsdch_qi (iid)
{
  if (!iid.equals(nsIChannel) /* && !iid.equals(nsIRequest) (do we?) */ &&
      !iid.equals(nsISupports)) {
    throw Components.results.NS_ERROR_NO_INTERFACE;
  }

  return this;
}

/* nsIChannel */
MoulinChannel.prototype.loadAttributes = null;
MoulinChannel.prototype.contentType = "text/html";
MoulinChannel.prototype.contentCharset = "UTF-8";
MoulinChannel.prototype.contentLength = -1;
MoulinChannel.prototype.owner = null;
MoulinChannel.prototype.loadGroup = null;
MoulinChannel.prototype.notificationCallbacks = null;
MoulinChannel.prototype.securityInfo = null;

MoulinChannel.prototype.open =
function moulinch_open()
{
  // We don't have to provide this (should we, anyway?)
  throw Components.results.NS_ERROR_NOT_IMPLEMENTED;
}

// The design of the following few functions is
// based on that in Venkman.

MoulinChannel.prototype.asyncOpen =
function moulinch_aopen (streamListener, context)
{
	this.streamListener = streamListener;
	this.context = context;
	try {
		this.respond("hellllo");
	} catch(ex) {
		dump("error aopen");
	}
}

MoulinChannel.prototype.respond =
function moulinch_respond (str)
{
    this.streamListener.onStartRequest (this, this.context);

    var len = str.length;
    this.stringStream.setData (str, len);
    this.streamListener.onDataAvailable (this, this.context, this.stringStream, 0, len);
    this.streamListener.onStopRequest (this, this.context, Components.results.NS_OK);

    this._isPending = false;    
}

function MoulinProtocolHandler() {
}


MoulinProtocolHandler.prototype.scheme = "moulin-image";

MoulinProtocolHandler.prototype.defaultPort = -1; 
MoulinProtocolHandler.prototype.protocolFlags = nsIProtocolHandler.URI_NORELATIVE|nsIProtocolHandler.URI_NOAUTH;

MoulinProtocolHandler.prototype.allowPort = function moulin_allowport (aPort, aScheme) { return false; }

// Turns a string into an nsURI, possibly relative to
// another nsURI.
MoulinProtocolHandler.prototype.newURI =
function moulin_newuri (spec, charset, baseURI)
{
    var uri = Components.classes["@mozilla.org/network/simple-uri;1"].createInstance(Components.interfaces.nsIURI);
    uri.spec = spec;
    return uri;
}

// Turns an nsURI into an nsIChannel
MoulinProtocolHandler.prototype.newChannel =
function moulin_newchannel (uri)
{
    var path = uri.path;

	var tmp = path.substr(2, path.length); // now should be like encyclopedia/fr/whatever
	sepI = tmp.indexOf("/");
	var lang = tmp.slice(0, sepI);
	tmp = tmp.substr(sepI + 1, tmp.length); // now should be like fr/whatever
	sepI = tmp.indexOf("/");
	var project = "math";
	var articleName = tmp.substr(sepI + 1, tmp.length).replace(/ /g, "_");;
    
    var tmpFile = Components.classes["@mozilla.org/file/directory_service;1"].getService(Components.interfaces.nsIProperties).get("TmpD", Components.interfaces.nsIFile);
    tmpFile.append(articleName+".png");
    
    if (!tmpFile.exists()) {
        var docrootFD = Components.classes["@mozilla.org/file/directory_service;1"].getService(Components.interfaces.nsIProperties).get("resource:app", Components.interfaces.nsIFile);
    	var todocrootpath = "datas/"+lang+"/_"+project;
    	for each (var i in todocrootpath.split("/")) { docrootFD.append(i); }
    	dataDB = docrootFD.clone();
    	dataDB.append("index.db");
		try {
	    	dataBaseResult = fetchDBDetails(dataDB, articleName);
		} catch (e) { L.info (e.toString ()); }
    
        if (dataBaseResult.nbOccur == 0) {
            return;
    	}
    	
    	if (dataBaseResult.aarchive != dataBaseResult.barchive)
    		length = -1;
    	else
    		length = dataBaseResult.bstartoff - dataBaseResult.astartoff;
    
    	archivefile = docrootFD.clone();
    	archivefile.append(dataBaseResult.aarchive);
        
        createTemporaryFile(archivefile.path, dataBaseResult.astartoff, length, tmpFile.path);
    }
    
    var ioService = Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService);
    var newURI = ioService.newURI("file://"+tmpFile.path, null, null); 
    var newChannel = ioService.newChannelFromURI(newURI);
    return newChannel;
}

////////////////////////////////////////////////////////////////
// Moulin protocol handler factory.
var MoulinProtocolHandlerFactory = new Object();

MoulinProtocolHandlerFactory.createInstance =
function moulin_phf_create(outer, iid)
{
  if (outer != null) {
    dump("Don't squish us!\n");
    throw Components.results.NS_ERROR_NO_AGGREGATION;
  }

  if (!iid.equals(nsIProtocolHandler) && !iid.equals(nsISupports)) {
    dump("Ugh, weird interface.\n");
    throw Components.results.NS_ERROR_INVALID_ARG;
  }
  
  return new MoulinProtocolHandler();
}

////////////////////////////////////////////////////////////////
// The Module
var Module = new Object();

Module.registerSelf =
function mod_regself(compMgr, fileSpec, location, type) {
  reg = compMgr.QueryInterface(Components.interfaces.nsIComponentRegistrar);
  reg.registerFactoryLocation(MOULIN_PROTOCOL_HANDLER_CID,
			      "moulin protocol handler",
			      MOULIN_PROTOCOL_HANDLER_CTRID,
			      fileSpec,
			      location,
			      type);
}

Module.getClassObject =
function mod_getclassobj(compMgr, cid, iid) {
  if (cid.equals(MOULIN_PROTOCOL_HANDLER_CID)) {
    return MoulinProtocolHandlerFactory;
  }

  // okay, so something's weird. give up.
  
  if (!iid.equals(Components.interfaces.nsIFactory))
    throw Components.results.NS_ERROR_NOT_IMPLEMENTED;
  
  throw Components.results.NS_ERROR_NO_INTERFACE;
  
}

Module.canUnload =
function mod_canunload(compMgr) {
  return true;
}

////////////////////////////////////////////////////////////////
// NSGetModule
function NSGetModule(compMgr, fileSpec) {
  return Module;
}

function createTemporaryFile(src, startoffset, length, dest) {
	//L.info ("src: "+src+"\ndest: "+dest+"\nstart: "+startoffset+"\nlength: "+length);
    var pngFile = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
    pngFile.initWithPath(src);
    var istream = Components.classes["@mozilla.org/network/file-input-stream;1"].createInstance(Components.interfaces.nsIFileInputStream);
    istream.init(pngFile, -1, -1, false);
    var bstream = Components.classes["@mozilla.org/binaryinputstream;1"].createInstance(Components.interfaces.nsIBinaryInputStream);
    bstream.setInputStream(istream);
    bstream.readBytes(startoffset);
    var bytes = bstream.readBytes(length);

    var aFile = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
    aFile.initWithPath(dest);
    var stream = Components.classes["@mozilla.org/network/safe-file-output-stream;1"].createInstance(Components.interfaces.nsIFileOutputStream);
    stream.init(aFile, 0x04 | 0x08 | 0x20, 777, 0); // write, create, truncate
                
    stream.write(bytes, length);
    if (stream instanceof Components.interfaces.nsISafeOutputStream) {
        stream.finish();
    } else {
        stream.close();
    }

}

// returns DB details such as redirect, archives and offsets
function fetchDBDetails( dataDB, articleName ) {
//	L.info ("db: "+dataDB.path+"\nart: "+articleName);
	var result = {};
	var storageService = Components.classes["@mozilla.org/storage/service;1"].getService(Components.interfaces.mozIStorageService);
	var mDBConn = storageService.openDatabase(dataDB);
	var statement = mDBConn.createStatement("SELECT a.title, a.archive, a.startoff, b.title, b.archive, b.startoff, a.id, a.redirect FROM windex a, windex b WHERE b.id = (a.id + 1) AND a.title = ?1;");
	statement.bindUTF8StringParameter(0, articleName);
	result.nbOccur = 0;
	while (statement.executeStep()) {
		result.nbOccur++;
		result.articleName = statement.getUTF8String(0);
		result.aarchive = statement.getUTF8String(1);
		result.astartoff = statement.getInt32(2);
		result.barchive = statement.getUTF8String(4);
		result.bstartoff = statement.getInt32(5);
		result.redirect = statement.getUTF8String(7);
	}
	return result;
}

////////////////////////////////////////////////////////////////////
//  URL encode / decode (www.webtoolkit.info)
var Url = {

	// public method for url encoding
	encode : function (string) {
		return escape(this._utf8_encode(string));
	},

	// public method for url decoding
	decode : function (string) {
		return this._utf8_decode(unescape(string));
	},

	// private method for UTF-8 encoding
	_utf8_encode : function (string) {
		string = string.replace(/\r\n/g,"\n");
		var utftext = "";

		for (var n = 0; n < string.length; n++) {

			var c = string.charCodeAt(n);

			if (c < 128) {
				utftext += String.fromCharCode(c);
			}
			else if((c > 127) && (c < 2048)) {
				utftext += String.fromCharCode((c >> 6) | 192);
				utftext += String.fromCharCode((c & 63) | 128);
			}
			else {
				utftext += String.fromCharCode((c >> 12) | 224);
				utftext += String.fromCharCode(((c >> 6) & 63) | 128);
				utftext += String.fromCharCode((c & 63) | 128);
			}
		}
		return utftext;
	},

	// private method for UTF-8 decoding
	_utf8_decode : function (utftext) {
		var string = "";
		var i = 0;
		var c = c1 = c2 = 0;

		while ( i < utftext.length ) {

			c = utftext.charCodeAt(i);

			if (c < 128) {
				string += String.fromCharCode(c);
				i++;
			}
			else if((c > 191) && (c < 224)) {
				c2 = utftext.charCodeAt(i+1);
				string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
				i += 2;
			}
			else {
				c2 = utftext.charCodeAt(i+1);
				c3 = utftext.charCodeAt(i+2);
				string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
				i += 3;
			}
		}
		return string;
	}
}
