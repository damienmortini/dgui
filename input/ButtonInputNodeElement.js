import "../misc/DraggableHandlerElement.js";

export default class ButtonInputNodeElement extends HTMLElement {
  static get observedAttributes() {
    return ["name", "value", "disabled"];
  }

  constructor() {
    super();

    this.type = "button";

    this.attachShadow({ mode: "open" }).innerHTML = `
      <style>
        :host {
          display: grid;
          grid-template-columns: auto auto 1fr auto;
          grid-gap: 5px;
          align-items: center;
        }
        button {
          width: 100%;
          height: 100%;
        }
      </style>
      <dgui-node-in data-to="this.getRootNode().host"></dgui-node-in>
      <dgui-draggable-handler data-target="this.getRootNode().host"></dgui-draggable-handler>
      <button>
        <slot></slot>
      </button>
      <dgui-node-out data-from="this.getRootNode().host"></dgui-node-out>
    `;

    this._slot = this.shadowRoot.querySelector("slot");
    this._button = this.shadowRoot.querySelector("button");

    this._button.onclick = (event) => {
      if (typeof this.value === "function") {
        this.value();
      }
      this.dispatchEvent(new event.constructor("input", event));
    };
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name in this) {
      this[name] = newValue;
    } else {
      this._button.setAttribute(name, newValue);
    }
  }

  set name(value) {
    this._slot.textContent = value;
    this._name = value;
  }

  get name() {
    return this._name;
  }

  get disabled() {
    return this._button.disabled;
  }

  set disabled(value) {
    this._button.disabled = value;
  }

  set value(value) {
    this._value = value;
    this.dispatchEvent(new Event("change", {
      bubbles: true,
    }));
  }

  get value() {
    return this._value;
  }

  toJSON() {
    return {
      name: this.name,
      type: this.type,
      value: this.value,
    };
  }
}

window.customElements.define("dgui-node-input-button", ButtonInputNodeElement);
