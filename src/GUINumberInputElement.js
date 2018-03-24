import GUIInputElement from "./GUIInputElement.js";

export default class GUINumberInputElement extends GUIInputElement {
  constructor() {
    super();
    this._input = this.shadowRoot.querySelector("input");
    this._input.type = "number";
  }

  _updateValue() {
    let value = this.shadowRoot.querySelector("input").valueAsNumber;
    this.value = isNaN(value) ? 0 : value;
  }

  set min(value) {
    this._input.min = value;
  }

  get min() {
    return this._input.min;
  }

  set max(value) {
    this._input.max = value;
  }

  get max() {
    return this._input.max;
  }
}

window.customElements.define("dgui-numberinput", GUINumberInputElement);
