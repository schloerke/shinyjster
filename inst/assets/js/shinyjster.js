// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"eS2z":[function(require,module,exports) {
"use strict";

exports.__esModule = true;
var Shiny = window.Shiny;
exports.Shiny = Shiny;
var jQuery = window.jQuery;
exports.jQuery = jQuery;
exports.$ = jQuery;
},{}],"ceOt":[function(require,module,exports) {
"use strict";

exports.__esModule = true;

var globals_1 = require("../globals"); // simulate user click


function click(id) {
  globals_1.$("#" + id).siblings().filter(".selectize-control").find(".selectize-input").click();
}

exports.click = click;

function options(id) {
  return globals_1.$("#" + id).siblings().filter(".selectize-control").find(".selectize-dropdown-content").children();
}

exports.options = options;

function clickOption(id, idx) {
  var opt = options(id).get(idx);

  if (globals_1.$(opt).hasClass("optgroup")) {
    globals_1.$(opt).find(".option").click();
  } else {
    opt.click();
  }
}

exports.clickOption = clickOption;

function currentOption(id) {
  return globals_1.$("#" + id).siblings().filter(".selectize-control").find(".selectize-input").text();
}

exports.currentOption = currentOption; // When using serverside selectize, only the first 1000 values are sent.

function values(id) {
  return options(id).map(function () {
    var selectInfo = {
      label: "",
      value: ""
    };
    var jthis = globals_1.$(this);

    if (jthis.hasClass("optgroup")) {
      selectInfo.group = jthis.find(".optgroup-header").text();
      selectInfo.label = jthis.find(".option").text();
      selectInfo.value = globals_1.$(jthis.find(".option").get(0)).attr("data-value");
    } else {
      selectInfo.label = jthis.text();
      selectInfo.value = jthis.attr("data-value");
    }

    return selectInfo;
  }).get();
}

exports.values = values;

function label(id) {
  return globals_1.$("label[for=\"" + id + "-selectized\"]:visible").text().trim();
}

exports.label = label;
},{"../globals":"eS2z"}],"ayWm":[function(require,module,exports) {
/**
 * Module exports.
 */

module.exports = inspect;

/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 * @license MIT (© Joyent)
 */
/* legacy: obj, showHidden, depth, colors*/

function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    _extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}

// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};

function stylizeNoColor(str, styleType) {
  return str;
}

function isBoolean(arg) {
  return typeof arg === 'boolean';
}

function isUndefined(arg) {
  return arg === void 0;
}

function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}

function isFunction(arg) {
  return typeof arg === 'function';
}

function isString(arg) {
  return typeof arg === 'string';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isNull(arg) {
  return arg === null;
}

function hasOwn(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}

function objectToString(o) {
  return Object.prototype.toString.call(o);
}

function arrayToHash(array) {
  var hash = {};

  array.forEach(function(val, idx) {
    hash[val] = true;
  });

  return hash;
}

function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwn(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}

function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}

function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);

  try {
    if (ctx.showHidden && Object.getOwnPropertyNames) {
      keys = Object.getOwnPropertyNames(value);
    }
  } catch (e) {
    // ignore
  }

  // IE doesn't make error fields non-enumerable
  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
  if (isError(value)
      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
    return formatError(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (Array.isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}

function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = { value: void 0 };
  try {
    // ie6 › navigator.toString
    // throws Error: Object doesn't support this property or method
    desc.value = value[key];
  } catch (e) {
    // ignore
  }
  try {
    // ie10 › Object.getOwnPropertyDescriptor(window.location, 'hash')
    // throws TypeError: Object doesn't support this action
    if (Object.getOwnPropertyDescriptor) {
      desc = Object.getOwnPropertyDescriptor(value, key) || desc;
    }
  } catch (e) {
    // ignore
  }
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }
  if (!hasOwn(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}

function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}

function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}

function _extend(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
}

},{}],"UK2R":[function(require,module,exports) {
"use strict";

var __importDefault = this && this.__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};

exports.__esModule = true;

var util_inspect_1 = __importDefault(require("util-inspect"));

function prettyJSON(x) {
  return util_inspect_1["default"](x, {
    depth: 4
  });
}

exports.prettyJSON = prettyJSON;

function shortString(xStr, maxLength) {
  if (maxLength === void 0) {
    maxLength = 20;
  }

  if (xStr.length <= maxLength) {
    return xStr;
  }

  return xStr.slice(0, maxLength) + "...";
}

function isEqual(x, y, contextObj) {
  if (contextObj === void 0) {
    contextObj = undefined;
  }

  var xStr = prettyJSON(x);
  var yStr = prettyJSON(y);

  if (xStr != yStr) {
    console.log("x:", x);
    console.log("y:", y);
    var throwObj = {
      message: shortString(xStr) + " does not equal " + shortString(yStr),
      x: x,
      y: y,
      xStr: xStr,
      yStr: yStr
    };

    if (contextObj) {
      console.log("context: ", contextObj);
      throwObj.contextStr = prettyJSON(contextObj);
    }

    throw throwObj;
  }

  return true;
}

exports.isEqual = isEqual;

function isTrue(x, contextObj) {
  if (contextObj === void 0) {
    contextObj = undefined;
  }

  return isEqual(x, true, contextObj);
}

exports.isTrue = isTrue;

function isFalse(x, contextObj) {
  if (contextObj === void 0) {
    contextObj = undefined;
  }

  return isEqual(x, false, contextObj);
}

exports.isFalse = isFalse;

function isFunction(fn) {
  if (typeof fn !== "function") {
    console.log("fn: ", fn);
    throw {
      message: "fn is not a function. fn: " + shortString(fn.toString()),
      fn: fn.toString()
    };
  }
}

exports.isFunction = isFunction;
},{"util-inspect":"ayWm"}],"owfG":[function(require,module,exports) {
"use strict";

exports.__esModule = true;

var globals_1 = require("../globals");

var shinyIsIdle = false;

function isIdle() {
  return shinyIsIdle;
}

exports.isIdle = isIdle;

function isBusy() {
  return !shinyIsIdle;
}

exports.isBusy = isBusy;

if (globals_1.$) {
  globals_1.$(document).on("shiny:busy", function () {
    shinyIsIdle = false;
  });
  globals_1.$(document).on("shiny:idle", function () {
    shinyIsIdle = true;
  });
} // `waitUntilIdleFor` requires a timeout value
// `waitUntilIdleFor` is interpreted as "Shiny must be in the 'idle' state for at least `timeout`ms"
// If shiny decides to become 'idle', but becomes 'busy' before `timeout`ms...
//   `callback` will have to wait until the next time Shiny is 'idle' before attempting to wait to execute
// Once a callback is successful, all created event handlers are removed to avoid buildup of no-op handlers


function waitUntilIdleFor(timeout) {
  return function (callback) {
    var timeoutId = null;

    var busyFn = function busyFn() {
      // clear timeout. Calling with `null` is ok.
      clearTimeout(timeoutId);
    };

    var idleFn = function idleFn() {
      var fn = function fn() {
        // made it through the timeout, remove event listeners
        globals_1.$(document).off("shiny:busy", busyFn);
        globals_1.$(document).off("shiny:idle", idleFn); // call original callback

        callback();
      }; // delay the callback wrapper function


      timeoutId = setTimeout(fn, timeout);
    }; // set up individual listeners for this function.


    globals_1.$(document).on("shiny:busy", busyFn);
    globals_1.$(document).on("shiny:idle", idleFn); // if already idle, call `idleFn`.

    if (shinyIsIdle) {
      idleFn();
    }
  };
}

exports.waitUntilIdleFor = waitUntilIdleFor; // `waitUntilIdle` will fire a callback once shiny is idle.
//  If shiny is already idle, the callback will be executed on the next tick.

function waitUntilIdle(callback) {
  waitUntilIdleFor(0)(callback);
}

exports.waitUntilIdle = waitUntilIdle; // `waitUntilStable` is interpreted as "Shiny must be in the 'idle' state for at least 200ms"
//   if shiny decides to become 'idle', then immediately become 'busy', `waitUntilIdle` should NOT be called.

function waitUntilStable(callback) {
  waitUntilIdleFor(200)(callback);
}

exports.waitUntilStable = waitUntilStable;

function hasOverlay() {
  return globals_1.$("#shiny-disconnected-overlay").length > 0;
}

exports.hasOverlay = hasOverlay;
},{"../globals":"eS2z"}],"bPYC":[function(require,module,exports) {
"use strict";

exports.__esModule = true;

var globals_1 = require("../globals");

function click(id) {
  globals_1.$("#" + id).click();
}

exports.click = click;
},{"../globals":"eS2z"}],"ZV6I":[function(require,module,exports) {
"use strict";

exports.__esModule = true;

var globals_1 = require("../globals");

function clickOption(id, value) {
  globals_1.$("#" + id + " input[value='" + value + "']").click();
}

exports.clickOption = clickOption;

function currentOption(id) {
  return globals_1.$("#" + id + " input:checked").attr("value");
}

exports.currentOption = currentOption;
},{"../globals":"eS2z"}],"by4Q":[function(require,module,exports) {
"use strict";

exports.__esModule = true;

var globals_1 = require("../globals");

function click(id, callback) {
  var href = globals_1.$("#" + id).attr("href");
  globals_1.$.get({
    url: href,
    success: function success(value) {
      callback(null, value);
    }
  }).fail(function (req, textStatus, errorThrown) {
    callback({
      req: req,
      textStatus: textStatus,
      errorThrown: errorThrown
    }, null);
  });
}

exports.click = click;
},{"../globals":"eS2z"}],"k4af":[function(require,module,exports) {
"use strict";

exports.__esModule = true;

var globals_1 = require("../globals");

function click(id) {
  globals_1.$("#" + id).click();
}

exports.click = click;

function isChecked(id) {
  return globals_1.$("#" + id + ":checked").length > 0;
}

exports.isChecked = isChecked;

function label(id) {
  return globals_1.$("#" + id).parent().text().trim();
}

exports.label = label;
},{"../globals":"eS2z"}],"eFjc":[function(require,module,exports) {
"use strict";

exports.__esModule = true;

var globals_1 = require("../globals");

function data(id) {
  var img = globals_1.$("#" + id + " img").get(0);
  var width = img.width;
  var height = img.height;
  var canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  var context = canvas.getContext("2d");
  context.drawImage(img, 0, 0, width, height);
  var imageData = context.getImageData(0, 0, width, height);
  return imageData.data;
}

exports.data = data;
},{"../globals":"eS2z"}],"nUGZ":[function(require,module,exports) {
"use strict";

exports.__esModule = true;

function escape(str, forR) {
  if (forR === void 0) {
    forR = false;
  }

  var ret = str.replace(/[^\0-~]/g, function (ch) {
    return "\\u" + ("000" + ch.charCodeAt().toString(16)).slice(-4);
  });

  if (forR) {
    // make all back slashes double back slashes
    ret = ret.replace(/\\u/g, "\\\\u");
  }

  return ret;
}

exports.escape = escape;
},{}],"nPXt":[function(require,module,exports) {
"use strict";

exports.__esModule = true;

var globals_1 = require("../globals");

function label(id) {
  return globals_1.$("label[for=\"" + id + "\"]").text().trim();
}

exports.label = label;

function currentOption(id) {
  return globals_1.$("#" + id).val();
}

exports.currentOption = currentOption;
exports.value = currentOption;

function setValue(id, value) {
  globals_1.$("#" + id).val(value);
  globals_1.$("#" + id).trigger("change");
  return;
}

exports.setValue = setValue;
},{"../globals":"eS2z"}],"JqBx":[function(require,module,exports) {
"use strict";

exports.__esModule = true;

var globals_1 = require("../globals");

function getEle(id) {
  if (id === void 0) {
    id = "._bookmark_";
  }

  return globals_1.$(document.getElementById(id));
}

function click(id) {
  if (id === void 0) {
    id = "._bookmark_";
  }

  return getEle(id).click();
}

exports.click = click;
},{"../globals":"eS2z"}],"Y0XI":[function(require,module,exports) {
"use strict";

var __importStar = this && this.__importStar || function (mod) {
  if (mod && mod.__esModule) return mod;
  var result = {};
  if (mod != null) for (var k in mod) {
    if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
  }
  result["default"] = mod;
  return result;
};

exports.__esModule = true;

var selectize = __importStar(require("./selectize"));

var assert = __importStar(require("./assert"));

var shiny = __importStar(require("./shiny"));

var button = __importStar(require("./button"));

var radio = __importStar(require("./radio"));

var download = __importStar(require("./download"));

var checkbox = __importStar(require("./checkbox"));

var image = __importStar(require("./image"));

var unicode = __importStar(require("./unicode"));

var input = __importStar(require("./input"));

var bookmark = __importStar(require("./bookmark"));

var methods = {
  assert: assert,
  selectize: selectize,
  shiny: shiny,
  button: button,
  radio: radio,
  download: download,
  checkbox: checkbox,
  image: image,
  unicode: unicode,
  input: input,
  bookmark: bookmark
};
exports.methods = methods;
},{"./selectize":"ceOt","./assert":"UK2R","./shiny":"owfG","./button":"bPYC","./radio":"ZV6I","./download":"by4Q","./checkbox":"k4af","./image":"eFjc","./unicode":"nUGZ","./input":"nPXt","./bookmark":"JqBx"}],"WLG3":[function(require,module,exports) {
"use strict";

exports.__esModule = true;

var globals_1 = require("./globals");

var methods_1 = require("./methods");

var assertFunction = methods_1.methods.assert.isFunction;

var Jster =
/** @class */
function () {
  function Jster(timeout) {
    this.hasCalled = false;
    this.timeout = timeout;
    this.fns = [];
    this.p = new Promise(function (resolve) {
      resolve(true);
    });
  }

  Jster.prototype.setProgress = function (color, txt, setInputValue) {
    if (globals_1.$) {
      // make sure the status bar is displayed
      globals_1.$("#shinyjster_progress").css("display", "");
    }

    this.setProgressText(txt, setInputValue);
    this.setProgressColor(color);
  };

  Jster.prototype.setProgressText = function (txt, setInputValue) {
    if (globals_1.$) {
      globals_1.$("#shinyjster_progress_val").text(txt);
    }

    if (setInputValue !== false) {
      setInputValue = this.initSetInputValue(setInputValue);
      setInputValue("jster_progress", txt);
    }
  };

  Jster.prototype.setProgressColor = function (color) {
    switch (color) {
      case "red":
        {
          color = "rgb(90%, 54%, 59.4%)";
          break;
        }

      case "yellow":
        {
          color = "rgb(90%, 86.4%, 54%)";
          break;
        }

      case "green":
        {
          color = "rgb(55.8%, 90%, 54%)";
          break;
        }

      default:
        {// color = color
        }
    }

    if (globals_1.$) {
      globals_1.$("#shinyjster_progress").css("background-color", color);
    }
  };

  Jster.prototype.add = function (fn, timeout) {
    if (timeout === void 0) {
      timeout = this.timeout;
    }

    if (this.hasCalled) {
      throw "`this.test()` has already been called";
    }

    this.setProgress("green", "Adding tests!", false);
    var addFn = fn;

    if (fn.length == 0) {
      // if no arguments are supplied in the added function,
      //   * assume it is a sync function
      //   * If it returns anything, pass it along to the next function
      //   * Since 'fn' has no 'value' arg, no value will be passed into 'fn'
      addFn = function addFn(done) {
        done(fn());
      };
    }

    this.fns.push({
      fn: addFn,
      timeout: timeout
    });
  };

  Jster.prototype.setupPromises = function () {
    var _this = this;

    this.setProgress("yellow", "Running tests!", false); // make sure shiny is fully initialized before advancing.

    this.p = this.p.then(function (value) {
      return new Promise(function (resolve) {
        var wait = function wait() {
          if (globals_1.Shiny.setInputValue) {
            resolve(value);
          } else {
            setTimeout(wait, 2);
          }
        };

        wait();
      });
    }); // for each fn

    this.fns.forEach(function (_a, idx, fns) {
      var fn = _a.fn,
          timeout = _a.timeout;
      assertFunction(fn);
      _this.p = _this.p // delay a little bit
      .then(function (value) {
        _this.setProgress("yellow", "Progress: " + (idx + 1) + "/" + fns.length + " (waiting)", undefined);

        return new Promise(function (resolve) {
          setTimeout(function () {
            resolve(value);
          }, timeout);
        });
      }) // call the fn itself
      .then(function (value) {
        _this.setProgress("yellow", "Progress: " + (idx + 1) + "/" + fns.length + " (running)", undefined);

        return new Promise(function (resolve) {
          fn(resolve, value);
        });
      });
    });
    return this.p;
  };

  Jster.prototype.initSetInputValue = function (setInputValue) {
    if (!setInputValue) {
      setInputValue = globals_1.Shiny.setInputValue;
    }

    if (typeof setInputValue !== "function") {
      throw "`setInputValue` is not a function.";
    }

    return setInputValue;
  };

  Jster.prototype.test = function (setInputValue) {
    var _this = this;

    if (this.hasCalled) {
      throw "`this.test()` has already been called";
    }

    if (this.fns.length === 0) {
      throw "`this.test()` requires functions to be `this.add()`ed before executing the test";
    } // prevent bad testing from occuring


    this.hasCalled = true;
    this.setupPromises().then(function (value) {
      setInputValue = _this.initSetInputValue(setInputValue);

      _this.setProgress("green", "Progress: " + _this.fns.length + "/" + _this.fns.length + " (done!)", setInputValue); // send success to shiny


      setInputValue("jster_done", {
        type: "success",
        length: _this.fns.length,
        value: value
      });
    }, function (error) {
      setInputValue = _this.initSetInputValue(setInputValue); // print error to progress area

      if (globals_1.$) {
        var errorMsg = error.message || error;

        _this.setProgress("red", globals_1.$("#shinyjster_progress_val").text() + " - Error found: " + errorMsg, setInputValue);
      } // send error to shiny


      setInputValue("jster_done", {
        type: "error",
        length: _this.fns.length,
        error: error
      }); // display error in console

      setTimeout(function () {
        throw error;
      }, 0);
    });
  };

  Jster.prototype.wait = function (ms) {
    this.add(function (done) {
      setTimeout(done, ms);
    });
  };

  Jster.getParameterByName = function (name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\\[\\]]/g, "\\\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return "";
    return decodeURIComponent(results[2].replace(/\\+/g, " "));
  };

  Jster.selectize = methods_1.methods.selectize;
  Jster.assert = methods_1.methods.assert;
  Jster.shiny = methods_1.methods.shiny;
  Jster.button = methods_1.methods.button;
  Jster.radio = methods_1.methods.radio;
  Jster.download = methods_1.methods.download;
  Jster.checkbox = methods_1.methods.checkbox;
  Jster.image = methods_1.methods.image;
  Jster.unicode = methods_1.methods.unicode;
  Jster.input = methods_1.methods.input;
  Jster.bookmark = methods_1.methods.bookmark;
  return Jster;
}();

exports.Jster = Jster;

function jster(timeout) {
  if (timeout === void 0) {
    timeout = 10;
  }

  return new Jster(timeout);
}

exports.jster = jster;
},{"./globals":"eS2z","./methods":"Y0XI"}],"CnUs":[function(require,module,exports) {
"use strict";

exports.__esModule = true;

var globals_1 = require("./globals");

function initJsterHooks() {
  // use event.target to obtain the output element
  globals_1.Shiny.addCustomMessageHandler("shinyjster_msg_close_window", function (canClose) {
    if (!canClose) return;
    setTimeout(function () {
      console.log("shinyjster: - closing window!");
      window.close();
    }, 500);
    globals_1.Shiny.setInputValue("jster_closing_window", "closing");
  });
}

exports.initJsterHooks = initJsterHooks;
},{"./globals":"eS2z"}],"QCba":[function(require,module,exports) {
"use strict"; // import "core-js/stable";

exports.__esModule = true;

var jster_1 = require("./jster");

var shiny_1 = require("./shiny");

window.jster = jster_1.jster;
window.Jster = jster_1.Jster;
shiny_1.initJsterHooks();
},{"./jster":"WLG3","./shiny":"CnUs"}]},{},["QCba"], null)
//# sourceMappingURL=/shinyjster.js.map