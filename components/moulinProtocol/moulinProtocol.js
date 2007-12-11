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

const MOULIN_PROTOCOL_HANDLER_CID   = Components.ID("{0b4543e6-f390-4a87-920e-e3c331113410}");
const MOULIN_PROTOCOL_HANDLER_CTRID = "@mozilla.org/network/protocol;1?name=moulin";

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
  
	var prompt = Components.classes["@mozilla.org/network/default-prompt;1"].createInstance(Components.interfaces.nsIPrompt);
	var moulinComp = Components.classes["@kunnafoni.org/cpp_nsMoulin;1"].createInstance(Components.interfaces.nsIMoulin);
	
	var path = Url.decode(this.URI.path);
	//prompt.alert("d", path);
	extractedPath = extractMoulinURI(path);
	var project	= extractedPath.project;
	var lang	= extractedPath.lang;
	var articleName	= extractedPath.articleName;
	var project_domain	= extractedPath.project_domain;

	// we have `project`, `lang` and `articleName` to search DB
	//prompt.alert("ddd", articleName);
	
	var docrootFD = Components.classes["@mozilla.org/file/directory_service;1"].getService(Components.interfaces.nsIProperties).get("resource:app", Components.interfaces.nsIFile);
	var datarootFD = docrootFD.clone ();
	var todocrootpath = "chrome/locale/"+lang+"/moulin/docroot";
	for each (var i in todocrootpath.split("/")) { docrootFD.append(i); }
	var todataspath = "datas/"+lang;
	for each (var i in todataspath.split("/")) { datarootFD.append(i); }

    // get projects list
	var moulinNFO = {};
    moulinNFO.catalogFD = datarootFD.clone ();
    moulinNFO.catalogFD.append("catalog");
    moulinNFO.catalogFormat = parseFormat(getFileContent(moulinNFO.catalogFD.path));

	datarootFD.append(project);
	dataDB = datarootFD.clone();
	dataDB.append("index.db");
	dataFormat = datarootFD.clone();
	dataFormat.append("format");
	
	dataBaseResult = fetchDBDetails(dataDB, articleName);
	while (dataBaseResult.redirect != "" && dataBaseResult.redirect != dataBaseResult.articleName) { // should prevent an infinite loop ?
		//prompt.alert("redirect", "redirecting "+dataBaseResult.articleName+" to "+Url.encode(dataBaseResult.redirect).replace("moulin%3A//", "moulin://"));
		if (dataBaseResult.redirect.indexOf("moulin://") == 0) {
			break;
		}
		dataBaseResult = fetchDBDetails(dataDB, dataBaseResult.redirect);
	}

	if (dataBaseResult.redirect != "") {
		// shouldn't happen.
		//prompt.alert("Redirection", "Requested article ("+dataBaseResult.articleName+") point to "+dataBaseResult.redirect+" in the database.");
	}
	
	if (dataBaseResult.nbOccur == 0 || dataBaseResult.nbOccur == "0") {
		// not found in DB ; should send the error page.
		//prompt.alert("Database Error", "Requested article ("+dataBaseResult.articleName+") couldn't be found in the database.");
		L.info("Article Not found in Database ("+articleName+")");
		errorFile = docrootFD.clone();
		errorFile.append("error.html");
		dataString = getFileContent(errorFile.path);
		this.respond(dataString);
		return;
	}

	if (dataBaseResult.aarchive != dataBaseResult.barchive)
		length = -1;
	else
		length = dataBaseResult.bstartoff - dataBaseResult.astartoff;
		
	// load project-specific configuration
	format = parseFormat(getFileContent(dataFormat.path));
	
	// overwrite nsIChannel settings
	if (!format.extension)
		format.extension = "";
	if (format.type)
		this.contentType = format.type;
	if (format.charset)
		this.contentCharset = format.charset;
	this.contentLength = length;
	
	if (format.header) {
		var headerFile = docrootFD.clone();
		headerFile.append(format.header);
	}
	if (format.footer) {
		var footerFile = docrootFD.clone();
		footerFile.append(format.footer);
	}
	
	archivefile = datarootFD.clone();
	archivefile.append(dataBaseResult.aarchive+format.extension);

	var dataString = new String();
	if (format.header) {
	   if (!format.newcharset) {
            var converter = Components.classes["@mozilla.org/intl/scriptableunicodeconverter"].createInstance(Components.interfaces.nsIScriptableUnicodeConverter);
	       	converter.charset =  format.charset;
    		var pageTitle = converter.ConvertFromUnicode(dataBaseResult.articleName);
        } else { pageTitle = dataBaseResult.articleName }
		dataString += globalReplace(getFileContent(headerFile.path), {var:"TITLE", value:pageTitle});
    }

	//	CrossNamespace redirection
	if (dataBaseResult.redirect.indexOf("moulin://") == 0) {
		var uri = Components.classes["@mozilla.org/network/simple-uri;1"].createInstance (Components.interfaces.nsIURI);
		uri.spec = dataBaseResult.redirect;
		var uriParts = extractedPath = extractMoulinURI(uri.path);
//		L.info(uriParts.project);
		var converter = Components.classes["@mozilla.org/intl/scriptableunicodeconverter"]
						.createInstance	(Components.interfaces.nsIScriptableUnicodeConverter);
		converter.charset =  format.charset;
		redirectFile = docrootFD.clone();
		redirectFile.append("redirect.html");
		dataString = globalReplace(getFileContent(redirectFile.path),
					{var:"TITLE", value: converter.ConvertFromUnicode(dataBaseResult.articleName)}, 
					{var:"NEWTITLE", value: moulinNFO.catalogFormat[uriParts.project] + ": " + converter.ConvertFromUnicode(dataBaseResult.articleName)}, 
					{var:"REDIRECT_URL", value: Url.encode(dataBaseResult.redirect).replace("moulin%3A//", "moulin://")},
					{var:"PROJECT_DOMAIN", value:project_domain});
		this.respond(dataString);
		return;
	}
	
	if (format.compression.match(/bzip2/i)) {
		dataString += moulinComp.retrieveBzip2Content(archivefile.path, dataBaseResult.astartoff, length);
	} else if (format.compression.match(/gzip/i)) {
		dataString += moulinComp.retrieveGzipContent(archivefile.path, dataBaseResult.astartoff, length);
	} else { // no compression
		try {
		dataString += getContentOfFile(archivefile.path, dataBaseResult.astartoff, length);
		}catch(e) { prompt.alert("ff", e); }
	}

	if (format.newcharset) {
		var converter = Components.classes["@mozilla.org/intl/scriptableunicodeconverter"].createInstance(Components.interfaces.nsIScriptableUnicodeConverter);
		converter.charset =  format.newcharset;
		var dataStringEncoded = converter.ConvertFromUnicode(dataString);
		var pageTitleEncoded = converter.ConvertFromUnicode(pageTitle);
	} else {
		var dataStringEncoded = dataString;
		var pageTitleEncoded = pageTitle;
	}
	
	if (format.footer)
		dataStringEncoded += globalReplace(getFileContent(footerFile.path), {var:"TITLE", value:pageTitleEncoded}, {var:"PROJECT_DOMAIN", value:project_domain});
	
	// some ugly fix while we cant generate new datas. pumbaa we miss you !
	dataStringEncoded = globalReplace2(dataStringEncoded, {var:"&lt;/div&gt;", value:""});
	
	try {
	/*var file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
 	file.initWithPath("/tmp/current.html");
		writeToFile (file, dataString);*/

		this.respond(dataStringEncoded);
	} catch(ex) {
		dump("error aopen: "+ex);
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


MoulinProtocolHandler.prototype.scheme = "moulin";

MoulinProtocolHandler.prototype.defaultPort = -1; 
MoulinProtocolHandler.prototype.protocolFlags = nsIProtocolHandler.URI_NORELATIVE|nsIProtocolHandler.URI_NOAUTH;

MoulinProtocolHandler.prototype.allowPort = function moulin_allowport (aPort, aScheme) { return false; }

// Turns a string into an nsURI, possibly relative to
// another nsURI.
MoulinProtocolHandler.prototype.newURI =
function moulin_newuri (spec, charset, baseURI)
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
	    uri.spec = spec;
	} 
    return uri;
}

// Turns an nsURI into an nsIChannel
MoulinProtocolHandler.prototype.newChannel =
function moulin_newchannel (uri)
{
//	L.info("asking newChannel ("+uri.toString()+")");
    return new MoulinChannel (uri);
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

function extractMoulinURI(path) {
	var tmp = path.substr(2, path.length); // now should be like encyclopedia/fr/whatever
	sepI = tmp.indexOf("/");
	var project = tmp.slice(0, sepI);
	tmp = tmp.substr(sepI + 1, tmp.length); // now should be like fr/whatever
	sepI = tmp.indexOf("/");
	var lang = tmp.slice(0, sepI);
	var articleName = tmp.substr(sepI + 1, tmp.length).replace(/ /g, "_");;
	var project_domain = (project == "encyclopedia") ? "wikipedia" : "wiki"+project;
	var sharp = articleName.indexOf ("#");
	if (sharp != -1) {
		articleName = articleName.substr (0, sharp);
	}
	return {project:project, lang:lang, articleName:articleName, project_domain:project_domain};
}

// returns the content of a file ; used for templating.
function getFileContent(fileName) {
	var dataString = "";
	var file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
 	file.initWithPath(fileName);
	var fstream = Components.classes["@mozilla.org/network/file-input-stream;1"].createInstance(Components.interfaces.nsIFileInputStream);
	var sstream = Components.classes["@mozilla.org/scriptableinputstream;1"].createInstance(Components.interfaces.nsIScriptableInputStream);
	fstream.init(file, -1, 0, 0);
	sstream.init(fstream); 

	var str = sstream.read(4096);
	while (str.length > 0) {
		dataString += str;
		str = sstream.read(4096);
	}

	sstream.close();
	fstream.close();

	return dataString;
}

function getContentOfFile(fileName, startoffset, length) {
	var dataString = "";
	var file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
 	file.initWithPath(fileName);
	var fstream = Components.classes["@mozilla.org/network/file-input-stream;1"].createInstance(Components.interfaces.nsIFileInputStream);
	var sstream = Components.classes["@mozilla.org/scriptableinputstream;1"].createInstance(Components.interfaces.nsIScriptableInputStream);
	fstream.init(file, -1, 0, 0);
	sstream.init(fstream); 

	sstream.read(startoffset);
	dataString = sstream.read(length);

	sstream.close();
	fstream.close();

	return dataString;
}

// returns DB details such as redirect, archives and offsets
function fetchDBDetails( dataDB, articleName ) {
	var result = {};
	var storageService = Components.classes["@mozilla.org/storage/service;1"]
	.getService(Components.interfaces.mozIStorageService);
	L.info ("Querying DB: " + dataDB.path);
	var mDBConn = storageService.openDatabase(dataDB);
	var statement = mDBConn.createStatement(" SELECT a.title, a.archive, a.startoff, b.archive, b.startoff, a.id, a.redirect, (SELECT id from windex ORDER BY id DESC LIMIT 0,1) as last FROM windex a, windex b WHERE (b.id = (a.id + 1) OR (b.id = a.id AND a.id = last)) AND a.title = ?1;");
	statement.bindUTF8StringParameter(0, articleName);
	result.nbOccur = 0;
	while (statement.executeStep()) {
		result.nbOccur++;
		result.articleName = statement.getUTF8String(0).replace(/_/g, " ");
		result.aarchive = statement.getUTF8String(1);
		result.astartoff = statement.getInt32(2);
		result.barchive = statement.getUTF8String(3);
		result.bstartoff = statement.getInt32(4);
		result.id = statement.getInt32(5);
		result.redirect = statement.getUTF8String(6).replace(/ /g, "_");
		result.last = statement.getInt32(7);
		if (result.id == result.last) {
			result.barchive = result.aarchive + 1;
		}
	}
	return result;
}

function globalReplace(source, args) {
	for (var i = 1; i<=arguments.length -1;i++) {
		source = source.replace(new RegExp("\\[\\[\\["+arguments[i].var+"\\]\\]\\]", "g"), arguments[i].value);
	}
	return source;
}
// please, remove this madness
function globalReplace2(source, args) {
	for (var i = 1; i<=arguments.length -1;i++) {
		source = source.replace(new RegExp(arguments[i].var, "g"), arguments[i].value);
	}
	return source;
}

function parseFormat(formatString) {
	var format = {};
	var formatA = formatString.split("\n");
	for (var i=0;i<formatA.length;i++) {
		var si = formatA[i].indexOf(":");
		format[formatA[i].substr(0, si)] = formatA[i].substr(si+1, formatA[i].length);
	}
	return format;
}

function writeToFile (file, content) {
	var charset = "UTF-8";
	var os = Components.classes["@mozilla.org/intl/converter-output-stream;1"]
	.createInstance(Components.interfaces.nsIConverterOutputStream);
	
	var fos = Components.classes["@mozilla.org/network/file-output-stream;1"]
	.createInstance(Components.interfaces.nsIFileOutputStream);
	fos.init(file, 0x02 | 0x08 | 0x20, 0666, 0); // write, create, truncate

	os.init(fos, charset, 0, 0x0000);

	os.writeString (content);

	os.close ();
	fos.close ();
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
