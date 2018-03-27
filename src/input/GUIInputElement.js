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

    this.name = "";
    this.type = type;

    this.attachShadow({ mode: "open" }).innerHTML = `
      <style>
        :host {
          display: grid;
          max-width: 100%;
          grid-template-columns: auto 1fr auto;
          grid-gap: 5px;
          align-items: center;
        }

        label {
          // width: 50px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        #reset {
          width: 30px;
        }
      </style>
      <label></label>
      ${content}
      <button id=\"reset\">✕</button>
    `;
  }

  connectedCallback() {
    this.shadowRoot.addEventListener("change", this._onChangeBinded = this._onChangeBinded || this._onChange.bind(this));
    this.shadowRoot.addEventListener("input", this._onInputBinded = this._onInputBinded || this._onInput.bind(this));
    this.shadowRoot.querySelector("#reset").addEventListener("click", this._onResetBinded = this._onResetBinded || this._onReset.bind(this));
  }

  disconnectedCallback() {
    this.shadowRoot.removeEventListener("change", this._onChangeBinded);
    this.shadowRoot.removeEventListener("input", this._onInputBinded);
    this.shadowRoot.querySelector("#reset").removeEventListener("click", this._onResetBinded);
  }

  _onInput(e) {
    e.stopPropagation();
    this._updateValueFromInput(e.target);
    this.dispatchEvent(new Event("input"));
  }
  
  _onChange(e) {
    e.stopPropagation();
    this._updateValueFromInput(e.target);
    this.dispatchEvent(new Event("change"));
  }
  
  _onReset(e) {
    if(this.value === this.initialValue) {
      return;
    }
    this.value = this.initialValue;
    this.dispatchEvent(new Event("reset"));
    this.dispatchEvent(new Event("input"));
    this.dispatchEvent(new Event("change"));
  }

  _updateValueFromInput(input) {
    this.value = input.value;
  }

  _updateInputFromValue(value) {
    this.shadowRoot.querySelector("input").value = value;
  }

  set object(value) {
    this._object = value;
    if(this.object && this.key) {
      this.value = this.object[this.key];
    }
  }

  get object() {
    return this._object;
  }

  set key(value) {
    this._key = value;
    if(this.object && this.key) {
      this.value = this.object[this.key];
    }
  }

  get key() {
    return this._key;
  }

  set value(value) {
    if(this.initialValue === undefined) {
      this.initialValue = value;
    }
    this.object[this.key] = value;
    this._updateInputFromValue(value);
  }

  get value() {
    return this.object[this.key];
  }

  set label(value) {
    const label = this.shadowRoot.querySelector("label");
    label.title = value;
    label.textContent = value;
  }

  get label() {
    return this.shadowRoot.querySelector("label").textContent;
  }
}

GUIInputElement.typeResolvers.set("any", (value, attributes) => true);

window.customElements.define("dgui-input", GUIInputElement);
