export default class ConnectorsElement extends HTMLElement {
  constructor() {
    super();

    this.attachShadow({ mode: "open" }).innerHTML = `
      <style>
        :host {
          display: flex;
          align-items: center;
        }
      </style>
      <graph-connector></graph-connector>
      <slot></slot>
      <graph-connector inputs="[this.previousElementSibling]"></graph-connector>
    `;
  }

  connectedCallback() {
    this.shadowRoot.querySelector("graph-connector").outputs.add(this.firstChild);
  }
}
