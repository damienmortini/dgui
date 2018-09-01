import ConnectorElement from "./ConnectorElement.js";
import "../link/LinkElement.js";

export default class ConnectorLinkSystemElement extends HTMLElement {
  static get observedAttributes() {
    return ["data-target"];
  }

  constructor() {
    super();

    this._activeLink = null;
    this._linkMap = new Map();

    this._onConnectBinded = this._onConnect.bind(this);
    this._onConnectedBinded = this._onConnected.bind(this);
    this._onDisconnectedBinded = this._onDisconnected.bind(this);
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) {
      return;
    }
    switch (name) {
      case "data-target":
        this.target = eval(newValue);
        break;
    }
  }

  connectedCallback() {
    this.target = this.target || this;
  }

  disconnectedCallback() {
    this._removeEventListeners();
  }

  _addLink() {
    const link = document.createElement("dnod-link");
    this.appendChild(link);
    link.addEventListener("click", () => {
      link.input.outputs.delete(link.output);
    });
    return link;
  }

  _onConnect(event) {
    this._activeLink = this._addLink();

    if (event.detail.output) {
      this._activeLink.out = event.target;
    } else {
      this._activeLink.in = event.target;
    }
  }

  _onConnected(event) {
    this._connectLink(event.target, event.detail.output);
  }

  _connectLink(input, output) {
    for (const key of this._linkMap.keys()) {
      if (key.input === input && key.output === output) {
        return;
      }
    }

    if (!this._activeLink) {
      this._activeLink = this._addLink();
    }

    this._activeLink.input = input;
    this._activeLink.output = output;

    this._linkMap.set({ input, output }, this._activeLink);

    this._activeLink = null;
  }

  _onDisconnected(event) {
    if (this._activeLink) {
      this._activeLink.remove();
    }
    for (const [key, link] of this._linkMap.entries()) {
      if (key.input === event.target && key.output === event.detail.output) {
        this._linkMap.delete(key);
        link.remove();
      }
    }
  }

  _removeEventListeners() {
    this._target.removeEventListener("connect", this._onConnectBinded);
    this._target.removeEventListener("connected", this._onConnectedBinded);
    this._target.removeEventListener("disconnected", this._onDisconnectedBinded);
  }

  get target() {
    return this._target;
  }

  set target(value) {
    if (this._target) {
      this._removeEventListeners();
    }

    this._target = value;

    for (const connector of this._target.querySelectorAll("dnod-connector")) {
      if (connector.type & ConnectorElement.TYPE_OUTPUT) {
        for (const output of connector.outputs) {
          if (output instanceof ConnectorElement) {
            this._connectLink(connector, output);
          }
        }
      }
    }

    this._target.addEventListener("connect", this._onConnectBinded);
    this._target.addEventListener("connected", this._onConnectedBinded);
    this._target.addEventListener("disconnected", this._onDisconnectedBinded);
  }
}

window.customElements.define("dnod-connector-linksystem", ConnectorLinkSystemElement);
