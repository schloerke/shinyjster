import { $ } from "../globals";

function findInput(id: string) {
  return $(`#${id}`).find("input");
}

function bsDatepicker(id: string, method: string) {
  // / @ts-ignore
  return findInput(id).bsDatepicker(method);
}

function show(id: string): void {
  bsDatepicker(id, "show");
  return;
}

function hide(id: string): void {
  bsDatepicker(id, "hide");
  return;
}

function click(id: string): void {
  show(id);
  findInput(id).focus(); // doesn't actually turn on the blue halo
  return;
}

function label(id: string): string {
  return $(`label[for="${id}"]`).text().trim();
}

function value(id: string): string | number | string[] {
  return findInput(id).val();
}

function setValue(id: string, value: string): void {
  findInput(id).val(value); // set the DOM
  bsDatepicker(id, "update"); // Tell the date picker DOM was updated
  $(`#${id}`).trigger("change"); // Tell shiny the date picker updated
  return;
}

export { label, value, setValue, show, hide, click };
