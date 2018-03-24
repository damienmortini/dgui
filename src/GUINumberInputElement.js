import GUIInputElement from "./GUIInputElement.js";

export default class GUINumberInputElement extends GUIInputElement {
  constructor() {
    super();
    this._numberInput = this.shadowRoot.querySelector("input");
    this._numberInput.type = "number";
  }

  set step(value) {
    this._numberInput.step = value;
  }

  get step() {
    return parseFloat(this._numberInput.step);
  }

  set min(value) {
    this._numberInput.min = value;
  }

  get min() {
    return parseFloat(this._numberInput.min);
  }

  set max(value) {
    this._numberInput.max = value;
  }

  get max() {
    return parseFloat(this._numberInput.max);
  }

  _updateInputFromValue(value) {
    if(this.shadowRoot.activeElement !== this._numberInput) {
      this._numberInput.valueAsNumber = value;
    }
  }

  _updateValueFromInput(input) {
    this.value = isNaN(input.valueAsNumber) ? this.value : input.valueAsNumber;
  }
}

window.customElements.define("dgui-numberinput", GUINumberInputElement);
