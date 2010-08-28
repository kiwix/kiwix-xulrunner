var EXPORTED_SYMBOLS = [ "library" ];

/* Define the Book class */
function Book(id, path, indexPath, indexType, readOnly) {
        this.id = id;
        this.path = path;
	this.indexPath = indexPath;
	this.indexType = indexType;
	this.readOnly = readOnly;
}

/* Define the Library class */
let library = {

    /* Constructor */
    register: function() {
    	this.books = [];
	this.current = "";

	/* Try to read install library file */
	var directoryService = Components.classes["@mozilla.org/file/directory_service;1"].getService(Components.interfaces.nsIProperties);
	var kiwixDirectory = directoryService.get("CurProcD", Components.interfaces.nsIFile);
	
	/* Compute the "content" directory */
	var libraryDirectory;
	if (os.isLinux()) {
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
	var liveFile = Components.classes["@mozilla.org/file/directory_service;1"].getService(Components.interfaces.nsIProperties).get("resource:app", Components.interfaces.nsIFile);
	liveFile.append("live");
	if (!liveFile.exists()) {	
		/* Prepare the library file descriptor */
		var directoryService = Components.classes["@mozilla.org/file/directory_service;1"].getService(Components.interfaces.nsIProperties);
		var settingsDirectory = directoryService.get("PrefD", Components.interfaces.nsIFile);
		settingsDirectory.append("library.xml");

		/* Save the library file path */
		this.filePath( settingsDirectory.path );

		/* Create a file if necessary */
		var libraryFile = settingsDirectory.clone();
		if (!libraryFile.exists ()) {
	   	   this.writeToFile();
		}

		/* Load library file */
		this.readFromFile(this.filePath());
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
    readFromFile: function(libraryPath, relative) {
       	var content = "";
	var charset = "UTF-8";

	/* Create the file descriptor */
	var fileDescriptor = this.openFile(libraryPath);

	/* Return if !fileDescriptor */
	if (!fileDescriptor)
	   return;

        /* Read the file from the fileDescriptor */
	var fileInputStreamService = Components.classes["@mozilla.org/network/file-input-stream;1"]
		.createInstance(Components.interfaces.nsIFileInputStream);
	fileInputStreamService.init(fileDescriptor, -1, 0, 0);
	
	const replacementCharacter = Components.interfaces.nsIConverterInputStream.DEFAULT_REPLACEMENT_CHARACTER;
	var converterInputStreamService = Components.classes ["@mozilla.org/intl/converter-input-stream;1"]
		.createInstance(Components.interfaces.nsIConverterInputStream);
	converterInputStreamService.init(fileInputStreamService, charset, 1024, replacementCharacter);
	
	var str = {};
	while (converterInputStreamService.readString(4096, str) != 0) {
		content += str.value;
	}

	/* Compute the content and index roots if necessary */
	if (relative) {
    	  var contentDirectory = fileDescriptor.parent.parent.clone();
	  contentDirectory.append("content");
	  var indexDirectory = fileDescriptor.parent.parent.clone();
	  indexDirectory.append("index");
	  this.fromXml(content, contentDirectory, indexDirectory);
	} else {
	  this.fromXml(content);
        }
    },

    /* Build the book list from the XML */
    fromXml: function(xml, contentDirectory, indexDirectory) {
       	var parser = new DOMParser();
        var doc = parser.parseFromString(xml, "text/xml");
	var root = doc.firstChild;
        var len = root.childNodes.length;
	var readOnly = contentDirectory || indexDirectory ? true : false;

	for (var i=0; i<len; i++) {
	    var id = root.childNodes[i].getAttribute('id');

	    var path = root.childNodes[i].getAttribute('path');
	    if (contentDirectory) {
	       var file = contentDirectory.clone();
	       file.append(path);
	       path = file.path;
	    }

	    var indexPath = root.childNodes[i].getAttribute('indexPath');
	    if (indexDirectory) {
	       var index = indexDirectory.clone();
	       index.append(indexPath);
	       indexPath = index.path;
	    }

	    var indexType = root.childNodes[i].getAttribute('indexType');
	    this.addBook(id, path, indexPath, indexType, readOnly);
    	}

	/* Set a current book if necessary */
	if (this.getBookById(root.getAttribute('current'))) {
            if (readOnly) {
	       this.current = root.getAttribute('current');
	    } else {
               this.setCurrentId(root.getAttribute('current'));
	    }
        }

    },

    /* Save the object to the XML file */
    writeToFile: function() {
        var xml = this.toXml();
	var charset = "UTF-8";

	/* Create the file descriptor */
	var fileDescriptor = this.openFile(this.filePath());

	/* Return if !fileDescriptor */
	if (!fileDescriptor)
	   return;

	/* Write to the file descriptor */
	var converterOutputStreamService = Components.classes["@mozilla.org/intl/converter-output-stream;1"]
		.createInstance(Components.interfaces.nsIConverterOutputStream);
	
	var fileOutputStreamService = Components.classes["@mozilla.org/network/file-output-stream;1"]
		.createInstance(Components.interfaces.nsIFileOutputStream);
	fileOutputStreamService.init(fileDescriptor, 0x02 | 0x08 | 0x20, 0666, 0);

	converterOutputStreamService.init(fileOutputStreamService, charset, 0, 0x0000);
	converterOutputStreamService.writeString(xml);
	converterOutputStreamService.close();
	fileOutputStreamService.close();
    },

    /* Build an XML string from the library object */
    toXml: function() {
        var parser = new DOMParser();     
    	var doc = parser.parseFromString("<library />", "text/xml");
	var root = doc.firstChild;
	root.setAttribute("current", this.current);
    	    
	var len = this.books.length >>> 0;
	for (var i=0 ; i<len ; i++) {
	    var book = this.books[i];

	    if (book.id && book.path && !book.readOnly) {
	       var bookNode = doc.createElement("book");
	       bookNode.setAttribute("id", book.id);
	       bookNode.setAttribute("path", book.path);
	       
	       if (book.indexPath) {
	       	       bookNode.setAttribute("indexPath", book.indexPath );
	       }

	       if (book.indexType) {
	       	       bookNode.setAttribute("indexType", book.indexType);
	       }
	       
	       root.appendChild(bookNode);
	    }
	}
    
	var serializer = new XMLSerializer();
        var xml = serializer.serializeToString(doc);
        return xml;
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
    addBook: function(id, path, indexPath, indexType, readOnly) {
    	var book = this.getBookById(id);
    	if (!book) {
	    	book = new Book(id, path, indexPath, indexType, readOnly);
		this.books.push(book);
		if (!book.readOnly) {
		  this.writeToFile();
		}
	}
	return book;
    },

    /* Delete a book */
    deleteBookById: function(id) {
	var len = this.books.length >>> 0;
	for (var i=0 ; i<len ; i++) {
	    if (this.books[i].id == id) {
	       this.books.splice(i, 1);
	       return true;
	    }
	}
	return false;
    },

    /* Get a book by its id */
    getBookById: function(id) {
	var len = this.books.length >>> 0;
	for (var i=0 ; i<len ; i++) {
	    if (this.books[i].id == id) {
	       return this.books[i];
	    }
	}
	return undefined;
    },

    /* Set the index information for a book */
    setIndexById: function(id, indexPath, indexType) {
      	var book = this.getBookById(id);
    	if (book) {
		book.indexPath = indexPath;
		book.indexType = indexType;
		this.writeToFile();
		return true;
	}
	return false;
    },


    /* Accessor the the file path */
    filePath: function(filePath) {
        if (filePath != undefined) {
	   this.path = filePath;
	}
	return this.path;
    },

    /* Return the current book */
    setCurrentId: function(id) {
        this.current = id;
	this.writeToFile();
    },

    /* Return the current book */
    getCurrentBook: function() {
        return(this.getBookById(this.current));
    },

    /* Delete the current book */
    deleteCurrentBook: function() {
        return(this.deleteBookById(this.current));
    }
}

/* Create the settings object */
library.register();