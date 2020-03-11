import { $, Shiny } from "../globals";

let shinyIsIdle = false;

function isIdle(): boolean {
  return shinyIsIdle;
}
function isBusy(): boolean {
  return !shinyIsIdle;
}
if ($) {
  $(document).on("shiny:busy", function() {
    shinyIsIdle = false;
  });
  $(document).on("shiny:idle", function() {
    shinyIsIdle = true;
  });
}

// `waitUntilIdleFor` requires a timeout value
// `waitUntilIdleFor` is interpreted as "Shiny must be in the 'idle' state for at least `timeout`ms"
// If shiny decides to become 'idle', but becomes 'busy' before `timeout`ms...
//   `callback` will have to wait until the next time Shiny is 'idle' before attempting to wait to execute
// Once a callback is successful, all created event handlers are removed to avoid buildup of no-op handlers
function waitUntilIdleFor(timeout) {
  return function(callback) {
    let timeoutId = null;

    const busyFn = function() {
      // clear timeout. Calling with `null` is ok.
      clearTimeout(timeoutId);
    };
    const idleFn = function() {
      const fn = function() {
        // made it through the timeout, remove event listeners
        $(document).off("shiny:busy", busyFn);
        $(document).off("shiny:idle", idleFn);

        // call original callback
        callback();
      };

      // delay the callback wrapper function
      timeoutId = setTimeout(fn, timeout);
    };

    // set up individual listeners for this function.
    $(document).on("shiny:busy", busyFn);
    $(document).on("shiny:idle", idleFn);

    // if already idle, call `idleFn`.
    if (shinyIsIdle) {
      idleFn();
    }
  };
}
// `waitUntilIdle` will fire a callback once shiny is idle.
//  If shiny is already idle, the callback will be executed on the next tick.
function waitUntilIdle(callback) {
  waitUntilIdleFor(0)(callback);
}
// `waitUntilStable` is interpreted as "Shiny must be in the 'idle' state for at least 200ms"
//   if shiny decides to become 'idle', then immediately become 'busy', `waitUntilIdle` should NOT be called.
function waitUntilStable(callback) {
  waitUntilIdleFor(200)(callback);
}

function ignoreSessionEnded(callback) {
  if (!(Shiny && Shiny.setInputValue)) {
    throw "Shiny is not found!";
  }
  Shiny.setInputValue("jster_ignore_on_session_ended", true);
  waitUntilStable(callback);
}
function updateHref(url) {
  return function(callback) {
    const searchParams = window.location.href.split("?")[1];

    // Only update if the href is the original href
    if (searchParams !== "shinyjster=1") {
      callback();
      return;
    }

    // Must be original href... updating!

    // Let shiny know to ignore the upcoming page refresh.
    ignoreSessionEnded(function() {
      // set the url using window.document (not window.location)
      // docs - https://developer.mozilla.org/en-US/docs/Web/API/Document/location
      // random solution - https://stackoverflow.com/a/6297374/591574
      window.document.location = url;

      // do not call the callback... the page will refresh...
      false && callback();
    });
  };
}

function hasOverlay() {
  return $("#shiny-disconnected-overlay").length > 0;
}

export {
  ignoreSessionEnded,
  isIdle,
  isBusy,
  hasOverlay,
  waitUntilIdleFor,
  waitUntilIdle,
  waitUntilStable,
  updateHref,
};
