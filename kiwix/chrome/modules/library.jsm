var EXPORTED_SYMBOLS = [ "library" ];

/* Define the Book class */
function Book(id, path, indexPath, indexType) {
        this.id = id;
        this.path = path;
	this.indexPath = indexPath;
	this.indexType = indexType;
}

/* Define the Library class */
let library = {

    /* Constructor */
    register: function() {
    	this.books = [];
	this.current = "";

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
	this.readFromFile();
    },
    
    /* Destructor */
    unregister: function() {
    },

    /* Open the XML file */
    readFromFile: function() {
       	var content = "";
	var charset = "UTF-8";

	/* Create the file descriptor */
	var fileDescriptor = this.openFile();

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

	this.fromXml(content);
    },

    /* Build the book list from the XML */
    fromXml: function(xml) {
       	var parser = new DOMParser();
        var doc = parser.parseFromString(xml, "text/xml");
	var root = doc.firstChild;
	this.current = root.getAttribute('current');

        var len = root.childNodes.length;

	for (var i=0; i<len; i++) {
	    var id = root.childNodes[i].getAttribute('id');
	    var path = root.childNodes[i].getAttribute('path');
	    var indexPath = root.childNodes[i].getAttribute('indexPath');
	    var indexType = root.childNodes[i].getAttribute('indexType');
	    this.addBook(id, path, indexPath, indexType);
    	}
    },

    /* Save the object to the XML file */
    writeToFile: function() {
        var xml = this.toXml();
	var charset = "UTF-8";

	/* Create the file descriptor */
	var fileDescriptor = this.openFile();

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
            var bookNode = doc.createElement("book");
	    bookNode.setAttribute("id", book.id);
	    bookNode.setAttribute("path", book.path);
	    bookNode.setAttribute("indexPath", book.indexPath);
	    bookNode.setAttribute("indexType", book.indexType);
	    root.appendChild(bookNode);
	}
    
	var serializer = new XMLSerializer();
        var xml = serializer.serializeToString(doc);
        return xml;
    },

    /* Get the file descriptor for a file */
    openFile: function() {
	var fileDescriptor = Components.classes["@mozilla.org/file/local;1"].
                     createInstance(Components.interfaces.nsILocalFile);
	fileDescriptor.initWithPath(this.filePath());

	return fileDescriptor;
    },

    /* Add a book to the library */
    addBook: function(id, path, indexPath, indexType) {
    	var book = this.getBookById(id);
    	if (!book) {
	    	book = new Book(id, path, indexPath, indexType);
		this.books.push(book);
		this.writeToFile();
	}
	return book;
    },

    /* Delete a book */
    deleteBookById: function(id) {
	var len = this.books.length >>> 0;
	for (var i=0 ; i<len ; i++) {
	    if (this.books[i].id == id) {
	       books.splice(i, 1);
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
    getCurrentBook: function() {
        return(this.getBookById(this.current));
    },

    /* Return the current book */
    deleteCurrentBook: function() {
        return(this.deleteBookById(this.current));
    }
}

/* Create the settings object */
library.register();