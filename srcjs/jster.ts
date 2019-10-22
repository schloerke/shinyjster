import { Shiny } from "./globals";

interface ResolveFnType {
  (value?: any): void;
}
interface AddFnType {
  (resolve: ResolveFnType, value?: any): void;
}

class ShinyJster {
  timeout: number;
  fns: Array<{ fn: Function; timeout: number }>;
  p: null | Promise<any>;

  constructor(timeout: number) {
    this.timeout = timeout;
    this.fns = [];
    this.p = new Promise((resolve) => {
      resolve(true);
    });
  }

  add(fn: AddFnType, timeout: number = this.timeout): void {
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
            fn(resolve, value);
          });
        });
    });

    return this.p;
  }

  test(setInputValue = Shiny.setInputValue): void {
    this.setupPromises().then(
      (value) => {
        setInputValue("jster", {
          type: "success",
          length: this.fns.length,
          value: value,
        });
      },
      (error) => {
        setTimeout(function() {
          throw error;
        }, 0);

        setInputValue("jster-error", {
          type: "error",
          length: this.fns.length,
          error: error,
        });
      }
    );
  }
}

export { ShinyJster };
