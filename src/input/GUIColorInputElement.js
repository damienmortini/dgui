import Color from "../../node_modules/dlib/math/Color.js";
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

  set initialValue(value) {
    if (typeof value === "string") {
      this._initialValue = value;
    } else {
      this._initialValue = value[0] === undefined ? { ...value } : [...value];
    }
  }

  get initialValue() {
    return this._initialValue;
  }

  set value(value) {
    if (typeof super.value === "string") {
      super.value = value;
    } else {
      const RGBA = Color.styleToRGBA(this._valueToHexadecimal(value));
      if (super.value.r) {
        [super.value.r, super.value.g, super.value.b] = [RGBA[0], RGBA[1], RGBA[2]];
      } else if (super.value.x) {
        [super.value.x, super.value.y, super.value.z] = [RGBA[0], RGBA[1], RGBA[2]];
      } else {
        [super.value[0], super.value[1], super.value[2]] = [RGBA[0], RGBA[1], RGBA[2]];
      }
      super.value = this.value;
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
    } else if (value.r) {
      RGBA = [value.r, value.g, value.b, 1];
    } else if (value.x) {
      RGBA = [value.x, value.y, value.z, 1];
    } else {
      RGBA = [value[0], value[1], value[2], 1];
    }

    return `#${Math.floor(RGBA[0] * 255).toString(16).padStart(2, "0")}${Math.floor(RGBA[1] * 255).toString(16).padStart(2, "0")}${Math.floor(RGBA[2] * 255).toString(16).padStart(2, "0")}`;
  }
}

GUIInputElement.typeResolvers.set("color", (value, attributes) => {
  return typeof value === "string" && ((value.length === 7 && value.startsWith("#")) || value.startsWith("rgb") || value.startsWith("hsl")) || (value.r !== undefined && value.g !== undefined && value.b !== undefined);
});

window.customElements.define("dgui-colorinput", GUIColorInputElement);
