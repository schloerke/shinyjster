import { $ } from "../globals";

function label(id: string) {
  return $(`label[for="${id}"]`)
    .text()
    .trim();
}

function currentOption(id: string) {
  return $(`#${id}`).val();
}

function setValue(id: string, value: string) {
  $(`#${id}`).val(value);
  $(`#${id}`).trigger("change");
  return;
}

export { label, currentOption, currentOption as value, setValue };
