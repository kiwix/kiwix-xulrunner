
/* Mini Logger to output stuff to JS Console. */
function L () {};

L.info = function (str) {
	try { 
		Components.classes['@mozilla.org/consoleservice;1']
		.getService (Components.interfaces.nsIConsoleService)
		.logStringMessage (str);
	} catch (e) {
		dump ("can't log info via nsIConsoleService: " + e.toString ());
	}
}

L.error = function (str) {
	try {
		Components.utils.reportError (str);
	} catch (e) {
		dump ("can't log error via reportError: " + e.toString ());
	}
}
