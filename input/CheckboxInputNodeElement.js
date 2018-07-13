import "../misc/DraggableHandlerElement.js";

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
          display: grid;
          grid-template-columns: auto auto auto 1fr auto;
          grid-gap: 5px;
          align-items: center;
        }
        input {
          flex: 1;
          margin : 0;
        }
      </style>
      <dgui-node-connector data-destination="this.getRootNode().host"></dgui-node-connector>
      <dgui-draggable-handler data-target="this.getRootNode().host"></dgui-draggable-handler>
      <label></label>
      <input type="checkbox"></input>
      <dgui-node-connector data-source="this.getRootNode().host"></dgui-node-connector>
    `;

    this._input = this.shadowRoot.querySelector("input");
    this._label = this.shadowRoot.querySelector("label");

    const dispatchEvent = (event) => {
      this.dispatchEvent(new event.constructor(event.type, event));
    };
    this.shadowRoot.addEventListener("input", dispatchEvent);
    this.shadowRoot.addEventListener("change", dispatchEvent);
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

  toJSON() {
    return {
      name: this.name,
      type: this.type,
      value: this.value,
    };
  }
}

window.customElements.define("dgui-node-input-checkbox", CheckboxInputNodeElement);
