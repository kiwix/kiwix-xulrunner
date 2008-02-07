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

var moulinSearchNFO			    = {};
moulinSearchNFO.currentLang		= null;
moulinSearchNFO.currentProject	= null;
moulinSearchNFO.query			= null;
moulinSearchNFO.subProjectList	= null;
moulinSearchNFO.masterProject	= null;
moulinSearchNFO.highlightedProject = null;
moulinSearchNFO.masterDatas		= {};
moulinSearchNFO.SubProjectsDatas= {};
moulinSearchNFO.docrootFD		= null;
moulinSearchNFO.datarootFD		= null;
moulinSearchNFO.sqlIndex		= 0;
moulinSearchNFO.sqlLimit		= 20;
moulinSearchNFO.sqlLimitMedia	= 5;
moulinSearchNFO.storageService	= null;
moulinSearchNFO.converter		= null;
moulinSearchNFO.catalogFD       = null;
moulinSearchNFO.catalogFormat   = {};
moulinSearchNFO.projectsCatalog = [];
moulinSearchNFO.grandTotal		= 0;
moulinSearchNFO.totalByProject	= [];

/*
 * Initialize various paths depending on request
 */
function Initialize () {
	if (moulinSearchNFO.currentLang == null ||
		moulinSearchNFO.currentProject == null) {
		throw 'UndefinedLangOrProjectException';
	}
	
	// converter is use to transform in-db unicode to UTF-8
	moulinSearchNFO.converter = Components
					.classes ["@mozilla.org/intl/scriptableunicodeconverter"]
					.createInstance (Components.interfaces.nsIScriptableUnicodeConverter);
	moulinSearchNFO.converter.charset =  "UTF-8";
	
	// set docrootFD to root of 
	moulinSearchNFO.docrootFD = Components.classes ["@mozilla.org/file/directory_service;1"]
					.getService (Components.interfaces.nsIProperties)
					.get ("resource:app", Components.interfaces.nsIFile);
	moulinSearchNFO.datarootFD = moulinSearchNFO.docrootFD.clone ();
    
	// docroot
	var todocrootpath = "chrome/locale/" + moulinSearchNFO.currentLang + "/moulin/docroot";
	for each (var i in todocrootpath.split ("/")) { moulinSearchNFO.docrootFD.append (i); }
	
	// datas path
	var todataspath = "datas/" + moulinSearchNFO.currentLang;
	for each (var i in todataspath.split ("/")) { moulinSearchNFO.datarootFD.append (i); }
	
    // get projects list
    moulinSearchNFO.catalogFD = moulinSearchNFO.datarootFD.clone ();
    moulinSearchNFO.catalogFD.append("catalog");
    //L.info (moulinSearchNFO.catalogFD.path);
    moulinSearchNFO.catalogFormat = parseFormat(getFileContent(moulinSearchNFO.catalogFD.path));
    moulinSearchNFO.projectsCatalog = moulinSearchNFO.catalogFormat.project_codes.split(",");
    
	// SQLite engine
	moulinSearchNFO.storageService = Components.classes ["@mozilla.org/storage/service;1"]
									.getService (Components.interfaces.mozIStorageService);
	
	// set the master project
	moulinSearchNFO.masterProject = moulinSearchNFO.currentProject.split ('-', 1) [0];
	
	// set a list of available subprojects
	moulinSearchNFO.subProjectList = GetSubProjectList (moulinSearchNFO.masterProject);
}

/*
 * returns a list of sub projects (catgeories, etc) from master name
 */
function GetSubProjectList (project) {
	var subProjects = [];
	var entries = moulinSearchNFO.datarootFD.directoryEntries;
	while (entries.hasMoreElements()) {
		var f = entries.getNext();
		f.QueryInterface(Components.interfaces.nsIFile);
		var sub_name = f.leafName.split (project+'-');
		if (sub_name[1] != undefined)
			subProjects.push (f.leafName);
	}
	return subProjects;
}

/*
 * retrives actual search results from databases
 */ 
function GetSearchResults (project) {
	var results = { total: 0,
					items: [] };
	
	var dataDB = moulinSearchNFO.datarootFD.clone ();

	dataDB.append (project);
	dataDB.append ("index.db");
    
	var mDBConn = moulinSearchNFO.storageService.openDatabase (dataDB);

	// fetch nmber of total results available
	var request = "SELECT COUNT(*) FROM windex WHERE";
	var words = moulinSearchNFO.query.split(" ");
	var splittedrequest = "";
	for (i=0;i<words.length;i++) {
		splittedrequest += " title LIKE \"%"+words[i]+"%\" AND";
	}
	splittedrequest += " 1";

	request += splittedrequest + ";";
	//L.info(request);
	var statement = mDBConn.createStatement (request);
	//statement.bindUTF8StringParameter (0, "%" + moulinSearchNFO.query + "%");

	while (statement.executeStep ()) {
		results.total = statement.getInt32 (0);
	}
	
	/* fetching the X asked results
	 */
	// we fetch from 0 to limit for each project except the one specified.
	if (moulinSearchNFO.currentProject == project) {
		var limit = { start:moulinSearchNFO.sqlIndex, nbr:moulinSearchNFO.sqlLimit + 1};
	} else {
		var limit = { start:0, nbr:moulinSearchNFO.sqlLimit + 1 };
	}
	statement = mDBConn.createStatement ("SELECT title FROM windex WHERE"+splittedrequest+" LIMIT ?2, ?3;");
	//statement.bindUTF8StringParameter (0, splittedrequest);
	statement.bindInt32Parameter (1, limit.start);
	statement.bindInt32Parameter (2, limit.nbr);
	var nbOccur = 0;
	while (statement.executeStep ()) {
		nbOccur++;
		var result = {};
		var rawtitle = statement.getUTF8String (0);
		var enctitle = moulinSearchNFO.converter.ConvertFromUnicode (rawtitle);
		result.url	= enctitle;
		result.title = enctitle.replace (/_/g, " ");
		results.items.push (result);
	}

//	results.total	= (results.items.length == moulinSearchNFO.sqlLimit) ? moulinSearchNFO.sqlLimit : (results.items.length < moulinSearchNFO.sqlLimit) ? results.items.length : parseInt (moulinSearchNFO.sqlLimit) + 1;
	return results;
}

/*
 * retrieve the html content of template and substitue vars
 */
function getTemplateContent (template, project) {
		
	var templateFile = moulinSearchNFO.docrootFD.clone ();
	templateFile.append ('search-' + template + '.html');

	var content = getFileContent (templateFile.path);
	
	var total_items = moulinSearchNFO.masterDatas.total;

	// add for grand total
	moulinSearchNFO.totalByProject[project] = moulinSearchNFO.masterDatas.total;

	if (template == 'project') {
	var l = moulinSearchNFO.SubProjectsDatas.length;
	for (i in moulinSearchNFO.SubProjectsDatas) {
		if (!isNaN (moulinSearchNFO.SubProjectsDatas[i].total)) {
			total_items += moulinSearchNFO.SubProjectsDatas[i].total;
//			L.info ('incrementing: '+i+': '+moulinSearchNFO.SubProjectsDatas[i].total);
			moulinSearchNFO.totalByProject[i] = moulinSearchNFO.SubProjectsDatas[i].total;
		}
	}
	}

	content = globalReplace (content,
							{var:"TITLE", value: moulinSearchNFO.converter.ConvertFromUnicode (moulinSearchNFO.query)},
							{var:"SEARCHQUERY", value: moulinSearchNFO.converter.ConvertFromUnicode (moulinSearchNFO.query)},
//							{var:"NBRESULTS", value: total_items},						
							{var:"LIMIT_S", value: moulinSearchNFO.sqlIndex},
							{var:"LIMIT_N", value: moulinSearchNFO.sqlLimit},
							{var:"MASTER_PROJECT", value: moulinSearchNFO.masterProject},
							{var:"CURRENT_PROJECT", value: moulinSearchNFO.currentProject},
							{var:"CURRENT_PROJECT2", value: moulinSearchNFO.highlightedProject},
							{var:"LANG", value: moulinSearchNFO.currentLang}
							);
	return content;
}

function getProjectTemplate (project) {
	//L.info ('current: '+moulinSearchNFO.currentProject);
	//L.info ('project: '+project);
	//L.info ('master: '+moulinSearchNFO.masterProject);
	var datas = (moulinSearchNFO.masterProject == project) ? moulinSearchNFO.masterDatas : moulinSearchNFO.SubProjectsDatas[project];
	if (datas.total == 0 )
		return "";
	
	
	var content = getTemplateContent ('project');

	var num = (datas.total < moulinSearchNFO.sqlLimit) ? datas.total : moulinSearchNFO.sqlLimit;
	var diff =  datas.total - moulinSearchNFO.sqlIndex;
	num =  (diff < num) ? diff : num;
	var fullproject = project;
	var itemsContent = new String ();

	moulinSearchNFO.totalByProject[project] = datas.total;
	for (var i=0; i < num; i++) {
		itemsContent += getTemplateContent ('item');
		//L.info ("items de i "+datas.items[i]+" total:"+datas.total+" url:"+datas.items[i].url);
		itemsContent = globalReplace (itemsContent,
							{var:"LINKURL", value: "moulin://" + fullproject + "/" + moulinSearchNFO.currentLang + "/" +datas.items[i].url},
							{var:"LINKNAME", value: datas.items[i].title});
		
		
	}
	//moulinSearchNFO.sqlLimit		= 20;
	var project_name = moulinSearchNFO.catalogFormat[project];
	var selected = (moulinSearchNFO.currentProject == project) ? 'selected' : 'unselected';
	content = globalReplace (content,
							{var:"PROJECT", value: project},
							{var:"PROJECT_NAME", value: project_name},
							{var:"NB_PROJECT", value: datas.total},
							{var:"MASTER_PROJECT", value: moulinSearchNFO.masterProject},
							{var:"PROJECT_LIST_ITEM", value: itemsContent},
							{var:"SELECTED", value: selected}
							);
	return content;
}

function searchResultsForProject(project, lang, query, media, header, footer, selected) {
	if (media) {
		//moulinSearchNFO.sqlLimit = moulinSearchNFO.sqlLimitMedia;
	}
	// set paths, project, sub projects
	Initialize ();
	
	//moulinSearchNFO.masterProject = project;
	moulinSearchNFO.currentProject = project;
	moulinSearchNFO.currentLang = lang;
	moulinSearchNFO.query = query;

	// retrieve both master and subprojects datas
	moulinSearchNFO.masterDatas = GetSearchResults (moulinSearchNFO.masterProject);
	if (moulinSearchNFO.masterDatas.total > 0)
		moulinSearchNFO.highlightedProject = moulinSearchNFO.masterProject;
	//L.info ('master total: '+ moulinSearchNFO.masterDatas.total);
	var l = moulinSearchNFO.subProjectList.length;
	for (var i = 0; i< l; i++) {
		var sproject = moulinSearchNFO.subProjectList[i];
		
		moulinSearchNFO.SubProjectsDatas [sproject] = GetSearchResults (sproject);
		if (moulinSearchNFO.SubProjectsDatas [sproject].total > 0)
			moulinSearchNFO.highlightedProject = sproject;
		//L.info (sproject+ ' total: ' + moulinSearchNFO.SubProjectsDatas [sproject].total);
		//L.info (sproject+ ' first: ' + moulinSearchNFO.SubProjectsDatas [sproject].items[0].url);
	}
	
	var dataString = new String ();
//	searchQueryStr = converter.ConvertFromUnicode (searchQuery);

	if (!media || header)
		dataString += getTemplateContent ('header');

	dataString += getProjectTemplate (moulinSearchNFO.masterProject);
	for (var i = 0; i< l; i++) {
		var sproject = moulinSearchNFO.subProjectList[i];
		dataString += getProjectTemplate (sproject);
	}
	if (moulinSearchNFO.paginationRequested)
		moulinSearchNFO.highlightedProject = moulinSearchNFO.currentProject;
	if (!media || footer)	
		dataString += getTemplateContent ('footer');

	return  dataString; //converter.ConvertFromUnicode(dataString);
}

/*
 *	moulin-search: protocol
 */
const nsIProtocolHandler	= Components.interfaces.nsIProtocolHandler;
const nsIURI				= Components.interfaces.nsIURI;
const nsIStringInputStream	= Components.interfaces.nsIStringInputStream;
const nsIChannel			= Components.interfaces.nsIChannel;
const nsIRequest			= Components.interfaces.nsIRequest;
const nsISupports			= Components.interfaces.nsISupports;

const MOULIN_PROTOCOL_HANDLER_CID	= Components.ID ("{b6226b50-1e46-4fa1-9614-020df0b1a267}");
const MOULIN_PROTOCOL_HANDLER_CTRID	= "@mozilla.org/network/protocol;1?name=moulin-search";

function MoulinChannel (uri) {
	this.URI = uri;
	this.originalURI = uri;
	this._isPending = true; // why?
	this.stringStream = Components
						.classes ["@mozilla.org/io/string-input-stream;1"]
						.createInstance (nsIStringInputStream);
}

MoulinChannel.prototype.QueryInterface = function (iid) {
	if (!iid.equals (nsIChannel) /* && !iid.equals(nsIRequest) (do we?) */ &&
		!iid.equals (nsISupports)) {
		throw Components.results.NS_ERROR_NO_INTERFACE;
	}
	return this;
}

/* nsIChannel */
MoulinChannel.prototype.loadAttributes			= null;
MoulinChannel.prototype.contentType			= "text/html";
MoulinChannel.prototype.contentCharset			= "UTF-8";
MoulinChannel.prototype.contentLength			= -1;
MoulinChannel.prototype.owner				= null;
MoulinChannel.prototype.loadGroup			= null;
MoulinChannel.prototype.notificationCallbacks		= null;
MoulinChannel.prototype.securityInfo			= null;

MoulinChannel.prototype.open = function () {
	// We don't have to provide this (should we, anyway?)
	throw Components.results.NS_ERROR_NOT_IMPLEMENTED;
}

// The design of the following few functions is
// based on that in Venkman.
MoulinChannel.prototype.asyncOpen = function (streamListener, context) {
	
	this.streamListener = streamListener;
	this.context = context;
  
	//var prompt = Components.classes["@mozilla.org/network/default-prompt;1"].createInstance(Components.interfaces.nsIPrompt);
	
	var path = Url.decode (this.URI.path);
	
	//L.info ('path2: '+path);
	var tmp = path.substr (2, path.length); // now should be like encyclopedia/fr/whatever
	sepI = tmp.indexOf ("/");
	var project = tmp.slice (0, sepI);
	if (project.indexOf ("@") != -1) {
		moulinSearchNFO.paginationRequested = true;
		pai = project.indexOf ("@");
		paa = project.slice (0, pai).split (":");
		moulinSearchNFO.sqlIndex = paa [0];
		moulinSearchNFO.sqlLimit	 = paa [1];
		project = project.slice (pai +1, project.length);
	} else {
		moulinSearchNFO.sqlIndex = 0;
	}
	moulinSearchNFO.currentProject = project;
	tmp = tmp.substr (sepI + 1, tmp.length); // now should be like fr/whatever
	sepI = tmp.indexOf ("/");
	moulinSearchNFO.currentLang = tmp.slice (0, sepI);
	moulinSearchNFO.query = tmp.substr (sepI + 1, tmp.length);
	// we have `project`, `lang` and `articleName` to search DB

    Initialize ();
	for (var i in moulinSearchNFO.totalByProject) {
		moulinSearchNFO.totalByProject[i] = 0;
	}
	moulinSearchNFO.grandTotal		= 0;
	moulinSearchNFO.SubProjectsDatas= [];
//	moulinSearchNFO.totalByProject	= [];
//	L.info ('moulinSearchNFO.currentProject: '+moulinSearchNFO.currentProject);

	if (moulinSearchNFO.currentProject == "media") {
		var dataStringUTF8 = "";
		projs = moulinSearchNFO.projectsCatalog;
		for (var i=0;i<projs.length;i++) {
			header = (i == 0);
			footer = (i == projs.length - 1);
			moulinSearchNFO.currentProject = projs[i];
			//L.info("metasearch "+projs[i]);
			dataStringUTF8 += searchResultsForProject(moulinSearchNFO.currentProject, moulinSearchNFO.currentLang, moulinSearchNFO.query, true, header, footer, projs[0]);
		}
	} else {
		var dataStringUTF8 = searchResultsForProject(moulinSearchNFO.currentProject, moulinSearchNFO.currentLang, moulinSearchNFO.query, false, true, true, moulinSearchNFO.currentProject);
	}
	
	for (var i in moulinSearchNFO.totalByProject) {
		if (i != 'undefined') {
//			L.info ('adding '+i+': '+moulinSearchNFO.totalByProject[i]);
			moulinSearchNFO.grandTotal += moulinSearchNFO.totalByProject[i];
		}
	}

	dataStringUTF8 = globalReplace(dataStringUTF8, {var:"NBRESULTS", value: moulinSearchNFO.grandTotal});
	
	try {
		this.respond (dataStringUTF8);
	} catch (e) {
		L.info ("error: "+e.toString ());
	}
}

MoulinChannel.prototype.respond = function (str) {
	this.streamListener.onStartRequest (this, this.context);
    var len = str.length;
    this.stringStream.setData (str, len);
    this.streamListener.onDataAvailable (this, this.context, this.stringStream, 0, len);
    this.streamListener.onStopRequest (this, this.context, Components.results.NS_OK);
    this._isPending = false;    
}

function MoulinProtocolHandler () {
}

MoulinProtocolHandler.prototype.scheme			= "moulin-search";
MoulinProtocolHandler.prototype.defaultPort		= -1; 
MoulinProtocolHandler.prototype.protocolFlags	= nsIProtocolHandler.URI_NORELATIVE | nsIProtocolHandler.URI_NOAUTH;

MoulinProtocolHandler.prototype.allowPort = function (aPort, aScheme) {
	return false;
}

// Turns a string into an nsURI, possibly relative to
// another nsURI.
MoulinProtocolHandler.prototype.newURI = function (spec, charset, baseURI) {
	var uri = Components.classes["@mozilla.org/network/simple-uri;1"]
						.createInstance(Components.interfaces.nsIURI);
	if (spec.indexOf ('moulin-search') == 0) {
	    uri.spec = spec;
	} else {
		//L.info ('SPEC? '+spec);
		uri = baseURI;
	}
    return uri;
}

// Turns an nsURI into an nsIChannel
MoulinProtocolHandler.prototype.newChannel = function (uri) {
	return new MoulinChannel (uri);
}

////////////////////////////////////////////////////////////////
// Moulin protocol handler factory.
var MoulinProtocolHandlerFactory = new Object();

MoulinProtocolHandlerFactory.createInstance = function (outer, iid) {
	if (outer != null) {
		dump("Don't squish us!\n");
		throw Components.results.NS_ERROR_NO_AGGREGATION;
	}

	if (!iid.equals (nsIProtocolHandler) && !iid.equals (nsISupports)) {
		dump("Ugh, weird interface.\n");
		throw Components.results.NS_ERROR_INVALID_ARG;
	}
	return new MoulinProtocolHandler();
}

////////////////////////////////////////////////////////////////
// The Module
var Module = new Object();

Module.registerSelf = function (compMgr, fileSpec, location, type) {
	reg = compMgr.QueryInterface (Components.interfaces.nsIComponentRegistrar);
	reg.registerFactoryLocation (MOULIN_PROTOCOL_HANDLER_CID,
								"moulin protocol handler",
								MOULIN_PROTOCOL_HANDLER_CTRID,
								fileSpec,
								location,
								type);
}

Module.getClassObject = function (compMgr, cid, iid) {
	if (cid.equals (MOULIN_PROTOCOL_HANDLER_CID)) {
		return MoulinProtocolHandlerFactory;
	}

	// okay, so something's weird. give up.
	if (!iid.equals (Components.interfaces.nsIFactory))
		throw Components.results.NS_ERROR_NOT_IMPLEMENTED;

	throw Components.results.NS_ERROR_NO_INTERFACE;
}

Module.canUnload = function (compMgr) {
	return true;
}

////////////////////////////////////////////////////////////////
// NSGetModule
function NSGetModule (compMgr, fileSpec) {
	return Module;
}

// returns the content of a file ; used for templating.
function getFileContent (fileName) {
	var dataString = "";
	var file = Components.classes ["@mozilla.org/file/local;1"]
				.createInstance (Components.interfaces.nsILocalFile);
 	file.initWithPath (fileName);
	var fstream = Components.classes ["@mozilla.org/network/file-input-stream;1"]
				.createInstance (Components.interfaces.nsIFileInputStream);
	var sstream = Components.classes ["@mozilla.org/scriptableinputstream;1"]
				.createInstance (Components.interfaces.nsIScriptableInputStream);
	fstream.init (file, -1, 0, 0);
	sstream.init (fstream); 

	var str = sstream.read (4096);
	while (str.length > 0) {
		dataString += str;
		str = sstream.read (4096);
	}

	sstream.close ();
	fstream.close ();

	return dataString;
}

// returns DB details such as redirect, archives and offsets
function fetchDBDetails (dataDB, articleName ) {
	var result = {};
	var storageService = Components.classes ["@mozilla.org/storage/service;1"]
						.getService (Components.interfaces.mozIStorageService);
	var mDBConn = storageService.openDatabase (dataDB);
	var statement = mDBConn.createStatement ("SELECT a.title, a.archive, a.startoff, b.title, b.archive, b.startoff, a.id, a.redirect FROM windex a, windex b WHERE b.id = (a.id + 1) AND a.title = ?1;");
	statement.bindUTF8StringParameter (0, articleName);
	result.nbOccur = 0;
	while (statement.executeStep ()) {
		result.nbOccur++;
		result.articleName = statement.getUTF8String (0);
		result.aarchive = statement.getUTF8String (1);
		result.astartoff = statement.getInt32 (2);
		result.barchive = statement.getUTF8String (4);
		result.bstartoff = statement.getInt32 (5);
		result.redirect = statement.getUTF8String (7);
	}
	return result;
}

function globalReplace (source, args) {
	for (var i = 1; i <= arguments.length -1; i++) {
		source = source.replace (new RegExp("\\[\\[\\[" + arguments[i].var + "\\]\\]\\]", "g"), arguments[i].value);
	}
	return source;
}

function GetListOfSubProjects (project) {
	
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
