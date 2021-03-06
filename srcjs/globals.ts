import { Jster } from "./jster";

interface ShinySetInputValueType {
  (key: string, value: boolean | string | Record<string, unknown>): void;
}

interface ShinyType {
  setInputValue: ShinySetInputValueType;
  addCustomMessageHandler?: (
    key: string,
    fn: (val?: string | number) => void
  ) => void;
  inputBindings?: {
    bindingNames: {
      [key: string]: {
        binding: {
          getValue: (el: JQuery<HTMLElement>) => any;
          setValue: (el: JQuery<HTMLElement>, value: any) => void;
        };
      };
    };
  };
}

declare global {
  interface Window {
    Shiny: ShinyType;
    jQuery: JQueryStatic;
    Jster: typeof Jster; // eslint-disable-line no-undef
    jster: (timeout: number) => void;
  }
}

const Shiny: ShinyType = window.Shiny;

const jQuery: JQueryStatic = window.jQuery;

export { Shiny, jQuery, jQuery as $, ShinySetInputValueType };
