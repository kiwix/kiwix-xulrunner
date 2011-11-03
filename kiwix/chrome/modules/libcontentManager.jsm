
var EXPORTED_SYMBOLS = [ "libcontentManager" ];

Components.utils.import("resource://gre/modules/ctypes.jsm");

let libcontentManager = {

    register: function () {

        const struct_book = new ctypes.StructType("CMBook",
            [ { "path": ctypes.char.ptr },
              { "indexPath": ctypes.char.ptr },
              { "indexType": ctypes.char.ptr },
              { "description": ctypes.char.ptr },
              { "articleCount": ctypes.char.ptr },
              { "mediaCount": ctypes.char.ptr },
              { "size": ctypes.char.ptr },
              { "creator": ctypes.char.ptr },
              { "date": ctypes.char.ptr },
              { "language": ctypes.char.ptr },
              { "favicon": ctypes.char.ptr },
              { "url": ctypes.char.ptr } ]);

        this.contentManager = ctypes.open("/home/reg/src/kiwix/moulinkiwix/src/contentManager/libContentCManager.so");
        //this._Create = this.contentManager.declare("ContentManager_Create", ctypes.default_abi, ctypes.int32_t.ptr, ctypes.int16_t);
        this.contAClass = null;
        //this._Destroy = this.contentManager.declare("ContentManager_Destroy", ctypes.default_abi, ctypes.int16_t, ctypes.int32_t.ptr);
        /*this._OpenLibraryFromFile = this.zimAccessor.declare("ContentManager_OpenLibraryFromFile", ctypes.default_abi, ctypes.int16_t, ctypes.int32_t.ptr, ctypes.char.ptr, ctypes.uint16_t);
        this._OpenLibraryFromText = this.zimAccessor.declare("ContentManager_OpenLibraryFromText", ctypes.default_abi, ctypes.int16_t, ctypes.int32_t.ptr, ctypes.char.ptr, ctypes.uint16_t);
        this._WriteLibrary = this.zimAccessor.declare("ContentManager_WriteLibrary", ctypes.default_abi, ctypes.int16_t, ctypes.int32_t.ptr);
        this._WriteLibraryToFile = this.zimAccessor.declare("ContentManager_WriteLibraryToFile", ctypes.default_abi, ctypes.int16_t, ctypes.int32_t.ptr, ctypes.char.ptr);
        this._AddBookFromPath = this.zimAccessor.declare("ContentManager_AddBookFromPath", ctypes.default_abi, ctypes.int16_t, ctypes.int32_t.ptr, ctypes.char.ptr);
        this._RemoveBookById = this.zimAccessor.declare("ContentManager_RemoveBookById", ctypes.default_abi, ctypes.int16_t, ctypes.int32_t.ptr, ctypes.char.ptr);
        this._SetCurrentBookId = this.zimAccessor.declare("ContentManager_SetCurrentBookId", ctypes.default_abi, ctypes.int16_t, ctypes.int32_t.ptr, ctypes.char.ptr);
        this._GetCurrentBookId = this.zimAccessor.declare("ContentManager_GetCurrentBookId", ctypes.default_abi, ctypes.char.ptr, ctypes.int32_t.ptr);

        this._GetBookById = this.zimAccessor.declare("ContentManager_GetBookById", ctypes.default_abi, struct_book.ptr, ctypes.int32_t.ptr, ctypes.char.ptr);

        this._UpdateBookLastOpenDateById = this.zimAccessor.declare("ContentManager_UpdateBookLastOpenDateById", ctypes.default_abi, ctypes.int16_t, ctypes.int32_t.ptr, ctypes.char.ptr);
        this._GetBookCount = this.zimAccessor.declare("ContentManager_GetBookCount", ctypes.default_abi, ctypes.uint16_t, ctypes.int32_t.ptr, ctypes.uint16_t, ctypes.uint16_t);
        this._GetListNextBookId = this.zimAccessor.declare("ContentManager_GetListNextBookId", ctypes.default_abi, ctypes.char.ptr, ctypes.int32_t.ptr);
        this._SetBookIndex = this.zimAccessor.declare("ContentManager_SetBookIndex", ctypes.default_abi, ctypes.int16_t, ctypes.int32_t.ptr, ctypes.char.ptr, ctypes.char.ptr, ctypes.char.ptr);
        this._SetBookPath = this.zimAccessor.declare("ContentManager_SetBookPath", ctypes.default_abi, ctypes.int16_t, ctypes.int32_t.ptr, ctypes.char.ptr, ctypes.char.ptr);
        this._GetBooksLanguages = this.zimAccessor.declare("ContentManager_GetBooksLanguages", ctypes.default_abi, ctypes.char.ptr, ctypes.int32_t.ptr);
        this._GetBooksPublishers = this.zimAccessor.declare("ContentManager_GetBooksPublishers", ctypes.default_abi, ctypes.char.ptr, ctypes.int32_t.ptr);
        this._ListBooks = this.zimAccessor.declare("ContentManager_ListBooks", ctypes.default_abi, ctypes.int16_t, ctypes.int32_t.ptr, ctypes.char.ptr, ctypes.char.ptr, ctypes.uint32_t, ctypes.char.ptr, ctypes.char.ptr, ctypes.char.ptr);*/

        //this.contAClass = this._Create(0);
        if (this.contAClass == null) {
            dump("Unable to create libcontentManager instance.\n");
            return false;
        }
    },
    /*
    openLibraryFromFile: function(path, readOnly) {
        return this._OpenLibraryFromFile(this.contAClass, path, readOnly);
    },

    openLibraryFromText: function(xml, readOnly) {
        return this._OpenLibraryFromText(this.contAClass, xml, readOnly);
    },

    writeLibrary: function() {
        return this._WriteLibrary(this.contAClass);
    },

    writeLibraryToFile: function(path) {
        return this._WriteLibraryToFile(this.contAClass, path);
    },

    addBookFromPath: function(path) {
        return this._AddBookFromPath(this.contAClass, path);
    },

    removeBookById: function(id) {
        return this._RemoveBookById(this.contAClass, id);
    },

    setCurrentBookId: function(id) {
        return this._SetCurrentBookId(this.contAClass, id);
    },

    getCurrentBookId: function() {
        let id = this._GetCurrentBookId(this.contAClass);
        return id.readString();
    },

    getBookById: function(id) {
        let book = this._GetBookById(this.contAClass, id);
        return book;
    },

    updateBookLastOpenDateById: function(id) {
        return this._UpdateBookLastOpenDateById(this.contAClass, id);
    },

    getBookCount: function() {
        let count = this._GetBookCount(this.contAClass);
        return count.contents;
    },

    getListNextBookId: function() {
        let id = this._GetListNextBookId(this.contAClass);
        return id.readString();
    },

    setBookIndex: function(id, index, type) {
        return this._SetBookIndex(this.contAClass, id, index, type);
    },

    setBookPath: function(id, path) {
        return this._SetBookPath(this.contAClass, id, path);
    },

    getBooksLanguages: function() {
        let lang = this._GetBooksLanguages(this.contAClass);
        return lang.readString();
    },

    getBooksPublishers: function() {
        let pub = this._GetBooksPublishers(this.contAClass);
        return pub.readString();
    },

    listBooks: function(mode, sortBy, maxSize, language, publisher, search) {
        return this._ListBooks(this.contAClass, mode, sortBy, maxSize, language, publisher, search);
    },*/

    unregister: function() {
        this._Destroy(this.contAClass);
        this.contentManager.close();
    },


};

libcontentManager.register();

