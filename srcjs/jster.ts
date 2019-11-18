import { Shiny, $ } from "./globals";

interface ResolveFnType {
  (value?: unknown): void;
}
interface AddFnType {
  (resolve: ResolveFnType, value?: unknown): void;
}

class Jster {
  timeout: number;
  fns: Array<{ fn: Function; timeout: number }>;
  p: null | Promise<unknown>;
  private hasCalled: boolean;

  constructor(timeout: number) {
    this.hasCalled = false;
    this.timeout = timeout;
    this.fns = [];
    this.p = new Promise((resolve) => {
      resolve(true);
    });
  }

  private setProgress(color: string, txt: string): void {
    this.setProgressText(txt);
    this.setProgressColor(color);
  }

  private setProgressText(txt: string): void {
    if ($) {
      $("#shinyjster_progress").text(txt);
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
    this.setProgress("green", "shinyjster - Adding tests!");
    this.fns.push({
      fn: fn,
      timeout: timeout,
    });
  }

  setupPromises(): Promise<unknown> {
    this.setProgress("yellow", "shinyjster - Running tests!");

    // for each fn
    this.fns.forEach(({ fn, timeout }, idx, fns) => {
      this.p = this.p
        // delay a little bit
        .then((value) => {
          this.setProgress(
            "yellow",
            `shinyjster - Progress: ${idx + 1}/${fns.length} (waiting)`
          );
          return new Promise((resolve) => {
            setTimeout(function() {
              resolve(value);
            }, timeout);
          });
        })
        // call the fn itself
        .then((value) => {
          this.setProgress(
            "yellow",
            `shinyjster - Progress: ${idx + 1}/${fns.length} (running)`
          );
          return new Promise((resolve) => {
            fn(resolve, value);
          });
        });
    });

    return this.p;
  }

  test(setInputValue = Shiny.setInputValue): void {
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
        this.setProgress(
          "green",
          `shinyjster - Progress: ${this.fns.length}/${this.fns.length} (done!)`
        );

        // send success to shiny
        setInputValue("jster_done", {
          type: "success",
          length: this.fns.length,
          value: value,
        });
      },
      (error) => {
        // print error to progress area
        if ($) {
          this.setProgress(
            "red",
            `${$("#shinyjster_progress").text()} - Error found: ${error}`
          );
        }

        // send error to shiny
        setInputValue("jster_done", {
          type: "error",
          length: this.fns.length,
          error: error,
        });

        // display error in console
        setTimeout(function() {
          throw error;
        }, 0);
      }
    );
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

function jster(timeout = 250): Jster {
  return new Jster(timeout);
}

export { Jster, jster };
