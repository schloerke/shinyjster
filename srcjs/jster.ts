import { Shiny, $, ShinySetInputValueType } from "./globals";
import { methods } from "./methods";

interface ResolveFnType {
  (value?: unknown): void;
}

interface AddFnType {
  (resolve?: ResolveFnType, value?: unknown): void;
}

const assertFunction = methods.assert.isFunction;
// const prettyJSON = methods.assert.prettyJSON;

class Jster {
  timeout: number;
  fns: Array<{ fn: AddFnType; timeout: number }>;
  p: null | Promise<unknown>;
  private hasCalled: boolean;

  static selectize = methods.selectize;
  static assert = methods.assert;
  static shiny = methods.shiny;
  static button = methods.button;
  static radio = methods.radio;
  static download = methods.download;
  static checkbox = methods.checkbox;
  static image = methods.image;
  static unicode = methods.unicode;
  static input = methods.input;
  static bookmark = methods.bookmark;
  static slider = methods.slider;
  static datepicker = methods.datepicker;
  static daterangepicker = methods.daterangepicker;

  // tell shiny to start listening
  static initShiny = function (): void {
    const jsterInitialized = function () {
      if (Shiny.setInputValue) {
        Shiny.setInputValue("jster_initialized", true);
      } else {
        setTimeout(jsterInitialized, 10);
      }
    };

    jsterInitialized();
  };

  constructor(timeout: number) {
    this.hasCalled = false;
    this.timeout = timeout;
    this.fns = [];
    this.p = new Promise((resolve) => {
      resolve(true);
    });
  }

  private setProgress(color: string, txt: string, setInputValue): void {
    if ($) {
      // make sure the status bar is displayed
      $("#shinyjster_progress").css("display", "");
    }

    this.setProgressText(txt, setInputValue);
    this.setProgressColor(color);
  }

  private setProgressText(txt: string, setInputValue): void {
    if ($) {
      $("#shinyjster_progress_val").text(txt);
    }
    if (setInputValue !== false) {
      setInputValue = this.initSetInputValue(setInputValue);
      setInputValue("jster_progress", txt);
    }
  }

  private setProgressColor(color: string): void {
    switch (color) {
      case "red": {
        color = "rgb(90%, 54%, 59.4%)";
        break;
      }
      case "yellow": {
        color = "rgb(90%, 86.4%, 54%)";
        break;
      }
      case "green": {
        color = "rgb(55.8%, 90%, 54%)";
        break;
      }
      default: {
        // color = color
      }
    }
    if ($) {
      $("#shinyjster_progress").css("background-color", color);
    }
  }

  add(fn: AddFnType, timeout: number = this.timeout): void {
    if (this.hasCalled) {
      throw "`this.test()` has already been called";
    }
    this.setProgress("green", "Adding tests!", false);

    let addFn = fn;

    if (fn.length == 0) {
      // if no arguments are supplied in the added function,
      //   * assume it is a sync function
      //   * If it returns anything, pass it along to the next function
      //   * Since 'fn' has no 'value' arg, no value will be passed into 'fn'
      addFn = function (done) {
        done(fn());
      };
    }

    this.fns.push({
      fn: addFn,
      timeout: timeout,
    });
  }

  setupPromises(): Promise<unknown> {
    this.setProgress("yellow", "Running tests!", false);

    // make sure shiny is fully initialized before advancing.
    this.p = this.p.then((value) => {
      return new Promise((resolve) => {
        const wait = function () {
          if (Shiny.setInputValue) {
            resolve(value);
          } else {
            setTimeout(wait, 2);
          }
        };

        wait();
      });
    });

    // for each fn
    this.fns.forEach(({ fn, timeout }, idx, fns) => {
      assertFunction(fn);

      this.p = this.p
        // delay a little bit
        .then((value) => {
          this.setProgress(
            "yellow",
            `Progress: ${idx + 1}/${fns.length} (waiting)`,
            undefined
          );
          return new Promise((resolve) => {
            setTimeout(function () {
              resolve(value);
            }, timeout);
          });
        })
        // call the fn itself
        .then((value) => {
          this.setProgress(
            "yellow",
            `Progress: ${idx + 1}/${fns.length} (running)`,
            undefined
          );
          return new Promise((resolve) => {
            fn(resolve, value);
          });
        });
    });

    return this.p;
  }

  private initSetInputValue(setInputValue) {
    if (!setInputValue) {
      setInputValue = Shiny.setInputValue;
    }
    if (typeof setInputValue !== "function") {
      throw "`setInputValue` is not a function.";
    }
    return setInputValue;
  }

  test(setInputValue?: ShinySetInputValueType): void {
    if (this.hasCalled) {
      throw "`this.test()` has already been called";
    }
    if (this.fns.length === 0) {
      throw "`this.test()` requires functions to be `this.add()`ed before executing the test";
    }
    // prevent bad testing from occuring
    this.hasCalled = true;

    this.setupPromises().then(
      (value) => {
        setInputValue = this.initSetInputValue(setInputValue);
        this.setProgress(
          "green",
          `Progress: ${this.fns.length}/${this.fns.length} (done!)`,
          setInputValue
        );

        // send success to shiny
        setInputValue("jster_done", {
          type: "success",
          length: this.fns.length,
          value: value,
        });
      },
      (error) => {
        setInputValue = this.initSetInputValue(setInputValue);
        // print error to progress area
        if ($) {
          const errorMsg = error.message || error;

          this.setProgress(
            "red",
            `${$(
              "#shinyjster_progress_val"
            ).text()} - Error found: ${errorMsg}`,
            setInputValue
          );
        }

        // send error to shiny
        setInputValue("jster_done", {
          type: "error",
          length: this.fns.length,
          error: error,
        });

        // display error in console
        setTimeout(function () {
          throw error;
        }, 0);
      }
    );
  }

  wait(ms: number): void {
    this.add((done) => {
      setTimeout(done, ms);
    });
  }

  static getParameterByName(name: string, url: string): string {
    if (!url) url = window.location.href;
    name = name.replace(/[\\[\\]]/g, "\\\\$&");
    const regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
      results = regex.exec(url);

    if (!results) return null;
    if (!results[2]) return "";
    return decodeURIComponent(results[2].replace(/\\+/g, " "));
  }
}

function jster(timeout = 10): Jster {
  return new Jster(timeout);
}

export { Jster, jster };
