import GUIInputElement from "./GUIInputElement.js";

const template = document.createElement("template");
template.innerHTML = `<input type="range"/><input type="number"/>`;

export default class GUIRangeInputElement extends GUIInputElement {
  constructor() {
    super();
    this.shadowRoot.replaceChild(document.importNode(template.content, true), this.shadowRoot.querySelector("input"));
  }
}

window.customElements.define("dgui-rangeinput", GUIRangeInputElement);
