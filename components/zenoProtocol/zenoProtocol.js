/*  ZenoProtocol - Zeno protocol handler for Kiwix, offline reader of Wikipedia
    based on moulin protocol handler
    Copyright (C) 2008, LinterWeb (France), Guillaume Duhamel
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

const nsIProtocolHandler   = Components.interfaces.nsIProtocolHandler;
const nsIURI               = Components.interfaces.nsIURI;
const nsIStringInputStream = Components.interfaces.nsIStringInputStream;
const nsIChannel           = Components.interfaces.nsIChannel;
const nsIRequest           = Components.interfaces.nsIRequest;
const nsISupports          = Components.interfaces.nsISupports;

const ZENO_PROTOCOL_HANDLER_CID   = Components.ID("{a4d35b24-db6a-4522-929f-297723019229}");
const ZENO_PROTOCOL_HANDLER_CTRID = "@mozilla.org/network/protocol;1?name=zeno";

function ZenoChannel (uri)
{
  this.URI = uri;

  this.originalURI = uri;
  this._isPending = true; // why?
  this.stringStream = Components.classes["@mozilla.org/io/string-input-stream;1"].createInstance(nsIStringInputStream);
}

ZenoChannel.prototype.QueryInterface =
function jsdch_qi (iid)
{
  if (!iid.equals(nsIChannel) /* && !iid.equals(nsIRequest) (do we?) */ &&
      !iid.equals(nsISupports)) {
    throw Components.results.NS_ERROR_NO_INTERFACE;
  }

  return this;
}

/* nsIChannel */
ZenoChannel.prototype.loadAttributes = null;
ZenoChannel.prototype.contentType = "text/html";
ZenoChannel.prototype.contentCharset = "UTF-8";
ZenoChannel.prototype.contentLength = -1;
ZenoChannel.prototype.owner = null;
ZenoChannel.prototype.loadGroup = null;
ZenoChannel.prototype.notificationCallbacks = null;
ZenoChannel.prototype.securityInfo = null;

ZenoChannel.prototype.open =
function zenoch_open()
{
  // We don't have to provide this (should we, anyway?)
  throw Components.results.NS_ERROR_NOT_IMPLEMENTED;
}

// The design of the following few functions is
// based on that in Venkman.

ZenoChannel.prototype.asyncOpen =
function zenoch_aopen (streamListener, context, directURI)
{
	this.streamListener = streamListener;
	this.context = context;
	
  	var zenocom = Components.classes["@linterweb.com/zeno"].getService();
	zenocom = zenocom.QueryInterface(Components.interfaces.iZeno);
	var contentType = new Object();
	var data = zenocom.getArticle(this.URI, contentType);

	this.contentType	= contentType.value;
	this.charset	= "UTF-8";
	this.contentLength	= data.length;

	if (data.length == 0) {
		throw 0x80520012;
	} else {
		this.respond(data);
	}
}

ZenoChannel.prototype.respond =
function zenoch_respond (str)
{
    var storageStream = Components.classes["@mozilla.org/storagestream;1"].
    		createInstance(Components.interfaces.nsIStorageStream);
    var binaryStream = Components.classes["@mozilla.org/binaryoutputstream;1"].
                createInstance(Components.interfaces.nsIBinaryOutputStream);
    storageStream.init(512, 65536, null);
    binaryStream.setOutputStream(storageStream);
    binaryStream.writeBytes(str, this.contentLength);
    this.stringStream = storageStream.newInputStream(0);

    this.streamListener.onStartRequest (this, this.context);

    this.streamListener.onDataAvailable (this, this.context, this.stringStream, 0, this.contentLength);
    this.streamListener.onStopRequest (this, this.context, Components.results.NS_OK);

    this._isPending = false;    
}

function ZenoProtocolHandler() {
}


ZenoProtocolHandler.prototype.scheme = "zeno";

ZenoProtocolHandler.prototype.defaultPort = -1; 
ZenoProtocolHandler.prototype.protocolFlags = nsIProtocolHandler.URI_NORELATIVE|nsIProtocolHandler.URI_NOAUTH;

ZenoProtocolHandler.prototype.allowPort = function zeno_allowport (aPort, aScheme) { return false; }

// Turns a string into an nsURI, possibly relative to
// another nsURI.
ZenoProtocolHandler.prototype.newURI =
function zeno_newuri (spec, charset, baseURI)
{
	//L.info("asking newURI ("+spec.toString()+")");
    var uri = Components.classes["@mozilla.org/network/simple-uri;1"]
    		 .createInstance (Components.interfaces.nsIURI);
   	// handle anchor links
    if (baseURI instanceof nsIURI && spec.indexOf ("#") == 0) {
		var sh = baseURI.spec.indexOf ("#");
		if (sh != -1) {
			var nb = baseURI.spec.substr (0, sh);
			uri.spec = nb+spec; 
		} else
		   	uri.spec = baseURI.spec+spec;
	} else {
            var prefix = spec.indexOf("zeno://");
	    if (prefix == -1) {
	        uri.spec = "zeno://" + spec;
	    } else {
	        uri.spec = spec;
            }
	} 
    return uri;
}

// Turns an nsURI into an nsIChannel
ZenoProtocolHandler.prototype.newChannel =
function zeno_newchannel (uri)
{
    return new ZenoChannel (uri);
}

////////////////////////////////////////////////////////////////
// Zeno protocol handler factory.
var ZenoProtocolHandlerFactory = new Object();

ZenoProtocolHandlerFactory.createInstance =
function zeno_phf_create(outer, iid)
{
  if (outer != null) {
    dump("Don't squish us!\n");
    throw Components.results.NS_ERROR_NO_AGGREGATION;
  }

  if (!iid.equals(nsIProtocolHandler) && !iid.equals(nsISupports)) {
    dump("Ugh, weird interface.\n");
    throw Components.results.NS_ERROR_INVALID_ARG;
  }
  
  return new ZenoProtocolHandler();
}

////////////////////////////////////////////////////////////////
// The Module
var Module = new Object();

Module.registerSelf =
function mod_regself(compMgr, fileSpec, location, type) {
  reg = compMgr.QueryInterface(Components.interfaces.nsIComponentRegistrar);
  reg.registerFactoryLocation(ZENO_PROTOCOL_HANDLER_CID,
			      "zeno protocol handler",
			      ZENO_PROTOCOL_HANDLER_CTRID,
			      fileSpec,
			      location,
			      type);
}

Module.getClassObject =
function mod_getclassobj(compMgr, cid, iid) {
  if (cid.equals(ZENO_PROTOCOL_HANDLER_CID)) {
    return ZenoProtocolHandlerFactory;
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
