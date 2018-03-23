import GUIInputElement from "./GUIInputElement.js";

const template = document.createElement("template");
template.innerHTML = `<textarea slot="input"></textarea>`;

export default class GUITextInputElement extends GUIInputElement {
  constructor() {
    super();
    this.shadowRoot.replaceChild(document.importNode(template.content, true), this.shadowRoot.querySelector("input"));
  }
}

window.customElements.define("dgui-textinput", GUITextInputElement);
