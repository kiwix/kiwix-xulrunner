/**
* JS-XMLRPC: Yet Another XMLRPC Library, in Javascript!
*
* ...as if the world needed it...
*
* FOR COMPLETE API DOCS, READ PHP-XMLRPC API DOCS. THE SAME API (almost) IS IMPLEMENTED HERE!
*
* Many thanks to Jan-Klaas Kollhof for JSOLAIT, and to the Yahoo YUI team, for
* providing the building blocks for all of this
*
* @version $Id: xmlrpc_lib.js,v 1.30 2008/07/23 19:28:36 ggiunta Exp $
* @author Gaetano Giunta
* @copyright (c) 2006-2009 G. Giunta
* @license code licensed under the BSD License: http://phpxmlrpc.sourceforge.net/jsxmlrpc/license.txt
*
* KNOWN DIFFERENCES FROM PHP-XMLRPC:
* + internal struct of xmlrpcval is slightly different
* + xmlrpcresp.serialize() produces complete xml chunk, including xml prologue
* + adding data to a struct val using colliding keys might produce different results
* + xmlrpcresp has no private member 'content-type'
* + values of global object 'xmlrpcTypes' differ (keys are the same)
* + xmlrpcval::addScalar() does not coerce values when declaring them as boolean
* + xmlrpcmsg::parseResponse() can take a string as second parameter (full response headers)
* + objects have an init() constructor method (needed for subclassing)
* + client by default has keepalive ON, uses HTTP 1.1 (if browser set to use HTTP 1.1)
* + client by default will send to server any cookie received
* + client does not support ssl certs, proxies, ntlm auth (?)
* + client by default will support receiving compresssed content, many charsets, as per browser capabilities and settings
* + client supports making async calls. send() timeouts are ignored in sync calls
* + lib output is performed by two functions: xmlrpc_error_log and xmlrpc_debug_log
* + method names ARE KEY SENSISTIVE IN JAVASCRIPT, and this lib respects camelCase convention
*
* MISSING FEATURES:
* - xmlrpc_decode_xml
* - handling of charset encoding (where explicitly requested)
* - compression of requests
* - handling of compression, chunked encoding in parseResponseHeaders
* - JSLint, testsuite, speed tests, demo files
* - htmlentities only encodes as much as php function htmlspecialchars
* - encoding/decoding of anon js classes via an xml attribute (since it is hard to recover a class name, we could encode instead all methods code)
* - complete parsing of: new xmlrpcclient('http://james:bond@a.complete/uri')
* - using client credentials for https auth
* - support for Rhino as host environment. Unluckily, it misses XHR (but see http://www.ibm.com/developerworks/webservices/library/ws-ajax1/ and http://jqueryjs.googlecode.com/svn/trunk/jquery/build/runtest/env.js for solutions)
*
* IMPROVEMENTS:
* @todo do not add methods to js base objects for serialization (use instanceof instead?)
* @todo optimize generation of strings using array and join('') instead of strings and + (nb: in Opera it's slower, in IE faster...)
* @todo add charset support to xmlrpc_encode_entities
*
* @todo when creating date xmlrpc values, save date objects instead of strings?
* @todo more in general, is it a good idea to save native js types inside xmlrpcvals
*       instead of native js objects? test memory/speed differences
* @todo when decoding xmlrpc int and double vals, check if we can skip regexp validation and be faster
* @todo fix base64_encode of empty strings (now it returns '0' on all browsers but FF)
* @todo find a way to add async+timeout msg send when running in WSH
* @todo find a more elegant solution to the 'hacks' in xmlrpc_debug_log() and htmlentities() for WSH case
*/

/******************************************************************************/
// global variables

var xmlrpcI4 = 'i4';
var xmlrpcInt = 'int';
var xmlrpcBoolean = 'boolean';
var xmlrpcDouble = 'double';
var xmlrpcString = 'string';
var xmlrpcDateTime = 'dateTime.iso8601';
var xmlrpcBase64 = 'base64';
var xmlrpcArray = 'array';
var xmlrpcStruct = 'struct';
var xmlrpcValue = 'undefined';
var xmlrpcNull = 'null';

/**
* @final
*/
var xmlrpcTypes = {
	xmlrpcI4 : 4,
	xmlrpcInt: 4,
	xmlrpcBoolean: 6,
	xmlrpcString: 1,
	xmlrpcDouble: 5,
	xmlrpcDateTime: 7,
	xmlrpcBase64: 8,
	xmlrpcArray: 2,
	xmlrpcStruct: 3,
	xmlrpcNull: 9
}

/**
* Library name. Used in the client's httprequests to identify self to server
* @type string
*/
var xmlrpcName = 'XML-RPC for JAVASCRIPT';
/**
* Library version number. Used in the client's httprequests to identify self to server
* @type string
*/
var xmlrpcVersion = '0.4';

// let user errors start at 800
var xmlrpcerruser = 800;
// let XML parse errors start at 100
var xmlrpcerrxml = 100;

var xmlrpcerr = {
	invalid_return: 2,
	http_error: 5,
	no_data: 6,
	no_curl: 16,
	multicall_error: 18,
	no_parser: 19
}

var xmlrpcstr = {
	invalid_return: 'Invalid return payload: enable debugging to examine incoming payload',
	http_error: 'Didn\'t receive 200 OK from remote server.',
	no_data: 'No data received from server.',
	no_curl: 'no support for executing http requests compiled in',
	multicall_error: 'Received from server invalid multicall response',
	no_parser: 'no support for parsing xml compiled in'
}

// set to TRUE to enable correct decoding of <NIL/> and <EX:NIL/> values
var xmlrpc_null_extension = false;
// set to TRUE to enable encoding of php NULL values to <EX:NIL/> instead of <NIL/>
var xmlrpc_null_apache_encoding = false;

var _xh = null;

// Please note that MS says you should only use versions 6 and 3...
// http://blogs.msdn.com/xmlteam/archive/2006/10/23/using-the-right-version-of-msxml-in-internet-explorer.aspx
var _msxml_progid = ['MSXML2.XMLHTTP.6.0', 'MSXML2.XMLHTTP.3.0', 'MSXML2.XMLHTTP.4.0', 'MSXML2.XMLHTTP','Microsoft.XMLHTTP'];
var _msxmldoc_progid = ['MSXML2.DOMDOCUMENT.6.0', 'MSXML2.DOMDOCUMENT.3.0', 'MSXML2.DOMDOCUMENT.4.0', 'MSXML2.DOMDOCUMENT','Microsoft.XMLDOM'];

/******************************************************************************/
/**
* @param {string} path
* @param {string} server
* @param {integer} port optional. Defaults to 80 for http, 443 for https
* @param {string} method not in use yet. Valid values: 'https', 'http'
* @constructor
* @todo verify support for:
		https,
		proxies,
		auth types,
		recovering cookies, ---> via getAllResponseHeaders()
		response/request compression, ---> response = transparent by the browser, request === to do
		charset transcoding, ---> done transparently (?) by the browser
		...
*/
function xmlrpc_client (path, server, port, method)
{
	/** @private **/
	this.path = '';
	/** @private **/
	this.server = '';
	/** @private **/
	this.port = 0; // verify if it can be used...
	/** @private **/
	this.method = 'http';
	//this.errno = 0;
	//this.errstr = '';
	/** @private **/
	this.debug = 0;
	/** @private **/
	this.username = '';
	/** @private **/
	this.password = '';
	this.no_multicall = false;
	/** @private **/
	this.cookies = {};
	this.return_type = 'xmlrpcvals';
	this.keepalive = true;
	this.accepted_charset_encodings = 'auto';
	/** @private **/
	this.accepted_compression = 'auto';
	/** @private **/
	this.polling_interval = 50;
	this.polling_queue = [];
	this.tid = 0;
	this.user_agent = xmlrpcName + ' ' + xmlrpcVersion;
	this.init(path, server, port, method);
}

/**
* @todo correctly split url into components if given as single parameter
* @private
*/
xmlrpc_client.prototype.init = function (path, server, port, method)
{
	if (method === undefined && port === undefined && server === undefined)
	{
		if (path !== undefined && path.search(/^https?:\/\/[^\/:]/) != -1)
		{
			/// @todo split eventual 'user:pwd@' from server
			// NB: if server/port are different from window.location, this might not make much sense...
			var matches = path.match(/(https?):\/\/([^\/:]+)(:\d+)?(.+)?/);
			method = matches[1];
			server = matches[2];
			port = matches[3] == undefined ? matches[3] : matches[3].substr(1);
			path = matches[4] !== undefined ? matches[4] : '';
		}
		else
		{
			// allow WSH to run us
			if (window !== undefined)
			{
				if (path === undefined)
				{
					path = window.location.pathname + window.location.search;
				}
				// path is ok, server, port and method are taken from window.location
				server = window.location.hostname;
				port = window.location.port;
				method = window.location.protocol == 'https:' ? 'https' : 'http';
			}
		}
	}
	if (path == '' || path.substr(0, 1) != '/')
	{
		this.path = '/' + path;
	}
	else
	{
		this.path = path;
	}
	this.server = server;
	if (port != undefined && port != '')
	{
		this.port = port;
	}
	if (method != undefined)
	{
		this.method = method;
	}
}

/**
* Enables/disables the echoing to screen of the xmlrpc responses received
* @param {integer} dbg values 0, 1 and 2 are supported (2 = echo sent msg too, before received response)
* @public
*/
xmlrpc_client.prototype.setDebug = function (dbg)
{
	this.debug = dbg;
}

/**
* Enables/disables reception of compressed xmlrpc responses.
* Note that enabling reception of compressed responses merely adds some standard
* http headers to xmlrpc requests. It is up to the xmlrpc server to return
* compressed responses when receiving such requests.
* @param {string} compmethod either 'gzip', 'deflate', 'any', 'auto' or ''. 'auto' means the javascript host (eg. the browser) will decide what to do
* @public
* @bug on IE setting does not seem to have any effect?
*/
xmlrpc_client.prototype.setAcceptedCompression = function (compmethod)
{
	if (compmethod == 'auto')
		this.accepted_compression = compmethod;
	else if (compmethod == 'any')
		this.accepted_compression = ['gzip', 'deflate'];
	else
		this.accepted_compression = array[compmethod];
}

/**
* Add some http BASIC AUTH credentials, used by the client to authenticate
* @param {string} username
* @param {string} password
* @param {integer} authtype Not in use (yet). See curl_setopt man page for supported auth types. Defaults to CURLAUTH_BASIC (basic auth)
* @public
*/
xmlrpc_client.prototype.setCredentials = function (username, password, authtype)
{
	this.username = username;
	this.password = password;
	// authtype not yet supported...
	//if (authtype === undefined) {
	//	this.authtype = 1;
	//}
	//else {
	//	this.authtype = authtype;
	//}
}

/**
* Set user-agent string that will be used by this client instance
* in http headers sent to the server
* @param {string} agentstring
* @public
*/
xmlrpc_client.prototype.setUserAgent = function(agentstring)
{
	this.user_agent = agentstring;
}
/**
* Send an xmlrpc request.
*
* @param {mixed} msg The message object, or an array of messages for using multicall, or the complete xml representation of a request
* @param {integer} timeout Connection timeout, in seconds. If unspecified, or 0 a platform specific timeout will apply. Used only with async calls and callback faunctions.
* @param {string|object} if string: 'method' - if left unspecified, the http protocol chosen during creation of the object will be used
*                        if object: callback function that accepts an xmlrpcresp obj as parameter
* @type xmlrpcresp
* @public
*/
xmlrpc_client.prototype.send = function (msg, timeout, method)
{
	var async = false;
	if (method === undefined || method === '') {
		method = this.method;
	}
	else if (typeof(method) == 'function')
	{
		async = method;
		method = this.method;
	}

	if (this.port == 0)
	{
		if (typeof window == 'object' && window.location.port == '')
		{
			// workaround for Safari BUG: if no port is given in current URL, it
			// will deny xhr access to url:80...
			var port = '';
		}
		else
		{
			var port = ':80';
		}
	}
	else
	{
		var port = ':' + this.port;
	}
	if (typeof(msg) == 'object' && msg instanceof Array) {
		return this.multiCall(msg, timeout, method);
	} else if (typeof(msg) == 'string') {
		var n = new xmlrpcmsg('');
		n.payload = msg;
		msg = n;
	}
	msg.debug = this.debug;

	// instantiate the request obj
	var httpconn = null;
	try	{
		// Instantiates XMLHttpRequest in non-IE browsers and assigns to http.
		// If you read note #1035754, in the post above, you will see that, in IE, if we try to instantiate
		// first the native XMLHttpRequest and then an activeX dom object, we might get
		// into trouble, using mismatched versions... oh so typical of them...
		httpconn = new XMLHttpRequest();
	}
	catch(e)
	{
		for(var i = 0; i < _msxml_progid.length; ++i) {
			try	{
				// Instantiates XMLHttpRequest for IE and assign to http.
				httpconn = new ActiveXObject(_msxml_progid[i]);
				break;
			}
			catch(e) {}
		}
	}
	if (httpconn === null)
	{
		var resp = new xmlrpcresp(0, xmlrpcerr['no_curl'], xmlrpcstr['no_curl']);
		if (async)
		{
			async(resp);
			return false;
		}
		return resp;
	}

	// Only create the payload if it was not created previously
	if (msg.payload == '')
	{
		msg.createPayload();
	}

	/// @todo add optional deflating of request
	var payload = msg.payload;
	var encoding_hdr = '';

	if (this.debug > 1)
	{
		xmlrpc_debug_log('<PRE>\n---SENDING---\n'+htmlentities(payload)+'\n---END---\n</PRE>');
	}

	try
	{
		if (this.username != '')
		{
			httpconn.open('POST', method + '://' + this.server + port + this.path, Boolean(async), this.username, this.password);
		}
		else
		{
			httpconn.open('POST', method + '://' + this.server + port + this.path, Boolean(async));
		}
	}
	catch(e)
	{
		//alert('open failed of '+method + '://' + this.server + port + this.path);
		httpconn = null;
		var resp = new xmlrpcresp(0, xmlrpcerr['http_error'], xmlrpcstr['http_error']+' (open failed)');
		if (async)
		{
			async(resp);
			return false;
		}
		return resp;
	}

	// opera 8b does not support setRequestHeader
	try
	{

	// optionally deny reception of deflated responses
	if (this.accepted_compression != 'auto')
	{
		httpconn.setRequestHeader('Accept-Encoding', this.accepted_compression.join(','));
	}

	/// @todo add support for setting cookies by hand

	httpconn.setRequestHeader('User-Agent', user_agent);
	httpconn.setRequestHeader('Content-type', msg.content_type);
	if (!this.keepalive)
	{
		httpconn.setRequestHeader('Connection', 'close');
		httpconn.setRequestHeader('Keep-Alive', ''); // harmless on IE, removes header in FF
	}
	// clear http headers that browsers add on their own

	// note: we assume that msg type is the same as type of expected response...
	httpconn.setRequestHeader('Accept', msg.content_type);
	//httpconn.setRequestHeader('Accept-lang', '');

	// add http header for accepted charsets if user set them explicitly
	if (this.accepted_charset_encodings != 'auto')
	{
		httpconn.setRequestHeader('Accept-Charset', this.accepted_charset_encodings.join(','));
	}

	// this one is set last, because Safari refuses to set it, and possibly raises an exception
	httpconn.setRequestHeader('Content-length', payload.length);

	}
	catch(e) // exception on call of setRequestHeader(): do nothing
	{
	}

	if (async)
	{
		if (timeout > 0)
		{
			// instead of binding to onreadystatechange event, we set up a polling
			// and abort callbacks after timeout secs
			var client = this;
			var tid = this.tid;
			this.polling_queue[this.tid] = [];
			// save pointers to timers, to make sure they later get deleted
			this.polling_queue[this.tid][0] = window.setTimeout(function(){
				window.clearInterval(client.polling_queue[tid][1]);
				delete client.polling_queue[tid][1];
				delete client.polling_queue[tid][0];
				client.handleTransaction(msg, httpconn, async, true);
			}, timeout*1000);
			this.polling_queue[this.tid][1] = window.setInterval(function(){
				if (httpconn.readyState == 4)
				{
					window.clearInterval(client.polling_queue[tid][1]);
					window.clearTimeout(client.polling_queue[tid][0]);
					delete client.polling_queue[tid][1];
					delete client.polling_queue[tid][0];
					client.handleTransaction(msg, httpconn, async, false);
					//httpconn = null;
				}
			}, this.polling_interval);
			++this.tid;
		}
		else
		{
			var client = this;
			// no timeout defined, be quicker and just use events
			httpconn.onreadystatechange = function(){
				if (httpconn.readyState == 4)
				{
					if (httpconn.status != 200)
					{
						/// @todo check if HTTP 1.1 100 Continue header will get us here or not...
						var resp = new xmlrpcresp(0, xmlrpcerr['http_error'], xmlrpcstr['http_error']+' ( HTTP ' + httpconn.status + ' ' + httpconn.statusText +')');
					}
					else
					{
						var resp = msg.parseResponse(httpconn.responseText, httpconn.getAllResponseHeaders(), client.return_type);
					}
					// make sure objs get destroyed. MIGHT help GC... (taken from other libs...)
					httpconn = null;
					async(resp);
				}
			}
		}
	}

	try
	{
		/// @todo check if we could extract more info from this exception...
		httpconn.send(payload);
	}
	catch(e)
	{
		httpconn = null;
		var resp = new xmlrpcresp(0, xmlrpcerr['http_error'], xmlrpcstr['http_error']+' (send failed)');
		if (async)
		{
			async(resp);
			return false;
		}
		return resp;
	}

	if (!async)
	{
		if (httpconn.status != 200)
		{
			/// @todo check if HTTP 1.1 100 Continue header will get us here or not...
			var resp = new xmlrpcresp(0, xmlrpcerr['http_error'], xmlrpcstr['http_error']+' ( HTTP ' + httpconn.status + ' ' + httpconn.statusText + ')');
		}
		else
		{
			var resp = msg.parseResponse(httpconn.responseText, httpconn.getAllResponseHeaders(), this.return_type);
		}
		// make sure objs get destroyed. MIGHT help GC... (taken from other libs...)
		httpconn = null;
		return resp;
	}
}
/**
 * Handler for async calls http transaction end events
 * @private
 **/
xmlrpc_client.prototype.handleTransaction = function(msg, httpconn, callback, is_timeout)
{
	if (is_timeout)
	{
		// timeout
		/// @todo rumors say that calling abort() on connections in state 0 or 4 raises an error...
		httpconn.abort();
		var resp = new xmlrpcresp(0, xmlrpcerr['http_error'], xmlrpcstr['http_error']+' (send timeout)');
	}

	else
	{
		// http ok
		if (httpconn.status != 200)
		{
			/// @todo check if HTTP 1.1 100 Continue header will get us here or not...
			var resp = new xmlrpcresp(0, xmlrpcerr['http_error'], xmlrpcstr['http_error']+' ( HTTP ' + httpconn.status + ' ' + httpconn.statusText +')');
		}
		else
		{
			var resp = msg.parseResponse(httpconn.responseText, httpconn.getAllResponseHeaders(), this.return_type);
		}
	}
	callback(resp);
}

/**
* Send an array of request messages and return an array of responses.
* Unless this.no_multicall has been set to true, it will try first
* to use one single xmlrpc call to server method system.multicall, and
* revert to sending many successive calls in case of failure.
* This failure is also stored in this.no_multicall for subsequent calls.
* Unfortunately, there is no server error code universally used to denote
* the fact that multicall is unsupported, so there is no way to reliably
* distinguish between that and a temporary failure.
* If you are sure that server supports multicall and do not want to
* fallback to using many single calls, set the fourth parameter to FALSE.
*
* @param {array} messages an array of xmlrpcmsg objects
* @param {integer} timeout Not in use (yet). Connection timeout (in seconds) for every single request made
* @param {string} method The http protocol variant to be used. If undefined, defaults to the variant used at obj creation time. Not in use (yet)
* @param {boolean} fallback When true (the default value), upon receiveing an error during multicall, multiple single calls will be attempted
* @type array
* @public
*/
xmlrpc_client.prototype.multiCall = function (messages, timeout, method, fallback)
{
	// NB: trying to shoehorn extra functionality into existing syntax has resulted
	// in pretty much convoluted code...

	if (fallback == undefined)
	{
		fallback = true;
	}
	if (method == undefined)
	{
		method = this.method;
	}

	if (!this.no_multicall)
	{
		var results = this._try_multicall(messages, timeout, method);
		if (results instanceof Array)
		{
			// System.multicall succeeded
			return results;
		}
		else
		{
			// either system.multicall is unsupported by server,
			// or call failed for some other reason.
			if (fallback)
			{
				// Don't try it next time...
				this.no_multicall = true;
			}
			else
			{
				if (results instanceof xmlrpcresp)
				{
					var result = results;
				}
				else
				{
					var result = new xmlrpcresp(0, xmlrpcerr['multicall_error'], xmlrpcstr['multicall_error']);
				}
			}
		}
	}
	else
	{
		// override fallback, in case careless user tries to do two
		// opposite things at the same time
		fallback = true;
		var results;
	}

	results = [];
	if (fallback)
	{
		// system.multicall is (probably) unsupported by server:
		// emulate multicall via multiple requests
		for(var i = 0; i < messages.length; ++i)
		{
			results[results.length] = this.send(messages[i], timeout, method);
		}
	}
	else
	{
		// user does NOT want to fallback on many single calls:
		// since we should always return an array of responses,
		// return an array with the same error repeated n times
		for(var i = 0; i < messages.length; ++i)
		{
			results[results.length] = result;
		}
	}
	return results;
}

/**
* Attempt to boxcar msgs via system.multicall.
* Returns either an array of xmlrpcreponses, an xmlrpc error response
* or false (when received response does not respect valid multicall syntax)
* @private
*/
xmlrpc_client.prototype._try_multicall = function (msgs, timeout, method)
{
	// Construct multicall message
	var calls = [];
	var call = {}
	var numParams;
	var msg;
	var params;
	for(var i = 0; i < msgs.length; ++i)
	{
		msg = msgs[i];
		call['methodName'] = new xmlrpcval(msgs.method(),'string');
		numParams = msg.getNumParams();
		params = [];
		for(var j = 0; j < numParams; ++j)
		{
			params[j] = msg.getParam(j);
		}
		call['params'] = new xmlrpcval(params, 'array');
		calls[i] = new xmlrpcval(call, 'struct');
	}
	var multicall = new xmlrpcmsg('system.multicall');
	multicall.addParam(new xmlrpcval(calls, 'array'));

	// Attempt RPC call
	var result = this.send(multicall, timeout, method);

	if (result.faultCode() != 0)
	{
		// call to system.multicall failed
		return result;
	}

	// Unpack responses.
	var rets = result.value();

	if (this.return_type == 'xml')
	{
		return rets;
	}
	else if (this.return_type == 'jsvals')
	{
		rets = result.value();
		if (!rets instanceof Array)
		{
			return false;		// bad return type from system.multicall
		}
		var numRets = rets.length;
		if (numRets != msgs.length)
		{
			return false;		// wrong number of return values.
		}

		var response = [];
		var val;
		for(i = 0; i < numRets; ++i)
		{
			val = rets[i];
			// in Js, val can either be a single-valued array, or an anonobj here...
			//if (!val instanceof Array)
			//{
			//	return false;
			//}
			switch(val.length)
			{
				case 1:
					if (val[0] === undefined)
					{
						return false;		// Bad value
					}
					// Normal return value
					response[i] = new xmlrpcresp(val[0], 0, '', 'jsvals');
					break;
				case 2:
					try
					{
						var code = val['faultCode'];
						if (typeof(code) != 'number')
						{
							return false;
						}
						var str = val['faultString'];
						if (typeof(str) != 'string')
						{
							return false;
						}
						response[i] = new xmlrpcresp(0, code, str);
					}
					catch (e)
					{
						return false;
					}
					break;
				default:
					return false;
			}
		}
		return response;
	}
	else // return type == 'xmlrpcvals'
	{
		rets = result.value();
		if (rets.kindOf() != 'array')
		{
			return false;		// bad return type from system.multicall
		}
		var numRets = rets.arraysize();
		if (numRets != msgs.length)
		{
			return false;		// wrong number of return values.
		}

		var response = [];
		var val;
		for(i = 0; i < numRets; ++i)
		{
			val = rets.arraymem(i);
			switch(val.kindOf())
			{
				case 'array':
					if (val.arraySize() != 1)
					{
						return false;		// Bad value
					}
					// Normal return value
					response[i] = new xmlrpcresp(val.arrayMem(0));
					break;
				case 'struct':
					var code = val.structmem('faultCode');
					if (code.kindOf() != 'scalar' || code.scalarTyp() != 'int')
					{
						return false;
					}
					var str = val.structmem('faultString');
					if (str.kindOf() != 'scalar' || str.scalarTyp() != 'string')
					{
						return false;
					}
					response[i] = new xmlrpcresp(0, code.scalarVal(), str.scalarVal());
					break;
				default:
					return false;
			}
		}
		return response;
	}
}

/******************************************************************************/
/**
* Create an xmlrpcval object out of a plain javascript value
* @param {mixed} val
* @param {string} type Any valid xmlrpc type name (lowercase). If omitted, 'string' is assumed
* @constructor
*/
function xmlrpcval (val, type)
{
	/** @private **/
	this.me = null;
	/** @private **/
	this.mytype = 0;
	/** @private **/
	this._js_class = '';

	this.init(val, type);
}

/**
* @param {mixed} val
* @param {string} type Any valid xmlrpc type name (lowercase). If null, 'string' is assumed
* @private
*/
xmlrpcval.prototype.init = function (val, type) {
	if (val !== undefined)
	{
		this.me = val;
		switch(type)
		{
			case 'string':
			case undefined:
			case '':
				this.mytype = 1;
				break;
			case 'i4':
			case 'int':
				this.mytype = 4;
				break;
			case 'double':
				this.mytype = 5;
				break;
			case 'boolean':
				this.mytype = 6;
				break;
			case 'dateTime.iso8601':
				this.mytype = 7;
				break;
			case 'base64':
				this.mytype = 8;
				break;
			case 'null':
				this.mytype = 9; // shall we be content with type 0?
				break;
			case 'array':
				this.mytype = 2;
				break;
			case 'struct':
				this.mytype = 3;
				this.myidx = 0;
				break;
			default:
				xmlrpc_error_log('XML-RPC: xmlrpcval::xmlrpcval: not a known type ('+type+')');
		}
	}
}

/**
* Add a single javascript value to an (uninitialized) xmlrpcval
* @param {mixed} val
* @param {string} type
* @return 1 or 0 on failure
* @type integer
*/
xmlrpcval.prototype.addScalar = function (val, type) {
	if (type === undefined)
		type = 'string';
	if (xmlrpcTypes[type] === undefined)
	{
		xmlrpc_error_log('XML-RPC: xmlrpcval::addScalar: not a scalar type ('+type+')');
		return 0;
	}

	// coerce booleans into correct values
	// NB: we should iether do it for datetimes, integers and doubles, too,
	// or just plain remove this check, implemnted on booleans only...
	/*if ($type==$GLOBALS['xmlrpcBoolean'])
	{
		if (strcasecmp($val,'true')==0 || $val==1 || ($val==true && strcasecmp($val,'false')))
		{
			$val=true;
		}
		else
		{
			$val=false;
		}
	}*/

	switch(this.mytype)
	{
		case 0:
			// a scalar, so set the value and remember we're scalar
			this.me = val;
			this.mytype = xmlrpcTypes[type];
			return 1;
		case 2:
			// we're adding a scalar value to an array here
			this.me[this.me.length] = new xmlrpcval(val, type);
			return 1;
		case 3:
			xmlrpc_error_log('XML-RPC: xmlrpcval::addScalar: cannot add anonymous scalar to struct xmlrpcval');
			return 0;
		default:
			xmlrpc_error_log('XML-RPC: xmlrpcval::addScalar: scalar xmlrpcval can have only one value');
			return 0;
	}
}

/**
* Add an array of xmlrpcval objects to an xmlrpcval (of type array or uninitialized)
* @param {array} vals An array, whose members are xmlrpcvals
* @return 1 or 0 on failure
* @type integer
* @public
*
* @todo add some checking for vals to be an array of xmlrpcvals?
*/
xmlrpcval.prototype.addArray = function (vals) {
	if (this.mytype == 0) {
		this.mytype = 2;
		this.me = vals;
		return 1;
	}
	else if (this.mytype == 2)
	{
		// we're adding to an array here
		for(var i = 0; i < vals.length; i++)
			this.me[this.me.length] = vals[i];
		return 1;
	}
	else
	{
		//xmlrpc_error_log('XML-RPC: xmlrpcval::addArray: already initialized as a [' . $this.kindOf() . ']');
		return 0;
	}
}

/**
* Add a list (anon obj) of named xmlrpcval objects to an xmlrpcval (of type struct or uninitialized)
* @param {object} vals An anonymous object, whose members are xmlrpcvals
* @return 1 or 0 on failure
* @type integer
* @public
*
* @todo add some checking for $vals to be an array?
*/
xmlrpcval.prototype.addStruct = function (vals)	{
	if (this.mytype == 0)
	{
		this.mytype = 3;
		this.me = vals;
		this.myidx = 0;
		return 1;
	}
	else if (this.mytype == 3)
	{
		// we're adding to a struct here. we expect an anon obj as parameter...
		for(var i in vals)
			this.me[i] = vals[i];
		return 1;
	}
	else
	{
		//xmlrpc_error_log('XML-RPC: xmlrpcval::addStruct: already initialized as a [' . this.kindOf() . ']');
		return 0;
	}
}

/**
* Returns a string containing "struct", "array" or "scalar" describing the base type of the value
* @type string
* @public
*/
xmlrpcval.prototype.kindOf = function () {
	switch(this.mytype)
	{
		case 3:
			return 'struct';
		case 2:
			return 'array';
		case 0:
			return 'undef';
		default:
			// note: this is hoping for nobody havingset this.me to, say, 666...
			/// @todo make this more secure enumerating known scalar types: 1, 4-9
			return 'scalar';
	}
}

/**
* Returns xml representation of the value. XML prologue not included
* @param {string} charset_encoding the charset to be used for serialization. If null, US-ASCII is assumed
* @type string
* @public
*/
xmlrpcval.prototype.serialize = function (charset_encoding)
{
	/// @todo coerce scalar types when serializing...
	switch(this.mytype)
	{
		case 1:
			var result = '<string>'+xmlrpc_encode_entities(this.me)+'</string>';
			break;
		case 4:
			if (isFinite(this.me) && this.me !== null)
			{ /// @todo add true and false? looks like isFinite accepts them as valid...
				var result = '<int>'+this.me.toFixed()+'</int>'; // as per Ecma-262, toFixed is better than toString...
			}
			else
			{
				var result = '<int>0</int>';
			}
			break;
		case 5:
			if (isFinite(this.me) && this.me !== null)
			{ /// @todo add true and false? looks like isFinite accepts them as valid...
				var result = '<double>'+this.me.toString()+'</double>';
			}
			else
			{
				var result = '<double>0</double>';
			}
			break;
		case 6:
			if (this.me)
				var result = '<boolean>1</boolean>';
			else
				var result = '<boolean>0</boolean>';
			break;
		case 7:
			// we are assuming we got a string, correctly formatted, here
			/// @todo shall we add some xml-escaping here???
			result = '<dateTime.iso8601>'+this.me+'</dateTime.iso8601>';
			break;
		case 8:
			var result = '<base64>'+base64_encode(this.me)+'</base64>';
			break;
		case 9:
		    if (xmlrpc_null_apache_encoding)
		    {
		        var result = '<ex:nil/>';
		    }
		    else
		    {
		        var result = '<nil/>';
		    }
			break;
		case 2:
			var result = '<array>\n<data>\n';
			for(var i = 0; i < this.me.length; i++)
			{
				result = result+this.me[i].serialize(charset_encoding);
				//alert(i+': '+this.me[i].kindof()+' - '+this.me[i].scalartyp());
			}
			result = result+'</data>\n</array>';
			break;
		case 3:
			var result = '<struct>\n';
			for(var attr in this.me)
			{
				result = result+'<member><name>'+xmlrpc_encode_entities(attr)+'</name>\n'+this.me[attr].serialize(charset_encoding)+'</member>\n';
				//alert(attr+': '+this.me[attr].kindof()+' - '+this.me[attr].scalartyp());
			}
			result = result+'</struct>';
			break;
		default:
			var result = '';
	}
	return '<value>'+result+'</value>\n';
}

/**
* Checks wheter a struct member with a given name is present.
* Works only on xmlrpcvals of type struct.
* @param {string} m the name of the struct member to be looked up
* @type boolean
* @public
*/
xmlrpcval.prototype.structMemExists = function(m) {
	for(var attr in this.me)
		if (attr == m)
			return true;
	return false;
}

/**
* Returns the value of a given struct member (an xmlrpcval object in itself).
* @param {string} m the name of the struct member to be looked up
* @return undefined if no such member exists
* @type xmlrpcval
* @public
*/
xmlrpcval.prototype.structMem = function(m) {
	return this.me[m];
}

/**
* Reset internal pointer for xmlrpcvals of type struct.
* @public
*/
xmlrpcval.prototype.structReset = function() {
	this.myidx = 0;
}

/**
* Returns next member element for xmlrpcvals of type struct.
* @return An anon obj with members 0,key => element name, 1,value => element val, or false upon reaching end of struct
* @type object
* @public
*/
xmlrpcval.prototype.structEach = function() {
	++this.myidx;
	var i = 0;
	for (var attr in this.me) {
		++i;
		if (i == this.myidx) {
			return {0:attr, 1:this.me[attr], key:attr, value:this.me[attr]} // same as php array returned by each()
		}
	}
	return false;
}

/**
* Returns the value of a scalar xmlrpcval
* @type mixed
* @public
*/
xmlrpcval.prototype.scalarVal = function () {
	return this.me;
}

/**
* Returns the type of the xmlrpcval.
* For integers, 'int' is always returned in place of 'i4'
* @type string
* @public
*/
xmlrpcval.prototype.scalarTyp = function () {
	switch(this.mytype)
	{
		case 3:
			return 'struct';
		case 2:
			return 'array';
		case 1:
			return 'string';
		case 4:
			return 'int';
		case 5:
			return 'double';
		case 6:
			return 'boolean';
		case 7:
			return 'dateTime.iso8601';
		case 8:
			return 'base64';
		case 9:
			return 'null';
		case 0:
			return 'undef';
		default:
			return 'undef: '+this.mytype; // on php version raises a warning instead
	}
}

/**
* Returns the m-th member of an xmlrpcval of array type
* @param {integer} m the index of the value to be retrieved (zero based).
* @return undefined if there is no such element
* @type xmlrpcval
* @public
*/
xmlrpcval.prototype.arrayMem = function(m) {
	return this.me[m];
}

/**
* Returns the number of members in an xmlrpcval of array type
* @type integer
* @public
*/
xmlrpcval.prototype.arraySize = function() {
	return this.me.length;
}

/**
* Returns the number of members in an xmlrpcval of struct type
* @type integer
* @public
*/
xmlrpcval.prototype.structSize = function() {
	var i = 0;
	for(var attr in this.me)
		++i;
	return i;
}

/**
* @type xmlrpcval
* @private
*/
xmlrpcval.prototype.toXmlRpcVal = function() {
	return this;
}

/******************************************************************************/
/**
* @param {string} meth Name of the method to be invoked
* @param {array} pars list of parameters for method call (xmlrpcval objects)
* @constructor
*/
function xmlrpcmsg(meth, pars) {
	/** @private **/
	this.methodname = '';
	/** @private **/
	this.params = [];
	/** @private **/
	this.payload = '';
	/** @private **/
	this.debug = 0;
	/** @private **/
	this.content_type = 'text/xml';

	this.init(meth, pars);
}

/**
* @private
*/
xmlrpcmsg.prototype.init = function(meth, pars) {
	this.methodname = meth;
	if (pars != undefined)
	{
		for(var i = 0; i < pars.length; ++i)
		{
			this.addParam(pars[i]);
		}
	}
}

/**
* @private
*/
xmlrpcmsg.prototype.kindOf = function() {
	return 'msg';
}

/**
* @private
*/
xmlrpcmsg.prototype.xml_header = function (charset_encoding) {
	if (charset_encoding != undefined && charset_encoding != '')
	{
		return '<?xml version="1.0" encoding="'+charset_encoding+'" ?' + '>\n<methodCall>\n';
	}
	else
	{
		return '<?xml version="1.0"?' + '>\n<methodCall>\n';
	}
}

/**
* @private
*/
xmlrpcmsg.prototype.xml_footer = function() {
	return '</methodCall>';
}

/**
* @private
*/
xmlrpcmsg.prototype.createPayload = function (charset_encoding) {
	if (charset_encoding != undefined && charset_encoding != '')
		this.content_type = 'text/xml; charset=' + charset_encoding;
	else
		this.content_type = 'text/xml';
	this.payload = this.xml_header(charset_encoding);
	this.payload = this.payload + '<methodName>' + xmlrpc_encode_entities(this.methodname) + '</methodName>\n';
	this.payload = this.payload + '<params>\n';
	for(var i = 0; i < this.params.length; i++)
	{
		this.payload = this.payload + '<param>\n' + this.params[i].serialize(charset_encoding) +
			'</param>\n';
	}
	this.payload = this.payload + '</params>\n';
	this.payload = this.payload + this.xml_footer();
}

/**
* Gets/sets the xmlrpc method to be invoked
* @param {string} meth the method to be set (leave empty not to set it)
* @return the method that will be invoked
* @type string
* @public
*/
xmlrpcmsg.prototype.method = function (meth)
{
	if (meth != undefined && meth != '')
	{
		this.methodname = meth;
	}
	return this.methodname;
}

/**
* Returns xml representation of the message. XML prologue included
* @param {string} charset_encoding The charset to be used for serialization. If null, US-ASCII is assumed
* @return the xml representation of the message, xml prologue included
* @type string
* @public
*/
xmlrpcmsg.prototype.serialize = function (charset_encoding)
{
	this.createPayload(charset_encoding);
	return this.payload;
}

/**
* Add a parameter to the list of parameters to be used upon method invocation
* @param {xmlrpcval} par
* @return false on failure (when parameter par is not of correct type)
* @type boolean
* @public
*/
xmlrpcmsg.prototype.addParam = function (par) {
	/// @todo: add check: do not add to self params which are not xmlrpcvals
	if (typeof(par) == 'object') // && )
	{
		this.params[this.params.length] = par;
		return true;
	}
	else
	{
		return false;
	}
}

/**
* Returns the nth parameter in the message. The index zero-based.
* @param {integer} i the index of the parameter to fetch (zero based)
* @return the i-th parameter (undefined if index i is bigger than current number of params)
* @type xmlrpcval
* @public
*/
xmlrpcmsg.prototype.getParam = function (i) { return this.params[i]; }

/**
* Returns the number of parameters in the messge.
* @return the number of parameters currently set
* @type integer
* @public
*/
xmlrpcmsg.prototype.getNumParams = function () { return this.params.length; }

/**
* Returns the response body (string) minus http headers, or an xmlrpcresp obj on error
* @private
*/
xmlrpcmsg.prototype.parseResponseHeaders = function (data, headers_processed) {
	if (headers_processed === undefined)
	{
		headers_processed = false;
	}
	var pos, bd;

	// NOTE: the http headers received from xmlhttprequest in browser-based hosts
	// do NOT include the status code.

	// Support "web-proxy-tunelling" connections for https through proxies
	if (data.search(/^HTTP\/1\.[0-1] 200 Connection established/) != -1)
	{
		// Look for CR/LF or simple LF as line separator,
		// (even though it is not valid http)
		pos = data.indexOf('\r\n\r\n');
		if (pos != -1)
		{
			bd = pos + 4;
		}
		else
		{
			pos = data.indexOf('\n\n');
			if (pos != -1)
			{
				bd = pos + 2;
			}
			else
			{
				// No separation between response headers and body: fault?
				bd = 0;
			}
		}
		if (bd)
		{
			// this filters out all http headers from proxy.
			// maybe we could take them into account, too?
			data = data.slice(bd);
		}
		else
		{
			xmlrpc_error_log('XML-RPC: xmlrpcmsg::parseResponse: HTTPS via proxy error, tunnel connection possibly failed');
			var r = new xmlrpcresp(0, xmlrpcerr['http_error'], xmlrpcstr['http_error'] + ' (HTTPS via proxy error, tunnel connection possibly failed)');
			return r;
		}
	}

	// Strip HTTP 1.1 100 Continue header if present
	while(data.search(/^HTTP\/1\.1 1[0-9]{2} /) != -1)
	{
		pos = data.indexOf('HTTP', 12);
		// server sent a Continue header without any (valid) content following...
		// give the client a chance to know it
		if (pos == -1)
		{
			break;
		}
		data = data.substr(pos);
	}

	var ar = data.match(/^HTTP\/[0-9.]+ ([0-9]{3}) /);
	if (ar != null && ar[0] != '200')
	{
		var errstr = (data.indexOf('\n') != -1) ? data.substring(0, data.indexOf('\n')-1) : data;
		xmlrpc_error_log('XML-RPC: xmlrpcmsg::parseResponse: HTTP error, got response: ' + errstr);
		var r = new xmlrpcresp(0, xmlrpcerr['http_error'], xmlrpcstr['http_error'] + ' (' + errstr + ')');
		return r;
	}

	_xh['headers'] = {};
	_xh['cookies'] = {};

	// be tolerant to usage of \n instead of \r\n to separate headers and data
	// (even though it is not valid http)
	pos = data.indexOf('\r\n\r\n');
	if (pos != -1)
	{
		bd = pos + 4;
	}
	else
	{
		pos = data.indexOf('\n\n');
		if (pos != -1)
		{
			bd = pos + 2;
		}
		else
		{
			// No separation between response headers and body: fault?
			// we could take some action here instead of going on...
			bd = 0;
			pos = data.length;
		}
	}

	// be tolerant to line endings, and extra empty lines
	ar = data.substring(0, pos).replace(/^\s/, '').replace(/\s$/, '').split(/\r?\n/);
	var line, arr;
	for(var i = 0; i < ar.length; ++i)
	{
		line = ar[i];
		// take care of multi-line headers and cookies
		arr = line.split(':');
		if (arr.length > 1)
		{
			// re-glue together all the stuff found after the first semicolon (header value)
			for(var j = 2; j < arr.length; ++j)
				arr[1] += ':' + arr[j];

			var header_name = arr[0].replace(/^\s/, '').replace(/\s$/, '').toLowerCase();
			/// @todo some other headers (the ones that allow a CSV list of values)
			/// do allow many values to be passed using multiple header lines.
			/// We should add content to _xh['headers'][header_name]
			/// instead of replacing it for those...
			if (header_name == 'set-cookie' || header_name == 'set-cookie2')
			{
				if (header_name == 'set-cookie2')
				{
					// version 2 cookies:
					// there could be many cookies on one line, comma separated
					var cookies = arr[1].split(',');
				}
				else
				{
					var cookies = [arr[1]];
				}
				for(j = 0; j < cookies.length; ++j)
				{
					var cookie = cookies[j];
					// glue together all received cookies, using a comma to separate them
					// (same as php does with getallheaders())
					if (_xh['headers'][header_name] !== undefined)
						_xh['headers'][header_name] += ', ' + cookie.replace(/^\s/, '').replace(/\s$/, '');
					else
						_xh['headers'][header_name] = cookie.replace(/^\s/, '').replace(/\s$/, '');
					// parse cookie attributes, in case user wants to correctly honour them
					// feature creep: only allow rfc-compliant cookie attributes?
					cookie = cookie.split(';');
					for(var k = 0; k < cookie.length; ++k)
					{
						var val = cookie[k].split('=');
						if (val.length == 1)
							val[1] = '';
						else if (val.length > 1)
						{
							for(var l = 2; l < val.length; ++l)
								val[1] += '=' + val[l];
						}
						var tag = val[0].replace(/^\s/, '').replace(/\s$/, '');
						val = val[1].replace(/^\s/, '').replace(/\s$/, '');
						/// @todo with version 1 cookies, we should strip leading and trailing " chars
						if (k == 0)
						{
							var cookiename = tag;
							_xh['cookies'][tag] = [];
							_xh['cookies'][cookiename]['value'] = decodeURIComponent(val);
						}
						else
						{
							_xh['cookies'][cookiename][tag] = val;
						}
					}
				}
			}
			else
			{
				_xh['headers'][header_name] = arr[1].replace(/^\s/, '').replace(/\s$/, '');
			}
		}
		else if (header_name !== undefined)
		{
			///	@todo version1 cookies might span multiple lines, thus breaking the parsing above
			_xh['headers'][header_name] += ' ' + line.replace(/^\s/, '').replace(/\s$/, '');
		}
	}

	data = data.slice(0, bd);

	if (this.debug)
	{
		xmlrpc_debug_log('<PRE>');
		for(i in _xh['headers'])
		{
			xmlrpc_debug_log(htmlentities('HEADER: ' + i + ': ' + _xh['headers'][i]));
		}
		for(i in _xh['cookies'])
		{
			xmlrpc_debug_log(htmlentities('COOKIE: ' + i + '=' + _xh['cookies'][i]));
		}
		xmlrpc_debug_log('</PRE>');
	}

	// if a browser's xmlhttreq. obj was used for the call, http headers have been processed,
	// and dechunking + reinflating have been carried out
	if (!headers_processed)
	{
		/**
		TO BE DONE
		// Decode chunked encoding sent by http 1.1 servers
		if (isset(_xh['headers']['transfer-encoding']) && _xh['headers']['transfer-encoding'] == 'chunked')
		{
			if (!$data = decode_chunked($data))
			{
				xmlrpc_error_log('XML-RPC: xmlrpcmsg::parseResponse: errors occurred when trying to rebuild the chunked data received from server');
				var r = new xmlrpcresp(0, $GLOBALS['xmlrpcerr']['dechunk_fail'], $GLOBALS['xmlrpcstr']['dechunk_fail']);
				return r;
			}
		}
		// Decode gzip-compressed stuff
		// code shamelessly inspired from nusoap library by Dietrich Ayala
		if (isset(_xh['headers']['content-encoding']))
		{
			_xh['headers']['content-encoding'] = str_replace('x-', '', _xh['headers']['content-encoding']);
			if (_xh['headers']['content-encoding'] == 'deflate' || _xh['headers']['content-encoding'] == 'gzip')
			{
				// if decoding works, use it. else assume data wasn't gzencoded
				if (function_exists('gzinflate'))
				{
					if (_xh['headers']['content-encoding'] == 'deflate' && $degzdata = @gzuncompress($data))
					{
						$data = $degzdata;
						if ($this.debug)
							print "<PRE>---INFLATED RESPONSE---[".strlen($data)." chars]---\n" . htmlentities($data) . "\n---END---</PRE>";
					}
					elseif (_xh['headers']['content-encoding'] == 'gzip' && $degzdata = @gzinflate(substr($data, 10)))
					{
						$data = $degzdata;
						if ($this.debug)
							print "<PRE>---INFLATED RESPONSE---[".strlen($data)." chars]---\n" . htmlentities($data) . "\n---END---</PRE>";
					}
					else
					{
						xmlrpc_error_log('XML-RPC: xmlrpcmsg::parseResponse: errors occurred when trying to decode the deflated data received from server');
						var r = new xmlrpcresp(0, $GLOBALS['xmlrpcerr']['decompress_fail'], $GLOBALS['xmlrpcstr']['decompress_fail']);
						return r;
					}
				}
				else
				{
					xmlrpc_error_log('XML-RPC: xmlrpcmsg::parseResponse: the server sent deflated data. Your php install must have the Zlib extension compiled in to support this.');
					var r = new xmlrpcresp(0, $GLOBALS['xmlrpcerr']['cannot_decompress'], $GLOBALS['xmlrpcstr']['cannot_decompress']);
					return r;
				}
			}
		}
		**/
	} // end of 'if needed, de-chunk, re-inflate response'

	// Js misses cal-by-ref, so we pass back the string we received, minus http headers
	return data;
}

/**
* Parse the xmlrpc response contained in the string data and return an xmlrpcresp object.
* @param {string} data the xmlrpc response, eventually including http headers
* @param {boolean|string} headers_processed When true prevents parsing HTTP headers for interpretation of content-encoding and consequent decoding. If a string, it is assumed to be the complete set of http headers, separated from response body. Defaults to false
* @param {string} return_type decides return type, i.e. content of response.value(). Either 'xmlrpcvals' (default), 'xml' or 'jsvals'
* @type xmlrpcresp
* @public
*/
xmlrpcmsg.prototype.parseResponse = function (data, headers_processed, return_type) {

//alert(headers_processed);
//alert(data);

	var headers = '';
	if (headers_processed === undefined)
	{
		headers_processed = false;
	}
	else if (typeof(headers_processed) == 'string')
	{
		headers = headers_processed;
		headers_processed = true;
	}

	if (return_type === undefined)
	{
		return_type = 'xmlrpcvals';
	}

	if (this.debug)
	{
		xmlrpc_debug_log('<PRE>---GOT---\n' + htmlentities(data) + '\n---END---\n</PRE>');
	}
	if (data == '')
	{
		xmlrpc_error_log('XML-RPC: xmlrpcmsg::parseResponse: no response received from server.');
		var r = new xmlrpcresp(0, xmlrpcerr['no_data'], xmlrpcstr['no_data']);
		return r;
	}

	_xh = {headers: [], cookies: {}};
	var raw_data = data;
	// examining http headers: check first if given as second param to function
	if (headers != '')
	{
		var r = this.parseResponseHeaders(headers, true);
	}
	// else check if http headers given as part of complete html response
	else if (data.slice(0, 4) == 'HTTP')
	{
		// if it was so, remove them (or return an error response, if parsing fails)
		var r = this.ParseResponseHeaders(data, headers_processed);
		if (typeof(r) !== 'string')
		{
			r.raw_data = data;
			return r;
		}
		else
		{
			data = r;
		}
	}

	if (this.debug)
	{
		var start = data.indexOf('<!-- SERVER DEBUG INFO (BASE64 ENCODED):');
		if (start != -1)
		{
			start += 41; //new String('<!-- SERVER DEBUG INFO (BASE64 ENCODED):').length();
			var end = data.indexOf('-->', start);
			var comments = data.slice(start, end-1);
			xmlrpc_debug_log('<PRE>---SERVER DEBUG INFO (DECODED)---\n\t'+htmlentities(base64_decode(comments).replace(/\n/g, '\n\t'))+'\n---END---\n</PRE>');
		}
	}

	// be tolerant of extra whitespace in response body
	data = data.replace(/^\s/, '').replace(/\s$/, '');

	// be tolerant of junk after methodResponse (e.g. javascript ads automatically inserted by free hosts)
	var pos = data.lastIndexOf('</methodResponse>');
	if (pos >= 0)
	{
		data = data.slice(0, pos+17);
	}

	// if user wants back raw xml, give it to him
	if (return_type == 'xml')
	{
		var r = new xmlrpcresp(data, 0, '', 'xml');
		r.hdrs = _xh['headers'];
		r._cookies = _xh['cookies'];
		r.raw_data = raw_data;
		return r;
	}

	/// @todo try to 'guestimate' the character encoding of the received response

	// build xml parser object
	var obj = null;
	var isMoz = false;
	var isIE = false;
	var isASV = false;

	try
	{ //to get Adobe's SVG parseXML
		obj = window.parseXML;
		if (obj == null)
		{
			throw 'No ASV parseXML';
		}
		isASV = true;
	}
	catch(e)
	{
		try
		{ //to get the mozilla parser
			obj = new DOMParser();
			isMoz = true;
		}
		catch(e)
		{
			for(var i = 0; i < _msxmldoc_progid.length; ++i)
			{
				try
				{
					// Instantiates XML parser for IE and assign to obj.
					obj = new ActiveXObject(_msxmldoc_progid[i]);
					isIE = true;
					break;
				}
				catch(e) {}
			}
		}
	}
	if (!isIE && !isMoz && !isASV)
	{
		var r = new xmlrpcresp(0, xmlrpcerr['no_parser'], xmlrpcstr['no_parser']);
		r.hdrs = _xh['headers'];
		r._cookies = _xh['cookies'];
		r.raw_data = raw_data;
		return r;
	}

	try
	{
		if (isMoz)
		{
			obj = obj.parseFromString(data, 'text/xml');
		}
		else if (isIE)
		{
			obj.loadXML(data);
		}
		else if (isASV)
		{
			obj = window.parseXML(data, null);
		}
	}
	catch(e)
	{
		/// @todo add some more error info here: check out exception obj...
		xmlrpc_error_log('XML Error');
		if (this.debug)
		{
			xmlrpc_debug_log('XML Error');
		}
		var r = new xmlrpcresp(0, xmlrpcerr['invalid_return'], xmlrpcstr['invalid_return']);
		r.hdrs = _xh['headers'];
		r._cookies = _xh['cookies'];
		r.raw_data = raw_data;
		return r;
	}

	try
	{
		var node = obj.documentElement;
		if (node == null)
		{//just in case parse xml didn't throw an Exception but returned nothing useful.
			throw 'No documentElement found.';
		}
		switch(node.tagName)
		{
			case 'methodResponse':
				//return parseMethodResponse(node);
				node = getSingleChild(node, ['params', 'fault']);
				if (node.tagName == 'fault')
				{
					node = getSingleChild(node, ['value']);
					var value = parseXmlrpcValue(node, true);
					/// @todo validate more format of error response: check for extra members...
					if (typeof(value) != 'object' || !value.hasOwnProperty('faultCode') || !value.hasOwnProperty('faultString'))
					{
						var r = new xmlrpcresp(0, xmlrpcerr['invalid_return'], xmlrpcstr['invalid_return']+ ' (malformed fault response)');
					}
					else
					{
						if (value['faultCode'] == 0)
						{
							value['faultCode'] = -1;
						}
						var r = new xmlrpcresp(0, value['faultCode'], value['faultString']);
					}
				}
				else
				{
					node = getSingleChild(node, ['param']);
					node = getSingleChild(node, ['value']);
					var value = parseXmlrpcValue(node, return_type == 'jsval');
					var r = new xmlrpcresp(value, 0, '', return_type);
				}
				if (this.debug)
				{
					xmlrpc_debug_log('<PRE>---PARSED---');
					xmlrpc_debug_log(htmlentities(var_export(value)));
					xmlrpc_debug_log('\n---END---</PRE>');
				}
				r.hdrs = _xh['headers'];
				r._cookies = _xh['cookies'];
				r.raw_data = raw_data;
				return r;
			//case "methodCall":
			//	return parseMethodCall(node);
			default: //nothing useful returned by parseXML.
				throw 'missing top level xmlrpc element';
		}
	}
	catch (e)
	{
		if (this.debug)
		{
			/// @todo echo something for user?
		}
		var r = new xmlrpcresp(0, xmlrpcerr['invalid_return'], xmlrpcstr['invalid_return'] + ' (' + e.toString() + ')');
		r.hdrs = _xh['headers'];
		r._cookies = _xh['cookies'];
		r.raw_data = raw_data;
		return r;
	}
}

/******************************************************************************/
/**
* @param {mixed} val either an xmlrpcval obj, a js value or the xml serialization of an xmlrpcval (a string)
* @param {integer} fcode set it to anything but 0 to create an error response
* @param {string} fstr the error string, in case of an error response
* @param {string} valtyp either 'xmlrpcvals', 'jsvals' or 'xml'. When unspecified, the type of the val parameter is analyzed to best guess how to encode it (any js string will be assumed to be the xml representation of a response)
* @constructor
*/
function xmlrpcresp(val, fcode, fstr, valtyp) {
	/** @private **/
	this.val = 0;
	/** @private **/
	this.valtyp = '';
	/** @private **/
	this.errno = 0;
	/** @private **/
	this.errstr = '';
	/** @private **/
	this.payload = '';
	/** @private **/
	this.hdrs = [];
	/** @private **/
	this._cookies = {};
	//this.content_type = 'text/xml';
	/** @private **/
	this.raw_data = '';

	this.init(val, fcode, fstr, valtyp);
}

/**
* Constructor for xmlrpcresp. Moved outside the xmlrpcresp() functions becuase we need subclasses to call it
* @private
*
* @todo add check that val / fcode / fstr is of correct type???
* NB: as of now we do not do it, since it might be either an xmlrpcval or a plain
* js val, or a complete xml chunk, depending on usage of xmlrpc_client::send() inside which creator is called...
*/
xmlrpcresp.prototype.init = function (val, fcode, fstr, valtyp) {
	if (fcode != undefined && fcode != 0)
	{
		// error response
		this.errno = fcode;
		this.errstr = fstr;
		//this.errstr = htmlspecialchars(fstr); // XXX: encoding probably shouldn't be done here; fix later.
	}
	else
	{
		// successful response
		this.val = val;
		if (valtyp == undefined)
		{
			// user did not declare type of response value: try to guess it
			/// @todo: verify class...
			if (typeof(val) == 'object') //&& is_a(this.val, 'xmlrpcval'))
			{
				this.valtyp = 'xmlrpcvals';
			}
			else if (typeof(val) == 'string')
			{
				this.valtyp = 'xml';
			}
			else
			{
				this.valtyp = 'jsvals';
			}
		}
		else
		{
			// user declares type of resp value: believe him
			this.valtyp = valtyp;
		}
	}
}

/**
* Returns the error code of the response.
* @return the error code of this response (0 for not-error responses)
* @type integer
* @public
*/
xmlrpcresp.prototype.faultCode = function () {
	return this.errno;
}

/**
* Returns the error string of the response.
* @return the error string of this response ('' for not-error responses)
* @type string
* @public
*/
xmlrpcresp.prototype.faultString = function () {
	return this.errstr;
}

/**
* Returns the value received by the server.
* @return the xmlrpcval object returned by the server. Might be an xml string or js value if the response has been created by specially configured xmlrpc_client objects
* @type mixed
* @public
*/
xmlrpcresp.prototype.value = function () {
	return this.val;
}

/**
* Returns an array with the cookies received from the server.
* Array has the form: cookiename => array ('value' => val, attr1 => val1, attr2 = val2, ...)
* with attributes being e.g. 'expires', 'path', domain'.
* NB: cookies sent as 'expired' by the server (i.e. with an expiry date in the past)
* are still present in the array. It is up to the user-defined code to decide
* how to use the received cookies, and wheter they have to be sent back with the next
* request to the server (using xmlrpc_client::setCookie) or not
* @return array of cookies received from the server
* @type object
* @public
*/
xmlrpcresp.prototype.cookies = function () {
	return this._cookies;
}

/**
* @private
*/
xmlrpcresp.prototype.xml_header = function (charset_encoding) {
	if (charset_encoding != undefined && charset_encoding != '')
	{
		return '<?xml version="1.0" encoding="'+charset_encoding+'" ?' + '>\n<methodResponse>\n';
	}
	else
	{
		return '<?xml version="1.0"?' + '>\n<methodResponse>\n';
	}
}

/**
* Returns xml representation of the response. XML prologue not included
* @param {string} charset_encoding the charset to be used for serialization. If null, US-ASCII is assumed
* @return the xml representation of the response
* @type string
* @public
*/
xmlrpcresp.prototype.serialize = function (charset_encoding) {
	//if (charset_encoding != undefined && charset_encoding != '')
	//	this.content_type = 'text/xml; charset=' + charset_encoding;
	//else
	//	this.content_type = 'text/xml';
	result = this.xml_header(charset_encoding);
	if (this.errno)
	{
		// G. Giunta 2005/2/13: let non-ASCII response messages be tolerated by clients
		// by xml-encoding non ascii chars
		result += '<fault>\n' +
'<value>\n<struct><member><name>faultCode</name>\n<value><int>' + this.errno +
'</int></value>\n</member>\n<member>\n<name>faultString</name>\n<value><string>' +
//xmlrpc_encode_entities(this.errstr, GLOBALS['xmlrpc_internalencoding'], charset_encoding) + "</string></value>\n</member>\n" +
xmlrpc_encode_entities(this.errstr) + '</string></value>\n</member>\n' +
'</struct>\n</value>\n</fault>';
	}
	else
	{
		/// @todo test for correct obj class
		if (typeof(this.val) != 'object') // || !is_a(this.val, 'xmlrpcval'))
		{
			if (typeof(this.val) == 'string' && this.valtyp == 'xml')
			{
				result += '<params>\n<param>\n' +
					this.val +
					'</param>\n</params>';
			}
			else
			{
				/// @todo try to build something serializable?
				///die('cannot serialize xmlrpcresp objects whose content is native js values');
			}
		}
		else
		{
			result += '<params>\n<param>\n' +
				this.val.serialize(charset_encoding) +
				'</param>\n</params>';
		}
	}
	result += '\n</methodResponse>';
	this.payload = result;
	return result;
}

/******************************************************************************/

/**
* Takes an xmlrpc value in xmlrpcval object format and translates it into native javascript types.
* Works with xmlrpc message objects as input, too.
* @param {xmlrpcval} xmlrpc_val
* @param {object} not in use (yet)
* @type mixed
* @public
*
* @todo add support for rebuilding non-anon js objects
*/
function xmlrpc_decode(xmlrpc_val, options) {
	switch(xmlrpc_val.kindOf())
	{
		case 'scalar':
			return xmlrpc_val.scalarVal();
		case 'array':
			var size = xmlrpc_val.arraySize();
			var arr = [];
			for(var i = 0; i < size; ++i)
			{
				arr[arr.length] = xmlrpc_decode(xmlrpc_val.arrayMem(i), options);
			}
			return arr;
		case 'struct':
			// If user said so, try to rebuild js objects for specific struct vals.
			/// @todo should we raise a warning for class not found?
			// shall we check for proper subclass of xmlrpcval instead of
			// presence of _php_class to detect what we can do?
			if ((options != undefined && options['decode_js_objs']) && xmlrpc_val._js_class != '')
				//&& class_exists($xmlrpc_val->_php_class)) /// @todo check if a class exists with given name
			{
				var obj = new xmlrpc_val._js_class;
			}
			else
			{
				var obj = {};
			}
			for(var key in xmlrpc_val.me)
			{
				obj[key] = xmlrpc_decode(xmlrpc_val.me[key], options);
			}
			return obj;
		case 'msg':
			var paramcount = xmlrpc_val.getNumParams();
			var arr = [];
			for(var i = 0; i < paramcount; ++i)
			{
				arr[arr.length] = xmlrpc_decode(xmlrpc_val.getParam(i));
			}
			return arr;
		}
}

/**
* Takes native javascript types and encodes them recursively into xmlrpcval object format.
* It will not re-encode xmlrpcval objects (ie. they can be freely mixed with native js values).
* @param {mixed} js_val The value to be converted into an xmlrpcval object
* @param {array} options
* @type xmlrpcval
* @public
*/
function xmlrpc_encode(js_val, options) {
	var type = typeof js_val;
	switch(type)
	{
		case 'string':
			if ((options != undefined && options['auto_dates']) && js_val.search(/^[0-9]{8}T[0-9]{2}:[0-9]{2}:[0-9]{2}$/) != -1)
				var xmlrpc_val = new xmlrpcval(js_val, 'dateTime.iso8601');
			else
				var xmlrpc_val = new xmlrpcval(js_val, 'string');
			break;
		case 'number':
			/// @todo...
			var num = new Number(js_val);
			if (num == parseInt(num))
			{
				var xmlrpc_val = new xmlrpcval(js_val, 'int');
			}
			else //if (num == parseFloat(num))
			{
				var xmlrpc_val = new xmlrpcval(js_val, 'double');
			}
			//else
			//{
				// ??? only NaN and Infinity can get here. Encode them as zero (double)...
			//	var xmlrpc_val = new xmlrpcval(0, 'double');
			//}
			break;
		case 'boolean':
			var xmlrpc_val = new xmlrpcval(js_val, 'boolean');
			break;
		case 'object':
			// we should be able to use js_val instanceof Null, but FF refuses it...
			// nb: check nulls first, since they have no attributes
			if (js_val === null)
			{
				if (options != undefined && options['null_extension'])
				{
					var xmlrpc_val = new xmlrpcval(null, 'null');
				}
				else
				{
					var xmlrpc_val = new xmlrpcval();
				}
			}
			else
			if (js_val.toXmlRpcVal)
			{
				var xmlrpc_val = js_val.toXmlRpcVal();
			}
			else
			if (js_val instanceof Array)
			{
				var arr = [];
					for(var i = 0; i < js_val.length; ++i)
					{
						arr[arr.length] = xmlrpc_encode(js_val[i], options);
					}
					var xmlrpc_val = new xmlrpcval(arr, 'array');
			}
			else
			// xmlrpcval acquired capability to do this on its own, declaring toXmlRpcVal()
			//if (js_val instanceof xmlrpcval)
			//{
			//	var xmlrpc_val = js_val;
			//}
			//else
			{
				// generic js object. encode all members except functions
				var arr = {};
				for(var attr in js_val)
				{
					if (typeof js_val[attr] != 'function')
					{
						arr[attr] = xmlrpc_encode(js_val[attr], options);
					}
				}
				var xmlrpc_val = new xmlrpcval(arr, 'struct');
				/*if (in_array('encode_php_objs', options))
				{
					// let's save original class name into xmlrpcval:
					// might be useful later on...
					$xmlrpc_val._php_class = get_class($php_val);
				}*/
			}
			break;
		// match 'function', 'undefined', ...
		default:
			// it has to return an empty object in case
			var xmlrpc_val = new xmlrpcval();
			break;
		}
		return xmlrpc_val;
}

/**
* !!! TO BE IMPLEMENTED !!!
* Convert the xml representation of a method response, method request or single
* xmlrpc value into the appropriate object (deserialize)
* @param {string} xml_val
* @param {array} options
* @return false on error, or an instance of either xmlrpcval, xmlrpcmsg or xmlrpcresp
* @type mixed
* @public
*/
function xmlrpc_decode_xml(xml_val, options) {

}

/******************************************************************************/
// helper functions (from phpxmlrpc)...

/**
* Decodes a Base64 encoded string to a byte string.
* @param {string} aString
* @type string
* @throws exception can be raised when decoding improperly coded data
* @public
*/
function base64_decode (aString) {
    aString = aString.replace(/^\s+|\s+$/g, "");
	if ((aString.length % 4) == 0)
	{
		if (typeof atob == 'function')
		{ //try using mozillas builtin codec
			return atob(aString);
		}
		else
		{
			if (aString == '')
				return '';
			var nBits;
			// create a result buffer, this is much faster than having strings concatenated.
			var sDecoded = [aString.length / 4];
			var base64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
			for(var i = 0; i < aString.length; i += 4)
			{
				nBits = (base64.indexOf(aString.charAt(i)) & 0xff) << 18 |
					(base64.indexOf(aString.charAt(i+1)) & 0xff) << 12 |
					(base64.indexOf(aString.charAt(i+2)) & 0xff) << 6 |
					base64.indexOf(aString.charAt(i+3)) & 0xff;
				sDecoded[i] = String.fromCharCode((nBits & 0xff0000) >> 16, (nBits & 0xff00) >> 8, nBits & 0xff);
			}
			//make sure padding chars are left out.
			sDecoded[sDecoded.length-1] = sDecoded[sDecoded.length-1].substring(0, 3 - ((aString.charCodeAt(i - 2) == 61) ? 2 : (aString.charCodeAt(i - 1) == 61 ? 1 : 0)));
			return sDecoded.join('');
		}
	}
	else
	{
		//throw new mod.Exception("String length must be divisible by 4.");
		return null;
	}
}

/**
* Encodes a string using Base64.
* @param {string} aString
* @type string
* @public
* @bug given an empty string, returns '0' in IE and Opera
*/
function base64_encode (aString) {
	if (typeof btoa == 'function')
	{ // try using mozillas builtin codec
		return btoa(aString);
	}
	else
	{
		var base64 = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z',
					  'a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z',
					  '0','1','2','3','4','5','6','7','8','9','+','/'];
		var sbin;
		var pad = 0;
		var s = '' + aString;
		if ((s.length % 3) == 1)
		{
			s += String.fromCharCode(0);
			s += String.fromCharCode(0);
			pad = 2;
		}
		else if ((s.length % 3) == 2)
		{
			s += String.fromCharCode(0);
			pad = 1 ;
		}
		//create a result buffer, this is much faster than having strings concatinated.
		var rslt = [s.length / 3];
		var ri = 0;
		for(var i = 0; i < s.length; i += 3)
		{
			sbin = ((s.charCodeAt(i) & 0xff) << 16) | ((s.charCodeAt(i+1) & 0xff) << 8) | (s.charCodeAt(i+2) & 0xff);
			rslt[ri] = (base64[(sbin >> 18) & 0x3f] + base64[(sbin >> 12) & 0x3f] + base64[(sbin >>6) & 0x3f] + base64[sbin & 0x3f]);
			ri++;
		}
		if (pad > 0)
		{
			rslt[rslt.length-1] = rslt[rslt.length-1].substr(0, 4-pad) +((pad==2) ? '==' : (pad==1) ? '=' : '');
		}
		return rslt.join('');
	}
}

/**
* Given a Date object, returns its representation in the iso8601 format used by xmlrpc
* @param {Date} time
* @param {boolean} utc when True, the UTC timezone is assumed
* @type string
* @public
*/
function iso8601_encode(time, utc) {
	var padd = function(s, p)
	{
		s = p + s;
		return s.substring(s.length - p.length);
	}
	if (utc)
	{
		var y = padd(time.getUTCFullYear(), "0000");
		var m = padd(time.getUTCMonth() + 1, "00");
		var d = padd(time.getUTCDate(), "00");
		var h = padd(time.getUTCHours(), "00");
		var min = padd(time.getUTCMinutes(), "00");
		var s = padd(time.getUTCSeconds(), "00");
	}
	else
	{
		var y = padd(time.getFullYear(), "0000");
		var m = padd(time.getMonth() + 1, "00");
		var d = padd(time.getDate(), "00");
		var h = padd(time.getHours(), "00");
		var min = padd(time.getMinutes(), "00");
		var sec = padd(time.getSeconds(), "00");
	}

	return y + m + d + "T" + h + ":" + min + ":" + sec;
}

/**
* Given an ISO8601 date string, return a date obj in the localtime, or UTC
* @param {string} time
* @param {boolean} utc
* @type Date
* @public
*/
function iso8601_decode(time, utc) {
	if (/^(\d{4})(\d{2})(\d{2})T(\d{2}):(\d{2}):(\d{2})$/.test(time))
	{
		if (utc)
			return new Date(Date.UTC(RegExp.$1, RegExp.$2-1, RegExp.$3, RegExp.$4, RegExp.$5, RegExp.$6));
		else
			return new Date(RegExp.$1, RegExp.$2-1, RegExp.$3, RegExp.$4, RegExp.$5, RegExp.$6);
	}
	else
		return null;
}

/**
* @private
*/
function xmlrpc_encode_entities(data, src_encoding, dest_encoding)
{
	return new String(data).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
	//return data.replace(/&/g, "&amp;").replace(/</g, "&lt;");
}

/******************************************************************************/

/**
* @type xmlrpcval
* @private
*/
String.prototype.toXmlRpcVal = function(options) {
	return new xmlrpcval(this.toString());
}

/**
* @type xmlrpcval
* @todo: see if there are faster checks than parseInt and parseFloat
* @private
*/
Number.prototype.toXmlRpcVal = function(options) {
	if (this == parseInt(this))
	{
		return new xmlrpcval(this.valueOf(), 'int');
	}
	else //if (this == parseFloat(this))
	{
		return new xmlrpcval(this.valueOf(), 'double');
	}
	//else
	//{
		// ??? only NaN and Infinity can get here. Encode them as zero (double)...
	//	return new xmlrpcval(0, 'double');
	//}
}

/**
* @type xmlrpcval
* @private
*/
Boolean.prototype.toXmlRpcVal = function(options){
	return new xmlrpcval(this.valueOf(), 'boolean');
}

/**
* @type xmlrpcval
* @private
*/
Date.prototype.toXmlRpcVal = function(options) {
	return new xmlrpcval(iso8601_encode(this), 'dateTime.iso8601');
}

/**
 * Used to parse xml nodes: retrieve the single child if it is of correct type.
 * Raise an error on any other condition
 * @return an xml node
 * @throws string
 * @private
 **/
function getSingleChild(node, expectedType)
{
	var k;
	var ret = null;
	var child;
//alert('Looking for ' + expectedType[0])
	for(var i = 0, j = 0; i < node.childNodes.length; i++)
	{
		child = node.childNodes.item(i);
		if (child.nodeType == 1) // ignore comments (8), character data (3), ...
		{
			for (k = 0; k < expectedType.length; k++)
			{
				if (child.tagName == expectedType[k])
				{
				//alert('Found correct element inside ' + node.tagName + ': ' + child.tagName)
					ret = child;
					break;
				}
			}
			if (ret === null)
			{
				throw 'Found incorrect element inside ' + node.tagName + ': ' + child.tagName;
			}
			if (++j > 1)
			{
				throw 'Found too many elements inside ' + node.tagName;
			}
		}
	}
	if (j == 0)
	{
		throw 'Found no element inside ' + node.tagName;
	}
	return ret;
}

/**
 * Used to parse xml nodes: retrieve the node text and checks that no sub-elemnts are present.
 * Raise an error on any other condition
 * @type string
 * @throws string
 * @private
 **/
function getChildText(node)
{
	var ret = '';
	for(var i = 0; i < node.childNodes.length; i++)
	{
		child = node.childNodes.item(i);
		if (child.nodeType == 3) // ignore comments (8), character data (3), ...
		{
			ret += String(child.nodeValue)
		}
		else if (child.nodeType == 1) // ignore comments (8), character data (3), ...
		{
			throw 'elements found inside a '+node.tagName;
		}
	}
	return ret;
}

/**
 * @private
 **/
function parseXmlrpcValue(node, return_jsvals)
{
	if (return_jsvals === undefined)
	{
		return_jsvals = false;
	}
	/// @todo ...
	var s = '';
	var ret = null;
	var child;
	var valtyp;
	for(var i = 0, j = 0; i < node.childNodes.length; i++)
	{
		child = node.childNodes.item(i);
		if (child.nodeType == 1) // ignore comments (8), character data (3), ...
		{
			valtyp = child.tagName;
			switch (child.tagName)
			{
				case 'string':
//xmlrpc_debug_log('found a string');
					ret = getChildText(child);
					break;
				case 'int':
				case 'i4':
					ret = getChildText(child);
					// we have an I4/INT
					// we must check that only 0123456789-<space> are characters here
					/// @todo use a better regexp than this (or remove it altogether)
					if (ret.search(/^[+-]?[0123456789 \t]+$/) == -1)
					{
						/// @todo find a better way of throwing an error
						// than this!
						xmlrpc_error_log('XML-RPC: non numeric value received in INT: ' + ret);
						ret = 'ERROR_NON_NUMERIC_FOUND';
					}
					else
					{
						// it's ok, add it on
						ret = parseInt(ret);
					}
					break;
				case 'double':
					// we have a DOUBLE
					// we must check that only 0123456789-.<space> are characters here
					ret = getChildText(child);
					/// @todo use a better regexp than this (or remove it altogether)
					if (ret.search(/^[+-]?[eE0123456789 \t.]+$/) == -1)
					{
						/// @todo: find a better way of throwing an error
						// than this!
						xmlrpc_error_log('XML-RPC: non numeric value received in DOUBLE: ' + ret);
						ret = 'ERROR_NON_NUMERIC_FOUND';
					}
					else
					{
						// it's ok, add it on
						ret = parseFloat(ret);
					}
					break;
				case 'boolean':
					ret = getChildText(child);
					if (ret == '1' || ret.search(/^true$/i) != -1)
					{
						ret = true;
					}
					else
					{
						// log if receiveing something strange, even though we set the value to false anyway
						if (ret != '0' && ret.search(/^false$/i) == -1)
							xmlrpc_error_log('XML-RPC: invalid value received in BOOLEAN: ' + ret);
						ret = false;
					}
					break;
				case 'base64':
					/// @todo use a regexp to validate base64 encoded data?
					ret = base64_decode(getChildText(child));
					break;
				case 'dateTime.iso8601':
					ret = getChildText(child);
					if (ret.search(/^[0-9]{8}T[0-9]{2}:[0-9]{2}:[0-9]{2}$/) == -1)
					{
						xmlrpc_error_log('XML-RPC: invalid value received in DATETIME: ' + ret);
					}
					break;
				case 'array':
//xmlrpc_debug_log('found an array');
					child = getSingleChild(child, ['data']);
					ret = [];
					for (var k =0; k < child.childNodes.length; k ++)
					{
						if (child.childNodes[k].nodeType == 1)
						{
							if (child.childNodes[k].tagName != 'value')
							{
								throw 'invalid element found inside array: '+ child.childNodes[k].tagName;
							}
							ret[ret.length] = parseXmlrpcValue(child.childNodes[k], return_jsvals);
						}
					}
					break;
				case 'struct':
//xmlrpc_debug_log('found a struct');
					ret = {};
					var membername, member, memberval;
					for (var k =0; k < child.childNodes.length; ++k)
					{
						if (child.childNodes[k].nodeType == 1)
						{
							if (child.childNodes[k].tagName != 'member')
							{
								throw 'invalid element found inside struct: '+ child.childNodes[k].tagName;
							}
							member = child.childNodes[k];
							membername = ''; // struct members without a name will get named '' instead of rejected...
							memberval = undefined;
							for (var l =0; l < member.childNodes.length; ++l)
							{
								if (member.childNodes[l].nodeType == 1)
								{
									switch(member.childNodes[l].tagName)
									{
										case 'name':
											membername = getChildText(member.childNodes[l]);
											break;
										case 'value':
											memberval = parseXmlrpcValue(member.childNodes[l], return_jsvals);
											break;
										default:
											throw 'invalid element found inside struct: '+ member.childNodes[l].tagName;
									}
								}
							}
							if (memberval === undefined)
								throw 'invalid member found inside struct: missing value';
							ret[membername] = memberval;
						}
					}
					break;
                case 'nil':
                case 'ex:nil':
                    if (xmlrpc_null_extension)
                    {
                        ret = null;
                        break;
                    }
                    // fall through voluntarily
				default:
					throw 'Found incorrect element inside \'value\' :'+ child.tagName;

			}

			if (++j > 1)
			{
				throw 'Found too many elements inside ' + node.tagName;
			}
		}
		else if (child.nodeType == 3)
		{
			s += new String(child.nodeValue);
		}
	}

	if (j == 0)
	{
		if (!return_jsvals)
		{
			return new xmlrpcval(s);
		}
		else
		{
			return s;
		}
	}
	else
	{
		if (!return_jsvals)
		{
			return new xmlrpcval(ret, valtyp);
		}
		else
		{
			return ret;
		}
	}
}

/**
* Function used to send an error message to the log. To override the default
* log handler, define the function 'xmlrpc_error_log_handler(string logmsg)'
* @public
* @type void
*/
function xmlrpc_error_log(errormsg) {
	if (typeof(xmlrpc_error_log_handler) != 'function')
	{
		if (typeof window == 'object')
		{
			// be smart with Firebug console
			if (window.console && typeof window.console.error == 'function')
				window.console.error(errormsg);
			else
				//alert(errormsg);
				window.setTimeout(function(){throw new Error(errormsg);}, 0);
		}
		// MS Windows Scripting Host
		else if (typeof WScript == 'object')
		{
			WScript.Echo(logmsg); // cannot use settimeout to raise a non blocking exception...
		}
		// Rhino (running eg. inside JRE 6)
		//else if (typeof print == 'function')
		//{
		//	print(logmsg);
		//}
	}
	else
	{
		xmlrpc_error_log_handler(errormsg);
	}
}

/**
* Function used to send a debug message to the log. To override the default
* log handler, define the function 'xmlrpc_debug_log_handler(string logmsg)'
* @param {string} logmsg
* @type void
* @public
*/
function xmlrpc_debug_log(logmsg) {
	if (typeof(xmlrpc_debug_log_handler) != 'function')
	{
		if (typeof window == 'object')
		{
			// be smart with Firebug console
			if (window.console && typeof window.console.debug == 'function')
				window.console.debug(logmsg);
			// and cater for Safari console, too
			//else if (window.console && typeof window.console.log == 'function')
			//	window.console.log(logmsg);
			else
			{
				// document.writeln gives too many troubles, esp. w. firefox
				//document.writeln(logmsg);
				var el = document.createElement('pre');
				el.innerHTML = logmsg;
				document.body.appendChild(el);
			}
		}
		// MS Windows Scripting Host
		else if (typeof WScript == 'object')
		{
			WScript.Echo(logmsg.replace(/^<PRE>/g, '').replace(/<\/PRE>$/g, ''));
		}
		// Rhino (running eg. inside JRE 6)
		//else if (typeof print == 'function')
		//{
		//	print(logmsg.replace(/^<PRE>/g, '').replace(/<\/PRE>$/g, ''));
		//}
	}
	else
	{
		xmlrpc_debug_log_handler(logmsg);
	}
}

if (typeof window !== 'object') {

/**
* Debug helper. Should do the same as the PHP htmlentities function (well, htmlspecialchars rather...).
* NB: since it is ONLY used for debugging purposes, it gets disabled in WSH environments for better readability...
* @param {string} val
* @type string
* @todo encode all chars outside ASCII to html charset entity...
*/
function htmlentities(val, quote_style) {
	var out = new String(val).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
	if (quote_style != 0)
		out = out.replace(/"/g, '&quot;').replace(/'/g, '&apos;');
	return out;
}

} else {

function htmlentities(val, quote_style) {
	return val;
}

}

/**
* Debug helper. Mimics PHP var_export function
* @param {mixed} val
* @param {boolean} ret
* @param {boolean} whitespaces
* @type string
*/
function var_export(val, ret, whitespaces) {
	var type = typeof val;
	var indent = '';
	if (whitespaces !== undefined)
	{
		for (var i = 0; i < whitespaces; i++)
			indent += '  ';
	}
	else
	{
		whitespaces = 0;
	}
	switch(type)
	{
		case 'string':
			return '\'' + val.replace(/'/g, '\'\'') + '\'';
		case 'number':
		case 'boolean':
			return val.toString();
		case 'object':
			// we should be able to use val instanceof Null, but FF refuses it...
			// nb: check nulls first, since they have no attributes
			if (val === null)
			{
				return 'null';
			}
			else if (val instanceof Array)
			{
				var arr = '[\n';
				for(var i = 0; i < val.length; ++i)
				{
					arr += indent + '  ' + var_export(val[i], ret, whitespaces+1) + ',\n';
				}
				arr += indent + ']';
				return arr;
			}
			else
			{
				// generic js object. encode all members except functions
				var arr = '{\n';
				for(var attr in val)
				{
					if (typeof val[attr] != 'function')
					{
						arr += indent + '  \'' + attr + '\' => ' + var_export(val[attr], ret, whitespaces+1) + ',\n';
					}
				}
				arr += indent + '}';
				return arr;
			}
		// match 'function', 'undefined', ...
		default:
			return indent + type;
	}
}
