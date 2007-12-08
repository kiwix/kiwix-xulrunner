/*  moulin - offline wikipedia distro
    Copyright (C) 2006-2007, Kunnafoni Foundation and contributors
    
    Contributor(s):
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
    
var NoteNFO				= {};
NoteNFO.currentPage		= null;

function InitializeNotes () {
	NoteNFO.rdfService	= Components.classes["@mozilla.org/rdf/rdf-service;1"]
	.getService(Components.interfaces.nsIRDFService);
	
	var file = GetNotesFile ();
	NoteNFO.datasource	= NoteNFO.rdfService.GetDataSourceBlocking ('file://'+file.path);
	//NoteNFO.datasource	= NoteNFO.rdfService.GetDataSourceBlocking ("file:///media/Hobbes/notes.xml");
}

function GetNotesFile () {
	// profile directory : where we'll store mynotes.rdf
	var profD = Components.classes["@mozilla.org/file/directory_service;1"]
		.getService (Components.interfaces.nsIProperties)
		.get ("ProfD", Components.interfaces.nsIFile);
	
	var leafName = "mynotes.rdf";
	
	// we create the file object for rdf file
	var file = profD.clone ();
	file.append (leafName);
	
	if (!file.exists ()) {
		// we will copy from our template in chrome/locale
		L.info ("Notes file does not exist: copying template");

		var prefs = Components.classes["@mozilla.org/preferences-service;1"]
			.getService(Components.interfaces.nsIPrefBranch);
		var default_language_ui = prefs.getCharPref("moulin.ui.language");
		
		// retrieve template path from chrome/locale
		var templateFD = moulinNFO.applicationFD.clone ();
		var totemplatepath = "chrome/locale/" + default_language_ui + "/moulin/notes.rdf";
		for each (var i in totemplatepath.split ("/")) { templateFD.append (i); }	
	    
	    // template is copied to destination
	    templateFD.copyTo (profD, leafName);  
	    
	    // reopening the file
	    var file = profD.clone ();
		file.append (leafName);
		
		return file;
	} 
	return file;
}

function UILoadNoteForUrl (url) {
	var hash = hex_md5 (url);
	NoteNFO.currentPage = hash;
	moulinUI.notesTextBox.value = hash;

	try {
		var subject	= NoteNFO.rdfService
			.GetResource ("http://www.moulinwiki.org/rdf/bookmark/"+hash);
		var predicate_text	= NoteNFO.rdfService
			.GetResource ("http://www.moulinwiki.org/rdf/bookmark/text");
		var value_text = NoteNFO.datasource
			.GetTarget (subject, predicate_text, true);

		if (value_text instanceof Components.interfaces.nsIRDFLiteral) {
			value_text	= value_text.Value;
		}
		
		moulinUI.notesTextBox.value = value_text;
	} catch(e) {
		alert(e);
	}	
}

function UISaveCurrentNote () {
	saveNote (NoteNFO.currentPage);
}

function saveNotes(url) {
	
	var newtext = NoteNFO.rdfService.GetLiteral(document.getElementById('notesTextBox').value);
	var hash	= NoteNFO.currentPage;
	
	var subject			= NoteNFO.rdfService
		.GetResource ("http://www.moulinwiki.org/rdf/bookmark/"+hash);
	var predicate_text	= NoteNFO.rdfService
		.GetResource ("http://www.moulinwiki.org/rdf/bookmark/text");
	var value_text		= NoteNFO.datasource
		.GetTarget (subject, predicate_text, true);
		
	if (value_text instanceof Components.interfaces.nsIRDFLiteral) {
		value_text	= value_text.Value;
	}
	
	if (value_text != null) {
		var oldtext = NoteNFO.rdfService.GetLiteral (value_text);
		NoteNFO.datasource.Change (subject, predicate_text, oldtext, newtext);
	} else {
		NoteNFO.datasource.Assert (subject, predicate_text, newtext, true);
	}
		
	NoteNFO.datasource.QueryInterface (Components.interfaces.nsIRDFRemoteDataSource);
	NoteNFO.datasource.Flush ();		
}

function releaseNotes () {
	NoteNFO.datasource.QueryInterface (Components.interfaces.nsIRDFRemoteDataSource);
	NoteNFO.datasource.Flush ();		
	NoteNFO.rdfService.UnregisterDataSource(NoteNFO.datasource);
}

function purgeNotes () {
	try {
		releaseNotes ();
	} catch (e) { L.info (e.toString ()); }

	try {
		var file = Components.classes["@mozilla.org/file/directory_service;1"]
			.getService (Components.interfaces.nsIProperties)
			.get ("ProfD", Components.interfaces.nsIFile);
		file.append ("mynotes.rdf");
		file.remove (true);
	} catch (e) { L.info (e.toString ()); }

	try {	
		InitializeNotes ();
	} catch (e) { L.info (e.toString ()); }
}
