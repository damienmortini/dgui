import GUIConfig from "./GUIConfig.js";

import "../input/NumberInputElement.js";
import "../input/TextInputElement.js";
import "../input/RangeInputElement.js";
import "../input/CheckboxInputElement.js";
import "../input/ButtonInputElement.js";
import "../input/ColorInputElement.js";
import "../input/SelectInputElement.js";

export default class GUIInputElement extends HTMLElement {
  constructor() {
    super();

    this.attachShadow({ mode: "open" }).innerHTML = `
      <style>
        :host {
          display: flex;
        }

        ::slotted(*) {
          flex: 1;
        }

        label {
          padding: 0 10px;
          text-overflow: ellipsis;
          align-self: center;
        }
      </style>
      <label></label>
      <slot></slot>
      <button id="save">Save</button>
      <button id="reset">✕</button>
    `;

    this.type = this.getAttribute("type") || undefined;
    this.name = this.getAttribute("name") || undefined;
    if (this.getAttribute("options")) {
      this.options = this.getAttribute("options");
    }
    if (this.getAttribute("value")) {
      this.value = this.getAttribute("value");
    }
  }

  set type(value) {
    if (this._type === value) {
      return;
    }
    this._type = value;

    if (this._input) {
      this.removeChild(this._input);
    }

    if (GUIConfig.inputTypeMap[this._type]) {
      this._input = document.createElement(GUIConfig.inputTypeMap[this._type]);
    } else {
      this._input = document.createElement("input");
      this._input.type = this._type;
    }
    this.appendChild(this._input);
  }

  get type() {
    return this._type;
  }

  connectedCallback() {
    this.shadowRoot.querySelector("#reset").addEventListener("click", this._onResetBinded = this._onResetBinded || this._onReset.bind(this));
    this.shadowRoot.querySelector("#save").addEventListener("click", this._saveBinded = this._saveBinded || this.save.bind(this));
  }

  disconnectedCallback() {
    this.shadowRoot.querySelector("#reset").removeEventListener("click", this._onResetBinded);
    this.shadowRoot.querySelector("#save").removeEventListener("click", this._saveBinded);
  }

  save() {
    this.dispatchEvent(new Event("save", {
      bubbles: true,
    }));
  }

  _onReset(event) {
    this.value = this.defaultValue;
    this.dispatchEvent(new Event("input", event));
    this.dispatchEvent(new Event("change", event));
    this.dispatchEvent(new Event("reset", event));
  }

  set defaultValue(value) {
    this._input.defaultValue = value;
  }

  get defaultValue() {
    return this._input.defaultValue;
  }

  set object(value) {
    this._object = value;
    if (this.defaultValue === undefined && this.object && this.key) {
      this.value = this.object[this.key];
    }
  }

  get object() {
    return this._object;
  }

  set key(value) {
    this._key = value;
    if (this.defaultValue === undefined && this.object && this.key) {
      this.value = this.object[this.key];
    }
  }

  get key() {
    return this._key;
  }

  set value(value) {
    this._value = value;

    if (!this.type) {
      let type = "text";
      for (let key in GUIConfig.typeResolvers) {
        if (GUIConfig.typeResolvers[key](this._value)) {
          type = key;
        }
      }
      this.type = type;
    }

    if (this.object && this.key) {
      this.object[this.key] = this._value;
    }

    this._input.value = value;
  }

  get value() {
    return this._input.value;
  }

  set name(value) {
    this._name = value;
    const label = this.shadowRoot.querySelector("label");
    label.title = this._name;
    label.textContent = this._name;
  }

  get name() {
    return this._name || this._label || this._key;
  }

  set options(value) {
    this._input.options = value;
  }

  get options() {
    return this._input.options;
  }

  toJSON() {
    return {
      name: this.name,
      type: this.type,
      value: this.value,
    };
  }
}

window.customElements.define("dgui-input", GUIInputElement);
