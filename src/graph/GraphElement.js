import Config from "../graph.config.js";

export default class GraphElement extends HTMLElement {
  static get observedAttributes() {
    return ["draggable", "zoomable"];
  }

  constructor() {
    super();

    this.childrenMap = new Map();

    this.attachShadow({ mode: "open" }).innerHTML = `
      <style>
        :host {
          display: block;
        }

        graph-zoomable, graph-draggable {
          position: absolute;
          width: 100%;
          height: 100%;
        }
      </style>
      <graph-zoomable handle="this.getRootNode().host" min=".1" max="3">
        <graph-draggable handle="this.getRootNode().host">
            <slot></slot>
        </graph-draggable>
      </graph-zoomable>
    `;

    this._zoomable = this.shadowRoot.querySelector("graph-zoomable");
    this._draggable = this.shadowRoot.querySelector("graph-draggable");

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
    for (const node of value) {
      if (!node.type) {
        for (const typeResolverKey in Config.typeResolvers) {
          node.type = Config.typeResolvers[typeResolverKey](node) ? typeResolverKey : node.type;
        }
      }

      if (!node.type && node.nodes) {
        node.type = "graph-node-group";
      }

      const nodeElement = this._nodesDataMap.get(node.name) || document.createElement(Config.inputTypeMap[node.type] || node.type);
      this._nodesDataMap.set(node.name, nodeElement);
      Object.assign(nodeElement, node);
      this.appendChild(nodeElement);
    }
  }

  get data() {
    return JSON.parse(JSON.stringify([...this._nodesDataMap.values()]));
  }

  set data(value) {
    this.innerHTML = "";

    const addChildren = (parent, children) => {
      for (const child of children) {
        const element = document.createElement(child.type);
        for (const key in child) {
          if (key === "children" || key === "type") {
            continue;
          }
          element[key] = child[key];
        }
        if (child.children) {
          addChildren(element, child.children);
        }
        parent.appendChild(element);
      }
    };

    addChildren(this, value.children);

    for (const child of value.children) {
      // if (!node.type) {
      //   for (const typeResolverKey in Config.typeResolvers) {
      //     node.type = Config.typeResolvers[typeResolverKey](node) ? typeResolverKey : node.type;
      //   }
      // }

      // if (!node.type && node.nodes) {
      //   node.type = "graph-node-group";
      // }

      // const nodeElement = this._nodesDataMap.get(node.name) || document.createElement(Config.inputTypeMap[node.type] || node.type);
      // this._nodesDataMap.set(node.name, nodeElement);
      // Object.assign(nodeElement, node);
      // this.appendChild(nodeElement);
    }
  }
}
