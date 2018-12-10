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
      <dnod-connector></dnod-connector>
      <slot></slot>
      <dnod-connector inputs="[this.previousElementSibling]"></dnod-connector>
    `;
  }

  connectedCallback() {
    this.shadowRoot.querySelector("dnod-connector").outputs.add(this.firstChild);
  }
}
