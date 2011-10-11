var EXPORTED_SYMBOLS = [ "library" ];

Components.utils.import("resource://modules/env.jsm");

/* Define the Book class */
function Book(id, path, indexPath, indexType, readOnly, last, title, description, articleCount, mediaCount, size, creator, date, language, favicon, url) {
        this.id = id;
        this.path = path;
	this.indexPath = indexPath;
	this.indexType = indexType;
	this.readOnly = readOnly;
	this.last = last;
	this.title = title;
	this.description = description;
	this.articleCount = articleCount;
	this.mediaCount = mediaCount;
	this.size = size;
	this.creator = creator;
	this.date = date;
	this.language = language;
	this.favicon = favicon;
	this.url = url;
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
	
	/* Compute the "../data" directory */
	var libraryDirectory;
        libraryDirectory = kiwixDirectory.parent.clone();
	libraryDirectory.append("data");
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

	/* For linux try to read ../share/kiwix */
	if (env.isLinux()) {
	  /* From /usr/lib/kiwix/ to /usr/share/kiwix */
          libraryDirectory = kiwixDirectory.parent.parent.clone();
	  libraryDirectory.append("share");
	  libraryDirectory.append("kiwix");
	  libraryDirectory.append("data");
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

        this.contentManager.openLibraryFromFile(fileDescriptor.path, readOnly);
    },

    /* Open the XML file */
    readFromText: function(xml, readOnly) {
        this.contentManager.openLibraryFromText(xml, readOnly);
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

        this.contentManager.addBookFromPath(fileDescriptor.path);
	this.writeToFile();
	return this.getBookById(id);
    },

    /* Delete a book */
    deleteBookById: function(id) {
        return this.contentManager.removeBookById(id);
    },

    /* Get book count */
    getLocalBookCount: function() {
        var count = new Object();
	this.contentManager.getBookCount(true, false, count);
	return count.value;
    },
    
    /* Get available books languages */
    getBooksLanguages: function() {
        var languagesObj = new Object;
	this.contentManager.getBooksLanguages(languagesObj);
	return languagesObj.value.split(';') ;
    },  

    getRemoteBookCount: function() {
        var count = new Object();
	this.contentManager.getBookCount(false, true, count);
	return count.value;
    },

    /* Get a book by its id */
    getBookById: function(id) {
	var path = new Object();
	var title = new Object();
	var indexPath = new Object();
	var indexType = new Object();
	var description = new Object();
	var articleCount = new Object();
	var mediaCount = new Object();
	var size = new Object();
	var creator = new Object();
	var date = new Object();
	var language = new Object();
	var favicon = new Object();
	var url = new Object();

	if (this.contentManager.getBookById(id, path, title, indexPath, indexType, description, articleCount, mediaCount, size, creator, date, language, favicon, url)) {
	   return new Book(id, path.value, indexPath.value, indexType.value, false, "", title.value, description.value, articleCount.value, mediaCount.value, size.value, creator.value, date.value, language.value, favicon.value, url.value);
	}
    },

    /* Set the index information for a book */
    setBookIndex: function(id, indexPath, indexType) {
	/* Create the file descriptor */
	if (indexPath != "") {
   	  var fileDescriptor = this.openFile(indexPath);

	  /* Return if !fileDescriptor */
	  if (!fileDescriptor)
	     return false;

          indexPath = fileDescriptor.path;
        }

    	if (this.contentManager.setBookIndex(id, indexPath, indexType, indexType)) {
	   this.writeToFile();
	   return true;
	}
	return false;
    },

    setBookPath: function(id, path) {
	/* Create the file descriptor */
	if (path != "") {
	  var fileDescriptor = this.openFile(path);

	  /* Return if !fileDescriptor */
	  if (!fileDescriptor)
	     return false;

	  path = fileDescriptor.path;
	}

    	if (this.contentManager.setBookPath(id, path)) {
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
	this.setCurrentId("");
        return(this.deleteBookById(this.current));
    },

    /* Prepare a list of books */
    /* mode = [lastOpen|remote|local] */
    listBooks: function(mode, sortBy, maxSize) {
    	this.contentManager.listBooks(mode, sortBy, maxSize);
	// Seems to be uselsess : this.writeToFile();
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