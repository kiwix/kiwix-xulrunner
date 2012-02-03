const Cc = Components.classes;
const Ci = Components.interfaces;
const Cr = Components.results;

Components.utils.import("resource://gre/modules/XPCOMUtils.jsm");

/* Global variables */
var currentZimId = null;
var zimAccessor = null;

/* ZimprotocolHandler */
function ZimprotocolHandler() {
}

ZimprotocolHandler.prototype = {
    defaultPort: -1,

    protocolFlags: Ci.nsIProtocolHandler.URI_NORELATIVE,

    classID: Components.ID("{ee042780-dcf9-11dd-8733-0002a5d5c51b}"),
    QueryInterface: XPCOMUtils.generateQI([Components.interfaces.nsIMyComponent]),

    allowPort: function(port, scheme) { return false; },

    newURI: function(spec, charset, baseURI) {
	var uri = Components.classes["@mozilla.org/network/simple-uri;1"]
	.createInstance (Components.interfaces.nsIURI);
	
	/* Handle anchor links */
	if (baseURI instanceof Components.interfaces.nsIURI && spec.indexOf ("#") == 0) {
	    var sh = baseURI.spec.indexOf ("#");
	    if (sh != -1) {
		var nb = baseURI.spec.substr (0, sh);
	    	uri.spec = nb+spec;
	    } else
	    	uri.spec = baseURI.spec+spec;
	} else {
	    var prefix = spec.indexOf("zim://");
	    if (prefix == -1) {
		if (spec.length < 2 || spec[1] != '/' && spec[0] != '/') {
	            spec = 'A/' + spec;
		}
		uri.spec = "zim://" + spec;
	    } else
		uri.spec = spec;	    
	} 
	
	uri.spec = uri.spec.replace(/\+/g, "%20");
	return uri;
    },
    
    newChannel: function(URI) {
        var channel = new PipeChannel(URI);
        return channel.QueryInterface(Ci.nsIChannel);
    },

    QueryInterface: function(iid) {

        if(!iid.equals(Ci.nsIProtocolHandler) && !iid.equals(Ci.nsISupports)) 
	   throw Cr.NS_ERROR_NO_INTERFACE;
        return this;
    }

}

/* PipeChannel */
var PipeChannel = function(URI) {
    this.pipe = Cc["@mozilla.org/pipe;1"].createInstance(Ci.nsIPipe);
    const PR_UINT32_MAX = Math.pow(2, 32) - 1;
    this.pipe.init(true,true,0, PR_UINT32_MAX,null);
    this.inputStreamChannel = Cc["@mozilla.org/network/input-stream-channel;1"].createInstance(Ci.nsIInputStreamChannel);
    this.inputStreamChannel.setURI(URI);
    this.inputStreamChannel.contentStream = this.pipe.inputStream;
    this.request = this.inputStreamChannel.QueryInterface(Ci.nsIRequest);
    this.channel = this.inputStreamChannel.QueryInterface(Ci.nsIChannel);
}

PipeChannel.prototype = {
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
    
    asyncOpen: function(listener, context) {
	this.channel.asyncOpen(listener, context);
	
	if(false/* some reason to abort */) {
	    this.request.cancel(Cr.NS_BINDING_FAILED);
	    Cc["@mozilla.org/embedcomp/prompt-service;1"]
		.getService(Ci.nsIPromptService)
		.alert(null, 'Error message.', 'Error message.');
	    return;
	}

	/* load the zim file if necessary */
	zimAccessor = Components.classes["@kiwix.org/zimAccessor"].getService();
	zimAccessor = zimAccessor.QueryInterface(Components.interfaces.IZimAccessor);

	/* Remove local anchor */
	var uri = this.URI.clone();
	if (uri.spec.indexOf("#") != -1) 
	    uri.spec = uri.spec.substr(0, uri.spec.indexOf("#"));

	var content = new Object();
	var contentLength = new Object();
	var contentType = new Object();

	if (zimAccessor.getContent(uri, content, contentLength, contentType)) {
	    this.pipe.outputStream.write(content.value, contentLength.value);
	} else {
	    /* TODO, this seems to generate segfaults */
	    /* but is necessary to display an error if the client try to load an unexisting url */
	    //throw("Unable to load article '" + uri.spec + "'.");
	}
	this.pipe.outputStream.close();

    },
    
    open: function() {return this.channel.open();},
    
    close: function() {this.pipe.outputStream.close();}
    
}

/* ZimprotocolHandlerFactory */
var ZimprotocolHandlerFactory = {
    createInstance: function(outer, iid) {
	if(outer != null) throw Cr.NS_ERROR_NO_AGGREGATION;
           return (new ZimprotocolHandler()).QueryInterface(iid);
    },
    
    QueryInterface: function(iid) {
	if(!iid.equals(Ci.nsIFactory) && !iid.equals(Ci.nsISupports))
	   throw Cr.NS_ERROR_NO_INTERFACE;
	return this;
    }
}

if (XPCOMUtils.generateNSGetFactory) {
    var NSGetFactory = XPCOMUtils.generateNSGetFactory([ZimprotocolHandler]);
} else {
    var ZimprotocolModule = new Object();
    
    ZimprotocolModule.registerSelf = function(compMgr, fileSpec, location, type) {
	compMgr = compMgr.QueryInterface(Ci.nsIComponentRegistrar);
	compMgr.registerFactoryLocation(Components.ID("{ee042780-dcf9-11dd-8733-0002a5d5c51b}"),
					"ZIM protocol handler",
					"@mozilla.org/network/protocol;1?name=zim",
					fileSpec, location, type);
	
    }
    
    ZimprotocolModule.unregisterSelf = function(compMgr, location, loaderStr) {
	compMgr = compMgr.QueryInterface(Ci.nsIComponentRegistrar);
	compMgr.unregisterFactoryLocation(Components.ID("{ee042780-dcf9-11dd-8733-0002a5d5c51b}"), location);
    }
    
    ZimprotocolModule.getClassObject = function(compMgr, cid, iid) {
	if(!iid.equals(Ci.nsIFactory)) 
	    throw Cr.NS_ERROR_NOT_IMPLEMENTED;
	if(cid.equals(Components.ID("{ee042780-dcf9-11dd-8733-0002a5d5c51b}"))) 
	    return ZimprotocolHandlerFactory;
	throw Cr.NS_ERROR_NO_INTERFACE;
    }
    
    ZimprotocolModule.canUnload = function(compMgr) {
	return true;
    }
    
    function NSGetModule(compMgr, fileSpec) {
	return ZimprotocolModule;
    }
}