import "../misc/DraggableHandlerElement.js";

export default class RangeInputNodeElement extends HTMLElement {
  static get observedAttributes() {
    return ["name", "value", "disabled"];
  }

  constructor() {
    super();

    this.type = "range";

    this.attachShadow({ mode: "open" }).innerHTML = `
      <style>
        :host {
          display: grid;
          grid-template-columns: auto auto auto 2fr 1fr auto;
          grid-gap: 5px;
          align-items: center;
        }
        input {
          width: 100%;
          height: 100%;
          box-sizing: border-box;
          margin: 0;
        }
      </style>
      <dgui-node-connector data-destination="this.getRootNode().host"></dgui-node-connector>
      <dgui-draggable-handler data-target="this.getRootNode().host"></dgui-draggable-handler>
      <label></label>
      <input type="range">
      <input type="number">
      <dgui-node-connector data-source="this.getRootNode().host"></dgui-node-connector>
    `;

    this._label = this.shadowRoot.querySelector("label");
    this._rangeInput = this.shadowRoot.querySelector("input[type=\"range\"]");
    this._numberInput = this.shadowRoot.querySelector("input[type=\"number\"]");

    const onInput = (event) => {
      this.dispatchEvent(new event.constructor(event.type, event));
      this._numberInput.valueAsNumber = event.target.valueAsNumber;
      this._rangeInput.valueAsNumber = event.target.valueAsNumber;
    };
    this.shadowRoot.addEventListener("input", onInput);
    this.shadowRoot.addEventListener("change", onInput);
  }

  attributeChangedCallback(name, oldValue, newValue) {
    this[name] = name === "disabled" ? newValue !== null : newValue;
  }

  set defaultValue(value) {
    this._defaultValue = value;
    const results = this._defaultValue.toString().replace("-", "").split(".");
    this.step = !isNaN(this.step) ? this.step : results[1] ? 1 / Math.pow(10, results[1].length + 1) : Math.pow(10, results[0].length - 3);
    this.max = !isNaN(this.max) ? this.max : (results[0] !== "0" ? Math.pow(10, results[0].length) : this.step * 1000);
    this.min = !isNaN(this.min) ? this.min : (this._defaultValue >= 0 ? 0 : -this.max);
  }

  get defaultValue() {
    return this._defaultValue;
  }

  set value(value) {
    if (this.defaultValue === undefined) {
      this.defaultValue = value;
    }
    this._numberInput.valueAsNumber = value;
    this._rangeInput.valueAsNumber = value;
  }

  get value() {
    return this._numberInput.valueAsNumber;
  }

  get name() {
    return this._numberInput.name;
  }

  set name(value) {
    this._label.textContent = value;
    this._numberInput.name = value;
    this._rangeInput.name = value;
  }

  set step(value) {
    this._numberInput.step = value;
    this._rangeInput.step = value;
  }

  get step() {
    return parseFloat(this._numberInput.step);
  }

  set min(value) {
    this._numberInput.min = value;
    this._rangeInput.min = value;
  }

  get min() {
    return parseFloat(this._numberInput.min);
  }

  set max(value) {
    this._numberInput.max = value;
    this._rangeInput.max = value;
  }

  get max() {
    return parseFloat(this._numberInput.max);
  }

  set disabled(value) {
    this._numberInput.disabled = value;
    this._rangeInput.disabled = value;
  }

  get disabled() {
    return this._numberInput.disabled;
  }

  toJSON() {
    return {
      name: this.name,
      type: this.type,
      value: this.value,
      step: this.step,
      min: this.min,
      max: this.max,
    };
  }
}

window.customElements.define("dgui-node-input-range", RangeInputNodeElement);
