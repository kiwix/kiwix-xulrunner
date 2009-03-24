EXPORTED_SYMBOLS = ["settings"];

var settings = {

    /* Constructor */
    register: function() {
	/* Create the settings service */
	this.settingsService = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
	
	/* Get the root branch */
	this.rootBranch = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);

	/* Add the observer */
	this.rootBranch.QueryInterface(Components.interfaces.nsIPrefBranch2);
	this.rootBranch.addObserver("", this, false);

	/* Prepare the settings file descriptor */
	var directoryService = Components.classes["@mozilla.org/file/directory_service;1"].getService(Components.interfaces.nsIProperties);
	var settingsDirectory = directoryService.get("PrefD", Components.interfaces.nsIFile);
	this.settingsFile = Components.classes["@mozilla.org/file/local;1"].createInstance();
	this.settingsFile.QueryInterface(Components.interfaces.nsILocalFile);
	this.settingsFile.initWithPath(settingsDirectory.path);
	this.settingsFile.appendRelativePath("prefs.js");

	/* Save the settings directory path */
	this.rootPath = settingsDirectory.path;

	/* Read the file */
	try {
	    this.settingsService.readUserPrefs(this.settingsFile);
	} catch (exception) {
	    /* Do nothing, the file will be create in the future */
	}
    },
    
    /* Destructor */
    unregister: function() {
	if (!this.rootBranch) {
	    return;
	} else {
	    this.rootBranch.removeObserver("", this);
	}
    },

    /* Return the path of the user profile */
    getRootPath: function() {
    	return this.rootPath + "/";
    },

    /* Observer */
    observe: function(aSubject, aTopic, aData) {
	if (aTopic != "nsPref:changed") {
	    return;
	} else {
	    this.save();
	}
    },

    /* Save settings */
    save: function() {
	this.settingsService.savePrefFile(this.settingsFile);
    },

    /* Generic accessor functions */
    charSettingParameter: function(name, value) {
	if (value != undefined) {
	    this.rootBranch.setCharPref(name, value);
	}
	if (this.rootBranch.prefHasUserValue(name) == true) { return this.rootBranch.getCharPref(name); }
    },
    
    intSettingParameter: function(name, value) {
	if (value != undefined) {
	    this.rootBranch.setIntPref(name, value);
	}
	if (this.rootBranch.prefHasUserValue(name) == true) { return this.rootBranch.getIntPref(name); }
    },

    boolSettingParameter: function(name, value) {
	if (value != undefined) {
	    value = (value == "true" || value == true) ? true : false;
	    this.rootBranch.setBoolPref(name, value);
	}
	if (this.rootBranch.prefHasUserValue(name) == true) { return this.rootBranch.getBoolPref(name); }
    },
    
    /* Multiple accessor functions */
    zimFilePath: function(value) { return this.charSettingParameter("zimFilePath", value); },
    displayStatusBar: function(value) { return this.boolSettingParameter("displayStatusBar", value); },
    displayFullScreen: function(value) { return this.boolSettingParameter("displayFullScreen", value); },
    displayResultsBar: function(value) { return this.boolSettingParameter("displayResultsBar", value); }
}

/* Create the settings object */
settings.register();