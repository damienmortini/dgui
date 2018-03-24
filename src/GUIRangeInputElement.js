import GUINumberInputElement from "./GUINumberInputElement.js";

const template = document.createElement("template");
template.innerHTML = `<input type="range"/>`;

export default class GUIRangeInputElement extends GUINumberInputElement {
  constructor() {
    super();
    this.shadowRoot.insertBefore(template.content.cloneNode(true), this.shadowRoot.querySelector("input"));
    this.shadowRoot.querySelector("style").textContent += `
      :host {
        grid-template-columns: 50px 3fr 1fr 25px;
      }

      input[type="number"] {
        box-sizing: border-box;
        width: 100%;
      }
    `;
  }

  _onInput(e) {
    for (const input of this.shadowRoot.querySelectorAll("input")) {
      input.value = e.target.value;
    }
    super._onInput(...arguments);
  }
}

window.customElements.define("dgui-rangeinput", GUIRangeInputElement);
