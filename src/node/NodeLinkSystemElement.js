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

  _onPointerDown(event) {
    if(event.button === 2) {
      
    }
  }

  _onNodeConnect(event) {
    const link = document.createElement("dnod-node-link");
    link.addEventListener("click", () => {
      link.in.disconnect(link.out);
      link.remove();
    });
    if (event.target.destination) {
      link.out = event.target;
    } else {
      link.in = event.target;
    }
    this._linkMap.set(event.target, link);
    this.appendChild(link);

    this._currentLink = link;
  }

  _onNodeConnected(event) {
    if (this._currentLink.out && this._currentLink.out !== event.target) {
      this._currentLink.in = event.target;
    }
    if (this._currentLink.in && this._currentLink.in !== event.target) {
      this._currentLink.out = event.target;
    }
  }

  _onNodeDisconnected(event) {
    const link = this._linkMap.get(event.target);
    if (link) {
      link.remove();
    }
  }

  _removeEventListeners() {
    this._listener.removeEventListener("nodeconnectorconnect", this._onNodeConnectBinded);
    this._listener.removeEventListener("nodeconnectorconnected", this._onNodeConnectedBinded);
    this._listener.removeEventListener("nodeconnectordisconnected", this._onNodeDisconnectedBinded);
    this._listener.removeEventListener("pointerdown", this._onPointerDownBinded);
  }

  get listener() {
    return this._listener;
  }

  set listener(value) {
    if (this._listener) {
      this._removeEventListeners();
    }

    this._listener = value;

    this._listener.addEventListener("nodeconnectorconnect", this._onNodeConnectBinded = this._onNodeConnectBinded || this._onNodeConnect.bind(this));
    this._listener.addEventListener("nodeconnectorconnected", this._onNodeConnectedBinded = this._onNodeConnectedBinded || this._onNodeConnected.bind(this));
    this._listener.addEventListener("nodeconnectordisconnected", this._onNodeDisconnectedBinded = this._onNodeDisconnectedBinded || this._onNodeDisconnected.bind(this));
    this._listener.addEventListener("pointerdown", this._onPointerDownBinded = this._onPointerDownBinded || this._onPointerDown.bind(this));
  }
}

window.customElements.define("dnod-node-link-system", NodeLinkSystemElement);
