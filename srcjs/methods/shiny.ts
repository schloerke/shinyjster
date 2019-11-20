import { $ } from "../globals";
import { debounce } from "lodash";

let shinyIsIdle = false;
const shinyIdleFns = [];

function isIdle(): boolean {
  return shinyIsIdle;
}
function callIdleFns() {
  // call using setTimeout to "break" serialized execution
  shinyIdleFns.map(function(fn) {
    setTimeout(fn, 0);
  });
}

// wait 200ms before calling callIdleFns
const callIdleFnsDebounced = debounce(callIdleFns, 200);

if ($) {
  $(document).on("shiny:busy", function(event) {
    shinyIsIdle = false;
    callIdleFnsDebounced.cancel();
  });
  $(document).on("shiny:idle", function(event) {
    shinyIsIdle = true;
    // to avoid idle and busy thrashing,
    //   call the debounced form of `callIdleFns`
    callIdleFnsDebounced();
  });
}

function waitUntilIdle(callback) {
  // add to idle queue
  shinyIdleFns.push(callback);

  if (shinyIsIdle) {
    // kick it off, if possible
    callIdleFnsDebounced();
  }
}

function isBusy(): boolean {
  return !shinyIsIdle;
}

function hasOverlay() {
  return $("#shiny-disconnected-overlay").length > 0;
}

export { waitUntilIdle, isBusy, hasOverlay, isIdle };
