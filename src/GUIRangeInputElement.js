import GUINumberInputElement from "./GUINumberInputElement.js";

const template = document.createElement("template");
template.innerHTML = `<input type="range"/>`;

export default class GUIRangeInputElement extends GUINumberInputElement {
  constructor() {
    super();
    this.shadowRoot.insertBefore(template.content.cloneNode(true), this.shadowRoot.querySelector("input"));
    this.shadowRoot.querySelector("style").textContent += `
      :host {
        grid-template-columns: 50px 2.5fr 1fr 25px;
      }

      input[type="number"] {
        box-sizing: border-box;
        width: 100%;
      }
    `;
    this._rangeInput = this.shadowRoot.querySelector(`input[type="range"]`);
  }

  set step(value) {
    super.step = value;
    this._rangeInput.step = value;
  }

  set min(value) {
    super.min = value;
    this._rangeInput.min = value;
  }

  set max(value) {
    super.max = value;
    this._rangeInput.max = value;
  }

  _updateInputFromValue(value) {
    if(this.shadowRoot.activeElement !== this._rangeInput) {
      this._rangeInput.valueAsNumber = value;
    }
    super._updateInputFromValue(value);
  }
}

window.customElements.define("dgui-rangeinput", GUIRangeInputElement);
