const TEMPLATE = document.createElement("template");
TEMPLATE.innerHTML = `
  <style>
    :host {
      display: grid;
      max-width: 100%;
      grid-template-columns: 50px 1fr 25px;
      grid-gap: 5px;
      align-items: center;
    }

    label {
      overflow: hidden;
      text-overflow: ellipsis;
    }
  </style>
  <label></label>
  <input></input>
  <button id=\"reset\">✕</button>
`;

export default class GUIInputElement extends HTMLElement {
  constructor() {
    super();

    this.name = "";

    this.attachShadow({ mode: "open" }).appendChild(document.importNode(TEMPLATE.content, true));
  }

  connectedCallback() {
    this.shadowRoot.addEventListener("change", this._onChangeBinded = this._onChangeBinded || this._onChange.bind(this));
    this.shadowRoot.addEventListener("input", this._onInputBinded = this._onInputBinded || this._onInput.bind(this));
    this.shadowRoot.querySelector("#reset").addEventListener("click", this._onResetBinded = this._onResetBinded || this._onReset.bind(this));
  }

  disconnectedCallback() {
    this.shadowRoot.removeEventListener("change", this._onChangeBinded);
    this.shadowRoot.removeEventListener("input", this._onInputBinded);
    this.shadowRoot.querySelector("#reset").addEventListener("click", this._onResetBinded);
  }

  _onInput(e) {
    this._updateValue();
    this.dispatchEvent(new Event("input"));
  }

  _onChange(e) {
    this._updateValue();
    this.dispatchEvent(new Event("change"));
  }

  _onReset(e) {
    this.value = this.initialValue;
    this.dispatchEvent(new Event("reset"));
  }

  _updateValue() {
    this.value = this.shadowRoot.querySelector("input").value;
  }

  _updateInput() {
    this.shadowRoot.querySelector("input").value = this.value;
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
    console.log(value);
    
    this.object[this.key] = value;
    this._updateInput();
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

window.customElements.define("dgui-input", GUIInputElement);
