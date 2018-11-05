import InputElement from "./InputElement.js";
import Color from "../../node_modules/dlib/math/Color.js";

export default class ColorInputElement extends InputElement {
  constructor() {
    super();

    this.shadowRoot.querySelector("slot").innerHTML = `
      <style>
        input {
          flex: .5;
          box-sizing: border-box;
        }
      </style>
      <input type="text">
      <input type="color">
    `;

    this._textInput = this.shadowRoot.querySelector("input[type=\"text\"]");
    this._colorInput = this.shadowRoot.querySelector("input[type=\"color\"]");

    this.disabled = this.disabled;

    const onInput = (event) => {
      this.value = event.target.value;
    };
    this._textInput.addEventListener("input", onInput);
    this._colorInput.addEventListener("input", (event) => {
      onInput(event);
      this.dispatchEvent(new event.constructor(event.type, event));
    });
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

    this._textInput.value = typeof value === "string" ? value : hexValue;
    this._colorInput.value = hexValue;
  }

  get disabled() {
    return this._disabled;
  }

  set disabled(value) {
    this._disabled = value;
    if (!this._textInput) {
      return;
    }
    this._textInput.disabled = value;
    this._colorInput.disabled = value;
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
