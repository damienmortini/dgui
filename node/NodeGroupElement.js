import "./NodeElement.js";
import DraggableHandler from "./DraggableHandler.js";
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

        details summary {
          padding: 5px;
          background: lightgrey;
          outline: none;
        }
      </style>
      <details>
        <summary></summary>
        <slot></slot>
      </details>
    `;

    this._container = this.shadowRoot.querySelector("details");
    this.open = true;

    this._draggableHandler = new DraggableHandler(this, this.shadowRoot.querySelector("summary"));

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

    for (let component of value) {
      if (this._nodes.has(component.name)) {
        Object.assign(this.nodes.get(component.name), component);
      } else {
        let componentElement;
        if (component.nodes) {
          componentElement = document.createElement("dgui-node-group");
        } else {
          componentElement = document.createElement(GUIConfig.inputTypeMap[component.type]);
        }
        Object.assign(componentElement, component);
        this.appendChild(componentElement);
        this._nodes.set(component.name, componentElement);
      }
    }
  }

  get nodes() {
    return this._nodes.values();
  }

  set name(value) {
    this._name = value;
    this._container.querySelector("summary").textContent = this._name;
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
    this._draggableHandler.enabled = value;
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
    const inputs = [];
    for (const child of this.children) {
      inputs.push(child.toJSON ? child.toJSON() : {
        name: child.name,
        type: child.type,
        value: child.value,
      });
    }
    return {
      name: this.name,
      inputs: inputs,
    };
  }
}

window.customElements.define("dgui-node-group", NodeGroupElement);
