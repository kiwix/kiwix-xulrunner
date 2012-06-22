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

      if (tmp.match(/^android/i)) {
        this.platform.type = "android";
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

    /* Return true if windows, otherwise false */
    isWindows: function() {
      return this.platform.type == "win" ? true : false;
    },

    /* Return true if mac, otherwise false */
    isMac: function() {
      return this.platform.type == "mac" ? true : false;
    },

    /* Return true if unix, otherwise false */
    isAndroid: function() {
      return this.platform.type == "android" ? true : false;
    },

    /* Return true if running on Sugar, false otherwise */
    isSugar: function() {
        var environment = Components.classes["@mozilla.org/process/environment;1"].getService(Components.interfaces.nsIEnvironment);
        return environment.exists("SUGAR_BUNDLE_PATH");
    },

    /* Check if this is a live instance */
    isLive: function() {
      var liveFile = this.getApplicationFolder();
      liveFile.append("live");
      return liveFile.exists();
    },

    /* Return the current date in UNIX format */
    getUnixTime: function() {
      var unixTimeDate = new Date;
      var unixTimeMs = unixTimeDate.getTime();
      return parseInt(unixTimeMs / 1000);
    },

    urlToPath: function(aPath) {
      if (!aPath || !/^file:/.test(aPath))
        return;

      var ph = Components.classes["@mozilla.org/network/protocol;1?name=file"]
        .createInstance(Components.interfaces.nsIFileProtocolHandler);
      return ph.getFileFromURLSpec(aPath).path;
   },

   getPath: function() {
      var environment = Components.classes["@mozilla.org/process/environment;1"].
          getService(Components.interfaces.nsIEnvironment);
      return this.getApplicationFolder().path + (this.isWindows() ? ";" : ":") + environment.get("PATH");
   },   

   getApplicationFolder: function() {
      /* Since Xulrunner 5.0, "DefRt" replaces "resource:app" */
      try {
	return Components.classes["@mozilla.org/file/directory_service;1"]
		.getService(Components.interfaces.nsIProperties)
		.get("DefRt", Components.interfaces.nsIFile);
      } catch (e) {
      }
   },

   chromeToPath: function(aPath) {
     if (!aPath || !(/^chrome:/.test(aPath)))
       return; //not a chrome url
    
     var rv;
     var ios = Components.classes['@mozilla.org/network/io-service;1'].getService(Components.interfaces["nsIIOService"]);
     var uri = ios.newURI(aPath, "UTF-8", null);
     var cr = Components.classes['@mozilla.org/chrome/chrome-registry;1'].getService(Components.interfaces["nsIChromeRegistry"]);
     rv = cr.convertChromeURL(uri).spec;

     if (/^file:/.test(rv))
       rv = this.urlToPath(rv);
     else
       rv = this.urlToPath("file://"+rv);

    return rv;
  }
}

/* Create the settings object */
env.register();
