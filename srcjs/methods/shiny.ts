import { $ } from "../globals";

function isBusy(): boolean {
  if (!$) {
    return false;
  }
  return $("html")
    .first()
    .hasClass("shiny-busy");
}

function waitUntilIdle(callback, timeout = 23) {
  const wait = function() {
    if (isBusy()) {
      setTimeout(wait, timeout);
    } else {
      callback();
    }
  };

  wait();
}

function hasOverlay() {
  return $("#shiny-disconnected-overlay").length > 0;
}

export { waitUntilIdle, isBusy, hasOverlay };
