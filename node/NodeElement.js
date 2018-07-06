import DraggableHandler from "./DraggableHandler.js";

export default class NodeElement extends HTMLElement {
  static get observedAttributes() {
    return ["draggable"];
  }

  constructor() {
    super();

    this.attachShadow({ mode: "open" }).innerHTML = `
      <style>
        :host {
          display: flex;
          align-items: center;
        }
        
        :host([draggable]) {
          will-change: transform;
          user-select: none;
          resize: horizontal;
          overflow: auto;
        }
        
        :host([draggable]) #drag {
          display: block;
        }

        input[type=radio] {
          margin: 0 5px;
        }
        
        #drag {
          display: none;
          cursor: grab;
          cursor: -webkit-grab;
          width: 20px;
          height: 20px;
          max-height: 100%;
          margin-right: 10px;
          background: url("data:image/svg+xml;charset=utf-8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'><path d='M7 4a1 1 0 1 1-1-1 1 1 0 0 1 1 1zm3 1a1 1 0 1 0-1-1 1 1 0 0 0 1 1zM6 7a1 1 0 1 0 1 1 1 1 0 0 0-1-1zm4 0a1 1 0 1 0 1 1 1 1 0 0 0-1-1zm-4 4a1 1 0 1 0 1 1 1 1 0 0 0-1-1zm4 0a1 1 0 1 0 1 1 1 1 0 0 0-1-1z'/></svg>") center no-repeat;
        }

        #drag:hover {
          outline: 1px dotted;
        }

        #drag:active {
          cursor: grabbing;
          cursor: -webkit-grabbing;
        }

        slot input {
          flex: 1;
        }
      </style>
      <input type="radio">
      <div id="drag" draggable></div>
      <slot><input type="text" disabled></slot>
      <input type="radio">
    `;

    this._draggableHandler = new DraggableHandler(this, this.shadowRoot.querySelector("#drag"));
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) {
      return;
    }
    this[name] = name === "draggable" ? newValue === "true" : newValue;
  }

  get draggable() {
    return super.draggable;
  }

  set draggable(value) {
    super.draggable = value;
    this._draggableHandler.enabled = value;
  }
}

window.customElements.define("dgui-node", NodeElement);
