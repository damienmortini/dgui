export default class NodeOutElement extends HTMLElement {
  constructor() {
    super();

    this.attachShadow({ mode: "open" }).innerHTML = `
      <input type="radio">
    `;
  }
}

window.customElements.define("dgui-node-out", NodeOutElement);
