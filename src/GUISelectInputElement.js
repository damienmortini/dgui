import GUIInputElement from "./GUIInputElement.js";

const template = document.createElement("template");
template.innerHTML = `
  <select></select>
`;

export default class GUISelectInputElement extends GUIInputElement {
  constructor() {
    super();
    this.shadowRoot.replaceChild(template.content.cloneNode(true), this.shadowRoot.querySelector("input"));
    this._selectInput = this.shadowRoot.querySelector("select");
  }

  set options(value) {
    this._options = value;
    for (let index = 0; index < this._selectInput.options.length; index++) {
      this._selectInput.remove(index);
    }
    for (let option of this._options) {
      const optionElement = document.createElement("option");
      optionElement.value = option;
      optionElement.text = option;
      optionElement.selected = option === this.value;
      this._selectInput.add(optionElement);
    }
  }

  get options() {
    return this._options;
  }

  _updateInputFromValue(value) {
    if(!this.options) {
      return;
    }
    this._selectInput.selectedIndex = this.options.indexOf(value);
  }
  
  _updateValueFromInput(input) {
    this.value = this.options[input.selectedIndex];
  }
}

window.customElements.define("dgui-selectinput", GUISelectInputElement);
