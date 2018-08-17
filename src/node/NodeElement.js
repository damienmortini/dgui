import "../misc/DraggableElement.js";

export default class NodeElement extends HTMLElement {
  static get observedAttributes() {
    return ["data-name", "data-draggable", "data-open", "data-x", "data-y", "data-width", "data-height"];
  }

  constructor() {
    super();

    this.attachShadow({ mode: "open" }).innerHTML = `
      <style>
        :host {
          display: block;
          overflow: auto;
          resize: both;
          width: 200px;
        }
        
        :host(.draggable) {
          border: 1px dotted;
          position: absolute;
          background: rgba(255, 255, 255, .9);
        }

        :host(.draggable:hover) {
          border: 1px dashed;
        }

        :host(.draggable:focus-within) {
          border: 1px solid;
          z-index: 1;
        }

        details, slot {
          padding: 5px;
        }

        details summary {
          position: relative;
          padding: 5px;
          outline: none;
        }
      </style>
      <dnod-draggable data-target="this.getRootNode().host">
        <slot name="content">
          <details>
            <summary></summary>
            <slot></slot>
          </details>
        </slot>
      </dnod-draggable>
    `;

    this.open = true;
    this.draggable = true;
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) {
      return;
    }

    name = name.replace("data-", "");

    switch (name) {
      case "draggable":
      case "open":
        this[name] = newValue !== "true";
        break;
      case "x":
      case "y":
      case "width":
      case "height":
        this[name] = parseFloat(newValue);
        break;
      default:
        this[name] = newValue;
        break;
    }
  }

  set name(value) {
    this._name = value;
    this.shadowRoot.querySelector("details").querySelector("summary").textContent = this._name;
  }

  get name() {
    return this._name;
  }

  get open() {
    return this.shadowRoot.querySelector("details").open;
  }

  set open(value) {
    this.shadowRoot.querySelector("details").open = value;
  }

  get draggable() {
    return this._draggable;
  }
  
  set draggable(value) {
    this._draggable = value;
    super.draggable = this._draggable;
    this.shadowRoot.querySelector("dnod-draggable").disabled = !this._draggable;
    this.classList.toggle("draggable", this._draggable);
  }

  get x() {
    return this._x;
  }

  set x(value) {
    this._x = parseFloat(value);
    this._updateBoundingRect();
  }

  get y() {
    return this._y;
  }

  set y(value) {
    this._y = parseFloat(value);
    this._updateBoundingRect();
  }

  get width() {
    return this._width;
  }

  set width(value) {
    this._width = parseFloat(value);
    this._updateBoundingRect();
  }

  get height() {
    return this._height;
  }

  set height(value) {
    this._height = parseFloat(value);
    this._updateBoundingRect();
  }

  _updateBoundingRect() {
    this.style.left = `${this.x}px`;
    this.style.top = `${this.y}px`;
    this.style.width = `${this.width}px`;
    this.style.height = `${this.height}px`;
  }

  toJSON() {
    return {
      name: this.name,
    };
  }
}

window.customElements.define("dnod-node", NodeElement);
