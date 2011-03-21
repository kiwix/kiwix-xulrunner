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

function Protocol()
{
}

Protocol.prototype =
{
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

  newChannel: function(aURI)
  {
    // aURI is a nsIUri, so get a string from it using .spec
    var mySearchTerm = aURI.spec;

    // strip away the kSCHEME: part
    mySearchTerm = mySearchTerm.substring(mySearchTerm.indexOf(":") + 1, mySearchTerm.length);    
    mySearchTerm = encodeURI(mySearchTerm);

    dump("[mySearchTerm=" + mySearchTerm + "]\n");
    var finalURL = "";
    
    try{ 
      // Get the preferences service
      var prefService = Components.classes["@mozilla.org/preferences-service;1"]
                                  .getService(Components.interfaces.nsIPrefService);

      var prefBranch = prefService.getBranch(null);
  
      defaultSearchURL = prefBranch.getComplexValue("browser.search.defaulturl",
                            Components.interfaces.nsIPrefLocalizedString).data;

      var searchDS = Components.classes["@mozilla.org/rdf/datasource;1?name=internetsearch"]
                               .getService(Components.interfaces.nsIInternetSearchService);

      var searchEngineURI = prefBranch.getCharPref("browser.search.defaultengine");
      if (searchEngineURI) {          
        searchURL = searchDS.GetInternetSearchURL(searchEngineURI, mySearchTerm, 0, 0, {value:0});
        if (searchURL)
          defaultSearchURL = searchURL;      
      }
      dump("[Search Protocol Success: " + defaultSearchURL + "]")
    } catch (e){
      dump("[Search Protocol failed to get the search pref: " + e + "]\n");
    }

   finalURL = defaultSearchURL + mySearchTerm;

    /* create dummy nsIURI and nsIChannel instances */
    var ios = Components.classes[kIOSERVICE_CONTRACTID]
                        .getService(nsIIOService);

    return ios.newChannel("javascript:document.location.href='" + finalURL + "'", null, null);

  },
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


/**
 * JS XPCOM component registration goop:
 *
 * We set ourselves up to observe the xpcom-startup category.  This provides
 * us with a starting point.
 */

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

