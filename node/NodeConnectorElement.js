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
        }
        input {
          vertical-align: middle;
          margin: 2px;
        }
      </style>
      <input type="radio" disabled>
      <slot></slot>
    `;

    this.connectedElements = new Set();
    this._parentConnector = null;

    this._radio = this.shadowRoot.querySelector("input");

    this._onSourceChangeBinded = this._onSourceChange.bind(this);

    window.addEventListener("guinodeconnect", (event) => {
      activeConnector = event.path[0];
    });

    this.addEventListener("pointerdown", () => {
      if (!this.source) {
        return;
      }
      this.dispatchEvent(new Event("guinodeconnect", {
        bubbles: true,
        composed: true,
      }));
    });

    this.addEventListener("pointerup", () => {
      if (activeConnector) {
        if (activeConnector === this) {
          return;
        }
        activeConnector.connect(this);
        activeConnector = null;
      } else {
        if (!this.source && this._parentConnector) {
          this._parentConnector.disconnect(this);
        }
      }
    });
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) {
      return;
    }
    switch (name) {
      case "data-source":
        this.source = eval(newValue);
        break;
      case "data-destination":
        this.destination = eval(newValue);
        break;
    }
  }

  connectedCallback() {
    if (this.source) {
      this.source = this.source;
    }
    if (this.destination) {
      this.destination = this.destination;
    }
  }

  connect(element) {
    if (element instanceof NodeConnectorElement) {
      if (element._parentConnector) {
        element._parentConnector.disconnect(element);
      }
      element._parentConnector = this;
      element.connected = true;
    }
    this.connectedElements.add(element);
    if (this.value !== undefined) {
      element.value = this.value;
    }
    this.connected = true;
    this.dispatchEvent(new Event("guinodeconnected", {
      bubbles: true,
      composed: true,
    }));
    element.dispatchEvent(new Event("guinodeconnected", {
      bubbles: true,
      composed: true,
    }));
  }

  disconnect(element) {
    this.connectedElements.delete(element);
    element._parentConnector = null;
    element.connected = false;
    element.dispatchEvent(new Event("guinodedisconnected", {
      bubbles: true,
      composed: true,
    }));
    this.connected = !!this.connectedElements.size;
    if (!this.connected) {
      this.dispatchEvent(new Event("guinodedisconnected", {
        bubbles: true,
        composed: true,
      }));
    }
  }

  _onSourceChange(event) {
    this.value = this.source.value;
  }

  get value() {
    return this.source ? this.source.value : undefined;
  }

  set value(value) {
    for (const element of this.connectedElements) {
      element.value = value;
    }
    if (this.destination) {
      this.destination.value = value;
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

window.customElements.define("dgui-node-connector", NodeConnectorElement);
