import GUINumberInputElement from "./GUINumberInputElement.js";

const template = document.createElement("template");
template.innerHTML = `<input type="range"/>`;

export default class GUIRangeInputElement extends GUINumberInputElement {
  constructor() {
    super();
    this.shadowRoot.insertBefore(template.content.cloneNode(true), this.shadowRoot.querySelector("input"));
    this.shadowRoot.querySelector("style").textContent += `
      :host {
        grid-template-columns: 50px 2.5fr 1fr auto;
      }

      input[type="number"] {
        box-sizing: border-box;
        width: 100%;
      }
    `;
    this._rangeInput = this.shadowRoot.querySelector(`input[type="range"]`);
  }

  set initialValue(value) {
    super.initialValue = value;
    this.max = !isNaN(this.max) ? this.max : this.step * 1000;
    this.min = !isNaN(this.min) ? this.min : (this._initialValue >= 0 ? 0 : -this.step * 1000);
  }

  get initialValue() {
    return super.initialValue;
  }

  set step(value) {
    super.step = value;
    this._rangeInput.step = value;
  }

  get step() {
    return super.step;
  }

  set min(value) {
    super.min = value;
    this._rangeInput.min = value;
  }

  get min() {
    return super.min;
  }

  set max(value) {
    super.max = value;
    this._rangeInput.max = value;
  }

  get max() {
    return super.max;
  }

  _updateInputFromValue(value) {
    if(this.shadowRoot.activeElement !== this._rangeInput) {
      this._rangeInput.valueAsNumber = value;
    }
    super._updateInputFromValue(value);
  }
}

window.customElements.define("dgui-rangeinput", GUIRangeInputElement);
