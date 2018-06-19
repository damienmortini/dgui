export default class TextInputElement extends HTMLElement {
  constructor() {
    super();

    this.type = "text";

    this.attachShadow({ mode: "open" }).innerHTML = `
      <style>
        textarea {
          width: 100%;
          height: 100%;
          box-sizing: border-box;
          resize: vertical;
          vertical-align: middle;
        }
      </style>
      <textarea rows="1"></textarea>
    `;

    this._textarea = this.shadowRoot.querySelector("textarea");

    if (this.getAttribute("value")) {
      this.value = this.getAttribute("value");
    }
  }

  connectedCallback() {
    this.shadowRoot.addEventListener("change", this._onChangeBinded = this._onChangeBinded || this._onChange.bind(this));
  }

  disconnectedCallback() {
    this.shadowRoot.removeEventListener("change", this._onChangeBinded);
  }

  _onChange(event) {
    this.dispatchEvent(new event.constructor(event.type, event));
  }

  set value(value) {
    if (this.defaultValue === undefined) {
      this.defaultValue = value;
    }

    this._textarea.value = value;
  }

  get value() {
    return this._textarea.value;
  }
}

window.customElements.define("input-text", TextInputElement);
