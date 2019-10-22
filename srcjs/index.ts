import "babel-polyfill";

import { ShinyJster } from "./jster";

function jster(timeout = 250): ShinyJster {
  return new ShinyJster(timeout);
}

export { jster };
