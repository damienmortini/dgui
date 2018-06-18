export default class NumberInputElement extends HTMLElement {
  constructor() {
    super();

    this.attachShadow({ mode: "open" }).innerHTML = `
      <style>
        input {
          box-sizing: border-box;
          width: 100%;
          height: 100%;
        }
      </style>
      <input type="number">
    `;
    this._numberInput = this.shadowRoot.querySelector("input");

    if (this.getAttribute("value")) {
      this.value = this.getAttribute("value");
    }
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
    if (!this.defaultValue) {
      this.defaultValue = value;
    }

    this._numberInput.valueAsNumber = value;
  }

  get value() {
    return this._numberInput.valueAsNumber;
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
}

window.customElements.define("input-number", NumberInputElement);
