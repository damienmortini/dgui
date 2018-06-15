const TYPE_RESOLVERS = new Map();

export default class GUIInputElement extends HTMLElement {
  static get typeResolvers() {
    return TYPE_RESOLVERS;
  }

  static get typeMap() {
    return new Map([
      ['color', 'dgui-colorinput'],
    ]);
  }

  constructor() {
    super();

    this.attachShadow({mode: 'open'}).innerHTML = `
      <style>
        :host {
          display: grid;
          max-width: 100%;
          grid-template-columns: auto 1fr auto auto;
          grid-gap: 5px;
          align-items: center;
        }

        label {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        button {
          height: 100%;
        }

        #reset {
          width: 30px;
        }
      </style>
      <label></label>
      <slot></slot>
      <button id="save">Save</button>
      <button id="reset">✕</button>
    `;

    this.type = this.getAttribute('type') || 'text';
    this.name = this.getAttribute('name');
    this.label = this.getAttribute('label');
    this.value = this.getAttribute('value');
  }

  set type(value) {
    if (this._type === value) {
      return;
    }
    this._type = value;

    this._input = document.createElement(GUIInputElement.typeMap.get(this._type) || 'input');
    this._input.type = this._type;
    this.appendChild(this._input);
  }

  get type() {
    return this._type;
  }

  connectedCallback() {
    this.shadowRoot.querySelector('#reset').addEventListener('click', this._onResetBinded = this._onResetBinded || this._onReset.bind(this));
    this.shadowRoot.querySelector('#save').addEventListener('click', this.saveBinded = this.saveBinded || this.save.bind(this));
  }

  disconnectedCallback() {
    this.shadowRoot.querySelector('#reset').removeEventListener('click', this._onResetBinded);
  }

  save() {
    this.dispatchEvent(new Event('save', {
      bubbles: true,
    }));
  }

  _onReset(e) {
    this.value = this.initialValue;
    this.dispatchEvent(new Event('input', {
      bubbles: true,
    }));
    this.dispatchEvent(new Event('reset', {
      bubbles: true,
    }));
  }

  set object(value) {
    this._object = value;
    if (this.initialValue === undefined && this.object && this.key) {
      this.value = this.object[this.key];
    }
  }

  get object() {
    return this._object;
  }

  set key(value) {
    this._key = value;
    if (this.initialValue === undefined && this.object && this.key) {
      this.value = this.object[this.key];
    }
    this.setAttribute('name', this.name);
  }

  get key() {
    return this._key;
  }

  set value(value) {
    this._value = value;

    if (this.object && this.key) {
      this.object[this.key] = this._value;
    }

    this._input = value;

    if (this.initialValue === undefined) {
      this.initialValue = this._value;
    } else {
      this.dispatchEvent(new Event('change', {
        bubbles: true,
      }));
    }
  }

  get value() {
    return this._input.value;
  }

  set label(value) {
    this._label = value;
    const label = this.shadowRoot.querySelector('label');
    label.title = this._label;
    label.textContent = this._label;
  }

  get label() {
    return this._label || this._name || this._key;
  }

  set name(value) {
    this._input.name = value;
  }

  get name() {
    return this._input.name || this.label || this.key;
  }

  toJSON() {
    return {
      name: this.name,
      label: this.label,
      type: this.type,
      value: this.value,
    };
  }
}

GUIInputElement.typeResolvers.set('any', (value, attributes) => true);

window.customElements.define('dgui-input', GUIInputElement);
