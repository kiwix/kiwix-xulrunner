var EXPORTED_SYMBOLS = [ "library" ];

Components.utils.import("resource://modules/env.jsm");

/* Define the Book class */
function Book(id, path, indexPath, indexType, readOnly, last, title) {
        this.id = id;
        this.path = path;
	this.indexPath = indexPath;
	this.indexType = indexType;
	this.readOnly = readOnly;
	this.last = last;
	this.title = title;
}

/* Define the Library class */
let library = {

    /* Constructor */
    register: function() {

       	/* Initiate the content manager */
	this.contentManager = Components.classes["@kiwix.org/contentManager"].getService();
	this.contentManager = this.contentManager.QueryInterface(Components.interfaces.IContentManager);

	/* Try to read install library file */
	var directoryService = Components.classes["@mozilla.org/file/directory_service;1"].getService(Components.interfaces.nsIProperties);
	var kiwixDirectory = directoryService.get("CurProcD", Components.interfaces.nsIFile);
	
	/* Compute the "content" directory */
	var libraryDirectory;
	if (env.isLinux()) {
	  /* From /usr/lib/kiwix/ to /usr/share/kiwix */
          libraryDirectory = kiwixDirectory.parent.parent.clone();
	  libraryDirectory.append("share");
	  libraryDirectory.append("kiwix");
	} else {
          libraryDirectory = kiwixDirectory.parent.clone();
	  libraryDirectory.append("data");
        }
	libraryDirectory.append("library");

	/* List xml library files in the data/library directory */
	if (libraryDirectory.exists() && libraryDirectory.isDirectory()) {
	   var entries = libraryDirectory.directoryEntries;
	   var array = [];  
	   while(entries.hasMoreElements()) {
	     var file = entries.getNext();  
	     file.QueryInterface(Components.interfaces.nsIFile);  
             this.readFromFile(file.path, true);
	   }
	}

	/* Check if this is a live instance */
	if (!env.isLive()) {	
 	  /* Prepare the library file descriptor */
	  var directoryService = Components.classes["@mozilla.org/file/directory_service;1"].getService(Components.interfaces.nsIProperties);
	  var settingsDirectory = directoryService.get("PrefD", Components.interfaces.nsIFile);
	  settingsDirectory.append("library.xml");

	  /* Load library file */
	  this.readFromFile(settingsDirectory.path, false);
	}
    },

    /* Delete file */
    delete: function() {
	var directoryService = Components.classes["@mozilla.org/file/directory_service;1"].getService(Components.interfaces.nsIProperties);
	var settingsDirectory = directoryService.get("PrefD", Components.interfaces.nsIFile);
	settingsDirectory.append("library.xml");
	var libraryFile = settingsDirectory.clone();

        try {
	  libraryFile.remove(false);
	} catch(err) {
	  dump("Unable to remove library file " + libraryFile.path + " : " + err.toString() + "\n");
        }
    },
    
    /* Destructor */
    unregister: function() {
    },

    /* Open the XML file */
    readFromFile: function(libraryPath, readOnly) {
	/* Create the file descriptor */
	var fileDescriptor = this.openFile(libraryPath);

	/* Return if !fileDescriptor */
	if (!fileDescriptor)
	   return;

        this.contentManager.openLibraryFromFile(fileDescriptor, readOnly);
    },

    /* Save the object to the XML file */
    writeToFile: function() {
        this.contentManager.writeLibrary();
    },

    /* Get the file descriptor for a file */
    openFile: function(path) {
	var fileDescriptor = Components.classes["@mozilla.org/file/local;1"].
                     createInstance(Components.interfaces.nsILocalFile);

        try {
   	  fileDescriptor.initWithPath(path);
	} catch(err) {
	  return;
        }

	return fileDescriptor;
    },

    /* Add a book to the library */
    addBook: function(id, path) {
	/* Create the file descriptor */
	var fileDescriptor = this.openFile(path);

	/* Return if !fileDescriptor */
	if (!fileDescriptor)
	   return;

        this.contentManager.addBookFromPath(fileDescriptor);
	this.writeToFile();
	return this.getBookById(id);
    },

    /* Delete a book */
    deleteBookById: function(id) {
        return this.contentManager.removeBookById(id);
    },

    /* Get a book by its id */
    getBookById: function(id) {
	var path = new Object();
	var title = new Object();
	var indexPath = new Object();
	var indexType = new Object();
	if (this.contentManager.getBookById(id, path, title, indexPath, indexType)) {
	   return new Book(id, path.value, indexPath.value, indexType.value, false, "", title.value);
	}
    },

    /* Set the index information for a book */
    setBookIndex: function(id, indexPath, indexType) {
    	if (this.contentManager.setBookIndex(id, indexPath, indexType)) {
	   this.writeToFile();
	   return true;
	}
	return false;
    },

    updateBookLastOpenDateById: function(id) {
        if (this.contentManager.updateBookLastOpenDateById(id)) {
	   this.writeToFile();
	}
    },   

    setCurrentId: function(id) {
    	var ok = this.contentManager.setCurrentBookId(id);
	this.writeToFile();
	return ok;
    },

    getCurrentId: function() {
	var id = new Object();
        this.contentManager.getCurrentBookId(id);
	if (id.value != "") {
	  return id.value;
	}
    },

    /* Return the current book */
    getCurrentBook: function() {
        return(this.getBookById(this.getCurrentId()));
    },

    /* Delete the current book */
    deleteCurrentBook: function() {
        return(this.deleteBookById(this.current));
    },

    /* Prepare a list of books */
    /* mode = [lastOpen|remote|local] */
    listBooks: function(mode) {
    	this.contentManager.listBooks(mode);
	this.writeToFile();
    },

    /* Pop up the next book in the list (see listBooks() */
    getNextBookInList: function() {
    	var id = new Object();
        if (this.contentManager.getListNextBookId(id)) {
	  return(this.getBookById(id.value));
	}
    }
    
}

/* Create the settings object */
library.register();