/*
 * MLBookmarks parses the moulin bookmark file
 * This is temporary hack ; switch to RDF is planned.
 * syntax is similar to YAML.
 */
function MLBookmarks () {}

MLBookmarks.parse = function (input) {

	var result = [];
	var currentObj = null;

	var lines = input.split (/\n/);
	var nLines = lines.length;
	
	for (var i = 0; i <= nLines; i++) {
		var line = new String (lines[i]);
		if (line.match (/^- /)) { // this is a new list-item
			if (currentObj != null) { // add previous in-progress object if any.
				result.push (currentObj);
				currentObj = null;
			}
			currentObj = {};
		}
		
		if (line.match (/^(-| ) ([a-z]*)\: (.*)/)) { // this is an item property
			var r = new RegExp (/^(-| ) ([a-z]*)\: (.*)/);
			var m = r.exec ();
			try {
				var propname = m[2];
				var propvalue = m[3];
				currentObj[propname] = propvalue;
			} catch (e) {
				dump("line is malformed");
			}
		}
		
	}
	if (currentObj != null) { // add previous in-progress object if any.
		result.push (currentObj);
		currentObj = null;
	}
	return result;
}

/*
 * Takes an array as input and returns
 * a YAML-like string
 */ 
MLBookmarks.dump = function (obj) {
	
	var output = new String ('--- \n'); // YAML style
	var nObj = obj.length;
	
	for (var i=0 ; i <= nObj ; i++) {
		if (obj[i] instanceof Object) { // this is a list-item
			output += '- \n';
			for (var j in obj[i]) { // properties
				output += '  '+j+': '+obj[i][j].toString ()+'\n';
			}
		}
	}
	return output;		
}

