import GUIInputElement from "./GUIInputElement.js";

export default class GUIButtonInputElement extends GUIInputElement {
  constructor() {
    super({
      type: "button",
      content: `
        <style>
          :host {
            grid-template-columns: 1fr auto auto;
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

  _updateInputFromValue() { }

  _updateValueFromInput() { }

  set onclick(value) {
    this._onclick = value;
    this.button.onclick = (e) => {
      this.value = value(e);
      this.dispatchEvent(new Event("input", {
        bubbles: true
      }));
    };
  }

  get onclick() {
    return this._onclick;
  }

  set label(value) {
    this.button.textContent = value;
    super.label = value;
  }
  
  get label() {
    return super.label;
  }
}

GUIInputElement.typeResolvers.set("button", (value, attributes) => attributes.onclick !== undefined);

window.customElements.define("dgui-buttoninput", GUIButtonInputElement);
