import GUIInputElement from "./input/GUIInputElement.js";
import "./input/GUINumberInputElement.js";
import "./input/GUITextInputElement.js";
import "./input/GUIRangeInputElement.js";
import "./input/GUISelectInputElement.js";
import "./input/GUICheckboxInputElement.js";
import "./input/GUIButtonInputElement.js";
import "./input/GUIColorInputElement.js";

export default class GUINodeElement extends HTMLElement {
  constructor() {
    super();

    this.attachShadow({ mode: "open" }).innerHTML = `
      <style>
        :host {
          display: block; 
          resize: horizontal;
          max-width: 100%;
          padding: 5px;
          font-family: monospace;
          max-height: 100%;
          box-sizing: border-box;
          overflow: auto;
        }

        details summary {
          outline: none;
        }
      </style>
      <details>
        <summary></summary>
        <slot name="input"></slot>
      </details>
    `;

    this._inputs = new Map();

    this._container = this.shadowRoot.querySelector("details");

    this.open = true;
  }

  set inputs(value) {
    const dataArray = Array.from(value);
    for (const data of (dataArray.length ? dataArray : Object.entries(value))) {
      this.addInput(data[1] || data);
    }
  }

  get inputs() {
    return this._inputs;
  }

  set name(value) {
    this.setAttribute("name", value);
  }

  get name() {
    return this.getAttribute("name") || this.label.toLowerCase();
  }

  set label(value) {
    this._container.querySelector("summary").textContent = value;
  }

  get label() {
    return this._container.querySelector("summary").textContent;
  }

  set open(value) {
    this._container.open = value;
  }

  get open() {
    return this._container.open;
  }

  addInput(object, key, attributes) {
    if(!key && !attributes) {
      attributes = object;
      object = undefined;
    }
    attributes = Object.assign({}, attributes);

    if (!attributes.type) {
      GUIInputElement.typeResolvers.forEach((resolver, type) => {
        if (resolver(attributes.value || (object ? object[key] : undefined), attributes)) {
          attributes.type = type;
        }
      });
    }
    
    let input = this.inputs.get(attributes.name || attributes.label || attributes.key);
    
    if(!input) {
      input = document.createElement(window.customElements.get(`dgui-${attributes.type}input`) ? `dgui-${attributes.type}input` : "dgui-input");
      input.slot = "input";
      this.appendChild(input);
    }
    Object.assign(input, Object.assign({
      object,
      key
    }, attributes));
    this.inputs.set(input.name, input);

    return input;
  }

  toJSON() {
    const inputs = {};
    for (const [key, value] of this.inputs) {
      inputs[key] = value.toJSON();
    }
    return {
      name: this.name,
      label: this.label,
      inputs: inputs
    }
  }
}

window.customElements.define("dgui-node", GUINodeElement);
