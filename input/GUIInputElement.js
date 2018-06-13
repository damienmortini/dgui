const TYPE_RESOLVERS = new Map();

export default class GUIInputElement extends HTMLElement {
  static get typeResolvers() {
    return TYPE_RESOLVERS;
  }

  constructor({
    type = "",
    content = `<input type="${type}"></input>`
  } = {}) {
    super();

    this.type = type;

    this.attachShadow({ mode: "open" }).innerHTML = `
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
      ${content}
      <button id=\"save\">Save</button>
      <button id=\"reset\">✕</button>
    `;
  }

  connectedCallback() {
    this.shadowRoot.addEventListener("change", this._onChangeBinded = this._onChangeBinded || this._onChange.bind(this));
    this.shadowRoot.addEventListener("input", this._onInputBinded = this._onInputBinded || this._onInput.bind(this));
    this.shadowRoot.querySelector("#reset").addEventListener("click", this._onResetBinded = this._onResetBinded || this._onReset.bind(this));
    this.shadowRoot.querySelector("#save").addEventListener("click", this.saveBinded = this.saveBinded || this.save.bind(this));
  }

  disconnectedCallback() {
    this.shadowRoot.removeEventListener("change", this._onChangeBinded);
    this.shadowRoot.removeEventListener("input", this._onInputBinded);
    this.shadowRoot.querySelector("#reset").removeEventListener("click", this._onResetBinded);
  }

  save() {
    this.dispatchEvent(new Event("save", {
      bubbles: true
    }));
  }

  _onInput(e) {
    e.stopPropagation();
    this._updateValueFromInput(e.target);
    this.dispatchEvent(new Event("input", {
      bubbles: true
    }));
  }

  _onChange(e) {
    e.stopPropagation();
    this._updateValueFromInput(e.target);
  }

  _onReset(e) {
    this.value = this.initialValue;
    this.dispatchEvent(new Event("input", {
      bubbles: true
    }));
    this.dispatchEvent(new Event("reset", {
      bubbles: true
    }));
  }

  _updateValueFromInput(input) {
    this.value = input.value;
  }

  _updateInputFromValue(value) {
    this.shadowRoot.querySelector("input").value = value;
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
    this.setAttribute("name", this.name);
  }

  get key() {
    return this._key;
  }

  set value(value) {
    this._value = value;
    
    if (this.object && this.key) {
      this.object[this.key] = this._value;
    }
    this._updateInputFromValue(this._value);

    if (this.initialValue === undefined) {
      this.initialValue = this._value;
    } else {
      this.dispatchEvent(new Event("change", {
        bubbles: true
      }));
    }
  }

  get value() {
    return this._value;
  }

  set label(value) {
    this._label = value;
    const label = this.shadowRoot.querySelector("label");
    label.title = this._label;
    label.textContent = this._label;
    this.setAttribute("name", this.name);
  }

  get label() {
    return this._label || this._name || this._key;
  }

  set name(value) {
    this._name = value;
    this.setAttribute("name", this.name);
  }

  get name() {
    return this._name || this.label || this.key;
  }

  toJSON() {
    return {
      name: this.name,
      label: this.label,
      type: this.type,
      value: this.value
    };
  }
}

GUIInputElement.typeResolvers.set("any", (value, attributes) => true);

window.customElements.define("dgui-input", GUIInputElement);
