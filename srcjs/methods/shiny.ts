import { $ } from "../globals";

function isShinyBusy(): boolean {
  if (!$) {
    return false;
  }
  return $("html")
    .first()
    .hasClass("shiny-busy");
}

function waitForShiny(callback) {
  const wait = function() {
    if (isShinyBusy()) {
      setTimeout(wait, 25);
    } else {
      callback();
    }
  };

  wait();
}

function hasOverlay() {
  return $("#shiny-disconnected-overlay").length > 0;
}

export { waitForShiny as wait, isShinyBusy as isBusy, hasOverlay };
