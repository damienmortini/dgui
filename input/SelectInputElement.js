export default class SelectInputElement extends HTMLElement {
  constructor() {
    super();

    this.type = "select";

    this.attachShadow({ mode: "open" }).innerHTML = `
      <style>
        :host {
          display: inline-block;
        }
        select {
          width: 100%;
          height: 100%;
        }
      </style>
      <select></select>
    `;

    this._optionsMap = new Map();

    this._select = this.shadowRoot.querySelector("select");

    if (this.hasAttribute("options")) {
      this.options = JSON.parse(`[${this.getAttribute("options")}]`);
    }
    if (this.hasAttribute("value")) {
      this.value = this.defaultValue = this.getAttribute("value");
    }
    if (this.hasAttribute("name")) {
      this.name = this.getAttribute("name");
    }
    this.disabled = this.hasAttribute("disabled");
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
    this._options = value;
    for (let index = 0; index < this._select.options.length; index++) {
      this._select.remove(index);
    }
    for (let option of this._options) {
      const optionElement = document.createElement("option");
      const stringifiedOption = typeof option === "object" ? JSON.stringify(option) : option.toString();
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
    this._select.value = value;
  }

  set disabled(value) {
    this._select.disabled = value;
  }

  get disabled() {
    return this._select.disabled;
  }
}

window.customElements.define("dgui-input-select", SelectInputElement);
