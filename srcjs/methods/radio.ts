import { $ } from "../globals";

function clickOption(id: string, value: string) {
  $(`#${id} input[value='${value}']`).click();
}

function currentOption(id: string) {
  return $(`#${id} input:checked`).attr("value");
}

export { clickOption, currentOption };
