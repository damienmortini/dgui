import ConnectorElement from "./ConnectorElement.js";

export default class ConnectorSystemElement extends HTMLElement {
  constructor() {
    super();

    this.attachShadow({ mode: "open" }).innerHTML = `
      <slot></slot>
    `;

    this._activeConnector = null;
    this._onWindowPointerUpBinded = this._onWindowPointerUp.bind(this);

    this.addEventListener("pointerdown", this._onPointerDown);
  }

  _onPointerDown(event) {
    if (this._activeConnector) {
      return;
    }
    for (const element of event.path) {
      if (element instanceof ConnectorElement) {
        this._activeConnector = element;
        break;
      }
    }
    window.addEventListener("pointerup", this._onWindowPointerUpBinded);
  }

  _onWindowPointerUp(event) {
    let connector;
    for (const element of event.path) {
      if (element instanceof ConnectorElement) {
        connector = element;
        break;
      }
    }

    if (connector === this._activeConnector) {
      return;
    }

    window.removeEventListener("pointerup", this._onWindowPointerUpBinded);

    if (!connector) {
      this._activeConnector = null;
      return;
    }

    const connectorSource = this._activeConnector.inputs.size ? this._activeConnector : connector;
    const connectorDestination = this._activeConnector.inputs.size ? connector : this._activeConnector;

    connectorSource.outputs.add(connectorDestination);

    this._activeConnector = null;
  }
}

window.customElements.define("dnod-connector-system", ConnectorSystemElement);
