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

  connect(url = "ws://localhost") {
    const socket = new WebSocket(url);
    const sendInputData = (e) => {
      if(socket.readyState !== WebSocket.OPEN) {
        return;
      }
      socket.send(JSON.stringify({
        type: e.type,
        data: Object.assign(this.toJSON(), {
          nodes: {
            [e.target.parentElement.name]: Object.assign(e.target.parentElement.toJSON(), {
              inputs: {
                [e.target.name]: e.target.toJSON()
              }
            })
          }
        })
      }));
    }
    socket.addEventListener("message", (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "change") {
        this.removeEventListener("change", sendInputData);
        Object.assign(this, data.data);
        this.addEventListener("change", sendInputData);
      }
    });
    this.addEventListener("change", sendInputData);
    this.addEventListener("save", sendInputData);
  }

  set nodes(value) {
    const dataArray = Array.from(value);
    for (const data of (dataArray.length ? dataArray : Object.entries(value))) {
      this.addNode(data[1] || data);
    }
  }

  get nodes() {
    return this._nodes;
  }

  addNode(attributes) {
    let node = this.nodes.get(attributes.name);
    if (!node) {
      node = document.createElement("dgui-node");
      node.slot = "node";
      this.appendChild(node);
    }
    Object.assign(node, attributes);
    this.nodes.set(node.name, node);
  }

  toJSON() {
    const nodes = {};
    for (const [key, value] of this.nodes) {
      nodes[key] = value.toJSON();
    }
    return {
      nodes
    }
  }
}

window.customElements.define("dgui-gui", GUIElement);
