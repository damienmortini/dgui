import GUIInputElement from "./GUIInputElement.js";

export default class GUINumberInputElement extends GUIInputElement {
  constructor() {
    super();
    this.shadowRoot.querySelector("input").type = "number";
  }
}

window.customElements.define("dgui-numberinput", GUINumberInputElement);
