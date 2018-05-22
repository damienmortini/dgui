import GUIInputElement from "./GUIInputElement.js";

export default class GUINumberInputElement extends GUIInputElement {
  constructor({
  } = {}) {
    super({
      type: "number",
      content: `
      <style>
        input {
          box-sizing: border-box;
          width: 100%;
        }
      </style>
      <input type="number">
      `
    });
    this._numberInput = this.shadowRoot.querySelector("input");
  }

  set initialValue(value) {
    this._initialValue = value;
    const results = this._initialValue.toString().replace("-", "").split(".");
    this.step = !isNaN(this.step) ? this.step : results[1] ? 1 / Math.pow(10, results[1].length) : 1;
  }

  get initialValue() {
    return this._initialValue;
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

GUIInputElement.typeResolvers.set("number", (value, attributes) => typeof value === "number");

window.customElements.define(`dgui-numberinput`, GUINumberInputElement);
