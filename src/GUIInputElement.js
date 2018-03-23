const TEMPLATE = document.createElement("template");
TEMPLATE.innerHTML = `
  <style>
    :host {
      display: block;
    }
  </style>
  <label></label>
  <input>
  <button class=\"clear\">✕</button>
`;

export default class GUIInputElement extends HTMLElement {
  constructor() {
    super();

    this.name = "";

    this.attachShadow({ mode: "open" }).appendChild(document.importNode(TEMPLATE.content, true));
  }

  set object(value) {
    this._object = value;
  }

  get object() {
    return this._object;
  }

  set key(value) {
    this._key = value;
  }

  get key() {
    return this._key;
  }

  set value(value) {
    if(value === this.object[this.key]) {
      return;
    }
    this.object[this.key] = value;
    this.shadowRoot.querySelector("input").value = value;
  }

  get value() {
    return this.object[this.key];
  }

  set label(value) {
    this.shadowRoot.querySelector("label").textContent = value;
  }

  get label() {
    return this.shadowRoot.querySelector("label").textContent;
  }
}

window.customElements.define("dgui-input", GUIInputElement);
