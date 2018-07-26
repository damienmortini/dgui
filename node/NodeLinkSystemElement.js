export default class NodeLinkSystemElement extends HTMLElement {
  static get observedAttributes() {
    return ["data-listener"];
  }

  constructor() {
    super();

    this.attachShadow({ mode: "open" }).innerHTML = `
      <slot></slot>
    `;

    this._currentLink = null;
    this._linkMap = new Map();
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

  _onNodeConnect(event) {
    this._currentLink = document.createElement("dgui-node-link");
    this._currentLink.in = event.path[0];
    this.appendChild(this._currentLink);
  }

  _onNodeConnected(event) {
    this._currentLink.out = event.path[0];
    this._linkMap.set(this._currentLink.out, this._currentLink);
  }

  _onNodeDisconnected(event) {
    const link = this._linkMap.get(event.path[0]);
    if (link) {
      link.remove();
    }
  }

  _removeEventListeners() {
    this._listener.removeEventListener("guinodeconnect", this._onNodeConnectBinded);
    this._listener.removeEventListener("guinodeconnected", this._onNodeConnectedBinded);
    this._listener.removeEventListener("guinodedisconnected", this._onNodeDisconnectedBinded);
  }

  get listener() {
    return this._listener;
  }

  set listener(value) {
    if(this._listener) {
      this._removeEventListeners();
    }

    this._listener = value;

    this._listener.addEventListener("guinodeconnect", this._onNodeConnectBinded = this._onNodeConnectBinded || this._onNodeConnect.bind(this));
    this._listener.addEventListener("guinodeconnected", this._onNodeConnectedBinded = this._onNodeConnectedBinded || this._onNodeConnected.bind(this));
    this._listener.addEventListener("guinodedisconnected", this._onNodeDisconnectedBinded = this._onNodeDisconnectedBinded || this._onNodeDisconnected.bind(this));
  }
}

window.customElements.define("dgui-node-link-system", NodeLinkSystemElement);
