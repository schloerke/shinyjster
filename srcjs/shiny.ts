import { Shiny, $ } from "./globals";

function initJsterHooks(): void {
  // use event.target to obtain the output element
  Shiny.addCustomMessageHandler("shinyjster_msg_close_window", function (
    canClose
  ) {
    if (!canClose) return;

    // add class to body so that selenium can determine it is ok to shut down
    $("body").addClass("shinyjster_complete");

    // wait ~ 5 seconds to give selenium ample time to notice that it is ok to shut down
    // ... doesn't hurt for humans to see that the test passed
    console.log("shinyjster: - closing window in a bit!");
    setTimeout(function () {
      window.close();
    }, 5 * 1000);
  });
}

export { initJsterHooks };
