import { $ } from "../globals";

function label(id: string) {
  return $(`label[for="${id}"]`)
    .text()
    .trim();
}

function currentOption(id: string) {
  return $(`#${id}`).val();
}

export { label, currentOption };
