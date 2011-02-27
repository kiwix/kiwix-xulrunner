/* Display the preferences dialog box */
function showPreferences() {
    var win = window.openDialog('preferences.xul','','centerscreen,resizable=no,scrollbars=no,modal,dialog,chrome');
}

function getPreferencesWindow() {
    return document.getElementById("preferences");
}

function onPreferencesDialogStart() {
    var profileDirectoryTextbox = document.getElementById("profileDirectory-textbox");
    profileDirectoryTextbox.value = settings.getRootPath();
}

/* Choose new profile directory */
function manageChangeProfileDirectory() {

    /* Create the file picker object */
    var nsIFilePicker = Components.interfaces.nsIFilePicker;
    var filePicker = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
    filePicker.init(window, "Choose a directory to store your profile...", nsIFilePicker.modeGetFolder);

    /* Create a nsIFile from the profile directory path */
    var profileDirectory = Components.classes["@mozilla.org/file/local;1"]
	.createInstance(Components.interfaces.nsILocalFile);
    profileDirectory.initWithPath(settings.getRootPath());

    /* Set the default path */
    if (profileDirectory.exists() == true) {
	filePicker.displayDirectory = profileDirectory;
    }
    
    /* Show the dialog and get the file path */
    var res = filePicker.show();
    
    /* Get the file path */
    if (res == nsIFilePicker.returnOK) {
	var newProfileDirectory = filePicker.file;
	var newProfileDirectoryParent = newProfileDirectory.parent;

	/* Check if the target directory is writable */

	/* Check if the target directory is empty */

	/* Check if the target directory has enough place */

	/* Show a confirm dialog box to ask the user if he really want to move his profile */
	profileDirectory.copyTo(newProfileDirectoryParent, newProfileDirectory.leafName);
    } else {
	return false;
    }
}
