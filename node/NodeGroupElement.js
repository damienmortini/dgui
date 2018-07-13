import "../misc/DraggableHandlerElement.js";
import GUIConfig from "../gui/GUIConfig.js";

export default class NodeGroupElement extends HTMLElement {
  static get observedAttributes() {
    return ["name"];
  }

  constructor() {
    super();

    this.attachShadow({ mode: "open" }).innerHTML = `
      <style>
        :host {
          display: block;
          padding: 5px;
          max-width: 100%;
          max-height: 100%;
          box-sizing: border-box;
        }

        dgui-draggable-handler {
          position: absolute;
          width: calc(100% - 2px);
          left: 1px;
        }

        details summary {
          position: relative;
          padding: 5px;
          outline: none;
        }
      </style>
      <details>
        <summary><span></span><dgui-draggable-handler data-target="this.getRootNode().host"></dgui-draggable-handler></summary>
        <slot></slot>
      </details>
    `;

    this._container = this.shadowRoot.querySelector("details");
    this.open = true;

    this._nodes = new Map();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) {
      return;
    }
    this[name] = newValue;
  }

  set nodes(value) {
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

      let nodeElement = this._nodes.get(node.name) || document.createElement(GUIConfig.inputTypeMap[node.type] || node.type);
      this._nodes.set(node.name, nodeElement);
      Object.assign(nodeElement, node);
      this.appendChild(nodeElement);
    }
  }

  get nodes() {
    return JSON.parse(JSON.stringify([...this._nodes.values()]));
  }

  set name(value) {
    this._name = value;
    this._container.querySelector("summary span").textContent = this._name;
  }

  get name() {
    return this._name;
  }

  set open(value) {
    this._container.open = value;
  }

  get open() {
    return this._container.open;
  }

  toJSON() {
    return {
      name: this.name,
      nodes: this.nodes,
    };
  }
}

window.customElements.define("dgui-node-group", NodeGroupElement);
