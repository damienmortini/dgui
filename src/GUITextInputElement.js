import GUIInputElement from "./GUIInputElement.js";

const template = document.createElement("template");
template.innerHTML = `
  <style>
    textarea {
      box-sizing: border-box;
    }
  </style>
  <textarea rows="1"></textarea>
`;

export default class GUITextInputElement extends GUIInputElement {
  constructor() {
    super();
    this.shadowRoot.replaceChild(template.content.cloneNode(true), this.shadowRoot.querySelector("input"));
  }

  _updateValue() {
    this.value = this.shadowRoot.querySelector("textarea").value;
  }

  _updateInput() {
    this.shadowRoot.querySelector("textarea").value = this.value;
  }
}

window.customElements.define("dgui-textinput", GUITextInputElement);
