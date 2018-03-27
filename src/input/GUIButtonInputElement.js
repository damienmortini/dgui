import GUIInputElement from "./GUIInputElement.js";

export default class GUIButtonInputElement extends GUIInputElement {
  constructor() {
    super({
      type: "button",
      content: `
        <style>
          :host {
            grid-template-columns: 1fr auto;
          }

          label {
            display: none;
          }
        </style>
        <button></button>
      `
    });
    this.button = this.shadowRoot.querySelector("button");
  }

  connectedCallback() {
    this.button.addEventListener("click", this._onClickBinded = this._onClickBinded || this._onClick.bind(this));
    super.connectedCallback();
  }

  disconnectedCallback() {
    this.button.removeEventListener("click", this._onClickBinded);
    super.disconnectedCallback();
  }

  _updateInputFromValue() {}

  _updateValueFromInput() {}

  _onClick(e) {
    this.value();
    super._onInput(e);
    super._onChange(e);
  }

  set label(value) {
    this.button.textContent = value;
  }

  get label() {
    return this.button.textContent;
  }
}

GUIInputElement.typeResolvers.set("button", (value, attributes) => typeof value === "function");

window.customElements.define("dgui-buttoninput", GUIButtonInputElement);
