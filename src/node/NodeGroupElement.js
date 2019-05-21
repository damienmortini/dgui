import "../misc/DraggableElement.js";
import Config from "../graph.config.js";

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

        graph-draggable {
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
        <summary><span></span><graph-draggable data-target="this.getRootNode().host"></graph-draggable></summary>
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
        for (const typeResolverKey in Config.typeResolvers) {
          node.type = Config.typeResolvers[typeResolverKey](node) ? typeResolverKey : node.type;
        }
      }

      if (!node.type && node.nodes) {
        node.type = "graph-node-group";
      }

      let nodeElement = this._nodes.get(node.name) || document.createElement(Config.inputTypeMap[node.type] || node.type);
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

window.customElements.define("graph-node-group", NodeGroupElement);
