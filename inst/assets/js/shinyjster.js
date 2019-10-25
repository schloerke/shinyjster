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
},{}],"WLG3":[function(require,module,exports) {
"use strict";

exports.__esModule = true;

var globals_1 = require("./globals");

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

  Jster.prototype.test = function (setInputValue) {
    var _this = this;

    if (setInputValue === void 0) {
      setInputValue = globals_1.Shiny.setInputValue;
    }

    if (this.hasCalled) {
      throw "`this.test()` has already been called";
    }

    if (this.fns.length === 0) {
      throw "`this.test()` requires functions to be `this.add()`ed before executing the test";
    } // prevent bad testing from occuring


    this.hasCalled = true;
    this.setupPromises().then(function (value) {
      _this.setProgress("green", "shinyjster - Progress: " + _this.fns.length + "/" + _this.fns.length + " (done!)"); // send success to shiny


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
},{"./globals":"eS2z"}],"CnUs":[function(require,module,exports) {
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
"use strict"; // import "babel-polyfill";

exports.__esModule = true;

var jster_1 = require("./jster");

var shiny_1 = require("./shiny");

window.jster = jster_1.jster;
shiny_1.initJsterHooks();
},{"./jster":"WLG3","./shiny":"CnUs"}]},{},["QCba"], null)
//# sourceMappingURL=/shinyjster.js.map