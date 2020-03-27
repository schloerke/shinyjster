import { $, Shiny } from "../globals";

function getValue(id: string) {
  return Shiny.inputBindings.bindingNames["shiny.sliderInput"].binding.getValue(
    $("#" + id)
  );
}

function setValue(id: string, val: any) {
  Shiny.inputBindings.bindingNames["shiny.sliderInput"].binding.setValue(
    $("#" + id),
    val
  );
}

export { getValue, setValue };
