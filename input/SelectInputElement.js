export default class SelectInputElement extends HTMLElement {
  constructor() {
    super();

    this.type = "select";

    this.attachShadow({ mode: "open" }).innerHTML = `
      <style>
        select {
          width: 100%;
          height: 100%;
        }
      </style>
      <select></select>
    `;

    this._optionsMap = new Map();

    this._select = this.shadowRoot.querySelector("select");

    if (this.getAttribute("options")) {
      this.options = this.getAttribute("options");
    }
  }

  connectedCallback() {
    this._onInputBinded = this._onInputBinded || this._onInput.bind(this);
    this.shadowRoot.addEventListener("input", this._onInputBinded);
    this.shadowRoot.addEventListener("change", this._onInputBinded);
  }

  disconnectedCallback() {
    this.shadowRoot.removeEventListener("input", this._onInputBinded);
    this.shadowRoot.removeEventListener("change", this._onInputBinded);
  }

  _onInput(event) {
    this.dispatchEvent(new event.constructor(event.type, event));
  }

  set options(value) {
    this._options = typeof value === "string" ? JSON.parse(`[${value}]`) : value;
    for (let index = 0; index < this._select.options.length; index++) {
      this._select.remove(index);
    }
    for (let option of this._options) {
      const optionElement = document.createElement("option");
      const stringifiedOption = JSON.stringify(option);
      optionElement.value = stringifiedOption;
      optionElement.text = stringifiedOption;
      optionElement.selected = option === this.value;
      this._select.add(optionElement);
      this._optionsMap.set(stringifiedOption, option);
    }
  }

  get options() {
    return this._options;
  }

  get value() {
    return this._optionsMap.get(this._select.value);
  }

  set value(value) {
    if (this.defaultValue === undefined) {
      this.defaultValue = value;
    }
    
    this._select.value = value;
  }
}

window.customElements.define("input-select", SelectInputElement);
