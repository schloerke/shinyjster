import { $ } from "../globals";

function click(id: string) {
  $(`#${id}`).click();
}

function isChecked(id: string) {
  return $(`#${id}:checked`).length > 0;
}

function label(id: string) {
  return $(`#${id}`).parent().find("span").html() || "";
}

export { click, isChecked, label };
