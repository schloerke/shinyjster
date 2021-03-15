import { $ } from "../globals";

// do not expose "setDate" methods. Only use `setValue()`!

function findInput(id: string) {
  return $(`#${id}`).find("input");
}

function findFromInput(id: string) {
  return $(findInput(id).get(0));
}
function findToInput(id: string) {
  return $(findInput(id).get(1));
}

function setup(findFn: (id: string) => JQuery<HTMLElement>) {
  function bsDatepicker(id: string, method: string): Date {
    return findFn(id).bsDatepicker(method) as Date;
  }

  function click(id: string): void {
    datePicker.show(id);
    findFn(id).focus(); // doesn't actually turn on the blue halo
    return;
  }

  function label(id: string): string {
    return $(`label[for="${id}"]`).text().trim();
  }

  function value(id: string): string | number | string[] {
    return findFn(id).val();
  }

  function dateToUTCString(x: Date): string {
    const year = x.getUTCFullYear();
    const month = x.getUTCMonth() + 1;
    const day = x.getUTCDate();

    return `${year}-${month}-${day}`;
  }

  function dateInfo(
    x: Date | null
  ): {
    date: Date;
    curString: string;
    year: number;
    month: number;
    day: number;
  } {
    if (x === null) {
      return {
        date: null,
        curString: null,
        year: null,
        month: null,
        day: null,
      };
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

  function setValue(id: string, value: string): void {
    findFn(id).val(value); // set the DOM
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

  return {
    click,
    label,
    value,
    dateInfo,
    datePickerInfo,
    setValue,
    bs: datePicker,
    method: bsDatepicker,
  };
}

const from = setup(findFromInput);

const to = setup(findToInput);

export { from, to };
