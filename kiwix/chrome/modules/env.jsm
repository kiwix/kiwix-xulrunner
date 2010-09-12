var EXPORTED_SYMBOLS = [ "env" ];

let env = {

    /* Constructor */
    register: function() {
      this.platform = {};

      var runtime = Components.classes ["@mozilla.org/xre/app-info;1"]
	.getService(Components.interfaces.nsIXULRuntime);
      var tmp = runtime.OS;
    
      if (tmp.match(/^win/i)) {
        this.platform.type = "win";
        this.platform.string = tmp;
      }
      
      if (tmp.match(/^darwin/i)) {
        this.platform.type = "mac";
        this.platform.string = tmp;
      }

      if (tmp.match(/^linux/i)) {
        this.platform.type = "linux";
        this.platform.string = tmp;
      }
    },
    
    /* Destructor */
    unregister: function() {
    },

    /* Return true if unix, otherwise false */
    isLinux: function() {
      return this.platform.type == "linux" ? true : false;
    },

    /* Check if this is a live instance */
    isLive: function() {
      var liveFile = Components.classes["@mozilla.org/file/directory_service;1"].getService(Components.interfaces.nsIProperties).get("resource:app", Components.interfaces.nsIFile);
      liveFile.append("live");
      return liveFile.exists();
    }
}

/* Create the settings object */
env.register();
