
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
var MIN_VOCSPE_SIZE = 0;
// Factor by which font is magnified by pressing ctrl+'+'
var zoomFactor = 1.3;
// Home url
var homeUrl = "index.html";
// Maximal number of search results returned
var NB_SEARCH_RETURN = 25;
// Score upon which the first search result is opened automatically
var AUTO_OPEN_SCORE = 20;
// List of past search queries
var listHisto = new Array;
// List of vocspe words
var vocSpeList = new Array;
// index in listVocSpe
var iVocSpeList = 0;
// Is the history side bar shown ?
var isHistoAffich = false;
// Is the search side bar shown ?
var isSearchAffich = false;
// Is the completion popup shown ?
var popupIsOpen = false;
// Absolute path to the html directory
var rootPath;
// does the completion popup have the focus ?
var focusPopup=false;
// structure for the find in page dialog
var findInstData=null;
// Do we do automatic search while clicking on links ?
var bAutomaticSearch=true;
var bNextAutomaticSearch=false;
var bNoAutoOpen=false;

function selectSkin( name ) {

 if (confirm("To change the skin, the application has to be restarted. Shall I restart ?")) {

 var prefs = Components.classes["@mozilla.org/preferences-service;1"].
      getService(Components.interfaces.nsIPrefBranch);
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

function MouseOver(aEvent) {

  var link = aEvent.target;

  if (link instanceof HTMLAnchorElement) {

    if (link.href.indexOf("http://",0)==0) {
     document.getElementById("wk-addressbar").value = link.href;
     setVisible('wk-earth', false);
    }
    if (link.href.indexOf("file://",0)==0) {
     document.getElementById("wk-addressbar").value = link.innerHTML;
     setVisible('wk-book', false);
    }
    if (link.href.indexOf("license://",0)==0) {
     document.getElementById("wk-addressbar").value = 
        "Full text of license : "+link.href.substring(10,link.href.length);
     setVisible('wk-book', false);
    }
  }
}

function MouseOut(aEvent) {

  var link = aEvent.target;

  if (link instanceof HTMLAnchorElement) {

    document.getElementById("wk-addressbar").value = "";
    setVisible('wk-earth', true);
    setVisible('wk-book', true);
  }
}

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
  aEvent.target.ownerDocument.removeEventListener("mouseover", MouseOver, true);
  aEvent.target.ownerDocument.removeEventListener("DOMMouseScroll", Activate, true);
  aEvent.target.ownerDocument.removeEventListener("DOMActivate", Activate, true);
  aEvent.target.ownerDocument.removeEventListener("unload", RemoveListener, false);
}

const listener = {
  
  onStateChange: function osc(aWP, aRequest, aStateFlags, aStatus) {

    for ( var i = 0 ; i < iVocSpeList ; i++ ) {

      var label = document.getElementById( "vocspelink_"+vocSpeList[i] );
      label.setAttribute( "class", "vocspe-label" );
    }

    if ( bNextAutomaticSearch && (aStateFlags & nsIWebProgressListener.STATE_STOP)) {

      bNextAutomaticSearch = false;
      document.getElementById("wk-recherche").value = getBrowser().contentTitle;
      recherche();      
    }

    if (aStateFlags & nsIWebProgressListener.STATE_STOP) {
      Components.utils.reportError("STATE_STOP");
      var myDocument = aWP.DOMWindow.document;
      myDocument.addEventListener("mouseover", MouseOver, true);
      myDocument.addEventListener("mouseout", MouseOut, true);
      myDocument.addEventListener("DOMMouseScroll", MouseScroll, true);
      myDocument.addEventListener("DOMActivate", Activate, true);
      myDocument.addEventListener("onchange", Transition, true);
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

  var wikisearch = Components.classes["@linterweb.com/wikicomponent"].getService();
  wikisearch = wikisearch.QueryInterface(Components.interfaces.iWikiSearch);
  rootPath = wikisearch.getRootPath();
  var dls = Components.classes["@mozilla.org/docloaderservice;1"].
  getService(Components.interfaces.nsIWebProgress);
  dls.addProgressListener(listener,
                          nsIWebProgress.NOTIFY_LOCATION_DOCUMENT |
                          nsIWebProgress.NOTIFY_STATE |
                          nsIWebProgress.NOTIFY_STATE_DOCUMENT);
  searchPopupClose();
  getBrowser().setAttribute( "homepage", "file://"+rootPath+'/'+homeUrl );
}

// Rend visible ou invisible un block
function visible(idVisible){
	var objet = document.getElementById(idVisible);
	if(objet.collapsed)
		 setVisible(idVisible, false);
	else
		 setVisible(idVisible, true);
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
	try{
		var browser = document.getElementById("wk-browser");
		browser.loadURI("file://"+rootPath+'/'+url, null, null);
	}catch(e){
		ajouterErreur(e);
		return false;
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

        iVocSpeList = 0;

        var desc = document.getElementById("wk-vocspe1");
        while ( desc.hasChildNodes() )        
          desc.removeChild( desc.lastChild );

        desc = document.getElementById("wk-vocspe2");
        while ( desc.hasChildNodes() )        
          desc.removeChild( desc.lastChild );

	desc = document.getElementById("wk-resultat");
        while ( desc.hasChildNodes() )        
          desc.removeChild( desc.lastChild );
}

// Adds an entry in the history list (page is the title, chemin is the command to execute)
function addListHistory(page, chemin){
	// get the richlist
	var l = document.getElementById("wk-history");

	// create a new richlist item
	var li = document.createElement("richlistitem");
	
	// set label of the richlist item
	var titre = document.createElement("label");
	titre.setAttribute("style", "color:#000; cursor:pointer; paddin-top: 3px; font-size: 15px;");
	titre.setAttribute("value", page);
	titre.setAttribute("flex", "0");
	titre.setAttribute("crop", "end");	
	
	li.setAttribute("onclick", chemin );
	li.setAttribute("flex", "0");
	li.setAttribute("style", "cursor:pointer;");

	li.appendChild( titre );
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

function searchword( mot ) {

  var label = document.getElementById( "vocspelink_"+mot );
  var finder = getBrowser().webBrowserFind;
  finder.searchString = mot;
  finder.wrapFind = true;
  if ( ! finder.findNext() )
    label.setAttribute( "class", "vocspe-label-greyed" );
  else label.setAttribute( "class", "vocspe-label" );
}

// adds the word <mot> in the list of related vocabulary
function addVocSpe( mot ) {

  vocSpeList[iVocSpeList++] = mot;
  var desc1 = document.getElementById("wk-vocspe1");
  var desc2 = document.getElementById("wk-vocspe2");
  var entry = document.createElement( "hbox" );
  var label = document.createElement( "label" );
  label.setAttribute( "value", mot );
  label.setAttribute( "onclick", "javascript:addword('"+mot+"');" );
  label.setAttribute( "class", "vocspe-label" );

  entry.appendChild( label );
  var button = document.createElement( "label" );
  button.setAttribute( "value", ">" );
  button.setAttribute( "onclick", "javascript:searchword('"+mot+"');" );
  button.setAttribute( "id", "vocspelink_"+mot );
  button.setAttribute( "class", "vocspe-label" );
  entry.appendChild( button );
  if ( desc1.childNodes.length > desc2.childNodes.length ) 
    desc2.appendChild(entry);
  else desc1.appendChild(entry);
}

// Affichage de l'historique des recherches
function affichHisto(){
	if(!isHistoAffich){
		isHistoAffich = true;
		isSearchAffich = false;
		deleteListHistory();
		setVisible('wk-blockResult', true);
		setVisible('wk-blockHistory', false);
		for(var cle in listHisto){
			addListHistory(cle, listHisto[cle]);
		}
	}else{
		isHistoAffich = false;
		isSearchAffich = true;
		setVisible('wk-blockResult', true);
		setVisible('wk-blockHistory', true);
	}
   textfocus();
}

// Show search result bar
function affichSearch(){

  if ( isSearchAffich )
    setVisible('wk-blockResult', true);
  else {
    setVisible('wk-blockResult', false);
    setVisible('wk-blockHistory', true);
    isHistoAffich=false;
  }
  isSearchAffich = !isSearchAffich;
  textfocus();
}

// close search result bar
function closeSearch(){
	isSearchAffich = false;
	setVisible('wk-blockResult', true);
}

// close history bar
function closeHistory(){
	isHistoAffich = false;
	setVisible('wk-blockHistory', true);
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
//  mot = mot.toLowerCase();
	
  deleteList();
  rechercheXpcom(mot);
  listHisto[mot] = "javascript:rechercheHistory('"+mot+"');";
  isHistoAffich = false;
  setVisible('wk-blockResult', false);
  setVisible('wk-blockHistory', true);
  document.getElementById("wk-labelSearchHistory").value = "Results";
  isHistoAffich = false;
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
  var wikisearch = Components.classes["@linterweb.com/wikicomponent"].getService();
  wikisearch = wikisearch.QueryInterface(Components.interfaces.iWikiSearch);
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
	alert(a);
}

function openlinterweb() {

  var extps = Components.
      classes["@mozilla.org/uriloader/external-protocol-service;1"].
      getService(Components.interfaces.nsIExternalProtocolService);
  var ioService = Components.classes["@mozilla.org/network/io-service;1"].
                  getService(Components.interfaces.nsIIOService);
  extps.loadUrl(ioService.newURI("http://www.linterweb.fr/", null, null) );
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

  item = document.getElementById( "itemautomatic" );
  if ( bAutomaticSearch ) 
    item.setAttribute( "label", "Disable automatic search (by clicking on links)" );
  else item.setAttribute( "label", "Enable automatic search (by clicking on links)" );
}
