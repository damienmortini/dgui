import Color from "../node_modules/dlib/math/Color.js";
import GUIInputElement from "./GUIInputElement.js";

export default class GUIColorInputElement extends GUIInputElement {
  constructor() {
    super({
      type: "color",
      content: `
      <style>
        :host {
          grid-template-columns: 2fr auto 1fr auto auto;
        }
        input {
          box-sizing: border-box;
          width: 100%;
        }
      </style>
      <input type="text" size="7">
      <input type="color">`
    });
    this._textInput = this.shadowRoot.querySelector(`input[type="text"]`);
    this._colorInput = this.shadowRoot.querySelector(`input[type="color"]`);
  }

  _onChange(e) { }

  set initialValue(value) {
    if (typeof value === "string") {
      this._initialValue = value;
    } else {
      this._initialValue = value[0] === undefined ? Object.assign({}, value) : [...value];
    }
  }

  get initialValue() {
    return this._initialValue;
  }

  set value(value) {
    if (typeof this.value === "object" && typeof value === "string") {
      const RGBA = Color.styleToRGBA(this._valueToHexadecimal(value));
      if (this.value.r !== undefined) {
        [this.value.r, this.value.g, this.value.b] = [RGBA[0], RGBA[1], RGBA[2]];
      } else if (this.value.x !== undefined) {
        [this.value.x, this.value.y, this.value.z] = [RGBA[0], RGBA[1], RGBA[2]];
      } else {
        [this.value[0], this.value[1], this.value[2]] = [RGBA[0], RGBA[1], RGBA[2]];
      }
      super.value = this.value;
    } else if (typeof this.value === "object" && typeof value === "object") {
      if (this.value.r !== undefined) {
        [this.value.r, this.value.g, this.value.b] = [value.r, value.g, value.b];
      } else if (this.value.x !== undefined) {
        [this.value.x, this.value.y, this.value.z] = [value.x, value.y, value.z];
      } else {
        [this.value[0], this.value[1], this.value[2]] = [value[0], value[1], value[2]];
      }
      super.value = this.value;
    } else {
      super.value = value;
    }
  }

  get value() {
    return super.value;
  }

  _updateInputFromValue(value) {
    const hexValue = this._valueToHexadecimal(value);

    if (this.shadowRoot.activeElement !== this._textInput) {
      this._textInput.value = hexValue;
    }
    this._colorInput.value = hexValue;
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
}

GUIInputElement.typeResolvers.set("color", (value, attributes) => {
  return typeof value === "string" && ((value.length === 7 && value.startsWith("#")) || value.startsWith("rgb") || value.startsWith("hsl")) || (typeof value === "object" && value.r !== undefined && value.g !== undefined && value.b !== undefined);
});

window.customElements.define("dgui-colorinput", GUIColorInputElement);
