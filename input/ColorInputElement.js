import Color from "../node_modules/dlib/math/Color.js";

export default class ColorInputElement extends HTMLElement {
  constructor() {
    super();

    this.type = "color";

    this.attachShadow({ mode: "open" }).innerHTML = `
      <style>
        :host {
          display: inline-grid;
          grid-template-columns: .75fr .25fr;
        }
        input {
          width: 100%;
          height: 100%;
          box-sizing: border-box;
        }
        input[type="text"] {
          flex: 2;
        }
        input[type="color"] {
          flex: 1;
        }
      </style>
      <input type="text">
      <input type="color">
    `;

    this._textInput = this.shadowRoot.querySelector("input[type=\"text\"]");
    this._colorInput = this.shadowRoot.querySelector("input[type=\"color\"]");

    if (this.hasAttribute("value")) {
      this.value = this.defaultValue = this.getAttribute("value");
    }
    if (this.hasAttribute("name")) {
      this.name = this.getAttribute("name");
    }
    this.disabled = this.hasAttribute("disabled");
  }

  connectedCallback() {
    this.shadowRoot.addEventListener("change", this._onChangeBinded = this._onChangeBinded || this._onChange.bind(this));
    this.shadowRoot.addEventListener("input", this._onInputBinded = this._onInputBinded || this._onInput.bind(this));
  }

  disconnectedCallback() {
    this.shadowRoot.removeEventListener("change", this._onChangeBinded);
    this.shadowRoot.removeEventListener("input", this._onInputBinded);
  }

  _onChange(event) {
    event.stopImmediatePropagation();
    this.dispatchEvent(new event.constructor(event.type, event));
  }

  _onInput(event) {
    event.stopImmediatePropagation();
    this.value = event.target.value;
    this.dispatchEvent(new event.constructor(event.type, event));
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

  get value() {
    return this._value;
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
}

window.customElements.define("dgui-input-color", ColorInputElement);
