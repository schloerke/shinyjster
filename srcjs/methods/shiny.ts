import { $ } from "../globals";

function isShinyBusy(): boolean {
  if (!$) {
    return false;
  }
  return $("html")
    .first()
    .hasClass("shiny-busy");
}

function waitForShiny() {
  this.add((done) => {
    const wait = function() {
      if (this.isShinyBusy()) {
        setTimeout(wait, 25);
      } else {
        done();
      }
    };

    wait();
  });
}

export { waitForShiny as wait, isShinyBusy as isBusy };
