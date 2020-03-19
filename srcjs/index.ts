import { $, Shiny } from "./globals";
import { jster, Jster } from "./jster";
import { initJsterHooks } from "./shiny";

window.jster = jster;
window.Jster = Jster;

initJsterHooks();
