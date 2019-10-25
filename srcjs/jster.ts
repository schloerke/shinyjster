import { Shiny, $ } from "./globals";

interface ResolveFnType {
  (value?: any): void;
}
interface AddFnType {
  (resolve: ResolveFnType, value?: any): void;
}

class Jster {
  timeout: number;
  fns: Array<{ fn: Function; timeout: number }>;
  p: null | Promise<any>;
  private hasCalled: boolean;

  constructor(timeout: number) {
    this.hasCalled = false;
    this.timeout = timeout;
    this.fns = [];
    this.p = new Promise((resolve) => {
      resolve(true);
    });
  }

  add(fn: AddFnType, timeout: number = this.timeout): void {
    if (this.hasCalled) {
      throw "`this.test()` has already been called";
    }
    this.fns.push({
      fn: fn,
      timeout: timeout,
    });
  }

  setupPromises(): Promise<any> {
    // for each fn
    this.fns.forEach(({ fn, timeout }) => {
      this.p = this.p
        // delay a little bit
        .then((value) => {
          return new Promise((resolve) => {
            setTimeout(function() {
              resolve(value);
            }, timeout);
          });
        })
        // call the fn itself
        .then((value) => {
          return new Promise((resolve) => {
            if ($) {
              $("#shinyjster_progress").text(
                `${$("#shinyjster_progress").text()} .`
              );
            }
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
        setInputValue("jster_done", {
          type: "success",
          length: this.fns.length,
          value: value,
        });
      },
      (error) => {
        // print to console the same error
        setTimeout(function() {
          throw error;
        }, 0);

        setInputValue("jster_done", {
          type: "error",
          length: this.fns.length,
          error: error,
        });
      }
    );
  }
}

function jster(timeout = 250): Jster {
  return new Jster(timeout);
}

export { Jster, jster };
