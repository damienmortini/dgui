import "../misc/DraggableHandlerElement.js";
import GUIConfig from "../gui/GUIConfig.js";

export default class NodeGroupElement extends HTMLElement {
  static get observedAttributes() {
    return ["name", "draggable"];
  }

  constructor() {
    super();

    this.attachShadow({ mode: "open" }).innerHTML = `
      <style>
        :host {
          display: block;
          resize: both;
          padding: 5px;
          max-width: 100%;
          max-height: 100%;
          box-sizing: border-box;
          overflow: auto;
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
        <summary><span class="name"></span><dgui-draggable-handler data-target="this.getRootNode().host"></dgui-draggable-handler></summary>
        <slot></slot>
      </details>
    `;

    this._container = this.shadowRoot.querySelector("details");
    this.open = true;

    // this._draggableHandler = new DraggableHandler(this, this.shadowRoot.querySelector("summary"));

    this._nodes = new Map();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) {
      return;
    }
    this[name] = name === "draggable" ? newValue === "true" : newValue;
  }

  set nodes(value) {
    this.innerHTML = "";
    for (let node of value) {
      if (!node.type) {
        node.type = "text";
        for (const typeResolverKey in GUIConfig.typeResolvers) {
          node.type = GUIConfig.typeResolvers[typeResolverKey](node) ? typeResolverKey : node.type;
        }
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
    this._container.querySelector("summary .name").textContent = this._name;
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

  get draggable() {
    return super.draggable;
  }

  set draggable(value) {
    super.draggable = value;
  }

  addInput(object, key, attributes) {
    if (!key && !attributes) {
      attributes = object;
      object = undefined;
    }
    attributes = Object.assign({}, attributes);

    let input = this.inputs.get(attributes.name || attributes.label || attributes.key);

    if (!input) {
      input = document.createElement(window.customElements.get(`dgui-${attributes.type}input`) ? `dgui-${attributes.type}input` : "dgui-input");
      input.slot = "input";
      this.appendChild(input);
    }
    Object.assign(input, Object.assign({
      object,
      key,
    }, attributes));
    this.inputs.set(input.name, input);

    return input;
  }

  toJSON() {
    return {
      name: this.name,
      nodes: this.nodes,
    };
  }
}

window.customElements.define("dgui-node-group", NodeGroupElement);
