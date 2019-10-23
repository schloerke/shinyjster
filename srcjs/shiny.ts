import { Shiny } from "./globals";

function initJsterHooks(): void {
  // use event.target to obtain the output element
  Shiny.addCustomMessageHandler("shinyjster_msg_close_window", function() {
    setTimeout(() => {
      console.log("shinyjster: - closing window!");
      window.close();
    }, 500);
    Shiny.setInputValue("jster_closing_window", "closing");
  });
}

export { initJsterHooks };
