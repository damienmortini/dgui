import GUIInputElement from "./GUIInputElement.js";

export default class GUITextInputElement extends GUIInputElement {
  constructor() {
    super({
      type: "text",
      content: `
      <style>
        textarea {
          box-sizing: border-box;
          resize: vertical;
        }
      </style>
      <textarea rows="1"></textarea>`
    });
  }

  _updateInputFromValue(value) {
    this.shadowRoot.querySelector("textarea").value = value;
  }
}

GUIInputElement.typeResolvers.set("text", (value, attributes) => typeof value === "string");

window.customElements.define("dgui-textinput", GUITextInputElement);
