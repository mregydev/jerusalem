import crypto from 'crypto';
import path from 'path';
import buffer from 'buffer';
import util from 'util';
import events from 'events';
import fs from 'fs';
import stream from 'stream';
import os from 'os';
import string_decoder from 'string_decoder';

var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

function getCjsExportFromNamespace (n) {
	return n && n.default || n;
}

/*!
 * depd
 * Copyright(c) 2014 Douglas Christopher Wilson
 * MIT Licensed
 */

/**
 * Module exports.
 */

var callsiteTostring = callSiteToString;

/**
 * Format a CallSite file location to a string.
 */

function callSiteFileLocation (callSite) {
  var fileName;
  var fileLocation = '';

  if (callSite.isNative()) {
    fileLocation = 'native';
  } else if (callSite.isEval()) {
    fileName = callSite.getScriptNameOrSourceURL();
    if (!fileName) {
      fileLocation = callSite.getEvalOrigin();
    }
  } else {
    fileName = callSite.getFileName();
  }

  if (fileName) {
    fileLocation += fileName;

    var lineNumber = callSite.getLineNumber();
    if (lineNumber != null) {
      fileLocation += ':' + lineNumber;

      var columnNumber = callSite.getColumnNumber();
      if (columnNumber) {
        fileLocation += ':' + columnNumber;
      }
    }
  }

  return fileLocation || 'unknown source'
}

/**
 * Format a CallSite to a string.
 */

function callSiteToString (callSite) {
  var addSuffix = true;
  var fileLocation = callSiteFileLocation(callSite);
  var functionName = callSite.getFunctionName();
  var isConstructor = callSite.isConstructor();
  var isMethodCall = !(callSite.isToplevel() || isConstructor);
  var line = '';

  if (isMethodCall) {
    var methodName = callSite.getMethodName();
    var typeName = getConstructorName(callSite);

    if (functionName) {
      if (typeName && functionName.indexOf(typeName) !== 0) {
        line += typeName + '.';
      }

      line += functionName;

      if (methodName && functionName.lastIndexOf('.' + methodName) !== functionName.length - methodName.length - 1) {
        line += ' [as ' + methodName + ']';
      }
    } else {
      line += typeName + '.' + (methodName || '<anonymous>');
    }
  } else if (isConstructor) {
    line += 'new ' + (functionName || '<anonymous>');
  } else if (functionName) {
    line += functionName;
  } else {
    addSuffix = false;
    line += fileLocation;
  }

  if (addSuffix) {
    line += ' (' + fileLocation + ')';
  }

  return line
}

/**
 * Get constructor name of reviver.
 */

function getConstructorName (obj) {
  var receiver = obj.receiver;
  return (receiver.constructor && receiver.constructor.name) || null
}

/*!
 * depd
 * Copyright(c) 2015 Douglas Christopher Wilson
 * MIT Licensed
 */

/**
 * Module exports.
 * @public
 */

var eventListenerCount_1 = eventListenerCount;

/**
 * Get the count of listeners on an event emitter of a specific type.
 */

function eventListenerCount (emitter, type) {
  return emitter.listeners(type).length
}

var compat = createCommonjsModule(function (module) {

/**
 * Module dependencies.
 * @private
 */

var EventEmitter = events.EventEmitter;

/**
 * Module exports.
 * @public
 */

lazyProperty(module.exports, 'callSiteToString', function callSiteToString () {
  var limit = Error.stackTraceLimit;
  var obj = {};
  var prep = Error.prepareStackTrace;

  function prepareObjectStackTrace (obj, stack) {
    return stack
  }

  Error.prepareStackTrace = prepareObjectStackTrace;
  Error.stackTraceLimit = 2;

  // capture the stack
  Error.captureStackTrace(obj);

  // slice the stack
  var stack = obj.stack.slice();

  Error.prepareStackTrace = prep;
  Error.stackTraceLimit = limit;

  return stack[0].toString ? toString : callsiteTostring
});

lazyProperty(module.exports, 'eventListenerCount', function eventListenerCount () {
  return EventEmitter.listenerCount || eventListenerCount_1
});

/**
 * Define a lazy property.
 */

function lazyProperty (obj, prop, getter) {
  function get () {
    var val = getter();

    Object.defineProperty(obj, prop, {
      configurable: true,
      enumerable: true,
      value: val
    });

    return val
  }

  Object.defineProperty(obj, prop, {
    configurable: true,
    enumerable: true,
    get: get
  });
}

/**
 * Call toString() on the obj
 */

function toString (obj) {
  return obj.toString()
}
});

/*!
 * depd
 * Copyright(c) 2014-2017 Douglas Christopher Wilson
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var callSiteToString$1 = compat.callSiteToString;
var eventListenerCount$1 = compat.eventListenerCount;
var relative = path.relative;

/**
 * Module exports.
 */

var depd_1 = depd;

/**
 * Get the path to base files on.
 */

var basePath = process.cwd();

/**
 * Determine if namespace is contained in the string.
 */

function containsNamespace (str, namespace) {
  var vals = str.split(/[ ,]+/);
  var ns = String(namespace).toLowerCase();

  for (var i = 0; i < vals.length; i++) {
    var val = vals[i];

    // namespace contained
    if (val && (val === '*' || val.toLowerCase() === ns)) {
      return true
    }
  }

  return false
}

/**
 * Convert a data descriptor to accessor descriptor.
 */

function convertDataDescriptorToAccessor (obj, prop, message) {
  var descriptor = Object.getOwnPropertyDescriptor(obj, prop);
  var value = descriptor.value;

  descriptor.get = function getter () { return value };

  if (descriptor.writable) {
    descriptor.set = function setter (val) { return (value = val) };
  }

  delete descriptor.value;
  delete descriptor.writable;

  Object.defineProperty(obj, prop, descriptor);

  return descriptor
}

/**
 * Create arguments string to keep arity.
 */

function createArgumentsString (arity) {
  var str = '';

  for (var i = 0; i < arity; i++) {
    str += ', arg' + i;
  }

  return str.substr(2)
}

/**
 * Create stack string from stack.
 */

function createStackString (stack) {
  var str = this.name + ': ' + this.namespace;

  if (this.message) {
    str += ' deprecated ' + this.message;
  }

  for (var i = 0; i < stack.length; i++) {
    str += '\n    at ' + callSiteToString$1(stack[i]);
  }

  return str
}

/**
 * Create deprecate for namespace in caller.
 */

function depd (namespace) {
  if (!namespace) {
    throw new TypeError('argument namespace is required')
  }

  var stack = getStack();
  var site = callSiteLocation(stack[1]);
  var file = site[0];

  function deprecate (message) {
    // call to self as log
    log.call(deprecate, message);
  }

  deprecate._file = file;
  deprecate._ignored = isignored(namespace);
  deprecate._namespace = namespace;
  deprecate._traced = istraced(namespace);
  deprecate._warned = Object.create(null);

  deprecate.function = wrapfunction;
  deprecate.property = wrapproperty;

  return deprecate
}

/**
 * Determine if namespace is ignored.
 */

function isignored (namespace) {
  /* istanbul ignore next: tested in a child processs */
  if (process.noDeprecation) {
    // --no-deprecation support
    return true
  }

  var str = process.env.NO_DEPRECATION || '';

  // namespace ignored
  return containsNamespace(str, namespace)
}

/**
 * Determine if namespace is traced.
 */

function istraced (namespace) {
  /* istanbul ignore next: tested in a child processs */
  if (process.traceDeprecation) {
    // --trace-deprecation support
    return true
  }

  var str = process.env.TRACE_DEPRECATION || '';

  // namespace traced
  return containsNamespace(str, namespace)
}

/**
 * Display deprecation message.
 */

function log (message, site) {
  var haslisteners = eventListenerCount$1(process, 'deprecation') !== 0;

  // abort early if no destination
  if (!haslisteners && this._ignored) {
    return
  }

  var caller;
  var callFile;
  var callSite;
  var depSite;
  var i = 0;
  var seen = false;
  var stack = getStack();
  var file = this._file;

  if (site) {
    // provided site
    depSite = site;
    callSite = callSiteLocation(stack[1]);
    callSite.name = depSite.name;
    file = callSite[0];
  } else {
    // get call site
    i = 2;
    depSite = callSiteLocation(stack[i]);
    callSite = depSite;
  }

  // get caller of deprecated thing in relation to file
  for (; i < stack.length; i++) {
    caller = callSiteLocation(stack[i]);
    callFile = caller[0];

    if (callFile === file) {
      seen = true;
    } else if (callFile === this._file) {
      file = this._file;
    } else if (seen) {
      break
    }
  }

  var key = caller
    ? depSite.join(':') + '__' + caller.join(':')
    : undefined;

  if (key !== undefined && key in this._warned) {
    // already warned
    return
  }

  this._warned[key] = true;

  // generate automatic message from call site
  var msg = message;
  if (!msg) {
    msg = callSite === depSite || !callSite.name
      ? defaultMessage(depSite)
      : defaultMessage(callSite);
  }

  // emit deprecation if listeners exist
  if (haslisteners) {
    var err = DeprecationError(this._namespace, msg, stack.slice(i));
    process.emit('deprecation', err);
    return
  }

  // format and write message
  var format = process.stderr.isTTY
    ? formatColor
    : formatPlain;
  var output = format.call(this, msg, caller, stack.slice(i));
  process.stderr.write(output + '\n', 'utf8');
}

/**
 * Get call site location as array.
 */

function callSiteLocation (callSite) {
  var file = callSite.getFileName() || '<anonymous>';
  var line = callSite.getLineNumber();
  var colm = callSite.getColumnNumber();

  if (callSite.isEval()) {
    file = callSite.getEvalOrigin() + ', ' + file;
  }

  var site = [file, line, colm];

  site.callSite = callSite;
  site.name = callSite.getFunctionName();

  return site
}

/**
 * Generate a default message from the site.
 */

function defaultMessage (site) {
  var callSite = site.callSite;
  var funcName = site.name;

  // make useful anonymous name
  if (!funcName) {
    funcName = '<anonymous@' + formatLocation(site) + '>';
  }

  var context = callSite.getThis();
  var typeName = context && callSite.getTypeName();

  // ignore useless type name
  if (typeName === 'Object') {
    typeName = undefined;
  }

  // make useful type name
  if (typeName === 'Function') {
    typeName = context.name || typeName;
  }

  return typeName && callSite.getMethodName()
    ? typeName + '.' + funcName
    : funcName
}

/**
 * Format deprecation message without color.
 */

function formatPlain (msg, caller, stack) {
  var timestamp = new Date().toUTCString();

  var formatted = timestamp +
    ' ' + this._namespace +
    ' deprecated ' + msg;

  // add stack trace
  if (this._traced) {
    for (var i = 0; i < stack.length; i++) {
      formatted += '\n    at ' + callSiteToString$1(stack[i]);
    }

    return formatted
  }

  if (caller) {
    formatted += ' at ' + formatLocation(caller);
  }

  return formatted
}

/**
 * Format deprecation message with color.
 */

function formatColor (msg, caller, stack) {
  var formatted = '\x1b[36;1m' + this._namespace + '\x1b[22;39m' + // bold cyan
    ' \x1b[33;1mdeprecated\x1b[22;39m' + // bold yellow
    ' \x1b[0m' + msg + '\x1b[39m'; // reset

  // add stack trace
  if (this._traced) {
    for (var i = 0; i < stack.length; i++) {
      formatted += '\n    \x1b[36mat ' + callSiteToString$1(stack[i]) + '\x1b[39m'; // cyan
    }

    return formatted
  }

  if (caller) {
    formatted += ' \x1b[36m' + formatLocation(caller) + '\x1b[39m'; // cyan
  }

  return formatted
}

/**
 * Format call site location.
 */

function formatLocation (callSite) {
  return relative(basePath, callSite[0]) +
    ':' + callSite[1] +
    ':' + callSite[2]
}

/**
 * Get the stack as array of call sites.
 */

function getStack () {
  var limit = Error.stackTraceLimit;
  var obj = {};
  var prep = Error.prepareStackTrace;

  Error.prepareStackTrace = prepareObjectStackTrace;
  Error.stackTraceLimit = Math.max(10, limit);

  // capture the stack
  Error.captureStackTrace(obj);

  // slice this function off the top
  var stack = obj.stack.slice(1);

  Error.prepareStackTrace = prep;
  Error.stackTraceLimit = limit;

  return stack
}

/**
 * Capture call site stack from v8.
 */

function prepareObjectStackTrace (obj, stack) {
  return stack
}

/**
 * Return a wrapped function in a deprecation message.
 */

function wrapfunction (fn, message) {
  if (typeof fn !== 'function') {
    throw new TypeError('argument fn must be a function')
  }

  var args = createArgumentsString(fn.length);
  var stack = getStack();
  var site = callSiteLocation(stack[1]);

  site.name = fn.name;

   // eslint-disable-next-line no-eval
  var deprecatedfn = eval('(function (' + args + ') {\n' +
    '"use strict"\n' +
    'log.call(deprecate, message, site)\n' +
    'return fn.apply(this, arguments)\n' +
    '})');

  return deprecatedfn
}

/**
 * Wrap property in a deprecation message.
 */

function wrapproperty (obj, prop, message) {
  if (!obj || (typeof obj !== 'object' && typeof obj !== 'function')) {
    throw new TypeError('argument obj must be object')
  }

  var descriptor = Object.getOwnPropertyDescriptor(obj, prop);

  if (!descriptor) {
    throw new TypeError('must call property on owner object')
  }

  if (!descriptor.configurable) {
    throw new TypeError('property must be configurable')
  }

  var deprecate = this;
  var stack = getStack();
  var site = callSiteLocation(stack[1]);

  // set site name
  site.name = prop;

  // convert data descriptor
  if ('value' in descriptor) {
    descriptor = convertDataDescriptorToAccessor(obj, prop, message);
  }

  var get = descriptor.get;
  var set = descriptor.set;

  // wrap getter
  if (typeof get === 'function') {
    descriptor.get = function getter () {
      log.call(deprecate, message, site);
      return get.apply(this, arguments)
    };
  }

  // wrap setter
  if (typeof set === 'function') {
    descriptor.set = function setter () {
      log.call(deprecate, message, site);
      return set.apply(this, arguments)
    };
  }

  Object.defineProperty(obj, prop, descriptor);
}

/**
 * Create DeprecationError for deprecation
 */

function DeprecationError (namespace, message, stack) {
  var error = new Error();
  var stackString;

  Object.defineProperty(error, 'constructor', {
    value: DeprecationError
  });

  Object.defineProperty(error, 'message', {
    configurable: true,
    enumerable: false,
    value: message,
    writable: true
  });

  Object.defineProperty(error, 'name', {
    enumerable: false,
    configurable: true,
    value: 'DeprecationError',
    writable: true
  });

  Object.defineProperty(error, 'namespace', {
    configurable: true,
    enumerable: false,
    value: namespace,
    writable: true
  });

  Object.defineProperty(error, 'stack', {
    configurable: true,
    enumerable: false,
    get: function () {
      if (stackString !== undefined) {
        return stackString
      }

      // prepare stack trace
      return (stackString = createStackString.call(this, stack))
    },
    set: function setter (val) {
      stackString = val;
    }
  });

  return error
}

var setprototypeof = Object.setPrototypeOf || ({__proto__:[]} instanceof Array ? setProtoOf : mixinProperties);

function setProtoOf(obj, proto) {
	obj.__proto__ = proto;
	return obj;
}

function mixinProperties(obj, proto) {
	for (var prop in proto) {
		if (!obj.hasOwnProperty(prop)) {
			obj[prop] = proto[prop];
		}
	}
	return obj;
}

var codes = {
	"100": "Continue",
	"101": "Switching Protocols",
	"102": "Processing",
	"103": "Early Hints",
	"200": "OK",
	"201": "Created",
	"202": "Accepted",
	"203": "Non-Authoritative Information",
	"204": "No Content",
	"205": "Reset Content",
	"206": "Partial Content",
	"207": "Multi-Status",
	"208": "Already Reported",
	"226": "IM Used",
	"300": "Multiple Choices",
	"301": "Moved Permanently",
	"302": "Found",
	"303": "See Other",
	"304": "Not Modified",
	"305": "Use Proxy",
	"306": "(Unused)",
	"307": "Temporary Redirect",
	"308": "Permanent Redirect",
	"400": "Bad Request",
	"401": "Unauthorized",
	"402": "Payment Required",
	"403": "Forbidden",
	"404": "Not Found",
	"405": "Method Not Allowed",
	"406": "Not Acceptable",
	"407": "Proxy Authentication Required",
	"408": "Request Timeout",
	"409": "Conflict",
	"410": "Gone",
	"411": "Length Required",
	"412": "Precondition Failed",
	"413": "Payload Too Large",
	"414": "URI Too Long",
	"415": "Unsupported Media Type",
	"416": "Range Not Satisfiable",
	"417": "Expectation Failed",
	"418": "I'm a teapot",
	"421": "Misdirected Request",
	"422": "Unprocessable Entity",
	"423": "Locked",
	"424": "Failed Dependency",
	"425": "Unordered Collection",
	"426": "Upgrade Required",
	"428": "Precondition Required",
	"429": "Too Many Requests",
	"431": "Request Header Fields Too Large",
	"451": "Unavailable For Legal Reasons",
	"500": "Internal Server Error",
	"501": "Not Implemented",
	"502": "Bad Gateway",
	"503": "Service Unavailable",
	"504": "Gateway Timeout",
	"505": "HTTP Version Not Supported",
	"506": "Variant Also Negotiates",
	"507": "Insufficient Storage",
	"508": "Loop Detected",
	"509": "Bandwidth Limit Exceeded",
	"510": "Not Extended",
	"511": "Network Authentication Required"
};

var codes$1 = /*#__PURE__*/Object.freeze({
	default: codes
});

var codes$2 = getCjsExportFromNamespace(codes$1);

/**
 * Module dependencies.
 * @private
 */



/**
 * Module exports.
 * @public
 */

var statuses = status;

// status code to message map
status.STATUS_CODES = codes$2;

// array of status codes
status.codes = populateStatusesMap(status, codes$2);

// status codes for redirects
status.redirect = {
  300: true,
  301: true,
  302: true,
  303: true,
  305: true,
  307: true,
  308: true
};

// status codes for empty bodies
status.empty = {
  204: true,
  205: true,
  304: true
};

// status codes for when you should retry the request
status.retry = {
  502: true,
  503: true,
  504: true
};

/**
 * Populate the statuses map for given codes.
 * @private
 */

function populateStatusesMap (statuses, codes) {
  var arr = [];

  Object.keys(codes).forEach(function forEachCode (code) {
    var message = codes[code];
    var status = Number(code);

    // Populate properties
    statuses[status] = message;
    statuses[message] = status;
    statuses[message.toLowerCase()] = status;

    // Add to array
    arr.push(status);
  });

  return arr
}

/**
 * Get the status code.
 *
 * Given a number, this will throw if it is not a known status
 * code, otherwise the code will be returned. Given a string,
 * the string will be parsed for a number and return the code
 * if valid, otherwise will lookup the code assuming this is
 * the status message.
 *
 * @param {string|number} code
 * @returns {number}
 * @public
 */

function status (code) {
  if (typeof code === 'number') {
    if (!status[code]) throw new Error('invalid status code: ' + code)
    return code
  }

  if (typeof code !== 'string') {
    throw new TypeError('code must be a number or string')
  }

  // '403'
  var n = parseInt(code, 10);
  if (!isNaN(n)) {
    if (!status[n]) throw new Error('invalid status code: ' + n)
    return n
  }

  n = status[code.toLowerCase()];
  if (!n) throw new Error('invalid status message: "' + code + '"')
  return n
}

var inherits_browser = createCommonjsModule(function (module) {
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor;
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor;
    var TempCtor = function () {};
    TempCtor.prototype = superCtor.prototype;
    ctor.prototype = new TempCtor();
    ctor.prototype.constructor = ctor;
  };
}
});

var inherits = createCommonjsModule(function (module) {
try {
  var util$$1 = util;
  if (typeof util$$1.inherits !== 'function') throw '';
  module.exports = util$$1.inherits;
} catch (e) {
  module.exports = inherits_browser;
}
});

/*!
 * toidentifier
 * Copyright(c) 2016 Douglas Christopher Wilson
 * MIT Licensed
 */

/**
 * Module exports.
 * @public
 */

var toidentifier = toIdentifier;

/**
 * Trasform the given string into a JavaScript identifier
 *
 * @param {string} str
 * @returns {string}
 * @public
 */

function toIdentifier (str) {
  return str
    .split(' ')
    .map(function (token) {
      return token.slice(0, 1).toUpperCase() + token.slice(1)
    })
    .join('')
    .replace(/[^ _0-9a-z]/gi, '')
}

var httpErrors = createCommonjsModule(function (module) {

/**
 * Module dependencies.
 * @private
 */

var deprecate = depd_1('http-errors');





/**
 * Module exports.
 * @public
 */

module.exports = createError;
module.exports.HttpError = createHttpErrorConstructor();

// Populate exports for all constructors
populateConstructorExports(module.exports, statuses.codes, module.exports.HttpError);

/**
 * Get the code class of a status code.
 * @private
 */

function codeClass (status) {
  return Number(String(status).charAt(0) + '00')
}

/**
 * Create a new HTTP Error.
 *
 * @returns {Error}
 * @public
 */

function createError () {
  // so much arity going on ~_~
  var err;
  var msg;
  var status = 500;
  var props = {};
  for (var i = 0; i < arguments.length; i++) {
    var arg = arguments[i];
    if (arg instanceof Error) {
      err = arg;
      status = err.status || err.statusCode || status;
      continue
    }
    switch (typeof arg) {
      case 'string':
        msg = arg;
        break
      case 'number':
        status = arg;
        if (i !== 0) {
          deprecate('non-first-argument status code; replace with createError(' + arg + ', ...)');
        }
        break
      case 'object':
        props = arg;
        break
    }
  }

  if (typeof status === 'number' && (status < 400 || status >= 600)) {
    deprecate('non-error status code; use only 4xx or 5xx status codes');
  }

  if (typeof status !== 'number' ||
    (!statuses[status] && (status < 400 || status >= 600))) {
    status = 500;
  }

  // constructor
  var HttpError = createError[status] || createError[codeClass(status)];

  if (!err) {
    // create error
    err = HttpError
      ? new HttpError(msg)
      : new Error(msg || statuses[status]);
    Error.captureStackTrace(err, createError);
  }

  if (!HttpError || !(err instanceof HttpError) || err.status !== status) {
    // add properties to generic error
    err.expose = status < 500;
    err.status = err.statusCode = status;
  }

  for (var key in props) {
    if (key !== 'status' && key !== 'statusCode') {
      err[key] = props[key];
    }
  }

  return err
}

/**
 * Create HTTP error abstract base class.
 * @private
 */

function createHttpErrorConstructor () {
  function HttpError () {
    throw new TypeError('cannot construct abstract class')
  }

  inherits(HttpError, Error);

  return HttpError
}

/**
 * Create a constructor for a client error.
 * @private
 */

function createClientErrorConstructor (HttpError, name, code) {
  var className = name.match(/Error$/) ? name : name + 'Error';

  function ClientError (message) {
    // create the error object
    var msg = message != null ? message : statuses[code];
    var err = new Error(msg);

    // capture a stack trace to the construction point
    Error.captureStackTrace(err, ClientError);

    // adjust the [[Prototype]]
    setprototypeof(err, ClientError.prototype);

    // redefine the error message
    Object.defineProperty(err, 'message', {
      enumerable: true,
      configurable: true,
      value: msg,
      writable: true
    });

    // redefine the error name
    Object.defineProperty(err, 'name', {
      enumerable: false,
      configurable: true,
      value: className,
      writable: true
    });

    return err
  }

  inherits(ClientError, HttpError);
  nameFunc(ClientError, className);

  ClientError.prototype.status = code;
  ClientError.prototype.statusCode = code;
  ClientError.prototype.expose = true;

  return ClientError
}

/**
 * Create a constructor for a server error.
 * @private
 */

function createServerErrorConstructor (HttpError, name, code) {
  var className = name.match(/Error$/) ? name : name + 'Error';

  function ServerError (message) {
    // create the error object
    var msg = message != null ? message : statuses[code];
    var err = new Error(msg);

    // capture a stack trace to the construction point
    Error.captureStackTrace(err, ServerError);

    // adjust the [[Prototype]]
    setprototypeof(err, ServerError.prototype);

    // redefine the error message
    Object.defineProperty(err, 'message', {
      enumerable: true,
      configurable: true,
      value: msg,
      writable: true
    });

    // redefine the error name
    Object.defineProperty(err, 'name', {
      enumerable: false,
      configurable: true,
      value: className,
      writable: true
    });

    return err
  }

  inherits(ServerError, HttpError);
  nameFunc(ServerError, className);

  ServerError.prototype.status = code;
  ServerError.prototype.statusCode = code;
  ServerError.prototype.expose = false;

  return ServerError
}

/**
 * Set the name of a function, if possible.
 * @private
 */

function nameFunc (func, name) {
  var desc = Object.getOwnPropertyDescriptor(func, 'name');

  if (desc && desc.configurable) {
    desc.value = name;
    Object.defineProperty(func, 'name', desc);
  }
}

/**
 * Populate the exports object with constructors for every error class.
 * @private
 */

function populateConstructorExports (exports, codes, HttpError) {
  codes.forEach(function forEachCode (code) {
    var CodeError;
    var name = toidentifier(statuses[code]);

    switch (codeClass(code)) {
      case 400:
        CodeError = createClientErrorConstructor(HttpError, name, code);
        break
      case 500:
        CodeError = createServerErrorConstructor(HttpError, name, code);
        break
    }

    if (CodeError) {
      // export the constructor
      exports[code] = CodeError;
      exports[name] = CodeError;
    }
  });

  // backwards-compatibility
  exports["I'mateapot"] = deprecate.function(exports.ImATeapot,
    '"I\'mateapot"; use "ImATeapot" instead');
}
});
var httpErrors_1 = httpErrors.HttpError;

/**
 * Module dependencies.
 * @private
 */



/**
 * Module variables.
 * @private
 */

var generateAttempts = crypto.randomBytes === crypto.pseudoRandomBytes ? 1 : 3;

/**
 * Module exports.
 * @public
 */

var randomBytes_1 = randomBytes;
var sync = randomBytesSync;

/**
 * Generates strong pseudo-random bytes.
 *
 * @param {number} size
 * @param {function} [callback]
 * @return {Promise}
 * @public
 */

function randomBytes(size, callback) {
  // validate callback is a function, if provided
  if (callback !== undefined && typeof callback !== 'function') {
    throw new TypeError('argument callback must be a function')
  }

  // require the callback without promises
  if (!callback && !commonjsGlobal.Promise) {
    throw new TypeError('argument callback is required')
  }

  if (callback) {
    // classic callback style
    return generateRandomBytes(size, generateAttempts, callback)
  }

  return new Promise(function executor(resolve, reject) {
    generateRandomBytes(size, generateAttempts, function onRandomBytes(err, str) {
      if (err) return reject(err)
      resolve(str);
    });
  })
}

/**
 * Generates strong pseudo-random bytes sync.
 *
 * @param {number} size
 * @return {Buffer}
 * @public
 */

function randomBytesSync(size) {
  var err = null;

  for (var i = 0; i < generateAttempts; i++) {
    try {
      return crypto.randomBytes(size)
    } catch (e) {
      err = e;
    }
  }

  throw err
}

/**
 * Generates strong pseudo-random bytes.
 *
 * @param {number} size
 * @param {number} attempts
 * @param {function} callback
 * @private
 */

function generateRandomBytes(size, attempts, callback) {
  crypto.randomBytes(size, function onRandomBytes(err, buf) {
    if (!err) return callback(null, buf)
    if (!--attempts) return callback(err)
    setTimeout(generateRandomBytes.bind(null, size, attempts, callback), 10);
  });
}
randomBytes_1.sync = sync;

/**
 * Module dependencies.
 * @private
 */



/**
 * Module variables.
 * @private
 */

var EQUAL_END_REGEXP = /=+$/;
var PLUS_GLOBAL_REGEXP = /\+/g;
var SLASH_GLOBAL_REGEXP = /\//g;

/**
 * Module exports.
 * @public
 */

var uidSafe = uid;
var sync$1 = uidSync;

/**
 * Create a unique ID.
 *
 * @param {number} length
 * @param {function} [callback]
 * @return {Promise}
 * @public
 */

function uid (length, callback) {
  // validate callback is a function, if provided
  if (callback !== undefined && typeof callback !== 'function') {
    throw new TypeError('argument callback must be a function')
  }

  // require the callback without promises
  if (!callback && !commonjsGlobal.Promise) {
    throw new TypeError('argument callback is required')
  }

  if (callback) {
    // classic callback style
    return generateUid(length, callback)
  }

  return new Promise(function executor (resolve, reject) {
    generateUid(length, function onUid (err, str) {
      if (err) return reject(err)
      resolve(str);
    });
  })
}

/**
 * Create a unique ID sync.
 *
 * @param {number} length
 * @return {string}
 * @public
 */

function uidSync (length) {
  return toString(randomBytes_1.sync(length))
}

/**
 * Generate a unique ID string.
 *
 * @param {number} length
 * @param {function} callback
 * @private
 */

function generateUid (length, callback) {
  randomBytes_1(length, function (err, buf) {
    if (err) return callback(err)
    callback(null, toString(buf));
  });
}

/**
 * Change a Buffer into a string.
 *
 * @param {Buffer} buf
 * @return {string}
 * @private
 */

function toString (buf) {
  return buf.toString('base64')
    .replace(EQUAL_END_REGEXP, '')
    .replace(PLUS_GLOBAL_REGEXP, '-')
    .replace(SLASH_GLOBAL_REGEXP, '_')
}
uidSafe.sync = sync$1;

var safeBuffer = createCommonjsModule(function (module, exports) {
/* eslint-disable node/no-deprecated-api */

var Buffer = buffer.Buffer;

// alternative to using Object.keys for old browsers
function copyProps (src, dst) {
  for (var key in src) {
    dst[key] = src[key];
  }
}
if (Buffer.from && Buffer.alloc && Buffer.allocUnsafe && Buffer.allocUnsafeSlow) {
  module.exports = buffer;
} else {
  // Copy properties from require('buffer')
  copyProps(buffer, exports);
  exports.Buffer = SafeBuffer;
}

function SafeBuffer (arg, encodingOrOffset, length) {
  return Buffer(arg, encodingOrOffset, length)
}

// Copy static methods from Buffer
copyProps(Buffer, SafeBuffer);

SafeBuffer.from = function (arg, encodingOrOffset, length) {
  if (typeof arg === 'number') {
    throw new TypeError('Argument must not be a number')
  }
  return Buffer(arg, encodingOrOffset, length)
};

SafeBuffer.alloc = function (size, fill, encoding) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number')
  }
  var buf = Buffer(size);
  if (fill !== undefined) {
    if (typeof encoding === 'string') {
      buf.fill(fill, encoding);
    } else {
      buf.fill(fill);
    }
  } else {
    buf.fill(0);
  }
  return buf
};

SafeBuffer.allocUnsafe = function (size) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number')
  }
  return Buffer(size)
};

SafeBuffer.allocUnsafeSlow = function (size) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number')
  }
  return buffer.SlowBuffer(size)
};
});
var safeBuffer_1 = safeBuffer.Buffer;

var pend = Pend;

function Pend() {
  this.pending = 0;
  this.max = Infinity;
  this.listeners = [];
  this.waiting = [];
  this.error = null;
}

Pend.prototype.go = function(fn) {
  if (this.pending < this.max) {
    pendGo(this, fn);
  } else {
    this.waiting.push(fn);
  }
};

Pend.prototype.wait = function(cb) {
  if (this.pending === 0) {
    cb(this.error);
  } else {
    this.listeners.push(cb);
  }
};

Pend.prototype.hold = function() {
  return pendHold(this);
};

function pendHold(self) {
  self.pending += 1;
  var called = false;
  return onCb;
  function onCb(err) {
    if (called) throw new Error("callback called twice");
    called = true;
    self.error = self.error || err;
    self.pending -= 1;
    if (self.waiting.length > 0 && self.pending < self.max) {
      pendGo(self, self.waiting.shift());
    } else if (self.pending === 0) {
      var listeners = self.listeners;
      self.listeners = [];
      listeners.forEach(cbListener);
    }
  }
  function cbListener(listener) {
    listener(self.error);
  }
}

function pendGo(self, fn) {
  fn(pendHold(self));
}

var Readable = stream.Readable;
var Writable = stream.Writable;
var PassThrough = stream.PassThrough;

var EventEmitter = events.EventEmitter;

var createFromBuffer_1 = createFromBuffer;
var createFromFd_1 = createFromFd;
var BufferSlicer_1 = BufferSlicer;
var FdSlicer_1 = FdSlicer;

util.inherits(FdSlicer, EventEmitter);
function FdSlicer(fd, options) {
  options = options || {};
  EventEmitter.call(this);

  this.fd = fd;
  this.pend = new pend();
  this.pend.max = 1;
  this.refCount = 0;
  this.autoClose = !!options.autoClose;
}

FdSlicer.prototype.read = function(buffer$$1, offset, length, position, callback) {
  var self = this;
  self.pend.go(function(cb) {
    fs.read(self.fd, buffer$$1, offset, length, position, function(err, bytesRead, buffer$$1) {
      cb();
      callback(err, bytesRead, buffer$$1);
    });
  });
};

FdSlicer.prototype.write = function(buffer$$1, offset, length, position, callback) {
  var self = this;
  self.pend.go(function(cb) {
    fs.write(self.fd, buffer$$1, offset, length, position, function(err, written, buffer$$1) {
      cb();
      callback(err, written, buffer$$1);
    });
  });
};

FdSlicer.prototype.createReadStream = function(options) {
  return new ReadStream(this, options);
};

FdSlicer.prototype.createWriteStream = function(options) {
  return new WriteStream(this, options);
};

FdSlicer.prototype.ref = function() {
  this.refCount += 1;
};

FdSlicer.prototype.unref = function() {
  var self = this;
  self.refCount -= 1;

  if (self.refCount > 0) return;
  if (self.refCount < 0) throw new Error("invalid unref");

  if (self.autoClose) {
    fs.close(self.fd, onCloseDone);
  }

  function onCloseDone(err) {
    if (err) {
      self.emit('error', err);
    } else {
      self.emit('close');
    }
  }
};

util.inherits(ReadStream, Readable);
function ReadStream(context, options) {
  options = options || {};
  Readable.call(this, options);

  this.context = context;
  this.context.ref();

  this.start = options.start || 0;
  this.endOffset = options.end;
  this.pos = this.start;
  this.destroyed = false;
}

ReadStream.prototype._read = function(n) {
  var self = this;
  if (self.destroyed) return;

  var toRead = Math.min(self._readableState.highWaterMark, n);
  if (self.endOffset != null) {
    toRead = Math.min(toRead, self.endOffset - self.pos);
  }
  if (toRead <= 0) {
    self.destroyed = true;
    self.push(null);
    self.context.unref();
    return;
  }
  self.context.pend.go(function(cb) {
    if (self.destroyed) return cb();
    var buffer$$1 = new Buffer(toRead);
    fs.read(self.context.fd, buffer$$1, 0, toRead, self.pos, function(err, bytesRead) {
      if (err) {
        self.destroy(err);
      } else if (bytesRead === 0) {
        self.destroyed = true;
        self.push(null);
        self.context.unref();
      } else {
        self.pos += bytesRead;
        self.push(buffer$$1.slice(0, bytesRead));
      }
      cb();
    });
  });
};

ReadStream.prototype.destroy = function(err) {
  if (this.destroyed) return;
  err = err || new Error("stream destroyed");
  this.destroyed = true;
  this.emit('error', err);
  this.context.unref();
};

util.inherits(WriteStream, Writable);
function WriteStream(context, options) {
  options = options || {};
  Writable.call(this, options);

  this.context = context;
  this.context.ref();

  this.start = options.start || 0;
  this.endOffset = (options.end == null) ? Infinity : +options.end;
  this.bytesWritten = 0;
  this.pos = this.start;
  this.destroyed = false;

  this.on('finish', this.destroy.bind(this));
}

WriteStream.prototype._write = function(buffer$$1, encoding, callback) {
  var self = this;
  if (self.destroyed) return;

  if (self.pos + buffer$$1.length > self.endOffset) {
    var err = new Error("maximum file length exceeded");
    err.code = 'ETOOBIG';
    self.destroy();
    callback(err);
    return;
  }
  self.context.pend.go(function(cb) {
    if (self.destroyed) return cb();
    fs.write(self.context.fd, buffer$$1, 0, buffer$$1.length, self.pos, function(err, bytes) {
      if (err) {
        self.destroy();
        cb();
        callback(err);
      } else {
        self.bytesWritten += bytes;
        self.pos += bytes;
        self.emit('progress');
        cb();
        callback();
      }
    });
  });
};

WriteStream.prototype.destroy = function() {
  if (this.destroyed) return;
  this.destroyed = true;
  this.context.unref();
};

util.inherits(BufferSlicer, EventEmitter);
function BufferSlicer(buffer$$1, options) {
  EventEmitter.call(this);

  options = options || {};
  this.refCount = 0;
  this.buffer = buffer$$1;
  this.maxChunkSize = options.maxChunkSize || Number.MAX_SAFE_INTEGER;
}

BufferSlicer.prototype.read = function(buffer$$1, offset, length, position, callback) {
  var end = position + length;
  var delta = end - this.buffer.length;
  var written = (delta > 0) ? delta : length;
  this.buffer.copy(buffer$$1, offset, position, end);
  setImmediate(function() {
    callback(null, written);
  });
};

BufferSlicer.prototype.write = function(buffer$$1, offset, length, position, callback) {
  buffer$$1.copy(this.buffer, position, offset, offset + length);
  setImmediate(function() {
    callback(null, length, buffer$$1);
  });
};

BufferSlicer.prototype.createReadStream = function(options) {
  options = options || {};
  var readStream = new PassThrough(options);
  readStream.destroyed = false;
  readStream.start = options.start || 0;
  readStream.endOffset = options.end;
  // by the time this function returns, we'll be done.
  readStream.pos = readStream.endOffset || this.buffer.length;

  // respect the maxChunkSize option to slice up the chunk into smaller pieces.
  var entireSlice = this.buffer.slice(readStream.start, readStream.pos);
  var offset = 0;
  while (true) {
    var nextOffset = offset + this.maxChunkSize;
    if (nextOffset >= entireSlice.length) {
      // last chunk
      if (offset < entireSlice.length) {
        readStream.write(entireSlice.slice(offset, entireSlice.length));
      }
      break;
    }
    readStream.write(entireSlice.slice(offset, nextOffset));
    offset = nextOffset;
  }

  readStream.end();
  readStream.destroy = function() {
    readStream.destroyed = true;
  };
  return readStream;
};

BufferSlicer.prototype.createWriteStream = function(options) {
  var bufferSlicer = this;
  options = options || {};
  var writeStream = new Writable(options);
  writeStream.start = options.start || 0;
  writeStream.endOffset = (options.end == null) ? this.buffer.length : +options.end;
  writeStream.bytesWritten = 0;
  writeStream.pos = writeStream.start;
  writeStream.destroyed = false;
  writeStream._write = function(buffer$$1, encoding, callback) {
    if (writeStream.destroyed) return;

    var end = writeStream.pos + buffer$$1.length;
    if (end > writeStream.endOffset) {
      var err = new Error("maximum file length exceeded");
      err.code = 'ETOOBIG';
      writeStream.destroyed = true;
      callback(err);
      return;
    }
    buffer$$1.copy(bufferSlicer.buffer, writeStream.pos, 0, buffer$$1.length);

    writeStream.bytesWritten += buffer$$1.length;
    writeStream.pos = end;
    writeStream.emit('progress');
    callback();
  };
  writeStream.destroy = function() {
    writeStream.destroyed = true;
  };
  return writeStream;
};

BufferSlicer.prototype.ref = function() {
  this.refCount += 1;
};

BufferSlicer.prototype.unref = function() {
  this.refCount -= 1;

  if (this.refCount < 0) {
    throw new Error("invalid unref");
  }
};

function createFromBuffer(buffer$$1, options) {
  return new BufferSlicer(buffer$$1, options);
}

function createFromFd(fd, options) {
  return new FdSlicer(fd, options);
}

var fdSlicer = {
	createFromBuffer: createFromBuffer_1,
	createFromFd: createFromFd_1,
	BufferSlicer: BufferSlicer_1,
	FdSlicer: FdSlicer_1
};

var Buffer$1 = safeBuffer.Buffer;
var StringDecoder = string_decoder.StringDecoder;


var START = 0;
var START_BOUNDARY = 1;
var HEADER_FIELD_START = 2;
var HEADER_FIELD = 3;
var HEADER_VALUE_START = 4;
var HEADER_VALUE = 5;
var HEADER_VALUE_ALMOST_DONE = 6;
var HEADERS_ALMOST_DONE = 7;
var PART_DATA_START = 8;
var PART_DATA = 9;
var CLOSE_BOUNDARY = 10;
var END = 11;

var LF = 10;
var CR = 13;
var SPACE = 32;
var HYPHEN = 45;
var COLON = 58;
var A = 97;
var Z = 122;

var CONTENT_TYPE_RE = /^multipart\/(?:form-data|related)(?:;|$)/i;
var CONTENT_TYPE_PARAM_RE = /;\s*([^=]+)=(?:"([^"]+)"|([^;]+))/gi;
var FILE_EXT_RE = /(\.[_\-a-zA-Z0-9]{0,16})[\S\s]*/;
var LAST_BOUNDARY_SUFFIX_LEN = 4; // --\r\n

util.inherits(Form, stream.Writable);
function Form(options) {
  var opts = options || {};
  var self = this;
  stream.Writable.call(self);

  self.error = null;

  self.autoFields = !!opts.autoFields;
  self.autoFiles = !!opts.autoFiles;

  self.maxFields = opts.maxFields || 1000;
  self.maxFieldsSize = opts.maxFieldsSize || 2 * 1024 * 1024;
  self.maxFilesSize = opts.maxFilesSize || Infinity;
  self.uploadDir = opts.uploadDir || os.tmpdir();
  self.encoding = opts.encoding || 'utf8';

  self.bytesReceived = 0;
  self.bytesExpected = null;

  self.openedFiles = [];
  self.totalFieldSize = 0;
  self.totalFieldCount = 0;
  self.totalFileSize = 0;
  self.flushing = 0;

  self.backpressure = false;
  self.writeCbs = [];

  self.emitQueue = [];

  self.on('newListener', function(eventName) {
    if (eventName === 'file') {
      self.autoFiles = true;
    } else if (eventName === 'field') {
      self.autoFields = true;
    }
  });
}

Form.prototype.parse = function(req, cb) {
  var called = false;
  var self = this;
  var waitend = true;

  if (cb) {
    // if the user supplies a callback, this implies autoFields and autoFiles
    self.autoFields = true;
    self.autoFiles = true;

    // wait for request to end before calling cb
    var end = function (done) {
      if (called) return;

      called = true;

      // wait for req events to fire
      process.nextTick(function() {
        if (waitend && req.readable) {
          // dump rest of request
          req.resume();
          req.once('end', done);
          return;
        }

        done();
      });
    };

    var fields = {};
    var files = {};
    self.on('error', function(err) {
      end(function() {
        cb(err);
      });
    });
    self.on('field', function(name, value) {
      var fieldsArray = fields[name] || (fields[name] = []);
      fieldsArray.push(value);
    });
    self.on('file', function(name, file) {
      var filesArray = files[name] || (files[name] = []);
      filesArray.push(file);
    });
    self.on('close', function() {
      end(function() {
        cb(null, fields, files);
      });
    });
  }

  self.handleError = handleError;
  self.bytesExpected = getBytesExpected(req.headers);

  req.on('end', onReqEnd);
  req.on('error', function(err) {
    waitend = false;
    handleError(err);
  });
  req.on('aborted', onReqAborted);

  var state = req._readableState;
  if (req._decoder || (state && (state.encoding || state.decoder))) {
    // this is a binary protocol
    // if an encoding is set, input is likely corrupted
    validationError(new Error('request encoding must not be set'));
    return;
  }

  var contentType = req.headers['content-type'];
  if (!contentType) {
    validationError(httpErrors(415, 'missing content-type header'));
    return;
  }

  var m = CONTENT_TYPE_RE.exec(contentType);
  if (!m) {
    validationError(httpErrors(415, 'unsupported content-type'));
    return;
  }

  var boundary;
  CONTENT_TYPE_PARAM_RE.lastIndex = m.index + m[0].length - 1;
  while ((m = CONTENT_TYPE_PARAM_RE.exec(contentType))) {
    if (m[1].toLowerCase() !== 'boundary') continue;
    boundary = m[2] || m[3];
    break;
  }

  if (!boundary) {
    validationError(httpErrors(400, 'content-type missing boundary'));
    return;
  }

  setUpParser(self, boundary);
  req.pipe(self);

  function onReqAborted() {
    waitend = false;
    self.emit('aborted');
    handleError(new Error("Request aborted"));
  }

  function onReqEnd() {
    waitend = false;
  }

  function handleError(err) {
    var first = !self.error;
    if (first) {
      self.error = err;
      req.removeListener('aborted', onReqAborted);
      req.removeListener('end', onReqEnd);
      if (self.destStream) {
        errorEventQueue(self, self.destStream, err);
      }
    }

    cleanupOpenFiles(self);

    if (first) {
      self.emit('error', err);
    }
  }

  function validationError(err) {
    // handle error on next tick for event listeners to attach
    process.nextTick(handleError.bind(null, err));
  }
};

Form.prototype._write = function(buffer$$1, encoding, cb) {
  if (this.error) return;

  var self = this;
  var i = 0;
  var len = buffer$$1.length;
  var prevIndex = self.index;
  var index = self.index;
  var state = self.state;
  var lookbehind = self.lookbehind;
  var boundary = self.boundary;
  var boundaryChars = self.boundaryChars;
  var boundaryLength = self.boundary.length;
  var boundaryEnd = boundaryLength - 1;
  var bufferLength = buffer$$1.length;
  var c;
  var cl;

  for (i = 0; i < len; i++) {
    c = buffer$$1[i];
    switch (state) {
      case START:
        index = 0;
        state = START_BOUNDARY;
        /* falls through */
      case START_BOUNDARY:
        if (index === boundaryLength - 2 && c === HYPHEN) {
          index = 1;
          state = CLOSE_BOUNDARY;
          break;
        } else if (index === boundaryLength - 2) {
          if (c !== CR) return self.handleError(httpErrors(400, 'Expected CR Received ' + c));
          index++;
          break;
        } else if (index === boundaryLength - 1) {
          if (c !== LF) return self.handleError(httpErrors(400, 'Expected LF Received ' + c));
          index = 0;
          self.onParsePartBegin();
          state = HEADER_FIELD_START;
          break;
        }

        if (c !== boundary[index+2]) index = -2;
        if (c === boundary[index+2]) index++;
        break;
      case HEADER_FIELD_START:
        state = HEADER_FIELD;
        self.headerFieldMark = i;
        index = 0;
        /* falls through */
      case HEADER_FIELD:
        if (c === CR) {
          self.headerFieldMark = null;
          state = HEADERS_ALMOST_DONE;
          break;
        }

        index++;
        if (c === HYPHEN) break;

        if (c === COLON) {
          if (index === 1) {
            // empty header field
            self.handleError(httpErrors(400, 'Empty header field'));
            return;
          }
          self.onParseHeaderField(buffer$$1.slice(self.headerFieldMark, i));
          self.headerFieldMark = null;
          state = HEADER_VALUE_START;
          break;
        }

        cl = lower(c);
        if (cl < A || cl > Z) {
          self.handleError(httpErrors(400, 'Expected alphabetic character, received ' + c));
          return;
        }
        break;
      case HEADER_VALUE_START:
        if (c === SPACE) break;

        self.headerValueMark = i;
        state = HEADER_VALUE;
        /* falls through */
      case HEADER_VALUE:
        if (c === CR) {
          self.onParseHeaderValue(buffer$$1.slice(self.headerValueMark, i));
          self.headerValueMark = null;
          self.onParseHeaderEnd();
          state = HEADER_VALUE_ALMOST_DONE;
        }
        break;
      case HEADER_VALUE_ALMOST_DONE:
        if (c !== LF) return self.handleError(httpErrors(400, 'Expected LF Received ' + c));
        state = HEADER_FIELD_START;
        break;
      case HEADERS_ALMOST_DONE:
        if (c !== LF) return self.handleError(httpErrors(400, 'Expected LF Received ' + c));
        var err = self.onParseHeadersEnd(i + 1);
        if (err) return self.handleError(err);
        state = PART_DATA_START;
        break;
      case PART_DATA_START:
        state = PART_DATA;
        self.partDataMark = i;
        /* falls through */
      case PART_DATA:
        prevIndex = index;

        if (index === 0) {
          // boyer-moore derrived algorithm to safely skip non-boundary data
          i += boundaryEnd;
          while (i < bufferLength && !(buffer$$1[i] in boundaryChars)) {
            i += boundaryLength;
          }
          i -= boundaryEnd;
          c = buffer$$1[i];
        }

        if (index < boundaryLength) {
          if (boundary[index] === c) {
            if (index === 0) {
              self.onParsePartData(buffer$$1.slice(self.partDataMark, i));
              self.partDataMark = null;
            }
            index++;
          } else {
            index = 0;
          }
        } else if (index === boundaryLength) {
          index++;
          if (c === CR) {
            // CR = part boundary
            self.partBoundaryFlag = true;
          } else if (c === HYPHEN) {
            index = 1;
            state = CLOSE_BOUNDARY;
            break;
          } else {
            index = 0;
          }
        } else if (index - 1 === boundaryLength)  {
          if (self.partBoundaryFlag) {
            index = 0;
            if (c === LF) {
              self.partBoundaryFlag = false;
              self.onParsePartEnd();
              self.onParsePartBegin();
              state = HEADER_FIELD_START;
              break;
            }
          } else {
            index = 0;
          }
        }

        if (index > 0) {
          // when matching a possible boundary, keep a lookbehind reference
          // in case it turns out to be a false lead
          lookbehind[index-1] = c;
        } else if (prevIndex > 0) {
          // if our boundary turned out to be rubbish, the captured lookbehind
          // belongs to partData
          self.onParsePartData(lookbehind.slice(0, prevIndex));
          prevIndex = 0;
          self.partDataMark = i;

          // reconsider the current character even so it interrupted the sequence
          // it could be the beginning of a new sequence
          i--;
        }

        break;
      case CLOSE_BOUNDARY:
        if (c !== HYPHEN) return self.handleError(httpErrors(400, 'Expected HYPHEN Received ' + c));
        if (index === 1) {
          self.onParsePartEnd();
          state = END;
        } else if (index > 1) {
          return self.handleError(new Error("Parser has invalid state."));
        }
        index++;
        break;
      case END:
        break;
      default:
        self.handleError(new Error("Parser has invalid state."));
        return;
    }
  }

  if (self.headerFieldMark != null) {
    self.onParseHeaderField(buffer$$1.slice(self.headerFieldMark));
    self.headerFieldMark = 0;
  }
  if (self.headerValueMark != null) {
    self.onParseHeaderValue(buffer$$1.slice(self.headerValueMark));
    self.headerValueMark = 0;
  }
  if (self.partDataMark != null) {
    self.onParsePartData(buffer$$1.slice(self.partDataMark));
    self.partDataMark = 0;
  }

  self.index = index;
  self.state = state;

  self.bytesReceived += buffer$$1.length;
  self.emit('progress', self.bytesReceived, self.bytesExpected);

  if (self.backpressure) {
    self.writeCbs.push(cb);
  } else {
    cb();
  }
};

Form.prototype.onParsePartBegin = function() {
  clearPartVars(this);
};

Form.prototype.onParseHeaderField = function(b) {
  this.headerField += this.headerFieldDecoder.write(b);
};

Form.prototype.onParseHeaderValue = function(b) {
  this.headerValue += this.headerValueDecoder.write(b);
};

Form.prototype.onParseHeaderEnd = function() {
  this.headerField = this.headerField.toLowerCase();
  this.partHeaders[this.headerField] = this.headerValue;

  var m;
  if (this.headerField === 'content-disposition') {
    if (m = this.headerValue.match(/\bname="([^"]+)"/i)) {
      this.partName = m[1];
    }
    this.partFilename = parseFilename(this.headerValue);
  } else if (this.headerField === 'content-transfer-encoding') {
    this.partTransferEncoding = this.headerValue.toLowerCase();
  }

  this.headerFieldDecoder = new StringDecoder(this.encoding);
  this.headerField = '';
  this.headerValueDecoder = new StringDecoder(this.encoding);
  this.headerValue = '';
};

Form.prototype.onParsePartData = function(b) {
  if (this.partTransferEncoding === 'base64') {
    this.backpressure = ! this.destStream.write(b.toString('ascii'), 'base64');
  } else {
    this.backpressure = ! this.destStream.write(b);
  }
};

Form.prototype.onParsePartEnd = function() {
  if (this.destStream) {
    flushWriteCbs(this);
    var s = this.destStream;
    process.nextTick(function() {
      s.end();
    });
  }
  clearPartVars(this);
};

Form.prototype.onParseHeadersEnd = function(offset) {
  var self = this;
  switch(self.partTransferEncoding){
    case 'binary':
    case '7bit':
    case '8bit':
      self.partTransferEncoding = 'binary';
      break;

    case 'base64': break;
    default:
      return httpErrors(400, 'unknown transfer-encoding: ' + self.partTransferEncoding);
  }

  self.totalFieldCount += 1;
  if (self.totalFieldCount > self.maxFields) {
    return httpErrors(413, 'maxFields ' + self.maxFields + ' exceeded.');
  }

  self.destStream = new stream.PassThrough();
  self.destStream.on('drain', function() {
    flushWriteCbs(self);
  });
  self.destStream.headers = self.partHeaders;
  self.destStream.name = self.partName;
  self.destStream.filename = self.partFilename;
  self.destStream.byteOffset = self.bytesReceived + offset;
  var partContentLength = self.destStream.headers['content-length'];
  self.destStream.byteCount = partContentLength ? parseInt(partContentLength, 10) :
    self.bytesExpected ? (self.bytesExpected - self.destStream.byteOffset -
      self.boundary.length - LAST_BOUNDARY_SUFFIX_LEN) :
    undefined;

  if (self.destStream.filename == null && self.autoFields) {
    handleField(self, self.destStream);
  } else if (self.destStream.filename != null && self.autoFiles) {
    handleFile(self, self.destStream);
  } else {
    handlePart(self, self.destStream);
  }
};

function flushWriteCbs(self) {
  self.writeCbs.forEach(function(cb) {
    process.nextTick(cb);
  });
  self.writeCbs = [];
  self.backpressure = false;
}

function getBytesExpected(headers) {
  var contentLength = headers['content-length'];
  if (contentLength) {
    return parseInt(contentLength, 10);
  } else if (headers['transfer-encoding'] == null) {
    return 0;
  } else {
    return null;
  }
}

function beginFlush(self) {
  self.flushing += 1;
}

function endFlush(self) {
  self.flushing -= 1;

  if (self.flushing < 0) {
    // if this happens this is a critical bug in multiparty and this stack trace
    // will help us figure it out.
    self.handleError(new Error("unexpected endFlush"));
    return;
  }

  maybeClose(self);
}

function maybeClose(self) {
  if (self.flushing > 0 || self.error) return;

  // go through the emit queue in case any field, file, or part events are
  // waiting to be emitted
  holdEmitQueue(self)(function() {
    // nextTick because the user is listening to part 'end' events and we are
    // using part 'end' events to decide when to emit 'close'. we add our 'end'
    // handler before the user gets a chance to add theirs. So we make sure
    // their 'end' event fires before we emit the 'close' event.
    // this is covered by test/standalone/test-issue-36
    process.nextTick(function() {
      self.emit('close');
    });
  });
}

function cleanupOpenFiles(self) {
  self.openedFiles.forEach(function(internalFile) {
    // since fd slicer autoClose is true, destroying the only write stream
    // is guaranteed by the API to close the fd
    internalFile.ws.destroy();

    fs.unlink(internalFile.publicFile.path, function(err) {
      if (err) self.handleError(err);
    });
  });
  self.openedFiles = [];
}

function holdEmitQueue(self, eventEmitter) {
  var item = {cb: null, ee: eventEmitter, err: null};
  self.emitQueue.push(item);
  return function(cb) {
    item.cb = cb;
    flushEmitQueue(self);
  };
}

function errorEventQueue(self, eventEmitter, err) {
  var items = self.emitQueue.filter(function (item) {
    return item.ee === eventEmitter;
  });

  if (items.length === 0) {
    eventEmitter.emit('error', err);
    return;
  }

  items.forEach(function (item) {
    item.err = err;
  });
}

function flushEmitQueue(self) {
  while (self.emitQueue.length > 0 && self.emitQueue[0].cb) {
    var item = self.emitQueue.shift();

    // invoke the callback
    item.cb();

    if (item.err) {
      // emit the delayed error
      item.ee.emit('error', item.err);
    }
  }
}

function handlePart(self, partStream) {
  beginFlush(self);
  var emitAndReleaseHold = holdEmitQueue(self, partStream);
  partStream.on('end', function() {
    endFlush(self);
  });
  emitAndReleaseHold(function() {
    self.emit('part', partStream);
  });
}

function handleFile(self, fileStream) {
  if (self.error) return;
  var publicFile = {
    fieldName: fileStream.name,
    originalFilename: fileStream.filename,
    path: uploadPath(self.uploadDir, fileStream.filename),
    headers: fileStream.headers,
    size: 0
  };
  var internalFile = {
    publicFile: publicFile,
    ws: null
  };
  beginFlush(self); // flush to write stream
  var emitAndReleaseHold = holdEmitQueue(self, fileStream);
  fileStream.on('error', function(err) {
    self.handleError(err);
  });
  fs.open(publicFile.path, 'wx', function(err, fd) {
    if (err) return self.handleError(err);
    var slicer = fdSlicer.createFromFd(fd, {autoClose: true});

    // end option here guarantees that no more than that amount will be written
    // or else an error will be emitted
    internalFile.ws = slicer.createWriteStream({end: self.maxFilesSize - self.totalFileSize});

    // if an error ocurred while we were waiting for fs.open we handle that
    // cleanup now
    self.openedFiles.push(internalFile);
    if (self.error) return cleanupOpenFiles(self);

    var prevByteCount = 0;
    internalFile.ws.on('error', function(err) {
      self.handleError(err.code === 'ETOOBIG'
        ? httpErrors(413, err.message, { code: err.code })
        : err);
    });
    internalFile.ws.on('progress', function() {
      publicFile.size = internalFile.ws.bytesWritten;
      var delta = publicFile.size - prevByteCount;
      self.totalFileSize += delta;
      prevByteCount = publicFile.size;
    });
    slicer.on('close', function() {
      if (self.error) return;
      emitAndReleaseHold(function() {
        self.emit('file', fileStream.name, publicFile);
      });
      endFlush(self);
    });
    fileStream.pipe(internalFile.ws);
  });
}

function handleField(self, fieldStream) {
  var value = '';
  var decoder = new StringDecoder(self.encoding);

  beginFlush(self);
  var emitAndReleaseHold = holdEmitQueue(self, fieldStream);
  fieldStream.on('error', function(err) {
    self.handleError(err);
  });
  fieldStream.on('readable', function() {
    var buffer$$1 = fieldStream.read();
    if (!buffer$$1) return;

    self.totalFieldSize += buffer$$1.length;
    if (self.totalFieldSize > self.maxFieldsSize) {
      self.handleError(httpErrors(413, 'maxFieldsSize ' + self.maxFieldsSize + ' exceeded'));
      return;
    }
    value += decoder.write(buffer$$1);
  });

  fieldStream.on('end', function() {
    emitAndReleaseHold(function() {
      self.emit('field', fieldStream.name, value);
    });
    endFlush(self);
  });
}

function clearPartVars(self) {
  self.partHeaders = {};
  self.partName = null;
  self.partFilename = null;
  self.partTransferEncoding = 'binary';
  self.destStream = null;

  self.headerFieldDecoder = new StringDecoder(self.encoding);
  self.headerField = "";
  self.headerValueDecoder = new StringDecoder(self.encoding);
  self.headerValue = "";
}

function setUpParser(self, boundary) {
  self.boundary = Buffer$1.alloc(boundary.length + 4);
  self.boundary.write('\r\n--', 0, boundary.length + 4, 'ascii');
  self.boundary.write(boundary, 4, boundary.length, 'ascii');
  self.lookbehind = Buffer$1.alloc(self.boundary.length + 8);
  self.state = START;
  self.boundaryChars = {};
  for (var i = 0; i < self.boundary.length; i++) {
    self.boundaryChars[self.boundary[i]] = true;
  }

  self.index = null;
  self.partBoundaryFlag = false;

  beginFlush(self);
  self.on('finish', function() {
    if (self.state !== END) {
      self.handleError(httpErrors(400, 'stream ended unexpectedly'));
    }
    endFlush(self);
  });
}

function uploadPath(baseDir, filename) {
  var ext = path.extname(filename).replace(FILE_EXT_RE, '$1');
  var name = uidSafe.sync(18) + ext;
  return path.join(baseDir, name);
}

function parseFilename(headerValue) {
  var m = headerValue.match(/\bfilename="(.*?)"($|; )/i);
  if (!m) {
    m = headerValue.match(/\bfilename\*=utf-8\'\'(.*?)($|; )/i);
    if (m) {
      m[1] = decodeURI(m[1]);
    }
    else {
      return;
    }
  }

  var filename = m[1];
  filename = filename.replace(/%22|\\"/g, '"');
  filename = filename.replace(/&#([\d]{4});/g, function(m, code) {
    return String.fromCharCode(code);
  });
  return filename.substr(filename.lastIndexOf('\\') + 1);
}

function lower(c) {
  return c | 0x20;
}

class Jerusalem {
    constructor(options) {
        this.files = [];
        this.options = options;
    }

    get Files() {
        return this.files;
    }

    init() {

    }
}

export default Jerusalem;
