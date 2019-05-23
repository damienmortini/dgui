/**
 * Node Element
 */
export default class NodeElement extends HTMLElement {
  static get observedAttributes() {
    return ["name", "draggable", "open", "x", "y", "width", "height"];
  }

  constructor() {
    super();

    this.attachShadow({ mode: "open" }).innerHTML = `
      <style>
        :host {
          display: block;
          overflow: auto;
          resize: horizontal;
          width: 200px;
          border: 1px dotted;
          position: absolute;
          background: rgba(255, 255, 255, .9);
        }

        :host(:hover) {
          border: 1px dashed;
        }

        :host(:focus-within) {
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
      <details open>
        <summary></summary>
        <slot></slot>
      </details>
      <graph-draggable targets="[this.getRootNode().host]"></graph-draggable>
    `;

    this._draggable = this.shadowRoot.querySelector("graph-draggable");
    this._draggable.handles = [this.shadowRoot.querySelector("summary"), this.shadowRoot.querySelector("details")];

    // this.open = true;
    // this.draggable = true;
  }

  attributeChangedCallback(name, oldValue, newValue) {
    switch (name) {
      case "name":
        this.shadowRoot.querySelector("details").querySelector("summary").textContent = newValue;
        break;
      case "draggable":
        console.log(newValue);
        break;
      case "open":
        this.shadowRoot.querySelector("details").open = newValue;
        break;
      case "x":
        this.style.left = `${this.x}px`;
        break;
      case "y":
        this.style.top = `${this.y}px`;
        break;
      case "width":
        this.style.width = `${this.width}px`;
        break;
      case "height":
        this.style.height = `${this.height}px`;
        break;
    }
  }

  // get draggable() {
  //   return !this._draggable.disabled;
  // }

  // set draggable(value) {
  //   this._draggable.disabled = !value;
  //   super.draggable = value;
  // }

  // set draggable(value) {
  //   if (value) {
  //     this.setAttribute("draggable", "");
  //   } else {
  //     this.removeAttribute("draggable");
  //   }
  // }

  // get draggable() {
  //   return this.hasAttribute("draggable");
  // }

  set open(value) {
    if (value) {
      this.shadowRoot.querySelector("details").setAttribute("open", "");
    } else {
      this.shadowRoot.querySelector("details").removeAttribute("open");
    }
  }

  get open() {
    return this.shadowRoot.querySelector("details").hasAttribute("open");
  }

  get name() {
    return this.getAttribute("name");
  }

  set name(value) {
    this.setAttribute("name", value);
  }

  get x() {
    return Number(this.getAttribute("x"));
  }

  set x(value) {
    this.setAttribute("x", String(value));
  }

  get y() {
    return Number(this.getAttribute("y"));
  }

  set y(value) {
    this.setAttribute("y", String(value));
  }

  get width() {
    return Number(this.getAttribute("width"));
  }

  set width(value) {
    this.setAttribute("width", String(value));
  }

  get height() {
    return Number(this.getAttribute("height"));
  }

  set height(value) {
    this.setAttribute("height", String(value));
  }

  toJSON() {
    return {
      name: this.name,
    };
  }
}
