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

    if (this.hasAttribute("value")) {
      this.value = this.defaultValue = this.getAttribute("value") === "true";
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

  set defaultValue(value) {
    this._input.defaultChecked = value;
  }

  get defaultValue() {
    return this._input.defaultChecked;
  }

  set value(value) {
    this._input.checked = value;
  }

  get value() {
    return this._input.checked;
  }

  set name(value) {
    this._input.name = value;
  }

  get name() {
    return this._input.name;
  }

  set disabled(value) {
    this._input.disabled = value;
  }

  get disabled() {
    return this._input.disabled;
  }
}

window.customElements.define("dgui-input-checkbox", CheckboxInputElement);
