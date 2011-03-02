var EXPORTED_SYMBOLS = [ "settings" ];

let settings = {

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
    	return this.rootPath;
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
	if (this.rootBranch.getPrefType(name) == this.rootBranch.PREF_STRING) { return this.rootBranch.getCharPref(name); }
    },
    
    intSettingParameter: function(name, value) {
	if (value != undefined) {
	    this.rootBranch.setIntPref(name, value);
	}
	if (this.rootBranch.getPrefType(name) == this.rootBranch.PREF_INT) { return this.rootBranch.getIntPref(name); }
    },

    boolSettingParameter: function(name, value) {
	if (value != undefined) {
	    value = (value == "true" || value == true) ? true : false;
	    this.rootBranch.setBoolPref(name, value);
	}
	if (this.rootBranch.getPrefType(name) == this.rootBranch.PREF_BOOL) { return this.rootBranch.getBoolPref(name); }
    },
    
    /* Multiple accessor functions */
    locale: function(value) {
        if (value != undefined) {
	    this.boolSettingParameter("intl.locale.matchOS", false);
        }
    	return this.charSettingParameter("general.useragent.locale", value); 
    },

    defaultSearchBackend: function(value) { return this.charSettingParameter("kiwix.defaultsearchbackend", value); },
    skin: function(value) { return this.charSettingParameter("general.skins.selectedSkin", value); },
    displayStatusBar: function(value) { return this.boolSettingParameter("displayStatusBar", value); },
    displayFullScreen: function(value) { return this.boolSettingParameter("displayFullScreen", value); },
    displayBookmarksBar: function(value) { return this.boolSettingParameter("displayBookmarksBar", value); },
    windowWidth: function(value) { return this.intSettingParameter("windowWidth", value); },
    windowHeight: function(value) { return this.intSettingParameter("windowHeight", value); },
    windowX: function(value) { return this.intSettingParameter("windowX", value); },
    windowY: function(value) { return this.intSettingParameter("windowY", value); },
    windowMaximized: function(value) { return this.boolSettingParameter("windowMaximized", value); },
    doOnCloseClean: function(value) { return this.boolSettingParameter("doOnCloseClean", value); },
    displayTabs: function(value) { return this.boolSettingParameter("displayTabs", value); },
    defaultFilePickerPath: function(value) { return this.charSettingParameter("defaultFilePickerPath", value); },
    profileToRemove: function(value) { return this.charSettingParameter("profileToRemove", value); },
    displayOnCloseCleanConfirmDialog: function(value) { 
    	return this.boolSettingParameter("displayOnCloseCleanConfirmDialog", value); 
    }
}

/* Create the settings object */
settings.register();
