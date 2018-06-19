export default class CheckboxInputElement extends HTMLElement {
  constructor() {
    super();

    this.type = "checkbox";

    this.attachShadow({ mode: "open" }).innerHTML = `
      <style>
        input {
          vertical-align: middle;
        }
      </style>
      <input type="checkbox"></input>
    `;

    this._input = this.shadowRoot.querySelector("input");

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
    value = typeof value === "string" ? value === "true" : value;

    if (this.defaultValue === undefined) {
      this.defaultValue = value;
    }

    this._input.checked = value;
  }

  get value() {
    return this._input.checked;
  }
}

window.customElements.define("input-checkbox", CheckboxInputElement);
