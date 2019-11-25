import { $ } from "../globals";

// simulate user click
function click(id: string) {
  $(`#${id}`)
    .siblings()
    .filter(".selectize-control")
    .find(".selectize-input")
    .click();
}

function options(id: string) {
  return $(`#${id}`)
    .siblings()
    .filter(".selectize-control")
    .find(".selectize-dropdown-content")
    .children();
}

function clickOption(id: string, idx: number) {
  const opt = options(id).get(idx);

  if ($(opt).hasClass("optgroup")) {
    $(opt)
      .find(".option")
      .click();
  } else {
    opt.click();
  }
}

function currentOption(id: string) {
  return $(`#${id}`)
    .siblings()
    .filter(".selectize-control")
    .find(".selectize-input")
    .text();
}

// When using serverside selectize, only the first 1000 values are sent.
function values(id: string) {
  return options(id)
    .map(function() {
      const selectInfo: { label: string; value: string; group?: string } = {
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

function label(id: string) {
  return $(`label[for="${id}-selectized"]`)
    .text()
    .trim();
}

export { click, values, options, clickOption, currentOption, label };
