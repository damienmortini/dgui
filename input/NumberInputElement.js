export default class NumberInputElement extends HTMLElement {
  constructor() {
    super();

    this.type = "number";

    this.attachShadow({ mode: "open" }).innerHTML = `
      <style>
        :host {
          display: inline-block;
        }
        input {
          box-sizing: border-box;
          width: 100%;
          height: 100%;
        }
      </style>
      <input type="number">
    `;
    this._input = this.shadowRoot.querySelector("input");

    if (this.hasAttribute("value")) {
      this.value = this.defaultValue = parseFloat(this.getAttribute("value"));
    }
    if (this.hasAttribute("name")) {
      this.name = this.getAttribute("name");
    }
    this.disabled = this.hasAttribute("disabled");
  }

  connectedCallback() {
    this.shadowRoot.addEventListener("change", this._onChangeBinded = this._onChangeBinded || this._onChange.bind(this));
  }

  disconnectedCallback() {
    this.shadowRoot.removeEventListener("change", this._onChangeBinded);
  }

  _onChange(event) {
    this.dispatchEvent(new event.constructor(event.type, event));
  }

  set value(value) {
    this._input.valueAsNumber = value;
  }

  get value() {
    return this._input.valueAsNumber;
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
}

window.customElements.define("dgui-input-number", NumberInputElement);
