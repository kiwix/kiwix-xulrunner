
var EXPORTED_SYMBOLS = [ "libzimAccessor" ];

Components.utils.import("resource://gre/modules/ctypes.jsm");

let libzimAccessor = {

    register: function () {
        this.zimAccessor = ctypes.open("libZimCAccessor.so");
        this._Create = this.zimAccessor.declare("ZimAccessor_Create", ctypes.default_abi, ctypes.int32_t.ptr, ctypes.int16_t);
        this.zimAClass = null;
        this._Destroy = this.zimAccessor.declare("ZimAccessor_Destroy", ctypes.default_abi, ctypes.int16_t, ctypes.int32_t.ptr);
        this._LoadFile = this.zimAccessor.declare("ZimAccessor_LoadFile", ctypes.default_abi, ctypes.int16_t, ctypes.int32_t.ptr, ctypes.char.ptr);
        this._Reset = this.zimAccessor.declare("ZimAccessor_Reset", ctypes.default_abi, ctypes.int16_t, ctypes.int32_t.ptr);
        this._GetArticleCount = this.zimAccessor.declare("ZimAccessor_GetArticleCount", ctypes.default_abi, ctypes.uint32_t, ctypes.int32_t.ptr);
        this._GetId = this.zimAccessor.declare("ZimAccessor_GetId", ctypes.default_abi, ctypes.char.ptr, ctypes.int32_t.ptr);
        this._GetPageUrlFromTitle = this.zimAccessor.declare("ZimAccessor_GetPageUrlFromTitle", ctypes.default_abi, ctypes.char.ptr, ctypes.int32_t.ptr, ctypes.char.ptr);
        this._GetMainPageUrl = this.zimAccessor.declare("ZimAccessor_GetMainPageUrl", ctypes.default_abi, ctypes.char.ptr, ctypes.int32_t.ptr);
        this._GetMetatag = this.zimAccessor.declare("ZimAccessor_GetMetatag", ctypes.default_abi, ctypes.char.ptr, ctypes.int32_t.ptr, ctypes.char.ptr);
        this._GetContent = this.zimAccessor.declare("ZimAccessor_GetContent", ctypes.default_abi, ctypes.char.ptr, ctypes.int32_t.ptr, ctypes.char.ptr);
        this._SearchSuggestions = this.zimAccessor.declare("ZimAccessor_SearchSuggestions", ctypes.default_abi, ctypes.uint32_t.ptr, ctypes.int32_t.ptr, ctypes.char.ptr);
        this._GetNextSuggestion = this.zimAccessor.declare("ZimAccessor_GetNextSuggestion", ctypes.default_abi, ctypes.char.ptr, ctypes.int32_t.ptr);
        this._CanCheckIntegrity = this.zimAccessor.declare("ZimAccessor_CanCheckIntegrity", ctypes.default_abi, ctypes.int16_t, ctypes.int32_t.ptr);
        this._IsCorrupted = this.zimAccessor.declare("ZimAccessor_IsCorrupted", ctypes.default_abi, ctypes.int16_t, ctypes.int32_t.ptr);
    },

    loadFile: function(zimFile) {
        this.zimAClass = this._Create(0);
        if (this.zimAClass == null) {
            dump("Unable to create libzimAccessor instance.\n");
            return false;
        }
        this.zimFile = zimFile;

        // loaded?
        return this._LoadFile(this.zimAClass, this.zimFile);
    },

    reset: function() {
        return this._Reset(this.zimAClass);
    },

    getArticleCount: function() {
        return this._GetArticleCount(this.zimAClass);
    },

    getId: function() {
        return this._GetId(this.zimAClass).readString();
    },

    getPageUrlFromTitle: function(title) {
        return this._GetPageUrlFromTitle(this.zimAClass, title).readString();
    },

    getMainPageUrl: function() {
        return this._GetMainPageUrl(this.zimAClass).readString();
    },

    getMetatag: function(name) {
        return this._GetMetatag(this.zimAClass, name).readString();
    },

    getContent: function(urlPath) {
        return this._GetContent(this.zimAClass, urlPath).readString();
    },

    searchSuggestions: function(prefix) {
        return this._SearchSuggestions(this.zimAClass, prefix).contents;
    },

    getNextSuggestion: function() {
        return this._GetNextSuggestion(this.zimAClass).readString();
    },

    canCheckIntegrity: function() {
        return this._CanCheckIntegrity(this.zimAClass).contents;
    },

    isCorrupted: function() {
        return this._IsCorrupted(this.zimAClass).contents;
    },

    unregister: function() {
        this._Destroy(this.zimAClass);
        this.zimAccessor.close();
    },


};

libzimAccessor.register();

