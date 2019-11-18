import { $ } from "../globals";

function options(id: string) {
  return $(`#${id}`)
    .siblings()
    .filter(".selectize-control")
    .find(".selectize-dropdown-content")
    .children();
}

function clickOption(id: string, value: string) {
  $(`#${id} input[value='${value}']`).click();
}

function currentChoice(id: string) {
  return $(`#${id} input:checked`).attr("value");
}

export { options, clickOption, currentChoice };
