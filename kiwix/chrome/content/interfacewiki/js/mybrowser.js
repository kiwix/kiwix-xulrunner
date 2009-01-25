
/* Kiwix 0.5 - a XUL/XPCOM based offline reader for Wikipedia
    Copyright (C) 2006-2007, LinterWeb (France), Emmanuel Engelhart

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

// Minimal specific vocabulary size for giving top of it
var MIN_VOCSPE_SIZE = 800;
// Factor by which font is magnified by pressing ctrl+'+'
var zoomFactor = 1.3;
// Maximal number of search results returned
var NB_SEARCH_RETURN = 25;
// Score upon which the first search result is opened automatically
var AUTO_OPEN_SCORE = 20;
// List of past search queries
var listHisto = new Array;
// Is the completion popup shown ?
var popupIsOpen = false;
// does the completion popup have the focus ?
var focusPopup=false;
// structure for the find in page dialog
var findInstData=null;
// Do we do automatic search while clicking on links ?
var bAutomaticSearch=true;
var bNextAutomaticSearch=false;
var bNoAutoOpen=false;

var searchEngines = new Array();
var sidebars = [ "wk-blockResult", "wk-blockHistory", "wk-blockCorpuslist" ];

function corpusgetactive() {
	var cl = new CorpusList("corpora.xml");

	return cl.getSelectedItem();
}

function corpussetactive(corpusname) {
	var cl = new CorpusList("corpora.xml");

	var idx = cl.getIndexByName(corpusname);

	cl.setSelected(idx);
	cl.save();

	var corpus = cl.getItemAtIndex(idx);
	var homepage = "zeno://" + corpus.getAttribute("root") + "/" + corpus.getAttribute("home").replace(/\+/g, "%2B");
	getBrowser().setAttribute( "homepage", homepage);
}

function startInstall(i) {

  var path = document.getElementById("iw-destination").value;

  var savepath = document.getElementById("iw-save").checked;
  if (savepath) {
    var prefs = Components.classes["@mozilla.org/preferences-service;1"].
      getService(Components.interfaces.nsIPrefBranch);

    prefs.setCharPref("corpus.destination", path);
  }

  var mainWindow = window.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
    .getInterface(Components.interfaces.nsIWebNavigation)
    .QueryInterface(Components.interfaces.nsIDocShellTreeItem)
    .rootTreeItem
    .QueryInterface(Components.interfaces.nsIInterfaceRequestor)
    .getInterface(Components.interfaces.nsIDOMWindow);
  var installer = mainWindow.installers[i];
  installer.install(path);
  installerWizard(i);
}

function cancelInstall(i) {
  var mainWindow = window.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
    .getInterface(Components.interfaces.nsIWebNavigation)
    .QueryInterface(Components.interfaces.nsIDocShellTreeItem)
    .rootTreeItem
    .QueryInterface(Components.interfaces.nsIInterfaceRequestor)
    .getInterface(Components.interfaces.nsIDOMWindow);
  var installer = mainWindow.installers[i];
  installer.cancel();
  document.getElementById('wk-deck').selectedIndex = 0;
}

function installerWizard(i) {

  var mainWindow = window.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
    .getInterface(Components.interfaces.nsIWebNavigation)
    .QueryInterface(Components.interfaces.nsIDocShellTreeItem)
    .rootTreeItem
    .QueryInterface(Components.interfaces.nsIInterfaceRequestor)
    .getInterface(Components.interfaces.nsIDOMWindow);
  var installer = mainWindow.installers[i];
  var prefs = Components.classes["@mozilla.org/preferences-service;1"].
    getService(Components.interfaces.nsIPrefBranch);

  document.getElementById('wk-deck').selectedIndex = 1;
  document.getElementById('iw-corpusname').value = installer.name;

  var actions = document.getElementById('iw-actions');
  while(actions.childNodes.length > 1) actions.removeChild(actions.lastChild);

  var l10n = document.getElementById("wk-strings");

  switch(installer.installState) {
    case 1:
      var cancel = document.createElement('button');
      cancel.setAttribute("onclick", "cancelInstall(" + i + ")");
      cancel.setAttribute("label", l10n.getString("kiwix.iw.cancel"));
      cancel.setAttribute("icon", "cancel");
      actions.appendChild(cancel);

      document.getElementById('iw-pages').selectedIndex = 1;
      break;
    case 0:
    default:
      var start = document.createElement('button');
      start.setAttribute("onclick", "startInstall(" + i + ")");
      start.setAttribute("label", l10n.getString("kiwix.iw.install"));
      start.setAttribute("icon", "apply");
      actions.appendChild(start);

      var cancel = document.createElement('button');
      cancel.setAttribute("onclick", "cancelInstall(" + i + ")");
      cancel.setAttribute("label", l10n.getString("kiwix.iw.cancel"));
      cancel.setAttribute("icon", "cancel");
      actions.appendChild(cancel);

      var installpath = prefs.getCharPref("corpus.destination");
      if (installpath == "") {
        var file = Components.classes["@mozilla.org/file/directory_service;1"].
          getService(Components.interfaces.nsIProperties).
          get("Desk", Components.interfaces.nsIFile);

        document.getElementById("iw-destination").value = file.path;
      } else {
        document.getElementById("iw-destination").value = installpath;
      }

      document.getElementById("iw-save").removeAttribute("checked");

      document.getElementById('iw-pages').selectedIndex = 0;
      break;
  }
}

function corpusInstall(source) {
  var richlistbox = document.getElementById("wk-corpuslist");

  var mainWindow = window.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
    .getInterface(Components.interfaces.nsIWebNavigation)
    .QueryInterface(Components.interfaces.nsIDocShellTreeItem)
    .rootTreeItem
    .QueryInterface(Components.interfaces.nsIInterfaceRequestor)
    .getInterface(Components.interfaces.nsIDOMWindow);
  var installer;
  var i;
  try {
    installer = new CorpusInstaller(source);
    i = mainWindow.installers.length - 1;
    richlistbox.selectedItem = addListCorpusInstaller(i);
  } catch(j) {
    i = j;
    installer = mainWindow.installers[j];
    if (installer.installState == 2) {
      var afteritem = richlistbox.lastChild;
      var k = mainWindow.installers.length - 1;
      while(k > i) {
        if (mainWindow.installers[k].installState != 2) afteritem = mainWindow.installers[k].listitem;
        k--;
      }

      richlistbox.insertBefore(installer.listitem, afteritem);

      installer.installState = 0;
    } 
    richlistbox.selectedItem = installer.listitem;
  }

  affichCorpuslist();
  installerWizard(i);
}

function removeCorpus() {

  var mainWindow = window.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
    .getInterface(Components.interfaces.nsIWebNavigation)
    .QueryInterface(Components.interfaces.nsIDocShellTreeItem)
    .rootTreeItem
    .QueryInterface(Components.interfaces.nsIInterfaceRequestor)
    .getInterface(Components.interfaces.nsIDOMWindow);
  var richlistbox = document.getElementById("wk-corpuslist");
  var i = richlistbox.selectedIndex;
  var n = richlistbox.itemCount;
  var pos = new Array();
  var k = 0;

  for(var j = 0;j < mainWindow.installers.length;j++) {
    if (mainWindow.installers[j].installState != 2) {
      pos[k] = j;
      k++;
    }
  }

  if (i < (n - k)) {
    var corpuslist = document.getElementById('wk-corpuslist');

    var cl = new CorpusList("corpora.xml");
    cl.remove(corpuslist.selectedIndex);
    cl.save();

    corpuslist.removeItemAt(corpuslist.selectedIndex);
  } else {
    cancelInstall(pos[(i + k) - n]);
  }
}

function browseDest() {

  var fp = Components.classes["@mozilla.org/filepicker;1"].
    createInstance(Components.interfaces.nsIFilePicker);
  var file = Components.classes['@mozilla.org/file/local;1'].
    createInstance(Components.interfaces.nsILocalFile);
  file.initWithPath(document.getElementById("iw-destination").value);

  fp.init(window, "Choose installation directory", fp.modeOpen | fp.modeGetFolder);
  fp.displayDirectory = file;
  var ret = fp.show();
  if (ret == fp.returnOK) {
    document.getElementById("iw-destination").value = fp.file.path;
  }
}

function getSearchEngine(corpus) {
  var wikisearch = null;

  if (typeof searchEngines[corpus.getAttribute("name")] == "undefined") {
    if (typeof Components.classes["@linterweb.com/wikicomponent"] != "undefined") {
      wikisearch = Components.classes["@linterweb.com/wikicomponent"].createInstance();
      wikisearch = wikisearch.QueryInterface(Components.interfaces.iWikiSearch);
    }

    if (wikisearch == null) {
      if (typeof Components.classes["@linterweb.com/minicomponent"] == "undefined") {
        return null;
      }
      wikisearch = Components.classes["@linterweb.com/minicomponent"].createInstance();
      wikisearch = wikisearch.QueryInterface(Components.interfaces.iMiniSearch);
    }

    var indexroot = corpus.getAttribute("indexroot");
    if (! indexroot) indexroot = corpus.getAttribute("root");
    wikisearch.init(indexroot);

    searchEngines[corpus.getAttribute("name")] = wikisearch;
  } else {
    wikisearch = searchEngines[corpus.getAttribute("name")];
  }

  return wikisearch;
}


function selectSkin( name ) {

 var prefs = Components.classes["@mozilla.org/preferences-service;1"].
      getService(Components.interfaces.nsIPrefBranch);

 if (name == prefs.getCharPref('general.skins.selectedSkin')) return;

 if (confirm("To change the skin, the application has to be restarted. Shall I restart ?")) {

 prefs.setCharPref('general.skins.selectedSkin', name);
 document.getElementById("clipmenu").hidePopup();
 var window = document.getElementById("mybrowser");
 Components.classes["@mozilla.org/chrome/chrome-registry;1"]
           .getService(Components.interfaces.nsIXULChromeRegistry)
           .reloadChrome();
 }
}

function getBrowser() {

  return document.getElementById("wk-browser");  
}

const nsIWebProgress = Components.interfaces.nsIWebProgress;
const nsIWebProgressListener = Components.interfaces.nsIWebProgressListener;

function MouseScroll(aEvent) {

  if ( aEvent.ctrlKey ) {
    if ( aEvent.detail > 0 ) zoomin();
    if ( aEvent.detail < 0 ) zoomout();
    aEvent.preventDefault();
    aEvent.stopPropagation();
  }
}

function Activate(aEvent)
{
  var link = aEvent.target;

  if (link instanceof HTMLAnchorElement) {
    var gzIdx = link.href.indexOf(".gz",0);
    if (gzIdx>=0)
      link.href=link.href.substr(0,gzIdx);
    if ((link.href.indexOf("/desc/",0)>=0)||(link.href.indexOf(".ogg",0)>=0)) {
      // prevent opening image notices when clicking on images.
      aEvent.preventDefault();
      aEvent.stopPropagation();
    } else 
    if (link.href.indexOf("license://",0)==0) {

      openLicensePage(link.href.substring(10,link.href.length));
      aEvent.preventDefault();
      aEvent.stopPropagation();
    } else
    if ((link.href.indexOf("http://",0)==0)||(link.href.indexOf("https://",0)==0)) {

      // We don't want to open external links in this process: do so in the
      // default browser.
      var ios = Components.classes["@mozilla.org/network/io-service;1"].
        getService(Components.interfaces.nsIIOService);

      var resolvedURI = ios.newURI(link.href, null, null);

      var extps = Components.
        classes["@mozilla.org/uriloader/external-protocol-service;1"].
        getService(Components.interfaces.nsIExternalProtocolService);

      extps.loadURI(resolvedURI, null);
      aEvent.preventDefault();
      aEvent.stopPropagation();
    } else {
//  alert( document.getElementById( "wk-blockSearch" ).collapsed );
      if ((link.href.indexOf("file://",0)==0)&&
          (link.href.indexOf("#",0)<0)&&
          ( ! document.getElementById( "wk-blockResult" ).collapsed )&&
          bAutomaticSearch ) {

        
//        document.getElementById("wk-recherche").value = link.innerHTML;
        bNextAutomaticSearch = true;
        bNoAutoOpen=true;
//        recherche();      
      }
    }
  }
}

function RemoveListener(aEvent) {
  aEvent.target.ownerDocument.removeEventListener("DOMMouseScroll", Activate, true);
  aEvent.target.ownerDocument.removeEventListener("DOMActivate", Activate, true);
  aEvent.target.ownerDocument.removeEventListener("unload", RemoveListener, false);
}

const listener = {
 
  onStateChange: function osc(aWP, aRequest, aStateFlags, aStatus) {

    if ( bNextAutomaticSearch && (aStateFlags & nsIWebProgressListener.STATE_STOP)) {

      bNextAutomaticSearch = false;
      document.getElementById("wk-recherche").value = getBrowser().contentTitle;
      recherche();
    }

    if (aStateFlags & nsIWebProgressListener.STATE_STOP) {
      Components.utils.reportError("STATE_STOP");
      var myDocument = aWP.DOMWindow.document;
      myDocument.addEventListener("DOMMouseScroll", MouseScroll, true);
      myDocument.addEventListener("DOMActivate", Activate, true);
      myDocument.addEventListener("unload", RemoveListener, false);
    }
  },
  onLocationChange: function olc(wp,request,location) {
  },
  QueryInterface: function qi(aIID) {
    if (aIID.equals(nsIWebProgressListener) ||
        aIID.equals(Components.interfaces.nsISupports) ||
        aIID.equals(Components.interfaces.nsISupportsWeakReference)) {
      return this;
    }
    throw Components.results.NS_ERROR_NO_INTERFACE;
  },
};

// Called at startup : asks to wikicomponent the root path to html, and registers the browser
// listener for catching external links
function initRoot() {

  var prefs = Components.classes["@mozilla.org/preferences-service;1"].
      getService(Components.interfaces.nsIPrefBranch);

  var selectedSkin = prefs.getCharPref('general.skins.selectedSkin');
  var skinmenu = document.getElementById("skinmenu");
  var skins = Components.classes["@mozilla.org/file/directory_service;1"].getService(Components.interfaces.nsIProperties).get("AChrom", Components.interfaces.nsIFile);
  skins.append("skin");
  dump("skin dir = " + skins.path + "\n");
  var skin_ls = skins.directoryEntries;
  while(skin_ls.hasMoreElements()) {
    var skin = skin_ls.getNext();
    skin.QueryInterface(Components.interfaces.nsIFile);
    var skintest = skin.clone();
    skintest.append("interfacewiki.css");
    if (skintest.exists()) {
      var skinname = skin.path.substr(skins.path.length + 1);
      var menuitem = document.createElement("menuitem");
      menuitem.setAttribute("label", skinname);
      menuitem.setAttribute("type", "radio");
      if (skinname == selectedSkin) menuitem.setAttribute("checked", true);
      menuitem.addEventListener("command", (function(s) { return function() { selectSkin(s); }; })(skinname), false);
      skinmenu.appendChild(menuitem);
    }
  }

  var dls = Components.classes["@mozilla.org/docloaderservice;1"].
  getService(Components.interfaces.nsIWebProgress);
  dls.addProgressListener(listener,
                          nsIWebProgress.NOTIFY_LOCATION_DOCUMENT |
                          nsIWebProgress.NOTIFY_STATE |
                          nsIWebProgress.NOTIFY_STATE_DOCUMENT);
  searchPopupClose();

  var corpus = corpusgetactive();

  var homepage;
  if (typeof corpus == "undefined") {
    homepage = prefs.getCharPref("corpus.url");
  } else {
    if (corpus.getAttribute("format") == "html") {
      homepage = "file://";
    } else {
      homepage = "zeno://";
    }
    homepage += corpus.getAttribute("root") + "/" + corpus.getAttribute("home").replace(/\+/g, "%2B");
  }

  getBrowser().setAttribute( "homepage", homepage);

  var mainWindow = window.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
    .getInterface(Components.interfaces.nsIWebNavigation)
    .QueryInterface(Components.interfaces.nsIDocShellTreeItem)
    .rootTreeItem
    .QueryInterface(Components.interfaces.nsIInterfaceRequestor)
    .getInterface(Components.interfaces.nsIDOMWindow);
  mainWindow.document.addEventListener("KiwixEvent", function(e) { corpusInstall(e.target); }, false, true);
  mainWindow.installers = new Array();
}

function setVisible(idVisible, booleanVisible){
	var objet = document.getElementById(idVisible);
	objet.collapsed = booleanVisible;
	document.getElementById("wk-recherche").focus();
}

// Retour en arriere dans le navigateur
function back() {
	try{
		var browser = document.getElementById("wk-browser");
		browser.stop();
		browser.goBack();
  if (( bAutomaticSearch )&&( ! document.getElementById( "wk-blockResult" ).collapsed ))
    bNextAutomaticSearch=true;
  bNoAutoOpen=true;
	}catch(e){
		ajouterErreur(e);
		return false;
		dump(e);
	}
	return true;
}

// Page precedente du navigateur
function forward() {
	try{
		var browser = document.getElementById("wk-browser");
		browser.stop();
		browser.goForward();
  if (( bAutomaticSearch )&&( ! document.getElementById( "wk-blockResult" ).collapsed ))
    bNextAutomaticSearch=true;
  bNoAutoOpen=true;
	}catch(e){
		ajouterErreur(e);
		return false;
		dump(e);
	}
	return true;
}

// Affiche une page dont l'url est transmise
function goTo(url){
	document.getElementById('wk-deck').selectedIndex = 0;

	try {
		var browser = document.getElementById("wk-browser");
		var uri;
		var pos = url.indexOf("://", 0);

		if (pos != -1) {
			if (url.substr(0, pos) == "zeno") {
				var pos2 = url.indexOf("/", pos + 3);
				var corpusname = url.substring(pos + 3, pos2);
				corpussetactive(corpusname);
			}
			uri = url;
		} else {
			var corpus = corpusgetactive();
			if (corpus.getAttribute("format") == "html") {
				uri = "file://";
			} else {
				uri = "zeno://";
			}

			uri += corpus.getAttribute("root") + "/" + url;
		}

		browser.loadURI(uri.replace(/\+/g, "%2B"), null, null);
	} catch(e) {
		//ajouterErreur(e);
		//return false;
		dump(e);
	}
}

function openLicensePage(name) {

  var browser = document.getElementById("wk-browser");
  browser.loadURI("chrome://interfacewiki/locale/licenses/"+name+"/index.html", null, null);
}

function deleteListHistory() {

 var desc = document.getElementById("wk-history");
 while ( desc.hasChildNodes() )
   desc.removeChild( desc.lastChild );
}

// Efface le contenu de la liste
function deleteList(){

	desc = document.getElementById("wk-resultat");
        while ( desc.hasChildNodes() )
          desc.removeChild( desc.lastChild );
}

function addListCorpusInstaller(i) {
  var mainWindow = window.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
            .getInterface(Components.interfaces.nsIWebNavigation)
            .QueryInterface(Components.interfaces.nsIDocShellTreeItem)
            .rootTreeItem
            .QueryInterface(Components.interfaces.nsIInterfaceRequestor)
            .getInterface(Components.interfaces.nsIDOMWindow);
  var corpus = mainWindow.installers[i];

  if (corpus.installState == 2) return;

  var richlistbox = document.getElementById("wk-corpuslist");

  var stack = document.createElement("stack");
  stack.setAttribute("flex", 1);

  var progress = document.createElement("progressmeter");
  progress.setAttribute("mode", "determined");
  corpus.progress = progress;
  stack.appendChild(progress);

  var label = document.createElement("label");
  label.setAttribute("value", corpus.name);
  label.setAttribute("style", "background: transparent");
  stack.appendChild(label);

  var richlistitem = document.createElement("richlistitem");
  richlistitem.appendChild(stack);
  richlistitem.setAttribute("onclick", "javascript:installerWizard(" + i + ")");
  
  richlistbox.insertBefore(richlistitem, richlistbox.lastChild);

  corpus.listitem = richlistitem;

  return richlistitem;
}

function addListCorpus(title, action) {
  var mainWindow = window.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
            .getInterface(Components.interfaces.nsIWebNavigation)
            .QueryInterface(Components.interfaces.nsIDocShellTreeItem)
            .rootTreeItem
            .QueryInterface(Components.interfaces.nsIInterfaceRequestor)
            .getInterface(Components.interfaces.nsIDOMWindow);

  var richlistbox = document.getElementById("wk-corpuslist");

  var label = document.createElement("label");
  label.setAttribute("value", title);
  
  var richlistitem = document.createElement("richlistitem");
  richlistitem.appendChild(label);
  richlistitem.setAttribute("onclick", action);

  var i = 0;
  while((i < mainWindow.installers.length) && (mainWindow.installers[i].installState == 2)) i++;

  if (i == mainWindow.installers.length) {
    richlistbox.insertBefore(richlistitem, richlistbox.lastChild);
  } else {
    richlistbox.insertBefore(richlistitem, mainWindow.installers[i].listitem);
  }

  return richlistitem;
}

// Adds an entry in the history list (page is the title, chemin is the command to execute)
function addListHistory(page, chemin){
	// get the richlist
	var l = document.getElementById("wk-history");

	// create a new richlist item
	var li = document.createElement("richlistitem");

	// set label of the richlist item
	var titre = document.createElement("label");
	titre.setAttribute("style", "color:#000; cursor:pointer; font-size: 15px;");
	titre.setAttribute("value", page);
	titre.setAttribute("flex", "0");
	titre.setAttribute("crop", "end");

	li.setAttribute("onclick", chemin );
	li.setAttribute("flex", "0");
	li.setAttribute("style", "cursor:pointer;");

	li.appendChild( titre );
	l.appendChild( li );
}

function addBackground(list) {
	// get the richlist
	var l = document.getElementById(list);

	// create a new richlist item
	var li = document.createElement("richlistitem");
	li.setAttribute("flex", "1");
	l.appendChild( li );
}

// Adds an entry in the result list (page is the title, chemin is the command to execute, score ...
function addList(page, chemin, score){
	try{
                setVisible( "wk-noresult", true );
		// get the richlist
		var l = document.getElementById("wk-resultat");
		
		// create the scoreslide
		var scoreslide = document.createElement("hbox");
		scoreslide.setAttribute("flex", "0");
		var scoreslidef = document.createElement("box");
		var slideWidth = score*2; if ( slideWidth > 180 ) slideWidth = 180;
                scoreslidef.setAttribute("class", "score-slide" );
		scoreslidef.setAttribute("style", 
			"cursor:pointer; width:"+slideWidth+"px;");
		scoreslide.appendChild(scoreslidef);

		// set label of the richlist item
		var titre = document.createElement("label");
		titre.setAttribute("class", "answer-label");
		titre.setAttribute("value", page);
                titre.setAttribute( "tooltiptext", page );
		titre.setAttribute("flex", "0");
		titre.setAttribute("crop", "end");

		// create the stack
		var titrescore = document.createElement("stack");
		titrescore.setAttribute("flex", "0");
		titrescore.appendChild(scoreslide);
		titrescore.appendChild(titre);

		// create a new richlist item
		var li = document.createElement("richlistitem");
		li.setAttribute("onclick", chemin);
		li.setAttribute("flex", "0");
		li.setAttribute("style", "cursor:pointer;");
		li.appendChild(titrescore);

		// add the item to the list
		l.appendChild(li);
	}catch(e){
		ajouterErreur(e);
		return false;
		dump(e);
	}
	return true;
}

// adds the word <mot> in the search text bar
function addword( mot ) {

  var searchbar = document.getElementById("wk-recherche");
  searchbar.value += ' '+mot;
  recherche();
}

function isVisible( id ) {

  return ! document.getElementById( id ).collapsed;
}

function collapseSidebars() {

  for(var i = 0;i < sidebars.length;i++) {
    setVisible(sidebars[i], true);
  }
}

// Affichage de l'historique des recherches
function affichHisto(){

  var visible = isVisible( 'wk-blockHistory' );
  collapseSidebars();

  if ( ! visible ){
    deleteListHistory();
    setVisible( 'wk-blockHistory', false );
    for(var cle in listHisto){
      addListHistory(cle, listHisto[cle]);
    }
    addBackground('wk-history');
  }
  textfocus();
}

// Show search result bar
function affichSearch(){

  var visible = isVisible( 'wk-blockResult' );
  collapseSidebars();

  if ( ! visible ) {
    setVisible( 'wk-blockResult', false );
  }
  textfocus();
}

function affichCorpuslist() {

  if ( isVisible( 'wk-blockCorpuslist' )) return;

  collapseSidebars();
  setVisible( 'wk-blockCorpuslist', false );

  var richlistbox = document.getElementById("wk-corpuslist");
  while(richlistbox.hasChildNodes()) richlistbox.removeChild(richlistbox.lastChild);

  addBackground('wk-corpuslist');

  // Corpus being installed
  var mainWindow = window.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
            .getInterface(Components.interfaces.nsIWebNavigation)
            .QueryInterface(Components.interfaces.nsIDocShellTreeItem)
            .rootTreeItem
            .QueryInterface(Components.interfaces.nsIInterfaceRequestor)
            .getInterface(Components.interfaces.nsIDOMWindow);
  for(var i = 0;i < mainWindow.installers.length;i++) {
    if (mainWindow.installers[i].installState != 2) {
      richlistbox.insertBefore(mainWindow.installers[i].listitem, richlistbox.lastChild);
    }
  }

  var cl = new CorpusList("corpora.xml");
  var dom = cl.dom;
  
  var c = dom.firstChild.childNodes;
  var n = c.length;
  for(var i = 0;i < n;i++) {
    var corpus = c[i];
    var scheme = "zeno://";
    if (corpus.getAttribute("format") == "html") scheme = "file://";

    addListCorpus(
      corpus.getAttribute("name"),
      "javascript:goTo('" + scheme + corpus.getAttribute("root") + "/" +
        corpus.getAttribute("home").replace(/\+/g, "%2B") + "');");
  }

  richlistbox.selectedIndex = cl.getSelected();

  setVisible( 'wk-blockCorpuslist', false );
  textfocus();
}

// close search result bar
function closeSearch(){
	setVisible('wk-blockResult', true);
}

// close history bar
function closeHistory(){
	setVisible('wk-blockHistory', true);
}

function closeCorpuslist() {
	setVisible('wk-blockCorpuslist', true);
}

// do a search query on word <mot>, put it in the text search bar
function rechercheHistory(mot){
	document.getElementById("wk-recherche").value = mot;
	recherche(mot);
	return true;
}

// do a search query
function recherche(){
  searchPopupClose();
  var mot = document.getElementById("wk-recherche").value;

  deleteList();
  var searchok = rechercheXpcom(mot);
  if (! searchok) return false;
  listHisto[mot] = "javascript:rechercheHistory('"+mot+"');";

  if (isVisible('wk-blockResult')) return true;

  collapseSidebars();
  setVisible('wk-blockResult', false);
  return true;
}

// open the "find in page" dialog
function findin() {

  searchPopupClose();
  if ( !findInstData ) {
    findInstData = new nsFindInstData();
    findInstData.browser = getBrowser();
  }
  var lastSearch = document.getElementById("wk-recherche").value;
  var bLastWord = lastSearch.lastIndexOf( " ", lastSearch.length );
  findInstData.webBrowserFind.searchString = lastSearch.substring( bLastWord+1, lastSearch.length );
  findInPage( findInstData );
}

// open the "print" dialog
function print(){
      searchPopupClose();
	try{
		var tt = PrintUtils.print();
		
		//apercu avant impression ==> printPreview();
		//page de modification des marges ==> showPageSetup();
		//getWebBrowserPrint;
	}catch(e){
		ajouterErreur("erreur  " +e);
		return false;
		dump(e);
	}
}

function searchPopupClose() {
  var popup = document.getElementById("wk-searchpopup");
  popup.hidePopup();
  focusPopup=false;
  popupIsOpen=false;
  textfocus();
}

function autoComplete(mot) {

  var textbox = document.getElementById("wk-recherche");
  var text = textbox.value;
  var begin = text.substring(0, text.lastIndexOf(' ', text.length)+1);
  textbox.value = begin+mot;
  
  searchPopupClose();
  recherche();
} 

function searchInput(){

  var textbox = document.getElementById("wk-recherche");
  var text = textbox.value;
  var word = text.substring(text.lastIndexOf(' ', text.length)+1, text.length);

  var corpus = corpusgetactive();

  var wikisearch = getSearchEngine(corpus);
  if (wikisearch == null) return;

  var nCompl = wikisearch.completionStart(word);
  if ( nCompl < 1 ) {
   searchPopupClose();
   return;
  }
  var popup = document.getElementById("wk-searchpopup");
  var popuplist = document.getElementById("wk-searchpopuplist");
  var i;
  popup.showPopup(textbox,-1,-1, "tooltip", "bottomleft", "topleft" );
  popupIsOpen = true;
  if ( nCompl > 12 ) nCompl = 12;
  for ( i = 0 ; i < nCompl ; i++ ) {
 
  	var text = wikisearch.getCompletion(i);
    var popuplistitem = document.getElementById("wk-searchpopuplistI"+i);
    popuplistitem.setAttribute( "label", text );
    popuplistitem.setAttribute( "onclick", "autoComplete('"+text+"');");
    popuplistitem.setAttribute( "value", text);
  }
  for ( ; i < 12 ; i++ ) {
 
    var popuplistitem = document.getElementById("wk-searchpopuplistI"+i);
    popuplistitem.setAttribute( "label", "" );
    popuplistitem.setAttribute( "onclick", "");
    popuplistitem.setAttribute( "value", "");
  }
  textbox.focus();
  popuplist.selectItem(popuplist.getItemAtIndex(0));
}

function popupSelect() {

  var popuplist = document.getElementById("wk-searchpopuplist");
  autoComplete( popuplist.selectedItem.value );
}

function textfocus() {

  document.getElementById("wk-recherche").focus();
}

function popupfocus() {
  
  var popup = document.getElementById("wk-searchpopup");
  var popuplist = document.getElementById("wk-searchpopuplist");
  if ( popupIsOpen ) popuplist.focus();
  focusPopup = true;
}

function browserfocus() {

  var browser = document.getElementById("wk-browser");
  browser.contentWindow.focus();
  focusPopup = false;
}

function enter() {

  if ( !focusPopup ) recherche();
  else popupSelect();
}

function textkeydown(event) {
  
  if ( event.keyCode == 40 ) if ( popupIsOpen ) popupfocus(); else browserfocus();
}

function copy() {

  getBrowser().contentViewerEdit.copySelection();
}

function selectall() {

  getBrowser().contentViewerEdit.selectAll();
}

function gohome() {

  getBrowser().goHome();
  affichCorpuslist();
}

function openexternal() {
  
  var extps = Components.
      classes["@mozilla.org/uriloader/external-protocol-service;1"].
      getService(Components.interfaces.nsIExternalProtocolService);
  extps.loadUrl(getBrowser().currentURI );
}

function zoomin() {

  getBrowser().markupDocumentViewer.textZoom *= zoomFactor;
}

function zoomout() {

  getBrowser().markupDocumentViewer.textZoom /= zoomFactor;
}

function ajouterErreur(e){
	afficher(e);
}

function afficher(a){
	//alert(a);
}

function openlinterweb() {

  var extps = Components.
      classes["@mozilla.org/uriloader/external-protocol-service;1"].
      getService(Components.interfaces.nsIExternalProtocolService);
  var ioService = Components.classes["@mozilla.org/network/io-service;1"].
                  getService(Components.interfaces.nsIIOService);
  extps.loadUrl(ioService.newURI("http://www.linterweb.fr/", null, null) );
}

function openwikiwix() {

  var extps = Components.
  classes["@mozilla.org/uriloader/external-protocol-service;1"].
  getService(Components.interfaces.nsIExternalProtocolService);
  var ioService = Components.classes["@mozilla.org/network/io-service;1"].
  getService(Components.interfaces.nsIIOService);
  extps.loadUrl(ioService.newURI("http://www.wikiwix.com/", null, null) );
}

function openwikipedia() {

  var extps = Components.
      classes["@mozilla.org/uriloader/external-protocol-service;1"].
      getService().QueryInterface(Components.interfaces.nsIExternalProtocolService);
  var ioService = Components.classes["@mozilla.org/network/io-service;1"].
                  getService().QueryInterface(Components.interfaces.nsIIOService);
  extps.loadUrl(ioService.newURI("http://en.wikipedia.org/", null, null) );
}

function setbrowser() {

 var prefs = Components.classes["@mozilla.org/preferences-service;1"].
      getService().QueryInterface(Components.interfaces.nsIPrefBranch);
 var name = prefs.getCharPref("network.protocol-handler.app.http" );
 var newname = prompt('Enter the path to your external browser',name);
 if ( newname != null ) 
   prefs.setCharPref("network.protocol-handler.app.http", newname );
}

function setautomatic() {

  bAutomaticSearch = ! bAutomaticSearch;
}

function checkautomatic() {

  var l10n = document.getElementById("wk-strings");

  item = document.getElementById( "itemautomatic" );
  if ( bAutomaticSearch )
    item.setAttribute( "label", l10n.getString("kiwix.wk.autosearchenabled"));
  else item.setAttribute( "label", l10n.getString("kiwix.wk.autosearchdisabled"));
}
