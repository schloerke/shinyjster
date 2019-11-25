import { $ } from "../globals";

function click(id: string) {
  $(`#${id}`).click();
}

function isChecked(id: string) {
  return $(`#${id}:checked`).length > 0;
}

function label(id: string) {
  return $("#summary")
    .parent()
    .text()
    .trim();
}

export { click, isChecked, label };
