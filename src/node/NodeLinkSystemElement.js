import "./NodeLinkElement.js";

export default class NodeLinkSystemElement extends HTMLElement {
  static get observedAttributes() {
    return ["data-listener"];
  }

  constructor() {
    super();

    this.attachShadow({ mode: "open" }).innerHTML = `
      <slot></slot>
    `;

    this._activeLink = null;
    this._linkMap = new Map();

    this._onNodeConnectBinded = this._onNodeConnect.bind(this);
    this._onNodeConnectedBinded = this._onNodeConnected.bind(this);
    this._onNodeDisconnectedBinded = this._onNodeDisconnected.bind(this);
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) {
      return;
    }
    switch (name) {
      case "data-listener":
        this.listener = eval(newValue);
        break;
    }
  }

  connectedCallback() {
    this.listener = this.listener || this;
  }

  disconnectedCallback() {
    this._removeEventListeners();
  }

  _createLink() {
    const link = document.createElement("dnod-node-link");
    this.appendChild(link);
    link.addEventListener("click", () => {
      link.in.disconnect(link.out);
    });
    return link;
  }

  _onNodeConnect(event) {
    this._activeLink = this._createLink();
    this.appendChild(this._activeLink);

    if (event.detail.destination) {
      this._activeLink.out = event.target;
    } else {
      this._activeLink.in = event.target;
    }
  }

  _onNodeConnected(event) {
    for (const key of this._linkMap) {
      if (key.source === event.detail.source && key.destination === event.detail.destination) {
        return;
      }
    }

    if (!this._activeLink) {
      this._activeLink = this._createLink();
    }

    this._activeLink.in = event.detail.source;
    this._activeLink.out = event.detail.destination;

    this._linkMap.set(event.detail, this._activeLink);

    this._activeLink = null;
  }

  _onNodeDisconnected(event) {
    if (this._activeLink) {
      this._activeLink.remove();
    }
    for (const [key, link] of this._linkMap.entries()) {
      if (key.source === event.detail.source && key.destination === event.detail.destination) {
        this._linkMap.delete(key);
        link.remove();
      }
    }
  }

  _removeEventListeners() {
    this._listener.removeEventListener("nodeconnectorconnect", this._onNodeConnectBinded);
    this._listener.removeEventListener("nodeconnectorconnected", this._onNodeConnectedBinded);
    this._listener.removeEventListener("nodeconnectordisconnected", this._onNodeDisconnectedBinded);
  }

  get listener() {
    return this._listener;
  }

  set listener(value) {
    if (this._listener) {
      this._removeEventListeners();
    }

    this._listener = value;

    this._listener.addEventListener("nodeconnectorconnect", this._onNodeConnectBinded);
    this._listener.addEventListener("nodeconnectorconnected", this._onNodeConnectedBinded);
    this._listener.addEventListener("nodeconnectordisconnected", this._onNodeDisconnectedBinded);
  }
}

window.customElements.define("dnod-node-link-system", NodeLinkSystemElement);
