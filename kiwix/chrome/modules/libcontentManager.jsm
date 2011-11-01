
var EXPORTED_SYMBOLS = [ "libcontentManager" ];

Components.utils.import("resource://gre/modules/ctypes.jsm");

let libcontentManager = {

    register: function () {
        this.contentManager = ctypes.open("libContentCManager.so");
        this._Create = this.contentManager.declare("ContentManager_Create", ctypes.default_abi, ctypes.int32_t.ptr, ctypes.int16_t);
        this.contAClass = null;
        this._Destroy = this.contentManager.declare("ContentManager_Destroy", ctypes.default_abi, ctypes.int16_t, ctypes.int32_t.ptr);
        this._OpenLibraryFromFile = this.zimAccessor.declare("ContentManager_OpenLibraryFromFile", ctypes.default_abi, ctypes.int16_t, ctypes.int32_t.ptr, ctypes.char.ptr, ctypes.uint16_t);

        this.contAClass = this._Create(0);
        if (this.contAClass == null) {
            dump("Unable to create libcontentManager instance.\n");
            return false;
        }
    },

    openLibraryFromFile: function(path, readOnly) {
        return this._OpenLibraryFromFile(this.contAClass, path, readOnly);
    },

    unregister: function() {
        this._Destroy(this.contAClass);
        this.contentManager.close();
    },


};

libcontentManager.register();

