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
    this.button.onclick = (e) => {
      if(this.onclick) {
        this.value = this._onclick(e);
        this.dispatchEvent(new Event("input", {
          bubbles: true
        }));
      } else {
        this.value.call(this.object);
      }
    };
  }

  _updateInputFromValue() { }

  _updateValueFromInput() { }

  set onclick(value) {
    this._onclick = value;
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

GUIInputElement.typeResolvers.set("button", (value, attributes) => typeof value === "function" || attributes.onclick !== undefined);

window.customElements.define("dgui-buttoninput", GUIButtonInputElement);
