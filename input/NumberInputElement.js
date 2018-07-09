import "../misc/DraggableHandlerElement.js";

export default class NumberInputElement extends HTMLElement {
  static get observedAttributes() {
    return ["name", "value", "step", "min", "max", "disabled"];
  }

  constructor() {
    super();

    this.type = "number";

    this.attachShadow({ mode: "open" }).innerHTML = `
      <style>
        :host {
          display: grid;
          grid-template-columns: auto auto auto 1fr auto;
          grid-gap: 5px;
          align-items: center;
        }
        input {
          box-sizing: border-box;
          width: 100%;
          height: 100%;
        }
      </style>
      <dgui-node-in data-to="this.getRootNode().host"></dgui-node-in>
      <dgui-draggable-handler data-target="this.getRootNode().host"></dgui-draggable-handler>
      <label></label>
      <input type="number">
      <dgui-node-out data-from="this.getRootNode().host"></dgui-node-out>
    `;
    this._input = this.shadowRoot.querySelector("input");
    this._label = this.shadowRoot.querySelector("label");

    this.shadowRoot.addEventListener("change", (event) => {
      this.dispatchEvent(new event.constructor(event.type, event));
    });
  }

  attributeChangedCallback(name, oldValue, newValue) {
    this[name] = name === "disabled" ? newValue !== null : newValue;
  }

  set value(value) {
    if (this.defaultValue === undefined) {
      this.defaultValue = value;
    }
    this._input.valueAsNumber = value;
  }

  get value() {
    return this._input.valueAsNumber;
  }

  get name() {
    return this._input.name;
  }

  set name(value) {
    this._label.textContent = value;
    this._input.name = value;
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

  set step(value) {
    this._input.step = value;
  }

  get step() {
    return parseFloat(this._input.step);
  }

  set min(value) {
    this._input.min = value;
  }

  get min() {
    return parseFloat(this._input.min);
  }

  set max(value) {
    this._input.max = value;
  }

  get max() {
    return parseFloat(this._input.max);
  }

  set disabled(value) {
    this._input.disabled = value;
  }

  get disabled() {
    return this._input.disabled;
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

window.customElements.define("dgui-node-input-number", NumberInputElement);
