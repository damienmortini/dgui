export default class SelectInputElement extends HTMLElement {
  constructor() {
    super();

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

    this._selectInput = this.shadowRoot.querySelector("select");

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
    for (let index = 0; index < this._selectInput.options.length; index++) {
      this._selectInput.remove(index);
    }
    for (let option of this._options) {
      const optionElement = document.createElement("option");
      const stringifiedOption = JSON.stringify(option);
      optionElement.value = stringifiedOption;
      optionElement.text = stringifiedOption;
      optionElement.selected = option === this.value;
      this._selectInput.add(optionElement);
      this._optionsMap.set(stringifiedOption, option);
    }
  }

  get options() {
    return this._options;
  }

  get value() {
    return this._optionsMap.get(this._selectInput.value);
  }

  set value(value) {
    this._selectInput.value = value;
  }
}

window.customElements.define("input-select", SelectInputElement);
