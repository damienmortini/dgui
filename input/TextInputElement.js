export default class TextInputElement extends HTMLElement {
  constructor() {
    super();

    this.type = "text";

    this.attachShadow({ mode: "open" }).innerHTML = `
      <style>
        :host {
          display: inline-block;
        }
        textarea {
          width: 100%;
          height: 100%;
          box-sizing: border-box;
          vertical-align: middle;
        }
      </style>
      <textarea rows="1"></textarea>
    `;

    this._textarea = this.shadowRoot.querySelector("textarea");

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
  }

  disconnectedCallback() {
    this.shadowRoot.removeEventListener("change", this._onChangeBinded);
  }

  _onChange(event) {
    this.dispatchEvent(new event.constructor(event.type, event));
  }

  set value(value) {
    this._textarea.value = value;
  }

  get value() {
    return this._textarea.value;
  }

  set disabled(value) {
    this._textarea.disabled = value;
  }

  get disabled() {
    return this._textarea.disabled;
  }
}

window.customElements.define("dgui-input-text", TextInputElement);
