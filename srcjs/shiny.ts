import { Shiny, $ } from "./globals";

function initJsterHooks(): void {
  // use event.target to obtain the output element
  Shiny.addCustomMessageHandler("shinyjster_msg_close_window", function(
    canClose
  ) {
    if (!canClose) return;

    // add class to body so that selenium can determine it is ok to shut down
    $("body").addClass("shinyjster_complete");
  });
}

export { initJsterHooks };
