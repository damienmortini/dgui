import Config from "../dnod.config.js";

import "../misc/DraggableElement.js";
import "../misc/ZoomableElement.js";

export default class NodeEditor extends HTMLElement {
  constructor() {
    super();

    this.attachShadow({ mode: "open" }).innerHTML = `
      <style>
        :host {
          display: block;
          width: 100%;
          height: 100%;
        }

        dnod-zoomable {
          position: absolute;
          width: 100%;
          height: 100%;
        }
      </style>
      <dnod-node-link-system data-listener="this.getRootNode().host"></dnod-node-link-system>
      <dnod-zoomable data-handle="this.getRootNode().host" min=".1" max="3">
        <dnod-draggable data-handle="this.getRootNode().host">
          <slot></slot>
        </dnod-draggable>
      </dnod-zoomable>
    `;

    const zoomable = this.shadowRoot.querySelector("dnod-zoomable");
    const draggable = this.shadowRoot.querySelector("dnod-draggable");

    zoomable.addEventListener("zoom", () => {
      draggable.dragFactor = 1 / zoomable.zoom;
    });

    this._nodesDataMap = new Map();
  }

  get nodesData() {
    return JSON.parse(JSON.stringify([...this._nodesDataMap.values()]));
  }

  set nodesData(value) {
    this.innerHTML = "";
    for (let node of value) {
      if (!node.type) {
        for (const typeResolverKey in Config.typeResolvers) {
          node.type = Config.typeResolvers[typeResolverKey](node) ? typeResolverKey : node.type;
        }
      }

      if (!node.type && node.nodes) {
        node.type = "dnod-node-group";
      }

      let nodeElement = this._nodesDataMap.get(node.name) || document.createElement(Config.inputTypeMap[node.type] || node.type);
      this._nodesDataMap.set(node.name, nodeElement);
      Object.assign(nodeElement, node);
      this.appendChild(nodeElement);
    }
  }
}

window.customElements.define("dnod-node-editor", NodeEditor);
