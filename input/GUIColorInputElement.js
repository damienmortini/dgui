import Color from '../node_modules/dlib/math/Color.js';

export default class ColorInputElement extends window.HTMLElement {
  constructor() {
    super();

    this.type = 'color';

    this.attachShadow({ mode: 'open' }).innerHTML = `
      <style>
        :host {
          display: grid;
          grid-template-columns: 3fr 1fr;
        }
        input {
          box-sizing: border-box;
          width: 100%;
        }
      </style>
      <input type="text" size="7">
      <input type="color">
    `;

    this._textInput = this.shadowRoot.querySelector(`input[type="text"]`);
    this._colorInput = this.shadowRoot.querySelector(`input[type="color"]`);

    if (this.getAttribute('value')) {
      this.value = this.getAttribute('value');
    }
  }

  connectedCallback() {
    this.shadowRoot.addEventListener('change', this._onChangeBinded = this._onChangeBinded || this._onChange.bind(this));
    this.shadowRoot.addEventListener('input', this._onInputBinded = this._onInputBinded || this._onInput.bind(this));
  }

  disconnectedCallback() {
    this.shadowRoot.removeEventListener('change', this._onChangeBinded);
    this.shadowRoot.removeEventListener('input', this._onInputBinded);
  }

  _onChange(e) {
    e.stopPropagation();
    console.log('change');
    this.dispatchEvent(new Event('change', {
      bubbles: true,
    }));
  }

  _onInput(e) {
    e.stopPropagation();
    console.log('input');
    this.dispatchEvent(new Event('input', {
      bubbles: true,
    }));
    this.value = e.target.value;
  }

  set value(value) {
    if (this.defaultValue) {
      this.defaultValue = this._valueToHexadecimal(value);
    }

    if (typeof this._value === 'object' && typeof value === 'string') {
      const RGBA = Color.styleToRGBA(this._valueToHexadecimal(value));
      if (this._value.r !== undefined) {
        [this._value.r, this._value.g, this._value.b] = [RGBA[0], RGBA[1], RGBA[2]];
      } else if (this._value.x !== undefined) {
        [this._value.x, this._value.y, this._value.z] = [RGBA[0], RGBA[1], RGBA[2]];
      } else {
        [this._value[0], this._value[1], this._value[2]] = [RGBA[0], RGBA[1], RGBA[2]];
      }
    } else if (typeof this._value === 'object' && typeof value === 'object') {
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
    this._updateInputFromValue(this._value);
  }

  get value() {
    return this._value;
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

    if (typeof value === 'string') {
      RGBA = Color.styleToRGBA(value);
    } else if (value.r !== undefined) {
      RGBA = [value.r, value.g, value.b, 1];
    } else if (value.x !== undefined) {
      RGBA = [value.x, value.y, value.z, 1];
    } else {
      RGBA = [value[0], value[1], value[2], 1];
    }

    return `#${Math.floor(RGBA[0] * 255).toString(16).padStart(2, '0')}${Math.floor(RGBA[1] * 255).toString(16).padStart(2, '0')}${Math.floor(RGBA[2] * 255).toString(16).padStart(2, '0')}`;
  }
}

window.customElements.define('input-color', ColorInputElement);
