import GUINodeElement from "./GUINodeElement.js";

export default class GUIElement extends HTMLElement {
  constructor() {
    super();

    this.attachShadow({ mode: "open" }).innerHTML = `
      <style>
        :host {
          display: block;
        }
      </style>
      <slot name="node"></slot>
    `;

    this._nodes = new Map();
  }

  set nodes(value) {
    for (const data of value) {
      this.addNode(data[1] || data);
    }
  }

  get nodes() {
    return this._nodes;
  }

  addNode(attributes) {
    const node = this.nodes.get(attributes.name) || document.createElement("dgui-node");
    Object.assign(node, attributes);
    this.nodes.set(node.name, node);
    node.slot = "node";
    this.appendChild(node);
  }

  toJSON() {
    return {
      nodes: [...this.nodes.values()]
    }
  }
}

window.customElements.define("dgui-gui", GUIElement);
