import GUIElement from "./GUIElement.js";
import GUINodeElement from "./GUINodeElement.js";

class GUIStaticElement extends GUIElement {
  constructor() {
    super();

    this.shadowRoot.innerHTML += `
    <style>
      :host{
        position: absolute;
        top: 0;
        left: 0;
        max-height: 100%;
        overflow: auto;
      }
    </style>
    `;

    this.dataFileURL = "gui-data.json";
    this.connect();
  }

  connectedCallback() {
    this.addNode({
      label: "GUI",
      name: "main"
    });
  }

  get inputs() {
    return this.nodes.get("main").inputs;
  }

  get open() {
    return this.nodes.get("main").open;
  }

  set open(value) {
    this.nodes.get("main").open = value;
  }

  add(...parameters) {
    return this.nodes.get("main").addInput(...parameters);
  }
}

window.customElements.define("dgui-staticgui", GUIStaticElement);

const GUI = document.createElement("dgui-staticgui");
document.body.appendChild(GUI);

export default GUI;