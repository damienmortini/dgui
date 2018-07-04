export default class NodeComponentElement extends HTMLElement {
  constructor() {
    super();

    this.attachShadow({ mode: "open" }).innerHTML = `
      <style>
        :host {
          display: flex;
          grid-auto-flow: column;
          align-items: center;
          will-change: transform;
          user-select: none;
        }

        :host(.draggable) {
          resize: horizontal;
        }
        
        :host(.draggable) #drag {
          display: block;
        }

        input {
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

        #drag.dragging {
          cursor: grabbing;
          cursor: -webkit-grabbing;
        }

        ::slotted(*) {
          flex: 1;
        }
      </style>
      <input type="radio">
      <div id="drag" draggable></div>
      <slot></slot>
      <input type="radio">
    `;

    this._drag = this.shadowRoot.querySelector("#drag");

    let offsetX = 0;
    let offsetY = 0;

    let dragStartX = 0;
    let dragStartY = 0;

    const onDrag = (event) => {
      this.style.transform = `translate(${offsetX + event.clientX - dragStartX}px, ${offsetY + event.clientY - dragStartY}px)`;
    };
    const onDragEnd = () => {
      window.removeEventListener("mousemove", onDrag);
      window.removeEventListener("mouseup", onDragEnd);
      offsetX += event.clientX - dragStartX;
      offsetY += event.clientY - dragStartY;
      this._drag.classList.remove("dragging");
    };
    this._drag.addEventListener("mousedown", (event) => {
      dragStartX = event.clientX;
      dragStartY = event.clientY;
      window.addEventListener("mousemove", onDrag);
      window.addEventListener("mouseup", onDragEnd);
      this._drag.classList.add("dragging");
    });
  }

  get draggable() {
    return this.classList.contains("draggable");
  }

  set draggable(value) {
    this.classList.toggle("draggable", value);
  }
}

window.customElements.define("dgui-node-component", NodeComponentElement);
