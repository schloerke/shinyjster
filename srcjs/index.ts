import { jster, Jster } from "./jster";
import { initJsterHooks } from "./shiny";
import "ts-polyfill/lib/es2015-promise";

window.jster = jster;
window.Jster = Jster;

initJsterHooks();
