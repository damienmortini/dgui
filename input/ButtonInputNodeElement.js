import "../node/NodeElement.js";

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
          display: block;
        }
        button {
          width: 100%;
          height: 100%;
        }
      </style>
      <dgui-node>
        <button>
          <slot></slot>
        </button>
      </dgui-node>
    `;

    this._slot = this.shadowRoot.querySelector("slot");
    this._button = this.shadowRoot.querySelector("button");

    this._button.onclick = (event) => {
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
}

window.customElements.define("dgui-node-input-button", ButtonInputNodeElement);
