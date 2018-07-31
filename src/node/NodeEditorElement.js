import GUIConfig from "../gui.config.js";

import "../misc/DraggableElement.js";
import "../misc/ZoomableElement.js";

export default class NodeEditor extends HTMLElement {
  constructor() {
    super();

    this.attachShadow({ mode: "open" }).innerHTML = `
      <style>
        :host {
          display: block;
        }

        dgui-zoomable, dgui-draggable {
          position: absolute;
          left: 0;
          top: 0;
          will-change: transform;
        }

        dgui-draggable:hover {
          outline: none;
        }
        
        dgui-zoomable {
          width: 100%;
          height: 100%;
        }
      </style>
      <dgui-node-link-system data-listener="this.getRootNode().host"></dgui-node-link-system>
      <dgui-zoomable data-listener="this.getRootNode().host" min=".1" max="3">
        <dgui-draggable draggable="true" data-deep-drag-factor="true" data-handle="this.getRootNode().host">
          <slot></slot>
        </dgui-draggable>
      </dgui-zoomable>
    `;

    const zoomable = this.shadowRoot.querySelector("dgui-zoomable");
    const draggable = this.shadowRoot.querySelector("dgui-draggable");

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
        for (const typeResolverKey in GUIConfig.typeResolvers) {
          node.type = GUIConfig.typeResolvers[typeResolverKey](node) ? typeResolverKey : node.type;
        }
      }

      if (!node.type && node.nodes) {
        node.type = "dgui-node-group";
      }

      let nodeElement = this._nodesDataMap.get(node.name) || document.createElement(GUIConfig.inputTypeMap[node.type] || node.type);
      this._nodesDataMap.set(node.name, nodeElement);
      Object.assign(nodeElement, node);
      this.appendChild(nodeElement);
    }
  }
}

window.customElements.define("dgui-node-editor", NodeEditor);
