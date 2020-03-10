import { Shiny, $ } from "./globals";

function initJsterHooks(): void {
  // use event.target to obtain the output element
  Shiny.addCustomMessageHandler("shinyjster_msg_close_window", function(
    canClose
  ) {
    if (!canClose) return;

    console.log("shinyjster: - closing window!");
    $("body").addClass("shinyjster_complete");
    setTimeout(function() {
      window.close();
    }, 2 * 1000);
  });

  if ($) {
    $(document).on("shiny:disconnected", function() {
      console.log("shinyjster: - lost connection. Closing window!");
      window.close();
    });
  }
}

export { initJsterHooks };
