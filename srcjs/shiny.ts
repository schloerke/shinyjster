import { Shiny } from "./globals";

function initJsterHooks(): void {
  // use event.target to obtain the output element
  Shiny.addCustomMessageHandler("shinyjster_msg_close_window", function(
    canClose
  ) {
    if (!canClose) return;

    console.log("shinyjster: - closing window!");
    window.close();
  });
}

export { initJsterHooks };
