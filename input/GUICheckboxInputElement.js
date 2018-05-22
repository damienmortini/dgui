import GUIInputElement from "./GUIInputElement.js";

export default class GUICheckboxInputElement extends GUIInputElement {
  constructor() {
    super({
      type: "checkbox"
    });
  }

  _onChange(e) {
    super._onInput(e);
    super._onChange(e);
  }

  _updateInputFromValue(value) {
    this.shadowRoot.querySelector("input").checked = value;
  }

  _updateValueFromInput(input) {
    this.value = input.checked;
  }
}

GUIInputElement.typeResolvers.set("checkbox", (value, attributes) => typeof value === "boolean");

window.customElements.define("dgui-checkboxinput", GUICheckboxInputElement);
