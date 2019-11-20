import { $ } from "../globals";

function click(id: string) {
  $(`#${id}`).click();
}

function isChecked(id: string) {
  return $(`#${id}:checked`).length > 0;
}

export { click, isChecked };
