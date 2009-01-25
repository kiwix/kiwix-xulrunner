/*
 * 
 * Corpus List class
 *
 * Maintains a list of corpus. A file is associated to the list
 * and data can be loaded from/saved to that file.
 * The list have an unique active corpus.
 *
 * The class also implements the nsIWebProgressListener interface.
 *
 */

/* build a new corpus list and load data in the given filename */

function CorpusList(filename) {
	this.filename = filename;
	this.stateIsRequest = false;

	this.load();
}

/* loads a corpus list from a file */

CorpusList.prototype.load = function() {
	try {
		var file = Components.classes["@mozilla.org/file/directory_service;1"]
			.getService(Components.interfaces.nsIProperties)
			.get("ProfD", Components.interfaces.nsIFile);
		file.append(this.filename);
		var fileContents = "";
		var fstream = Components.classes["@mozilla.org/network/file-input-stream;1"]
			.createInstance(Components.interfaces.nsIFileInputStream);
		var sstream = Components.classes["@mozilla.org/scriptableinputstream;1"]
			.createInstance(Components.interfaces.nsIScriptableInputStream);
		fstream.init(file, -1, 0, 0);
		sstream.init(fstream); 

		var str = sstream.read(4096);
		while (str.length > 0) {
			fileContents += str;
			str = sstream.read(4096);
		}

		sstream.close();
		fstream.close();

		var domParser = new DOMParser();
		this.dom = domParser.parseFromString(fileContents, "text/xml");
	} catch(someproblem) {
		this.dom = document.implementation.createDocument("","",null);
		var corpora = this.dom.createElement("corpora");
		this.dom.appendChild(corpora);
	}
}

/* download the given url and replace the file content assiocated with this corpus list */

CorpusList.prototype.update = function(url) {
	var wbp = Components.classes['@mozilla.org/embedding/browser/nsWebBrowserPersist;1']
		.createInstance(Components.interfaces.nsIWebBrowserPersist);
	var ios = Components.classes['@mozilla.org/network/io-service;1']
		.getService(Components.interfaces.nsIIOService);
	var uri;

	try {
		uri = ios.newURI(url, null, null);
	} catch(someerror) {
		alert("Malformed URL: " + url);
		return;
	}

	var file = Components.classes["@mozilla.org/file/directory_service;1"]
		.getService(Components.interfaces.nsIProperties)
		.get("ProfD", Components.interfaces.nsIFile);
	file.append(this.filename);

	wbp.progressListener = this;
	wbp.saveURI(uri, null, null, null, null, file);
}

/* removes a corpus from the list */

CorpusList.prototype.remove = function(idx) {
	var corpora = this.dom.firstChild.childNodes;

	this.dom.firstChild.removeChild(corpora[idx]);
}

/* save the corpus list to a file */

CorpusList.prototype.save = function() {
	var serializer = new XMLSerializer();
	var output = Components.classes["@mozilla.org/network/file-output-stream;1"].
		createInstance(Components.interfaces.nsIFileOutputStream);
	var file = Components.classes["@mozilla.org/file/directory_service;1"]
		.getService(Components.interfaces.nsIProperties)
		.get("ProfD", Components.interfaces.nsIFile);
	file.append("corpora.xml");
	output.init(file, 0x02 | 0x08 | 0x20, 0664, 0);
	serializer.serializeToStream(this.dom, output, "");
	output.close();

	var file = Components.classes["@mozilla.org/file/directory_service;1"]
		.getService(Components.interfaces.nsIProperties)
		.get("ProfD", Components.interfaces.nsIFile);
	file.append("zenopaths");
	output.init(file, 0x02 | 0x08 | 0x20, 0664, 0);

	var corpora = this.dom.firstChild.childNodes;
	var n = corpora.length;
	for(var i = 0;i < n;i++) {
		var corpus = corpora[i];
		if (corpus.getAttribute("format") == "zeno") {
			var data = corpus.getAttribute("root") + " " + corpus.getAttribute("indexroot") + "\n";
			output.write(data, data.length);
		}
	}

	output.close();
}

/* set the active corpus */

CorpusList.prototype.setSelected = function(idx) {
	var corpora = this.dom.firstChild.childNodes;
	var n = corpora.length;
	for(var i = 0;i < n;i++) {
		var corpus = corpora[i];

		if (i == idx) {
			corpus.setAttribute("selected", "true");
		} else {
			corpus.removeAttribute("selected");
		}
	}
}

/* returns the active corpus index */

CorpusList.prototype.getSelected = function() {
	var corpora = this.dom.firstChild.childNodes;
	var n = corpora.length;
	var active = 0;
	for(var i = 0;i < n;i++) {
		if (corpora[i].getAttribute("selected") == "true") {
			active = i;
		}
	}

	return active;
}

/* returns the active corpus */

CorpusList.prototype.getSelectedItem = function() {
	var corpora = this.dom.firstChild.childNodes;

	return corpora[this.getSelected()];
}

CorpusList.prototype.getItemAtIndex = function(idx) {
	return this.dom.firstChild.childNodes[idx];
}

CorpusList.prototype.appendItem = function() {
	var corpus = this.dom.createElement("corpus");
	this.dom.firstChild.appendChild(corpus);

	return corpus;
}

CorpusList.prototype.getIndexByName = function(name) {
	var corpora = this.dom.firstChild.childNodes;
	var n = corpora.length;
	var idx = -1;
	for(var i = 0;i < n;i++) {
		if (corpora[i].getAttribute("name") == name) {
			idx = i;
		}
	}

	return idx;
}

CorpusList.prototype.getItemByName = function(name) {
	var corpora = this.dom.firstChild.childNodes;
	var n = corpora.length;
	var active = null;
	for(var i = 0;i < n;i++) {
		if (corpora[i].getAttribute("name") == name) {
			active = corpora[i];
		}
	}

	return active;
}

CorpusList.prototype.getItemByUrl = function(url) {
	var corpora = this.dom.firstChild.childNodes;
	var n = corpora.length;
	var active = null;
	for(var i = 0;i < n;i++) {
		if (corpora[i].getAttribute("url") == url) {
			active = corpora[i];
		}
	}

	return active;
}

CorpusList.prototype.length = function() {
	return this.dom.firstChild.childNodes.length;
}

CorpusList.prototype.QueryInterface = function(aIID) {
	if (aIID.equals(Components.interfaces.nsIWebProgressListener) ||
			aIID.equals(Components.interfaces.nsISupportsWeakReference) ||
			aIID.equals(Components.interfaces.nsISupports))
		return this;
	throw Components.results.NS_NOINTERFACE;
}

CorpusList.prototype.onStateChange = function(aProgress, aRequest, aFlag, aStatus) {
	var nsIWPL = Components.interfaces.nsIWebProgressListener;
	if (aFlag & nsIWPL.STATE_STOP) { this.load(); alert("Corpus list updated"); }
	return 0;
}

CorpusList.prototype.onLocationChange = function(aProgress, aRequest, aLocation) {
	return 0;
}

CorpusList.prototype.onProgressChange = function(a,b,cur,max,e,f) {}
CorpusList.prototype.onStatusChange = function(a,b,c,d){}
CorpusList.prototype.onSecurityChange = function(a,b,c){}
CorpusList.prototype.onLinkIconAvailable = function(a){} 

function actionedit() {
	var corpuslist = document.getElementById('corpuslist');
	corpusedit(corpuslist.selectedIndex);
}

function actionremove() {
	var corpuslist = document.getElementById('corpuslist');

	var cl = new CorpusList("corpora.xml");
	cl.remove(corpuslist.selectedIndex);
	cl.save();

	corpusbuild();
}

function actioncancel() {
	var corpuslist = document.getElementById('corpuslist');
	var cl = new CorpusList("corpora.xml");
	
	var mainWindow = window.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                  .getInterface(Components.interfaces.nsIWebNavigation)
                  .QueryInterface(Components.interfaces.nsIDocShellTreeItem)
                  .rootTreeItem
                  .QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                  .getInterface(Components.interfaces.nsIDOMWindow);
	mainWindow.opener.installers[corpuslist.selectedIndex - cl.length()].pers.cancelSave();
	mainWindow.opener.installers.splice(corpuslist.selectedIndex - cl.length(), 1);
	corpusbuild();
}

function list2radio() {

	var corpuslist = document.getElementById('corpuslist');

	var cl = new CorpusList("corpora.xml");

	var actions = document.getElementById("corpusactions");
	if (actions) actions.parentNode.removeChild(actions);

	actions = document.createElement("hbox");

	var spacer = document.createElement("spacer");
	spacer.setAttribute("flex", "1");
	actions.appendChild(spacer);

	var l10n = document.getElementById("cm-strings");

	var edit = document.createElement("button");
	edit.setAttribute("label", l10n.getString('kiwix.cm.edit'));
	edit.addEventListener("click", actionedit, false);

	var remove = document.createElement("button");
	remove.setAttribute("label", l10n.getString('kiwix.cm.remove'));
	remove.setAttribute("icon", "remove");
	remove.addEventListener("click", actionremove, false);

	actions.appendChild(edit);
	actions.appendChild(remove);
	actions.setAttribute("id", "corpusactions");

	var ele = corpuslist.selectedItem.firstChild;
	ele.appendChild(actions);
}

function corpusedit(idx) {
	if (idx == -1) {
		window.openDialog('chrome://interfacewiki/content/corpusedit.xul', 'Edit corpus', 'chrome', corpusbuild);
	} else {
		window.openDialog('chrome://interfacewiki/content/corpusedit.xul', 'Edit corpus', 'chrome', corpusbuild, idx);
	}
}

function CorpusInstaller(source) {
	this.url = source.getAttribute("url");
	this.name = source.getAttribute("name")
	this.description = source.getAttribute("description")
	this.format = source.getAttribute("format");
	this.home = source.getAttribute("home");
	this.root = source.getAttribute("root");
	this.progress = false;
	this.installState = 0;

	this.stateIsRequest = false;

	var mainWindow = window.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                  .getInterface(Components.interfaces.nsIWebNavigation)
                  .QueryInterface(Components.interfaces.nsIDocShellTreeItem)
                  .rootTreeItem
                  .QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                  .getInterface(Components.interfaces.nsIDOMWindow);
	var installers = mainWindow.installers;

	for(var i = 0;i < installers.length;i++) {
		var icorpus = installers[i];
		if (icorpus.name == this.name) throw i;
	}

	installers[installers.length] = this;
}

CorpusInstaller.prototype.getListItem = function() {
	return this.richlistitem;
}

CorpusInstaller.prototype.QueryInterface = function(aIID) {
	if (aIID.equals(Components.interfaces.nsIWebProgressListener) ||
			aIID.equals(Components.interfaces.nsISupportsWeakReference) ||
			aIID.equals(Components.interfaces.nsISupports))
		return this;
	throw Components.results.NS_NOINTERFACE;
}

CorpusInstaller.prototype.onStateChange = function(aProgress, aRequest, aFlag, aStatus) {
	var nsIWPL = Components.interfaces.nsIWebProgressListener;
	if ((aFlag & nsIWPL.STATE_STOP) && (aStatus == 0)) this.postInstall();
	return 0;
}

CorpusInstaller.prototype.onLocationChange = function(aProgress, aRequest, aLocation) {
	return 0;
}

CorpusInstaller.prototype.onProgressChange = function(a,b,cur,max,e,f) {
	if (this.progress) this.progress.value = parseInt((100 * cur) / max);
}

CorpusInstaller.prototype.onStatusChange = function(a,b,c,d){}
CorpusInstaller.prototype.onSecurityChange = function(a,b,c){}
CorpusInstaller.prototype.onLinkIconAvailable = function(a){} 

CorpusInstaller.prototype.install = function(path) {
	var destlist = new CorpusList("corpora.xml");
	var exists = destlist.getItemByName(this.name);
	if (exists != null) {
		var c = confirm('This corpus is already installed\ndo you want to update it?');
		if (c == false) return;
	}

	// Create URI from which we want to download file
	var ios = Components.classes["@mozilla.org/network/io-service;1"].
		getService(Components.interfaces.nsIIOService);
	var uri1 = ios.newURI(this.url, null, null);

	// Set to where we want to save downloaded file (user's desktop)
	var file = Components.classes['@mozilla.org/file/local;1'].
		createInstance(Components.interfaces.nsILocalFile);
	file.initWithPath(path);

	this.indexroot = path;

	var tmp = this.url.split("/");
	var filename = tmp[tmp.length - 1];

	file.append(filename);
	this.filepath = file.path;
	var uri2 = ios.newFileURI(file);

	// Observer for download
	var nsIWBP = Components.interfaces.nsIWebBrowserPersist;
	var pers = Components.classes["@mozilla.org/embedding/browser/nsWebBrowserPersist;1"].
		createInstance(nsIWBP);
	pers.persistFlags = nsIWBP.PERSIST_FLAGS_REPLACE_EXISTING_FILES |
		nsIWBP.PERSIST_FLAGS_BYPASS_CACHE |
		nsIWBP.PERSIST_FLAGS_AUTODETECT_APPLY_CONVERSION;

	this.pers = pers;
	this.pers.progressListener = this;
	pers.saveURI(uri1, null, null, null, null, uri2);

	this.installState = 1;
}

CorpusInstaller.prototype.cancel = function() {

  if (this.installState == 1) this.pers.cancelSave();
  this.listitem.parentNode.removeChild(this.listitem);
  this.installState = 2;
}

CorpusInstaller.prototype.postInstall = function() {
	var corpuslist = new CorpusList("corpora.xml");
	var corpus = corpuslist.getItemByName(this.name);
	var update = true;
	if (corpus == null) {
		update = false;
		corpus = corpuslist.appendItem();
	}

	corpus.setAttribute("name", this.name);
	corpus.setAttribute("format", this.format);
	corpus.setAttribute("root", this.root);
	corpus.setAttribute("home", this.home);
	corpus.setAttribute("url", this.url);

	var minitar = Components.classes["@linterweb.com/minitar"].createInstance(Components.interfaces.iMiniTar);
	this.indexroot = minitar.untar(this.filepath);
	corpus.setAttribute("indexroot", this.indexroot);

	corpuslist.save();

	var mainWindow = window.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                  .getInterface(Components.interfaces.nsIWebNavigation)
                  .QueryInterface(Components.interfaces.nsIDocShellTreeItem)
                  .rootTreeItem
                  .QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                  .getInterface(Components.interfaces.nsIDOMWindow);
	var idx = -1;
	for(var i = 0;i < mainWindow.installers.length;i++) {
		var icorpus = mainWindow.installers[i];
		if (icorpus.name == this.name) idx = i;
	}

	this.installState = 2;
	var richlistbox = document.getElementById("wk-corpuslist");
	var isvisible = (this.listitem.parentNode.selectedItem == this.listitem);
	this.listitem.parentNode.removeChild(this.listitem);
	var newitem;
	if (update) {
		newitem = richlistbox.getItemAtIndex(corpuslist.getIndexByName(this.name));
	} else {
		newitem = addListCorpus(this.name,
			"javascript:goTo('zeno://" + this.root + "/" + this.home.replace(/\+/g, "%2B") + "')");
	}
	if (isvisible) {
		richlistbox.selectedItem = newitem;
		goTo("zeno://" + this.root + "/" + this.home.replace(/\+/g, "%2B"));
	}
}

function corpusbuild() {
	var richlistbox = document.getElementById("corpuslist");

	while(richlistbox.hasChildNodes()) {
		richlistbox.removeChild(richlistbox.firstChild);
	}

	// Corpus already present
	var cl = new CorpusList("corpora.xml");
	var dom = cl.dom;

	var c = dom.firstChild.childNodes;
	var n = c.length;
	for(var i = 0;i < n;i++) {
		var corpus = c[i];
		var corpusname = corpus.getAttribute("name");
		var corpusformat = corpus.getAttribute("format");
		var corpusroot = corpus.getAttribute("root");
		var corpushome = corpus.getAttribute("home");
		var corpusindexroot = corpus.getAttribute("indexroot");
		var corpusselected = corpus.getAttribute("selected");

		var itemname = document.createElement("label");
		itemname.setAttribute("style", "font-weight : bold");
		itemname.setAttribute("value", corpusname);

		var itemformat = document.createElement("description");
		itemformat.appendChild(document.createTextNode("Format: " + corpusformat));

		var itemroot = document.createElement("description");
		itemroot.appendChild(document.createTextNode("Root: " + corpusroot));

		var itemhome = document.createElement("description");
		itemhome.appendChild(document.createTextNode("Home: " + decodeURI(corpushome)));

		var itemhbox = document.createElement("hbox");
		itemhbox.appendChild(itemformat);
		itemhbox.appendChild(itemroot);
		itemhbox.appendChild(itemhome);

		if (corpusindexroot) {
			var itemindexroot = document.createElement("description");
			itemindexroot.appendChild(document.createTextNode("Index root: " + corpusindexroot));
			itemhbox.appendChild(itemindexroot);
		}

		var itemvbox = document.createElement("vbox");
		itemvbox.appendChild(itemname);
		itemvbox.appendChild(itemhbox);
		itemvbox.setAttribute("flex", 1);

		var richlistitem = document.createElement("richlistitem");
		richlistitem.appendChild(itemvbox);

		richlistbox.appendChild(richlistitem);

		if (corpusselected == "true") {
			richlistbox.selectedIndex = i;
		}
	}
}

function corpusclose() {
	var mainWindow = window.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                  .getInterface(Components.interfaces.nsIWebNavigation)
                  .QueryInterface(Components.interfaces.nsIDocShellTreeItem)
                  .rootTreeItem
                  .QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                  .getInterface(Components.interfaces.nsIDOMWindow);
	for(var i = 0;i < mainWindow.opener.installers.length;i++) {
		var corpus = mainWindow.opener.installers[i];
		corpus.progress = false;
	}
}

function savecorpus() {

	// storing form content and sanity checks

	var corpusname = document.getElementById("corpus-name").value;
	if (corpusname == "") {
		alert("You must set the corpus name");
		return;
	}

	var corpusformat = document.getElementById("corpus-format").value;

	var corpusroot = document.getElementById("corpus-root").value;
	if (corpusroot == "") {
		alert("You must set the corpus root");
		return;
	}

	var corpushome = document.getElementById("corpus-home").value;
	if (corpushome == "") {
		alert("You must set the corpus home");
		return;
	}

	var corpusindexroot = document.getElementById("corpus-index-root").value;

	// xml document building

	var cl = new CorpusList("corpora.xml");

	var corpus;
	if (typeof window.arguments[1] == 'undefined') {
		corpus = cl.appendItem();
	} else {
		corpus = cl.getItemAtIndex(window.arguments[1]);
	}
	corpus.setAttribute("name", corpusname);
	corpus.setAttribute("format", corpusformat);
	corpus.setAttribute("root", corpusroot);
	corpus.setAttribute("home", encodeURI(corpushome));
	if (corpusindexroot) corpus.setAttribute("indexroot", corpusindexroot);
	else corpus.removeAttribute("indexroot");

	// saving xml to file

	cl.save();

	window.arguments[0]();
	window.close();
}

function corpuseditload() {
	if (typeof window.arguments[1] != 'undefined') {
		var idx = window.arguments[1];
		var cl = new CorpusList("corpora.xml");
		var corpus = cl.getItemAtIndex(idx);

		document.getElementById("corpus-name").value = corpus.getAttribute("name");
		document.getElementById("corpus-format").value = corpus.getAttribute("format");
		document.getElementById("corpus-root").value = corpus.getAttribute("root");
		document.getElementById("corpus-home").value = decodeURI(corpus.getAttribute("home"));
		document.getElementById("corpus-index-root").value = corpus.getAttribute("indexroot");
	}
}

function remoteInstall() {
/*
        var prefs = Components.classes["@mozilla.org/preferences-service;1"].
          getService().QueryInterface(Components.interfaces.nsIPrefBranch);

	var mainWindow = window.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                  .getInterface(Components.interfaces.nsIWebNavigation)
                  .QueryInterface(Components.interfaces.nsIDocShellTreeItem)
                  .rootTreeItem
                  .QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                  .getInterface(Components.interfaces.nsIDOMWindow);

	var browser;
	try {
	  browser = mainWindow.opener.getBrowser();
	  browser.loadURI(prefs.getCharPref("corpus.url"));
	  window.close();
        } catch(someerror) {
	  browser = mainWindow.getBrowser();
	  browser.loadURI(prefs.getCharPref("corpus.url"));
        }
*/
  var prefs = Components.classes["@mozilla.org/preferences-service;1"].
    getService().QueryInterface(Components.interfaces.nsIPrefBranch);

  goTo(prefs.getCharPref("corpus.url"));
}
