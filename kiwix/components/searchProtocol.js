/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Mozilla.
 *
 * The Initial Developer of the Original Code is IBM Corporation.
 * Portions created by IBM Corporation are Copyright (C) 2004
 * IBM Corporation. All Rights Reserved.
 *
 * Contributor(s):
 *   Darin Fisher <darin@meer.net>
 *   Doron Rosenberg <doronr@us.ibm.com>
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */
const Cc = Components.classes;
const Ci = Components.interfaces;
const Cr = Components.results;

// Test protocol related
const kSCHEME = "search";
const kPROTOCOL_NAME = "Search Protocol";
const kPROTOCOL_CONTRACTID = "@mozilla.org/network/protocol;1?name=" + kSCHEME;
const kPROTOCOL_CID = Components.ID("789409b9-2e3b-4682-a5d1-71ca80a76456");

// Mozilla defined
const kSIMPLEURI_CONTRACTID = "@mozilla.org/network/simple-uri;1";
const kIOSERVICE_CONTRACTID = "@mozilla.org/network/io-service;1";
const nsISupports = Components.interfaces.nsISupports;
const nsIIOService = Components.interfaces.nsIIOService;
const nsIProtocolHandler = Components.interfaces.nsIProtocolHandler;
const nsIURI = Components.interfaces.nsIURI;

Components.utils.import("resource://gre/modules/XPCOMUtils.jsm");

function Protocol()
{
}

Protocol.prototype =
{
    observe: function(){},
    classID: Components.ID(kPROTOCOL_CID),

  QueryInterface: function(iid)
  {
    if (!iid.equals(nsIProtocolHandler) &&
        !iid.equals(nsISupports))
      throw Components.results.NS_ERROR_NO_INTERFACE;
    return this;
  },

  scheme: kSCHEME,
  defaultPort: -1,
  protocolFlags: nsIProtocolHandler.URI_NORELATIVE |
                 nsIProtocolHandler.URI_NOAUTH,
  
  allowPort: function(port, scheme)
  {
    return false;
  },

  newURI: function(spec, charset, baseURI)
  {
    var uri = Components.classes[kSIMPLEURI_CONTRACTID].createInstance(nsIURI);
    uri.spec = spec;
    return uri;
  },

  newChannel: function(URI)
  {
      var channel = new SearchPipeChannel(URI);
      return channel.QueryInterface(Ci.nsIChannel);
  },
}

/* PipeChannel */
var SearchPipeChannel = function(URI) {
    this.pipe = Cc["@mozilla.org/pipe;1"].createInstance(Ci.nsIPipe);
    const PR_UINT32_MAX = Math.pow(2, 32) - 1;
    this.pipe.init(true,true,0, PR_UINT32_MAX,null);
    this.inputStreamChannel = Cc["@mozilla.org/network/input-stream-channel;1"].createInstance(Ci.nsIInputStreamChannel);
    this.inputStreamChannel.setURI(URI);
    this.inputStreamChannel.contentStream = this.pipe.inputStream;
    this.request = this.inputStreamChannel.QueryInterface(Ci.nsIRequest);
    this.channel = this.inputStreamChannel.QueryInterface(Ci.nsIChannel);
}

SearchPipeChannel.prototype = {
    QueryInterface: function(iid){
	if (iid.equals(Ci.nsIChannel) || iid.equals(Ci.nsIRequest) ||
	    iid.equals(Ci.nsISupports))
	    return this;
	throw Cr.NS_NOINTERFACE;
    },
    
    get LOAD_NORMAL() {return this.request.LOAD_NORMAL},
    get LOAD_BACKGROUND() {return this.request.LOAD_BACKGROUND},
    get INHIBIT_CACHING() {return this.request.INHIBIT_CACHING},
    get INHIBIT_PERSISTENT_CACHING() {return this.request.INHIBIT_PERSISTENT_CACHING},
    get LOAD_BYPASS_CACHE() {return this.request.LOAD_BYPASS_CACHE},
    get LOAD_FROM_CACHE() {return this.request.LOAD_FROM_CACHE},
    get VALIDATE_ALWAYS() {return this.request.VALIDATE_ALWAYS},
    get VALIDATE_NEVER() {return this.request.VALIDATE_NEVER},
    get VALIDATE_ONCE_PER_SESSION() {return this.request.VALIDATE_ONCE_PER_SESSION},
    
    get loadFlags() {return this.request.loadFlags},
    set loadFlags(val) {this.request.loadFlags = val},
    get loadGroup() {return this.request.loadGroup},
    set loadGroup(val) {this.request.loadGroup = val},
    get name() {return this.request.name},
    get status() {return this.request.status},

    cancel: function(status) {this.request.cancel(status);},
    isPending: function() {return this.request.isPending();},
    resume: function() {this.request.resume();},
    suspend: function() {this.request.suspend();},
    
    get LOAD_DOCUMENT_URI() {return this.channel.LOAD_DOCUMENT_URI},
    get LOAD_RETARGETED_DOCUMENT_URI() {return this.channel.LOAD_RETARGETED_DOCUMENT_URI},
    get LOAD_REPLACE() {return this.channel.LOAD_REPLACE},
    get LOAD_INITIAL_DOCUMENT_URI() {return this.channel.LOAD_INITIAL_DOCUMENT_URI},
    get LOAD_TARGETED() {return this.channel.LOAD_TARGETED},

    get contentCharset() {return this.channel.contentCharset},
    set contentCharset(val) {this.channel.contentCharset = val},
    get contentLength() {return this.channel.contentLength},
    set contentLength(val) {this.channel.contentLength = val},
    get contentType() {return this.channel.contentType},
    set contentType(val) {this.channel.contentType = val},
    get notificationCallbacks() {return this.channel.notificationCallbacks},
    set notificationCallbacks(val) {this.channel.notificationCallbacks = val},
    get originalURI() {return this.channel.originalURI},
    set originalURI(val) {this.channel.originalURI = val},
    get owner() {return this.channel.owner},
    set owner(val) {this.channel.owner = val},
    get securityInfo() {return this.channel.securityInfo},
    get URI() {return this.channel.URI},


    /* Try to open search index */
    openSearchIndex: function(path) {

	Components.utils.import("resource://modules/settings.jsm");

	var backend = settings.defaultSearchBackend();
	var indexAccessor;
	
	/* Create the xapian accessor */
	if (backend == "clucene") {
	    indexAccessor = Components.classes["@kiwix.org/cluceneAccessor"].getService();
	    indexAccessor = indexAccessor.QueryInterface(Components.interfaces.ICluceneAccessor);
	} else {
	    indexAccessor = Components.classes["@kiwix.org/xapianAccessor"].getService();
	    indexAccessor = indexAccessor.QueryInterface(Components.interfaces.IXapianAccessor);
	}
	
	/* Open the xapian readable database */
	if (!indexAccessor.openReadableDatabase(path, path))
	    return;    
	
	return indexAccessor;
    },
    
    /* Search a pattern in the index */
    searchInIndex: function(query, indexDirectory, start, end, loadFirstResult) {
	var value;

	Components.utils.import("resource://modules/env.jsm");

	/* Get the index accessor */
	var indexAccessor = this.openSearchIndex(indexDirectory);

	/* Security check */
	if (!indexAccessor) return;
	
	/* Make a search */
	if (indexAccessor.search(query, start, end)) {
	    
	    /* Display the HTML */
	    var html = new Object();
	    indexAccessor.getHtml(html);
	    value = html.value;
	}
	
	/* Close the xapian readable databse */
	indexAccessor.closeReadableDatabase();

	return value;
    },

    asyncOpen: function(listener, context) {

	this.channel.asyncOpen(listener, context);
	
	if(false/* some reason to abort */) {
	    this.request.cancel(Cr.NS_BINDING_FAILED);
	    Cc["@mozilla.org/embedcomp/prompt-service;1"]
		.getService(Ci.nsIPromptService)
		.alert(null, 'Error message.', 'Error message.');
	    return;
	}

	Components.utils.import("resource://modules/library.jsm");

	// aURI is a nsIUri, so get a string from it using .spec
	var uri = this.URI.clone();
	var indexOfPattern = uri.spec.indexOf("pattern=");
	var indexOfStart = uri.spec.indexOf("start=");
	var indexOfEnd = uri.spec.indexOf("end=");
	var pattern = decodeURI(uri.spec.substring(indexOfPattern + 8, indexOfStart -1));
	var start = uri.spec.substring(indexOfStart + 6, indexOfEnd -1);
	var end = uri.spec.substring(indexOfEnd + 4);
	var currentBook = library.getCurrentBook();
	var html = this.searchInIndex(pattern, currentBook.indexPath, start, end, true);

	this.pipe.outputStream.write(html, html.length);
	this.pipe.outputStream.close();
    },
    
    open: function() {return this.channel.open();},
    
    close: function() {this.pipe.outputStream.close();}
    
}



var ProtocolFactory = new Object();

ProtocolFactory.createInstance = function (outer, iid)
{
  if (outer != null)
    throw Components.results.NS_ERROR_NO_AGGREGATION;

  if (!iid.equals(nsIProtocolHandler) &&
      !iid.equals(nsISupports))
    throw Components.results.NS_ERROR_NO_INTERFACE;

  return new Protocol();
}


if (XPCOMUtils.generateNSGetFactory) {
    var NSGetFactory = XPCOMUtils.generateNSGetFactory([Protocol]);
} else {
    var TestModule = new Object();
    
    TestModule.registerSelf = function (compMgr, fileSpec, location, type)
    {
	compMgr = compMgr.QueryInterface(Components.interfaces.nsIComponentRegistrar);
	compMgr.registerFactoryLocation(kPROTOCOL_CID,
					kPROTOCOL_NAME,
					kPROTOCOL_CONTRACTID,
					fileSpec, 
					location, 
					type);
    }
    
    TestModule.getClassObject = function (compMgr, cid, iid)
    {
	if (!cid.equals(kPROTOCOL_CID))
	    throw Components.results.NS_ERROR_NO_INTERFACE;
	
	if (!iid.equals(Components.interfaces.nsIFactory))
	    throw Components.results.NS_ERROR_NOT_IMPLEMENTED;
	
	return ProtocolFactory;
    }
    
    TestModule.canUnload = function (compMgr)
    {
	return true;
    }
    
    function NSGetModule(compMgr, fileSpec)
    {
	return TestModule;
    }
}

