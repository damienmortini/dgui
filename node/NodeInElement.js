export default class NodeInElement extends HTMLElement {
  constructor() {
    super();

    this.attachShadow({ mode: "open" }).innerHTML = `
      <input type="radio">
    `;
  }
}

window.customElements.define("dgui-node-in", NodeInElement);
