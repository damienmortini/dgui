import "../node/NodeElement.js";

export default class SelectInputNodeElement extends HTMLElement {
  static get observedAttributes() {
    return ["name", "value", "disabled"];
  }

  constructor() {
    super();

    this.type = "select";

    this.attachShadow({ mode: "open" }).innerHTML = `
      <style>
        :host {
          display: block;
        }
        select {
          width: 100%;
          height: 100%;
        }
        label {
          margin-right: 10px;
        }
      </style>
      <dgui-node>
        <label></label>
        <select></select>
      </dgui-node>
    `;

    this._optionsMap = new Map();

    this._select = this.shadowRoot.querySelector("select");
    this._label = this.shadowRoot.querySelector("label");

    const onInput = (event) => {
      this.dispatchEvent(new event.constructor(event.type, event));
    };
    this.shadowRoot.addEventListener("input", onInput);
    this.shadowRoot.addEventListener("change", onInput);
  }

  attributeChangedCallback(name, oldValue, newValue) {
    switch (name) {
      case "disabled":
        this[name] = newValue !== null;
        break;
      case "value":
        this[name] = this.defaultValue = newValue;
        break;
      default:
        this[name] = newValue;
        break;
    }
  }

  set options(value) {
    this._options = value instanceof Array ? value : JSON.parse(`[${value}]`);
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

  get name() {
    return this._select.name;
  }

  set name(value) {
    this._label.textContent = value;
    this._select.name = value;
  }

  set disabled(value) {
    this._select.disabled = value;
  }

  get disabled() {
    return this._select.disabled;
  }

  toJSON() {
    return {
      name: this.name,
      type: this.type,
      value: this.value,
      options: this.options,
    };
  }
}

window.customElements.define("dgui-node-input-select", SelectInputNodeElement);
