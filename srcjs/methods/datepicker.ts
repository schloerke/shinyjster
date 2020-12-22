import { $ } from "../globals";

// do not expose "setDate" methods. Only use `setValue()`!

function findInput(id: string) {
  return $(`#${id}`).find("input");
}

function bsDatepicker(
  id: string,
  method: string
): string | number | Date | null {
  // / @ts-ignore
  return findInput(id).bsDatepicker(method);
}

function click(id: string): void {
  datePicker.show(id);
  findInput(id).focus(); // doesn't actually turn on the blue halo
  return;
}

function label(id: string): string {
  return $(`label[for="${id}"]`).text().trim();
}

function value(id: string): string | number | string[] {
  return findInput(id).val();
}

function dateToUTCString(x: Date): string {
  const year = x.getUTCFullYear();
  const month = x.getUTCMonth() + 1;
  const day = x.getUTCDate();

  return `${year}-${month}-${day}`;
}

function dateInfo(x) {
  if (x === null) {
    return { date: null, curString: null, year: null, month: null, day: null };
  }
  return {
    date: x,
    curString: dateToUTCString(x),
    year: x.getUTCFullYear(),
    month: x.getUTCMonth() + 1,
    day: x.getUTCDate(),
  };
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
function datePickerInfo(id: string) {
  return {
    min: dateInfo(datePicker.getStartDate(id)),
    cur: dateInfo(datePicker.getDate(id)),
    max: dateInfo(datePicker.getEndDate(id)),
  };
}

function possibleDates(id: string, callback = window.console.log): number[] {
  const isVisible = $(".datepicker-dropdown").length > 0;

  if (!isVisible)
    throw "date pick is not open to inspect. Call `Jster.datepicker.bs.show()`";

  const visibleDates = $(
    ".datepicker-dropdown .datepicker-days .day:not(.disabled)"
  )
    .get()
    .map(function (item) {
      const dateText = $(item).text();

      return parseInt(dateText, 10);
    });

  return visibleDates;
}

function setValue(id: string, value: string): void {
  findInput(id).val(value); // set the DOM
  bsDatepicker(id, "update"); // Tell the date picker DOM was updated
  $(`#${id}`).trigger("change"); // Tell shiny the date picker updated
  return;
}

function getDateHelper(method_name: string) {
  return function (id: string) {
    return bsDatepicker(id, method_name);
  };
}

const datePicker = {
  show(id: string): void {
    bsDatepicker(id, "show");
    return;
  },
  hide(id: string): void {
    bsDatepicker(id, "hide");
    return;
  },
  getStartDate: getDateHelper("getStartDate"),
  getDate: getDateHelper("getDate"),
  getEndDate: getDateHelper("getEndDate"),
};

export {
  label,
  value,
  setValue,
  datePicker as bs,
  click,
  // bsDatepicker,
  bsDatepicker as method,
  datePickerInfo,
  possibleDates,
};
