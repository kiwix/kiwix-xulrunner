function actionedit() {
	var corpuslist = document.getElementById('corpuslist');
	corpusedit(corpuslist.selectedIndex);
}

function actionremove() {
	var corpuslist = document.getElementById('corpuslist');

	var dom = corpusload();
	var corpora = dom.firstChild.childNodes;

	dom.firstChild.removeChild(corpora[corpuslist.selectedIndex]);

	corpussave(dom);

	corpusbuild();
}

function list2radio() {
	var corpuslist = document.getElementById('corpuslist');
	var corpusradio = document.getElementById('corpusradio');

	corpusradio.selectedIndex = corpuslist.selectedIndex;

	var actions = document.getElementById("corpusactions");

	if (!actions) {
		actions = document.createElement("hbox");

		var spacer = document.createElement("spacer");
		spacer.setAttribute("flex", "1");

		var edit = document.createElement("button");
		edit.setAttribute("label", "Edit");
		edit.addEventListener("click", actionedit, false);

		var remove = document.createElement("button");
		remove.setAttribute("label", "Remove");
		remove.setAttribute("icon", "remove");
		remove.addEventListener("click", actionremove, false);

		actions.appendChild(spacer);
		actions.appendChild(edit);
		actions.appendChild(remove);
		actions.setAttribute("id", "corpusactions");
	} else {
		actions = actions.parentNode.removeChild(actions);
	}

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

function corpusload() {
	var dom;

	try {
		var file = Components.classes["@mozilla.org/file/directory_service;1"]
			.getService(Components.interfaces.nsIProperties)
			.get("ProfD", Components.interfaces.nsIFile);
		file.append("corpora.xml");
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
		dom = domParser.parseFromString(fileContents, "text/xml");
	} catch(someproblem) {
		dom = document.implementation.createDocument("","",null);
		var corpora = dom.createElement("corpora");
		dom.appendChild(corpora);
	}

	return dom;
}

function corpusbuild() {
	var richlistbox = document.getElementById("corpuslist");

	while(richlistbox.hasChildNodes()) {
		richlistbox.removeChild(richlistbox.firstChild);
	}

	var dom = corpusload();

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

		var itemname = document.createElement("radio");
		itemname.setAttribute("style", "font-weight : bold");
		itemname.setAttribute("label", corpusname);

		var itemformat = document.createElement("description");
		itemformat.appendChild(document.createTextNode("Format: " + corpusformat));

		var itemroot = document.createElement("description");
		itemroot.appendChild(document.createTextNode("Root: " + corpusroot));

		var itemhome = document.createElement("description");
		itemhome.appendChild(document.createTextNode("Home: " + corpushome));

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

		var richlistitem = document.createElement("richlistitem");
		richlistitem.appendChild(itemvbox);

		richlistbox.appendChild(richlistitem);

		if (corpusselected == "true") {
			richlistbox.selectedIndex = i;
		}
	}
}

function corpussave(doc) {
	var serializer = new XMLSerializer();
	var output = Components.classes["@mozilla.org/network/file-output-stream;1"].
		createInstance(Components.interfaces.nsIFileOutputStream);
	var file = Components.classes["@mozilla.org/file/directory_service;1"]
		.getService(Components.interfaces.nsIProperties)
		.get("ProfD", Components.interfaces.nsIFile);
	file.append("corpora.xml");
	output.init(file, 0x02 | 0x08 | 0x20, 0664, 0);
	serializer.serializeToStream(doc, output, "");
	output.close();

	var file = Components.classes["@mozilla.org/file/directory_service;1"]
		.getService(Components.interfaces.nsIProperties)
		.get("ProfD", Components.interfaces.nsIFile);
	file.append("zenopaths");
	output.init(file, 0x02 | 0x08 | 0x20, 0664, 0);

	var corpora = doc.firstChild.childNodes;
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

	var doc = corpusload();
	var corpora = doc.firstChild;

	var corpus;
	if (typeof window.arguments[1] == 'undefined') {
		corpus = doc.createElement("corpus");
		corpora.appendChild(corpus);
	} else {
		corpus = corpora.childNodes[window.arguments[1]];
	}
	corpus.setAttribute("name", corpusname);
	corpus.setAttribute("format", corpusformat);
	corpus.setAttribute("root", corpusroot);
	corpus.setAttribute("home", corpushome);
	if (corpusindexroot) corpus.setAttribute("indexroot", corpusindexroot);
	else corpus.removeAttribute("indexroot");

	// saving xml to file

	corpussave(doc);

	window.arguments[0]();
	window.close();
}

function corpussaveselected() {
	var selected = document.getElementById("corpuslist").selectedIndex;

	var dom = corpusload();
	var corpora = dom.firstChild.childNodes;
	var n = corpora.length;
	for(var i = 0;i < n;i++) {
		var corpus = corpora[i];

		if (i == selected) {
			corpus.setAttribute("selected", "true");
		} else {
			corpus.removeAttribute("selected");
		}
	}

	corpussave(dom);

	window.close();
}

function corpusgetactive() {
	var dom = corpusload();
	var corpora = dom.firstChild.childNodes;
	var n = corpora.length;
	var active = 0;
	for(var i = 0;i < n;i++) {
		if (corpora[i].getAttribute("selected") == "true") {
			active = i;
		}
	}

	return corpora[active];
}

function corpuseditload() {
	if (typeof window.arguments[1] != 'undefined') {
		var idx = window.arguments[1];
		var dom = corpusload();
		var corpora = dom.firstChild.childNodes;

		var corpus = corpora[idx];

		document.getElementById("corpus-name").value = corpus.getAttribute("name");
		document.getElementById("corpus-format").value = corpus.getAttribute("format");
		document.getElementById("corpus-root").value = corpus.getAttribute("root");
		document.getElementById("corpus-home").value = corpus.getAttribute("home");
		document.getElementById("corpus-index-root").value = corpus.getAttribute("indexroot");
	}
}
