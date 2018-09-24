import ConnectorElement from "./ConnectorElement.js";

let activeConnector = null;

/**
 * Handle connector elements linking
 */
class LinkableConnectorElement extends ConnectorElement {
  constructor() {
    super();

    this.addEventListener("pointerdown", this._onPointerDown);

    this._outputLinkMap = new Map();

    this._onWindowPointerUpBinded = this._onWindowPointerUp.bind(this);
    this.addEventListener("connected", this._onConnected);
    this.addEventListener("disconnected", this._onDisconnected);
  }

  _addLink() {
    let root = this;
    let element = this.parentElement;
    while (element.parentElement) {
      if (element.tagName === "DNOD-EDITOR") {
        root = element;
        break;
      }
      element = element.parentElement;
    }

    const link = document.createElement("dnod-link");
    root.prepend(link);
    return link;
  }

  _onConnected(event) {
    const link = this._outputLinkMap.get(undefined) || this._addLink();
    link.addEventListener("click", () => {
      link.input.outputs.delete(link.output);
    });
    link.input = event.target;
    link.output = event.detail.output;

    this._outputLinkMap.set(event.detail.output, link);
  }

  _onDisconnected(event) {
    this._outputLinkMap.get(event.detail.output).remove();
    this._outputLinkMap.delete(event.detail.output);
  }

  _onPointerDown(event) {
    if (activeConnector) {
      return;
    }
    activeConnector = this;

    const link = this._addLink();
    link.input = this;

    this._outputLinkMap.set(undefined, link);

    window.addEventListener("pointerup", this._onWindowPointerUpBinded);
  }

  _onWindowPointerUp(event) {
    if (!activeConnector) {
      return;
    }

    let connector;
    for (const element of event.path) {
      if (element instanceof LinkableConnectorElement) {
        connector = element;
        break;
      }
    }

    if (connector === activeConnector) {
      return;
    }

    this._outputLinkMap.get(undefined).remove();
    this._outputLinkMap.delete(undefined);

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
