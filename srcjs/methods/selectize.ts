import { $ } from "../globals";

// simulate user click
function click(id: string): void {
  $(`#${id}`)
    .siblings()
    .filter(".selectize-control")
    .find(".selectize-input")
    .trigger("click");
}

function options(id: string): JQuery<HTMLElement> {
  return $(`#${id}`)
    .siblings()
    .filter(".selectize-control")
    .find(".selectize-dropdown-content")
    .children();
}

function clickOption(id: string, idx: number): void {
  const opt = options(id).get(idx);

  if ($(opt).hasClass("optgroup")) {
    $(opt).find(".option").trigger("click");
  } else {
    $(opt).trigger("click");
  }
  setTimeout(function () {
    // Remove focus
    $("#" + id)
      .siblings()
      .filter(".selectize-control")
      .find(".selectize-input input")
      .trigger("blur");
  }, 0);
}

function currentOption(id: string): string {
  return $(`#${id}`)
    .siblings()
    .filter(".selectize-control")
    .find(".selectize-input")
    .text();
}

type SelectInfo = { label: string; value: string; group?: string };
// When using serverside selectize, only the first 1000 values are sent.
function values(id: string): SelectInfo[] {
  return options(id)
    .map(function () {
      const selectInfo: SelectInfo = {
        label: "",
        value: "",
      };
      const jthis = $(this);

      if (jthis.hasClass("optgroup")) {
        selectInfo.group = jthis.find(".optgroup-header").text();
        selectInfo.label = jthis.find(".option").text();
        selectInfo.value = $(jthis.find(".option").get(0)).attr("data-value");
      } else {
        selectInfo.label = jthis.text();
        selectInfo.value = jthis.attr("data-value");
      }
      return selectInfo;
    })
    .get();
}

function label(id: string): string {
  return $(`label[for="${id}-selectized"]:visible`).text().trim();
}

export { click, values, options, clickOption, currentOption, label };
