import "../node/NodeElement.js";

export default class CheckboxInputNodeElement extends HTMLElement {
  static get observedAttributes() {
    return ["name", "value", "disabled"];
  }

  constructor() {
    super();

    this.type = "checkbox";

    this.attachShadow({ mode: "open" }).innerHTML = `
      <style>
        :host {
          display: block;
        }
        label {
          margin-right: 10px;
        }
        input {
          flex: 1;
          margin : 0;
        }
      </style>
      <dgui-node>
        <label></label>
        <input type="checkbox"></input>
      </dgui-node>
    `;

    this._input = this.shadowRoot.querySelector("input");
    this._label = this.shadowRoot.querySelector("label");

    this.shadowRoot.addEventListener("change", (event) => {
      this.dispatchEvent(new event.constructor(event.type, event));
    });
  }

  attributeChangedCallback(name, oldValue, newValue) {
    this[name] = name === "disabled" ? newValue !== null : newValue;
  }

  get defaultValue() {
    return this._input.defaultChecked;
  }

  set defaultValue(value) {
    this._input.defaultChecked = value;
  }

  get value() {
    return this._input.checked;
  }

  set value(value) {
    this._input.checked = value;
  }

  get name() {
    return this._input.name;
  }

  set name(value) {
    this._label.textContent = value;
    this._input.name = value;
  }

  get disabled() {
    return this._input.disabled;
  }

  set disabled(value) {
    this._input.disabled = value;
  }
}

window.customElements.define("dgui-node-input-checkbox", CheckboxInputNodeElement);
