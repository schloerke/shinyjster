import { $ } from "../globals";

function getEle(id = "._bookmark_") {
  return $(document.getElementById(id));
}

function click(id = "._bookmark_") {
  return getEle(id).click();
}

export { click };
