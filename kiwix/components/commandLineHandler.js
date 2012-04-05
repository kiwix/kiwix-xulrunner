Components.utils.import("resource://gre/modules/XPCOMUtils.jsm");

const nsISupports           = Components.interfaces.nsISupports;
const nsICategoryManager    = Components.interfaces.nsICategoryManager;
const nsIComponentRegistrar = Components.interfaces.nsIComponentRegistrar;
const nsICommandLine        = Components.interfaces.nsICommandLine;
const nsICommandLineHandler = Components.interfaces.nsICommandLineHandler;
const nsIFactory            = Components.interfaces.nsIFactory;
const nsIModule             = Components.interfaces.nsIModule;
const nsIWindowWatcher      = Components.interfaces.nsIWindowWatcher;

// CHANGEME: to the chrome URI of your extension or application
const CHROME_URI = "chrome://main/content/invisible.xul";

// CHANGEME: change the contract id, CID, and category to be unique
// to your application.
const clh_contractID = "@mozilla.org/commandlinehandler/general-startup;1?type=kiwix-command";

// use uuidgen to generate a unique ID
const clh_CID = Components.ID("{52E289CE-46BC-11E1-AB51-5DED4824019B}");

// category names are sorted alphabetically. Typical command-line handlers use a
// category that begins with the letter "m".
const clh_category = "m-kiwix";

/**
 * Utility functions
 */

/**
 * Opens a chrome window.
 * @param aChromeURISpec a string specifying the URI of the window to open.
 * @param aArgument an argument to pass to the window (may be null)
 */
function openWindow(aChromeURISpec, aArgument)
{
  var ww = Components.classes["@mozilla.org/embedcomp/window-watcher;1"].
	getService(Components.interfaces.nsIWindowWatcher);
    ww.openWindow(null, aChromeURISpec, "_blank",
                  "chrome,menubar,toolbar,status,resizable,dialog=no",
                  aArgument);
}

function pathFromURL(aURL) {
    if (!aURL.match(/^file\:\/\//)) {
	return aURL;
    }
    var ioService = Components.classes["@mozilla.org/network/io-service;1"]
        .getService(Components.interfaces.nsIIOService);
    var baseURI = ioService.newURI(aURL, null, null);
    return baseURI.path;
}

/**
 * The XPCOM component that implements nsICommandLineHandler.
 * It also implements nsIFactory to serve as its own singleton factory.
 */
function myAppHandler(){};

myAppHandler.prototype={
    classID: Components.ID(clh_CID),
    QueryInterface: XPCOMUtils.generateQI([Components.interfaces.nsIComponentRegistrar]),

    QueryInterface : function clh_QI(iid)
    {
	if (iid.equals(nsICommandLineHandler) ||
            iid.equals(nsIFactory) ||
            iid.equals(nsISupports))
	    return this;

	throw Components.results.NS_ERROR_NO_INTERFACE;
    },

    /* nsICommandLineHandler */
    handle : function bch_handle(commandLine) {
	var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
	    .getService(Components.interfaces.nsIWindowMediator);
	var e = wm.getEnumerator("singleton");
	var mostRecent = null;
	if (e && e.hasMoreElements()) {
	    mostRecent = e.getNext();
	}

	/* A window is already open */
	if (mostRecent) {
	    /* Get the singleton Window object */
	    var navNav = mostRecent.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                .getInterface(Components.interfaces.nsIWebNavigation);
	    var rootItem = navNav.QueryInterface(Components.interfaces.nsIDocShellTreeItem).rootTreeItem;
	    var rootWin = rootItem.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                .getInterface(Components.interfaces.nsIDOMWindow);
	    
	    /* Trigger an event to parse the zim file path */
	    var evt = rootWin.document.createEvent("Events");
	    evt.initEvent("onZimArg", true, false);
	    evt.data = commandLine;
	    rootWin.document.dispatchEvent(evt); 
	} else {
	    var windowWatcher = Components.classes["@mozilla.org/embedcomp/window-watcher;1"]
                .getService(nsIWindowWatcher);
	    return windowWatcher.openWindow(null, "chrome://main/content/main.xul", "_blank", 
					    "chrome,dialog=no,all", commandLine);
	}
    },

    /* nsIFactory */
    createInstance : function clh_CI(outer, iid)
    {
	if (outer != null)
	    throw Components.results.NS_ERROR_NO_AGGREGATION;

	return this.QueryInterface(iid);
    },

    lockFactory : function clh_lock(lock)
    {
    /* no-op */
    }
};

if (XPCOMUtils.generateNSGetFactory) {
    var NSGetFactory = XPCOMUtils.generateNSGetFactory([myAppHandler]);
} else {
    /**
 * The XPCOM glue that implements nsIModule
 */
    const myAppHandlerModule = {
  /* nsISupports */
	QueryInterface : function mod_QI(iid)
	{
	    if (iid.equals(nsIModule) ||
		iid.equals(nsISupports))
		return this;

	    throw Components.results.NS_ERROR_NO_INTERFACE;
	},

  /* nsIModule */
	getClassObject : function mod_gch(compMgr, cid, iid)
	{
	    if (cid.equals(clh_CID))
		return new myAppHandler().QueryInterface(iid);

	    throw Components.results.NS_ERROR_NOT_REGISTERED;
	},

	registerSelf : function mod_regself(compMgr, fileSpec, location, type)
	{
	    compMgr.QueryInterface(nsIComponentRegistrar);

	    compMgr.registerFactoryLocation(clh_CID,
					    "myAppHandler",
					    clh_contractID,
					    fileSpec,
					    location,
					    type);

    var catMan = Components.classes["@mozilla.org/categorymanager;1"].
		getService(nsICategoryManager);
	    catMan.addCategoryEntry("command-line-handler",
				    clh_category,
				    clh_contractID, true, true);
	},

	unregisterSelf : function mod_unreg(compMgr, location, type)
	{
	    compMgr.QueryInterface(nsIComponentRegistrar);
	    compMgr.unregisterFactoryLocation(clh_CID, location);

    var catMan = Components.classes["@mozilla.org/categorymanager;1"].
		getService(nsICategoryManager);
	    catMan.deleteCategoryEntry("command-line-handler", clh_category);
	},

	canUnload : function (compMgr)
	{
	    return true;
	}
    };

/* The NSGetModule function is the magic entry point that XPCOM uses to find what XPCOM objects
 * this component provides
 */
    function NSGetModule(comMgr, fileSpec)
    {
	return myAppHandlerModule;
    }
}

