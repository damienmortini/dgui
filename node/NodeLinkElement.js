export default class NodeLinkElement extends HTMLElement {
  constructor() {
    super();

    this.attachShadow({ mode: "open" }).innerHTML = `
      link
    `;
  }

  connectedCallback() {
    window.dispatchEvent(new Event("guilinkstart", {
      bubbles: true,
    }));
  }

  get in() {
    return this._in;
  }

  set in(value) {
    this._in = value;
  }

  get out() {
    return this._out;
  }

  set out(value) {
    this._out = value;
  }
}

window.customElements.define("dgui-node-link", NodeLinkElement);
