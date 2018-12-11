import Config from "../dnod.config.js";

export default class EditorElement extends HTMLElement {
  static get observedAttributes() {
    return ["draggable", "zoomable"];
  }

  constructor() {
    super();

    this.attachShadow({ mode: "open" }).innerHTML = `
      <style>
        :host {
          display: block;
        }

        dnod-zoomable, dnod-draggable {
          position: absolute;
          width: 100%;
          height: 100%;
        }
      </style>
      <dnod-zoomable handle="this.getRootNode().host" min=".1" max="3">
        <dnod-draggable handle="this.getRootNode().host">
            <slot></slot>
        </dnod-draggable>
      </dnod-zoomable>
    `;

    this._zoomable = this.shadowRoot.querySelector("dnod-zoomable");
    this._draggable = this.shadowRoot.querySelector("dnod-draggable");

    this._zoomable.addEventListener("zoom", () => {
      this._draggable.dragFactor = 1 / this._zoomable.zoom;
    });

    this._nodesDataMap = new Map();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) {
      return;
    }
    this[name] = newValue === "true";
  }

  get zoomable() {
    return this._zoomable.disabled;
  }

  set zoomable(value) {
    this._zoomable.disabled = !value;
  }

  get draggable() {
    return this._draggable.disabled;
  }

  set draggable(value) {
    this._draggable.disabled = !value;
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
