// import "core-js/stable";

import { jster, Jster } from "./jster";
import { initJsterHooks } from "./shiny";

window.Jster = Jster;
window.jster = jster;

initJsterHooks();
