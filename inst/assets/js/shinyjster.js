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
})({"globals.ts":[function(require,module,exports) {
"use strict";

exports.__esModule = true;
var Shiny = window.Shiny;
exports.Shiny = Shiny;
var jQuery = window.jQuery;
exports.jQuery = jQuery;
exports.$ = jQuery;
},{}],"methods/selectize.ts":[function(require,module,exports) {
"use strict";

exports.__esModule = true;

var globals_1 = require("../globals");

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

function currentChoice(id) {
  return globals_1.$("#" + id).siblings().filter(".selectize-control").find(".selectize-input").text();
}

exports.currentChoice = currentChoice;

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
},{"../globals":"globals.ts"}],"methods/assert.ts":[function(require,module,exports) {
"use strict";

exports.__esModule = true;

function prettyJSON(x) {
  return JSON.stringify(x, null, "  ");
}

exports.prettyJSON = prettyJSON;

function isEqual(x, y) {
  var xStr = prettyJSON(x);
  var yStr = prettyJSON(y);

  if (xStr !== yStr) {
    console.log("x: ", x);
    console.log("y: ", y);
    throw "x does not equal y";
  }

  return true;
}

exports.isEqual = isEqual;

function isTrue(x) {
  return isEqual(x, true);
}

exports.isTrue = isTrue;

function isFalse(x) {
  return isEqual(x, false);
}

exports.isFalse = isFalse;

function isFunction(fn) {
  if (typeof fn !== "function") {
    console.log("fn: ", fn);
    throw "fn is not a function";
  }
}

exports.isFunction = isFunction;
},{}],"methods/shiny.ts":[function(require,module,exports) {
"use strict";

exports.__esModule = true;

var globals_1 = require("../globals");

function isBusy() {
  if (!globals_1.$) {
    return false;
  }

  return globals_1.$("html").first().hasClass("shiny-busy");
}

exports.isBusy = isBusy;

function waitUntilIdle(callback, timeout) {
  if (timeout === void 0) {
    timeout = 23;
  }

  var wait = function wait() {
    if (isBusy()) {
      setTimeout(wait, timeout);
    } else {
      callback();
    }
  };

  wait();
}

exports.waitUntilIdle = waitUntilIdle;

function hasOverlay() {
  return globals_1.$("#shiny-disconnected-overlay").length > 0;
}

exports.hasOverlay = hasOverlay;
},{"../globals":"globals.ts"}],"methods/button.ts":[function(require,module,exports) {
"use strict";

exports.__esModule = true;

var globals_1 = require("../globals");

function click(id) {
  globals_1.$("#" + id).click();
}

exports.click = click;
},{"../globals":"globals.ts"}],"methods/radio.ts":[function(require,module,exports) {
"use strict";

exports.__esModule = true;

var globals_1 = require("../globals");

function options(id) {
  return globals_1.$("#" + id).siblings().filter(".selectize-control").find(".selectize-dropdown-content").children();
}

exports.options = options;

function clickOption(id, value) {
  globals_1.$("#" + id + " input[value='" + value + "']").click();
}

exports.clickOption = clickOption;

function currentChoice(id) {
  return globals_1.$("#" + id + " input:checked").attr("value");
}

exports.currentChoice = currentChoice;
},{"../globals":"globals.ts"}],"methods/index.ts":[function(require,module,exports) {
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

var methods = {
  assert: assert,
  selectize: selectize,
  shiny: shiny,
  button: button,
  radio: radio
};
exports.methods = methods;
},{"./selectize":"methods/selectize.ts","./assert":"methods/assert.ts","./shiny":"methods/shiny.ts","./button":"methods/button.ts","./radio":"methods/radio.ts"}],"jster.ts":[function(require,module,exports) {
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

  Jster.prototype.setProgress = function (color, txt) {
    this.setProgressText(txt);
    this.setProgressColor(color);
  };

  Jster.prototype.setProgressText = function (txt) {
    if (globals_1.$) {
      globals_1.$("#shinyjster_progress").text(txt);
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

    this.setProgress("green", "shinyjster - Adding tests!");
    this.fns.push({
      fn: fn,
      timeout: timeout
    });
  };

  Jster.prototype.setupPromises = function () {
    var _this = this;

    this.setProgress("yellow", "shinyjster - Running tests!"); // for each fn

    this.fns.forEach(function (_a, idx, fns) {
      var fn = _a.fn,
          timeout = _a.timeout;
      assertFunction(fn);
      _this.p = _this.p // delay a little bit
      .then(function (value) {
        _this.setProgress("yellow", "shinyjster - Progress: " + (idx + 1) + "/" + fns.length + " (waiting)");

        return new Promise(function (resolve) {
          setTimeout(function () {
            resolve(value);
          }, timeout);
        });
      }) // call the fn itself
      .then(function (value) {
        _this.setProgress("yellow", "shinyjster - Progress: " + (idx + 1) + "/" + fns.length + " (running)");

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
      _this.setProgress("green", "shinyjster - Progress: " + _this.fns.length + "/" + _this.fns.length + " (done!)");

      setInputValue = _this.initSetInputValue(setInputValue); // send success to shiny

      setInputValue("jster_done", {
        type: "success",
        length: _this.fns.length,
        value: value
      });
    }, function (error) {
      // print error to progress area
      if (globals_1.$) {
        _this.setProgress("red", globals_1.$("#shinyjster_progress").text() + " - Error found: " + error);
      } // send error to shiny


      setInputValue = _this.initSetInputValue(setInputValue);
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
  return Jster;
}();

exports.Jster = Jster;

function jster(timeout) {
  if (timeout === void 0) {
    timeout = 250;
  }

  return new Jster(timeout);
}

exports.jster = jster;
},{"./globals":"globals.ts","./methods":"methods/index.ts"}],"shiny.ts":[function(require,module,exports) {
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
},{"./globals":"globals.ts"}],"index.ts":[function(require,module,exports) {
"use strict"; // import "babel-polyfill";

exports.__esModule = true;

var jster_1 = require("./jster");

var shiny_1 = require("./shiny");

window.jster = jster_1.jster;
window.Jster = jster_1.Jster;
shiny_1.initJsterHooks();
},{"./jster":"jster.ts","./shiny":"shiny.ts"}],"../node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var checkedAssets, assetsToAccept;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "51447" + '/');

  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      var handled = false;
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);

          if (didAccept) {
            handled = true;
          }
        }
      }); // Enable HMR for CSS by default.

      handled = handled || data.assets.every(function (asset) {
        return asset.type === 'css' && asset.generated.js;
      });

      if (handled) {
        console.clear();
        data.assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });
        assetsToAccept.forEach(function (v) {
          hmrAcceptRun(v[0], v[1]);
        });
      } else if (location.reload) {
        // `location` global exists in a web worker context but lacks `.reload()` function.
        location.reload();
      }
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }

  if (checkedAssets[id]) {
    return;
  }

  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAcceptCheck(global.parcelRequire, id);
  });
}

function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }
}
},{}]},{},["../node_modules/parcel-bundler/src/builtins/hmr-runtime.js","index.ts"], null)
//# sourceMappingURL=/shinyjster.js.map