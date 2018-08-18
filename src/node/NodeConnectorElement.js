let activeConnector = null;

export default class NodeConnectorElement extends HTMLElement {
  static get observedAttributes() {
    return ["data-source", "data-destination"];
  }

  constructor() {
    super();

    this.attachShadow({ mode: "open" }).innerHTML = `
      <style>
        :host {
          display: inline-block;
          cursor: pointer;
        }
        input {
          cursor: pointer;
          display: inline-block;
          margin: 3px;
        }
      </style>
      <input type="radio" disabled>
      <slot></slot>
    `;

    this.connectedElements = new Set();

    this._radio = this.shadowRoot.querySelector("input");

    this._onSourceChangeBinded = this._onSourceChange.bind(this);
  }

  connectedCallback() {
    if (this.source) {
      this.source = this.source;
    }
    if (this.destination) {
      this.destination = this.destination;
    }
    this.addEventListener("pointerdown", this._onPointerDown);
  }

  disconnectedCallback() {
    this.removeEventListener("pointerdown", this._onPointerDown);
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) {
      return;
    }

    this[name.replace("data-", "")] = new Function(`return ${newValue}`).apply(this);
  }

  _onPointerDown() {
    if (activeConnector) {
      return;
    }
    activeConnector = this;
    this.connected = true;
    this.dispatchEvent(new Event("nodeconnectorconnect", {
      bubbles: true,
      composed: true,
    }));
    window.addEventListener("pointerup", this._onWindowPointerUpBinded = this._onWindowPointerUpBinded || this._onWindowPointerUp.bind(this));
  }

  _onWindowPointerUp(event) {
    let connector;
    for (const element of event.path) {
      if (element instanceof NodeConnectorElement) {
        connector = element;
        break;
      }
    }
    
    if (connector === activeConnector) {
      return;
    }

    window.removeEventListener("pointerup", this._onWindowPointerUpBinded);

    if (connector && activeConnector.source && connector.destination && activeConnector.source !== connector.destination) {
      activeConnector.connect(connector);
    } else if (connector && activeConnector !== connector && connector.source && activeConnector.destination && connector.source !== activeConnector.destination) {
      connector.connect(activeConnector);
    } else {
      activeConnector.disconnect();
    }

    activeConnector = null;
  }

  connect(element) {
    if (this.connectedElements.has(element)) {
      return;
    }
    if (element instanceof NodeConnectorElement) {
      element.connected = true;
    }
    this.connectedElements.add(element);
    if (this.value !== undefined) {
      element.value = this.value;
    }
    this.connected = true;
    this.dispatchEvent(new Event("nodeconnectorconnected", {
      bubbles: true,
      composed: true,
    }));
    element.dispatchEvent(new Event("nodeconnectorconnected", {
      bubbles: true,
      composed: true,
    }));
  }

  disconnect(element) {
    if (element) {
      this.connectedElements.delete(element);

      element.connected = false;
      element.dispatchEvent(new Event("nodeconnectordisconnected", {
        bubbles: true,
        composed: true,
      }));
    }

    this.connected = !!this.connectedElements.size;

    this.dispatchEvent(new Event("nodeconnectordisconnected", {
      bubbles: true,
      composed: true,
    }));
  }

  _onSourceChange(event) {
    this.value = this.source.value;
  }

  get value() {
    return this._value;
  }

  set value(value) {
    if (value === this._value) {
      return;
    }
    this._value = value;

    for (const element of this.connectedElements) {
      element.value = this._value;
    }
    if (this.destination) {
      this.destination.value = this._value;
      this.destination.dispatchEvent(new Event("input", {
        bubbles: true,
      }));
      this.destination.dispatchEvent(new Event("change", {
        bubbles: true,
      }));
    }
  }

  get connected() {
    return this._radio.checked;
  }

  set connected(value) {
    if (this.destination) {
      this.destination.disabled = value;
    }
    this._radio.checked = value;
  }

  get source() {
    return this._source;
  }

  set source(value) {
    if (this._source) {
      this._source.removeEventListener("input", this._onSourceChangeBinded);
      this._source.removeEventListener("change", this._onSourceChangeBinded);
    }
    this._source = value;
    if (!this._source || !this.isConnected) {
      return;
    }
    if (this.destination) {
      this.value = this._source.value;
    }
    this._source.addEventListener("input", this._onSourceChangeBinded);
    this._source.addEventListener("change", this._onSourceChangeBinded);
  }

  get destination() {
    return this._destination;
  }

  set destination(value) {
    this._destination = value;
    if (!this.isConnected) {
      return;
    }
    if (this.value !== undefined) {
      this._destination.value = this.value;
    }
  }
}

window.customElements.define("dnod-node-connector", NodeConnectorElement);
