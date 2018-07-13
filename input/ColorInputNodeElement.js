import Color from "../node_modules/dlib/math/Color.js";

export default class ColorInputNodeElement extends HTMLElement {
  static get observedAttributes() {
    return ["name", "value", "disabled"];
  }

  constructor() {
    super();

    this.type = "color";

    this.attachShadow({ mode: "open" }).innerHTML = `
      <style>
        :host {
          display: grid;
          grid-template-columns: auto auto auto 3fr 1fr auto;
          grid-gap: 5px;
          align-items: center;
        }
        input {
          width: 100%;
          box-sizing: border-box;
        }
      </style>
      <dgui-node-connector data-destination="this.getRootNode().host"></dgui-node-connector>
      <dgui-draggable-handler data-target="this.getRootNode().host"></dgui-draggable-handler>
      <label></label>
      <input type="text">
      <input type="color">
      <dgui-node-connector data-source="this.getRootNode().host"></dgui-node-connector>
    `;

    this._label = this.shadowRoot.querySelector("label");
    this._textInput = this.shadowRoot.querySelector("input[type=\"text\"]");
    this._colorInput = this.shadowRoot.querySelector("input[type=\"color\"]");

    this.shadowRoot.addEventListener("change", (event) => {
      event.stopImmediatePropagation();
      this.dispatchEvent(new event.constructor(event.type, event));
    });

    this.shadowRoot.addEventListener("input", (event) => {
      event.stopImmediatePropagation();
      this.value = event.target.value;
      this.dispatchEvent(new event.constructor(event.type, event));
    });
  }

  attributeChangedCallback(name, oldValue, newValue) {
    this[name] = name === "disabled" ? newValue !== null : newValue;
  }

  get value() {
    return this._value;
  }

  set value(value) {
    const hexValue = this._valueToHexadecimal(value);

    if (typeof this._value === "object" && typeof value === "string") {
      const RGBA = Color.styleToRGBA(hexValue);
      if (this._value.r !== undefined) {
        [this._value.r, this._value.g, this._value.b] = [RGBA[0], RGBA[1], RGBA[2]];
      } else if (this._value.x !== undefined) {
        [this._value.x, this._value.y, this._value.z] = [RGBA[0], RGBA[1], RGBA[2]];
      } else {
        [this._value[0], this._value[1], this._value[2]] = [RGBA[0], RGBA[1], RGBA[2]];
      }
    } else if (typeof this._value === "object" && typeof value === "object") {
      if (this._value.r !== undefined) {
        [this._value.r, this._value.g, this._value.b] = [value.r, value.g, value.b];
      } else if (this._value.x !== undefined) {
        [this._value.x, this._value.y, this._value.z] = [value.x, value.y, value.z];
      } else {
        [this._value[0], this._value[1], this._value[2]] = [value[0], value[1], value[2]];
      }
    } else {
      this._value = value;
    }

    if (this.shadowRoot.activeElement !== this._textInput) {
      this._textInput.value = hexValue;
    }
    this._colorInput.value = hexValue;
  }

  get name() {
    return this._textInput.name;
  }

  set name(value) {
    this._label.textContent = value;
    this._textInput.name = value;
    this._colorInput.name = value;
  }

  set disabled(value) {
    this._textInput.disabled = value;
    this._colorInput.disabled = value;
  }

  get disabled() {
    return this._textInput.disable;
  }

  _valueToHexadecimal(value) {
    let RGBA;

    if (typeof value === "string") {
      RGBA = Color.styleToRGBA(value);
    } else if (value.r !== undefined) {
      RGBA = [value.r, value.g, value.b, 1];
    } else if (value.x !== undefined) {
      RGBA = [value.x, value.y, value.z, 1];
    } else {
      RGBA = [value[0], value[1], value[2], 1];
    }

    return `#${Math.floor(RGBA[0] * 255).toString(16).padStart(2, "0")}${Math.floor(RGBA[1] * 255).toString(16).padStart(2, "0")}${Math.floor(RGBA[2] * 255).toString(16).padStart(2, "0")}`;
  }

  toJSON() {
    return {
      name: this.name,
      type: this.type,
      value: this._valueToHexadecimal(this.value),
    };
  }
}

window.customElements.define("dgui-node-input-color", ColorInputNodeElement);
