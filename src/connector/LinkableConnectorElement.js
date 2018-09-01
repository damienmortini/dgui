import ConnectorElement from "./ConnectorElement.js";

let activeConnector = null;

/**
 * Handle connector elements linking
 */
class LinkableConnectorElement extends ConnectorElement {
  constructor() {
    super();

    this.addEventListener("pointerdown", this._onPointerDown);

    this._onWindowPointerUpBinded = this._onWindowPointerUp.bind(this);
  }

  _onPointerDown(event) {
    if (activeConnector) {
      return;
    }
    activeConnector = this;

    window.addEventListener("pointerup", this._onWindowPointerUpBinded);
  }

  _onWindowPointerUp(event) {
    if (!activeConnector) {
      return;
    }

    let connector;
    for (const element of event.path) {
      if (element instanceof ConnectorElement) {
        connector = element;
        break;
      }
    }

    if (connector === activeConnector) {
      return;
    }

    window.removeEventListener("pointerup", this._onWindowPointerUpBinded);

    if (!connector || (activeConnector.type === connector.type && connector.type !== ConnectorElement.TYPE_BOTH)) {
      activeConnector = null;
      return;
    }

    const inputConnector = activeConnector.type & ConnectorElement.TYPE_OUTPUT ? activeConnector : connector;
    const outputConnector = connector.type & ConnectorElement.TYPE_INPUT ? connector : activeConnector;

    inputConnector.outputs.add(outputConnector);

    activeConnector = null;
  }
}

export default LinkableConnectorElement;
