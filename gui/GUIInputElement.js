import GUIConfig from "./GUIConfig.js";

import "../input/NumberInputElement.js";
import "../input/TextInputNodeElement.js";
import "../input/RangeInputNodeElement.js";
import "../input/CheckboxInputNodeElement.js";
import "../input/ButtonInputNodeElement.js";
import "../input/ColorInputNodeElement.js";
import "../input/SelectInputNodeElement.js";

export default class GUIInputElement extends HTMLElement {
  static get observedAttributes() {
    return ["type", "name", "value", "disabled"];
  }

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
          margin-right: 10px;
          text-overflow: ellipsis;
          align-self: center;
        }
      </style>
      <label></label>
      <slot><input></slot>
      <button id="save">Save</button>
      <button id="reset">✕</button>
    `;

    this._input = this.shadowRoot.querySelector("input");
    this._label = this.shadowRoot.querySelector("label");
    this._save = this.shadowRoot.querySelector("#save");
    this._reset = this.shadowRoot.querySelector("#reset");

    this._reset.addEventListener("click", this.reset.bind(this));
    this._save.addEventListener("click", this.save.bind(this));
  }

  attributeChangedCallback(name, oldValue, newValue) {
    this[name] = name === "disabled" ? newValue === "" : newValue;
    this._input.setAttribute(name, newValue);
  }

  get type() {
    return this._type;
  }

  set type(value) {
    if (this._type === value) {
      return;
    }
    this._type = value;

    /**
     * Create new input element
     */
    let newInput;
    if (GUIConfig.inputTypeMap[this._type]) {
      newInput = document.createElement(GUIConfig.inputTypeMap[this._type]);
    } else {
      newInput = document.createElement("input");
      newInput.type = this._type;
    }

    /**
     * Swap inputs elements
     */
    if (this._input) {
      newInput.name = this._input.name;
      newInput.value = this._input.value;
      newInput.disabled = this._input.disabled;
      for (const key in this.dataset) {
        newInput[key] = this.dataset[key];
      }
      this._input.remove();
    }
    this._input = newInput;
    this.appendChild(this._input);
  }

  save() {
    this.dispatchEvent(new Event("save", {
      bubbles: true,
    }));
  }

  reset() {
    this.value = this.defaultValue;
    this.dispatchEvent(new Event("input", {
      bubbles: true,
    }));
    this.dispatchEvent(new Event("change", {
      bubbles: true,
    }));
    this.dispatchEvent(new Event("reset", {
      bubbles: true,
    }));
  }

  get defaultValue() {
    return this._input.defaultValue;
  }

  set defaultValue(value) {
    this._input.defaultValue = value;
  }

  get value() {
    return this._input.value;
  }

  set value(value) {
    if (!this.type) {
      let type = "text";
      for (let key in GUIConfig.typeResolvers) {
        if (GUIConfig.typeResolvers[key](value)) {
          type = key;
        }
      }
      this.type = type;
    }
    this._input.value = value;
  }

  get name() {
    return this._name || this._key;
  }

  set name(value) {
    this._name = value;
    this._label.title = this._name;
    this._label.textContent = this._name;
    this._input.name = this._name;
  }

  set disabled(value) {
    this._input.disabled = value;
    this._reset.disabled = value;
  }

  get disabled() {
    return this._input.disabled;
  }

  toJSON() {
    return this._input.toJSON ? this._input.toJSON() : {
      name: this.name,
      type: this.type,
      value: this.value,
    };
  }
}

window.customElements.define("dgui-input", GUIInputElement);
