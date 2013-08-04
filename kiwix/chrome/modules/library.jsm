var EXPORTED_SYMBOLS = [ "library" ];

Components.utils.import("resource://modules/env.jsm");

/* Define the Book class */
function Book(id, path, relativeLibraryPath, indexPath, indexType, readOnly, last, title, description, articleCount, mediaCount, size, creator, publisher, date, language, favicon, url) {
        this.id = id;
        this.path = path;
        this.relativeLibraryPath = relativeLibraryPath;
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
	this.publisher = publisher;
	this.date = date;
	this.language = language;
	this.favicon = favicon;
	this.url = url;
}

/* Define the Library class */
let library = {
    /* Constructor */
    register: function() {
        this.paths = "";

       	/* Initiate the content manager */
	this.contentManager = Components.classes["@kiwix.org/contentManager"].getService();
	this.contentManager = this.contentManager.QueryInterface(Components.interfaces.IContentManager);

	/* Search library XML files in different places */
        this.readFromDescriptor('<CurProcD>/../data/library', true);

	if (env.isLinux()) {
            this.readFromDescriptor('<CurProcD>/../../share/kiwix/data/library', true);
        } else if (env.isMac()) {
            this.readFromDescriptor('<CurProcD>/../../../data/library', true);
	}

	if (!env.isLive()) {	
	    this.readFromDescriptor('<PrefD>/library.xml', true);
	    this.readFromDescriptor('<PrefD>/data/library/', false);
	    this.readFromDescriptor('<PrefD>/data/library/library.xml', false);
	}
    },

    /* Delete file */
    delete: function() {
	var directoryService = Components.classes["@mozilla.org/file/directory_service;1"].getService(Components.interfaces.nsIProperties);
	var settingsDirectory = directoryService.get("PrefD", Components.interfaces.nsIFile);
	settingsDirectory.append("data");
	settingsDirectory.append("library");
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

    /* Open one or more XML file based on a patch descriptor */
    readFromDescriptor: function(descriptor, readOnly) {
        var descriptorParts = descriptor.split('/');
        var directoryService = Components.classes["@mozilla.org/file/directory_service;1"].
					getService(Components.interfaces.nsIProperties);
	var fileService = Components.classes["@mozilla.org/file/local;1"];
	var file;

	/* Determine what is the "base" of the path */
	if (!descriptorParts[0]) {
	    file = fileService.createInstance(Components.interfaces.nsILocalFile);
	    file.initWithPath("/");
	} else if (matchs = descriptorParts[0].match(/^<(.*)>$/)) {
	    var id = matchs[1];
	    try {
                file = directoryService.get(id, Components.interfaces.nsIFile);
	    } catch(error) {
	    }
	} else {
	    file = directoryService.get("CurProcD", Components.interfaces.nsIFile).parent;
	}
	descriptorParts.shift();	

	/* Go through other parts of the descriptor to build the path */
	descriptorParts.map(function(part) {
	    if (part) {
	       if (part == '..') {
	           file = file.parent;
	       } else {
	           file.append(part);
               }
            }
	});
	
	/* Load library file(s) */
	if (file.exists() && file.isDirectory()) {
	   var entries = file.directoryEntries;
	   var array = [];  
	   while(entries.hasMoreElements()) {
	      var localFile = entries.getNext();  
	      localFile.QueryInterface(Components.interfaces.nsIFile);
              this.readFromFile(localFile.path, readOnly);
	   }
	} else {
	    this.readFromFile(file.path, readOnly);
	}
    },

    /* Open the file an add to the list of open libraries if successful */
    readFromFile: function(libraryPath, readOnly) {
	if (this.contentManager.openLibraryFromFile(libraryPath, readOnly)) {
            this.paths += libraryPath + ";";
	}
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
        if (this.contentManager.removeBookById(id)) {
	  this.writeToFile();
	  return true;
	}
	return false;
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

    /* Get available books publishers */
    getBooksCreators: function() {
        var creatorsObj = new Object;
	this.contentManager.getBooksCreators(creatorsObj);
	return creatorsObj.value.split(';');
    },

    /* Get available books publishers */
    getBooksPublishers: function() {
        var publishersObj = new Object;
	this.contentManager.getBooksPublishers(publishersObj);
	return publishersObj.value.split(';');
    },

    getRemoteBookCount: function() {
        var count = new Object();
	this.contentManager.getBookCount(false, true, count);
	return count.value;
    },

    /* Get a book by its id */
    getBookById: function(id) {
	var path = new Object();
	var relativeLibraryPath = new Object();
	var title = new Object();
	var indexPath = new Object();
	var indexType = new Object();
	var description = new Object();
	var articleCount = new Object();
	var mediaCount = new Object();
	var size = new Object();
	var creator = new Object();
	var publisher = new Object();
	var date = new Object();
	var language = new Object();
	var favicon = new Object();
	var url = new Object();

	if (this.contentManager.getBookById(id, path, relativeLibraryPath, title, indexPath, indexType, description, articleCount, mediaCount, size, creator, publisher, date, language, favicon, url)) {
	   return new Book(id, path.value, relativeLibraryPath.value, indexPath.value, indexType.value, false, "", title.value, description.value, articleCount.value, mediaCount.value, size.value, creator.value, publisher.value, date.value, language.value, favicon.value, url.value);
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
	if (this.current)
	  return(this.deleteBookById(this.current));
    },

    /* Prepare a list of books */
    /* mode = [lastOpen|remote|local] */
    listBooks: function(mode, sortBy, maxSize, language, creator, publisher, search) {
    	this.contentManager.listBooks(mode, sortBy, maxSize, language, creator, publisher, search);
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