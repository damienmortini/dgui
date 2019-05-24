export default class NodeInputElement extends HTMLElement {
  static get observedAttributes() {
    return ["name"];
  }

  constructor() {
    super();

    this.attachShadow({ mode: "open" }).innerHTML = `
      <style>
        :host {
          display: flex;
          align-items: center;
        }
        label {
          overflow: hidden;
          text-overflow: ellipsis;
          margin: 0 5px;
          width: 25%;
        }
        label:empty {
          display: none;
        }
        input, ::slotted(*) {
          width: 100%;
        }
      </style>
      <graph-connector outputs="[this.nextElementSibling]"></graph-connector>
      <label></label>
      <slot><input></slot>
      <graph-connector inputs="[this.previousElementSibling]"></graph-connector>
    `;
  }

  attributeChangedCallback(name, oldValue, newValue) {
    switch (name) {
      case "name":
        this.shadowRoot.querySelector("label").textContent = newValue;
        break;
    }
  }

  get name() {
    return this.getAttribute("name");
  }

  set name(value) {
    this.setAttribute("name", value);
  }
}
