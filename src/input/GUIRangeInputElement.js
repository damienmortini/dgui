import GUIInputElement from "./GUIInputElement.js";

export default class GUIRangeInputElement extends GUIInputElement {
  constructor() {
    super({
      type: "range",
      content: `
        <style>
          :host {
            grid-template-columns: auto 2.5fr 1fr auto auto;
          }

          input {
            box-sizing: border-box;
            width: 100%;
          }
        </style>

        <input type="range"><input type="number">
      `
    });
    this._rangeInput = this.shadowRoot.querySelector(`input[type="range"]`);
    this._numberInput = this.shadowRoot.querySelector(`input[type="number"]`);
  }

  set initialValue(value) {
    this._initialValue = value;
    const results = this._initialValue.toString().replace("-", "").split(".");
    this.step = !isNaN(this.step) ? this.step : results[1] ? 1 / Math.pow(10, results[1].length + 2) : Math.pow(10, results[0].length - 3);
    this.max = !isNaN(this.max) ? this.max : this.step * 1000;
    this.min = !isNaN(this.min) ? this.min : (this._initialValue >= 0 ? 0 : -this.step * 1000);
  }

  get initialValue() {
    return this._initialValue;
  }

  set step(value) {
    this._rangeInput.step = this._numberInput.step = value;
  }

  get step() {
    return parseFloat(this._rangeInput.step);
  }

  set min(value) {
    this._rangeInput.min = this._numberInput.min = value;
  }

  get min() {
    return parseFloat(this._rangeInput.min);
  }

  set max(value) {
    this._rangeInput.max = this._numberInput.max = value;
  }

  get max() {
    return parseFloat(this._rangeInput.max);
  }

  _updateInputFromValue(value) {
    if(this.shadowRoot.activeElement !== this._numberInput) {
      this._numberInput.valueAsNumber = value;
    }
    this._rangeInput.valueAsNumber = value;
  }

  _updateValueFromInput(input) {
    if(this.shadowRoot.activeElement !== input) {
      return;
    }
    this.value = isNaN(input.valueAsNumber) ? this.value : input.valueAsNumber;
  }
}

GUIInputElement.typeResolvers.set("range", (value, attributes) => typeof value === "number" && (attributes.min !== undefined || attributes.max !== undefined));

window.customElements.define("dgui-rangeinput", GUIRangeInputElement);
