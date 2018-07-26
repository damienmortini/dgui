export default class GUILayerElement extends HTMLElement {
  constructor() {
    super();

    this.attachShadow({ mode: "open" }).innerHTML = `
      <dgui-node-link-system data-listener="this.getRootNode().host"></dgui-node-link-system>
      <slot></slot>
    `;
  }
}

window.customElements.define("dgui-layer", GUILayerElement);
