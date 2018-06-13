import WebSocket from "./node_modules/dlib/utils/WebSocket.js";

import "./GUINodeElement.js";

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

  get dataFileURL() {
    return this._dataFileURL;
  }

  set dataFileURL(value) {
    this._dataFileURL = value;
    if (this.webSocket) {
      this.webSocket.send(JSON.stringify({
        type: "datafileurl",
        data: this._dataFileURL
      }));
    }
    fetch(this._dataFileURL).then((response) => {
      if(response.status !== 404) {
        return response.json();
      }
    }).then((data) => {
      if (this._dataFileURL !== value) {
        return;
      }
      Object.assign(this, data);
    });
  }

  connect({
    url = "wss://localhost:8000"
  } = {}) {
    this.webSocket = new WebSocket(url);

    if (this.dataFileURL) {
      this.webSocket.send(JSON.stringify({
        type: "datafileurl",
        data: this.dataFileURL
      }));
    }

    const sendInputData = (e) => {
      this.webSocket.send(JSON.stringify({
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
    this.webSocket.addEventListener("message", (event) => {
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
