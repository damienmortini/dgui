import "../misc/DraggableHandlerElement.js";

export default class TextInputNodeElement extends HTMLElement {
  static get observedAttributes() {
    return ["name", "value", "disabled"];
  }

  constructor() {
    super();

    this.type = "text";

    this.attachShadow({ mode: "open" }).innerHTML = `
      <style>
        :host {
          display: grid;
          grid-template-columns: auto auto auto 1fr auto;
          grid-gap: 5px;
          align-items: center;
        }
        textarea {
          width: 100%;
          height: 100%;
          box-sizing: border-box;
          vertical-align: middle;
        }
      </style>
      <dgui-node-in data-to="this.getRootNode().host"></dgui-node-in>
      <dgui-draggable-handler data-target="this.getRootNode().host"></dgui-draggable-handler>
      <label></label>
      <textarea rows="1"></textarea>
      <dgui-node-out data-from="this.getRootNode().host"></dgui-node-out>
    `;

    this._textarea = this.shadowRoot.querySelector("textarea");
    this._label = this.shadowRoot.querySelector("label");

    this.shadowRoot.addEventListener("change", (event) => {
      this.dispatchEvent(new event.constructor(event.type, event));
    });
  }

  attributeChangedCallback(name, oldValue, newValue) {
    this[name] = name === "disabled" ? newValue !== null : newValue;
  }

  get value() {
    return this._textarea.value;
  }

  set value(value) {
    this._textarea.value = value;
  }

  get name() {
    return this._textarea.name;
  }

  set name(value) {
    this._label.textContent = value;
    this._textarea.name = value;
  }

  get disabled() {
    return this._textarea.disabled;
  }

  set disabled(value) {
    this._textarea.disabled = value;
  }

  toJSON() {
    return {
      name: this.name,
      type: this.type,
      value: this.value,
    };
  }
}

window.customElements.define("dgui-node-input-text", TextInputNodeElement);
