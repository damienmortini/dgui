import ConnectorElement from "./ConnectorElement.js";

/**
 * Handle connector elements linking
 */
class ConnectorSystemElement extends HTMLElement {
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
    if (!this._activeConnector) {
      return;
    }

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

    if (!connector || (this._activeConnector.type === connector.type && connector.type !== ConnectorElement.TYPE_BOTH) ) {
      this._activeConnector = null;
      return;
    }

    const outputConnector = this._activeConnector.type & ConnectorElement.TYPE_OUTPUT ? this._activeConnector : connector;
    const inputConnector = connector.type & ConnectorElement.TYPE_INPUT ? connector : this._activeConnector;

    outputConnector.outputs.add(inputConnector);

    this._activeConnector = null;
  }
}

window.customElements.define("dnod-connector-system", ConnectorSystemElement);

export default ConnectorSystemElement;