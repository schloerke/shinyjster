interface ShinyType {
  setInputValue: (key: string, value: string | Record<string, any>) => void;
}

declare global {
  interface Window {
    Shiny: ShinyType;
    jQuery: JQueryStatic;
  }
}

const Shiny: ShinyType = window.Shiny;

const jQuery: JQueryStatic = window.jQuery;

export { Shiny, jQuery, jQuery as $ };
