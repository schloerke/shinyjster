import { $ } from "../globals";

function click(id: string) {
  $(`#${id}`).click();
}

export { click };
