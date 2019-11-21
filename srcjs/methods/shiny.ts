import { $ } from "../globals";
import { debounce } from "lodash";

let shinyIsIdle = false;

function isIdle(): boolean {
  return shinyIsIdle;
}
function isBusy(): boolean {
  return !shinyIsIdle;
}
if ($) {
  $(document).on("shiny:busy", function(event) {
    shinyIsIdle = false;
  });
  $(document).on("shiny:idle", function(event) {
    shinyIsIdle = true;
    // to avoid idle and busy thrashing,
    //   call the debounced form of `callIdleFns`
    // `waitUntilIdle` is interpreted as "Shiny must be in the 'idle' state for at least 200ms"
    //   if shiny decides to become 'idle', then immediately become 'busy', `waitUntilIdle` should NOT be called.
    // To combat this, debouncing is used to make sure there is a 200ms delay
    //   and _.cancel is used to stop any debounced `waitUntilIdle` call if suddendly shiny is 'busy'.
  });
}

// to avoid idle and busy thrashing,
//   call the debounced form of `callIdleFns`
// `waitUntilIdle` is interpreted as "Shiny must be in the 'idle' state for at least 200ms"
//   if shiny decides to become 'idle', then immediately become 'busy', `waitUntilIdle` should NOT be called.
// To combat this, debouncing is used to make sure there is a 200ms delay
//   and _.cancel is used to stop any debounced `waitUntilIdle` call if suddendly shiny is 'busy'.
function waitUntilIdleFor(timeout) {
  return function(callback) {
    let timeoutId = null;
    const randomVal = Math.random();
    const busyFn = function() {
      console.log("busy!", randomVal);
      clearTimeout(timeoutId);
    };
    const idleFn = function() {
      console.log("idle!", randomVal);
      const fn = function() {
        console.log("success!", randomVal);
        // made it through the timeout, remove event listeners
        $(document).off("shiny:busy", busyFn);
        $(document).off("shiny:idle", idleFn);
        callback();
      };

      timeoutId = setTimeout(fn, timeout);
    };

    $(document).on("shiny:busy", busyFn);
    $(document).on("shiny:idle", idleFn);

    if (shinyIsIdle) {
      idleFn();
    }
  };
}
function waitUntilIdle(callback) {
  waitUntilIdleFor(0)(callback);
}
function waitUntilStable(callback) {
  waitUntilIdleFor(200)(callback);
}

function hasOverlay() {
  return $("#shiny-disconnected-overlay").length > 0;
}

export {
  isIdle,
  isBusy,
  hasOverlay,
  waitUntilIdleFor,
  waitUntilIdle,
  waitUntilStable,
};
