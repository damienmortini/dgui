export default class DraggableHandleElement extends HTMLElement {
  static get observedAttributes() {
    return ["draggable", "data-target", "data-handle"];
  }

  constructor() {
    super();

    this.attachShadow({ mode: "open" }).innerHTML = `
      <style>
        :host {
          width: 20px;
          height: 20px;
        }
        
        slot {
          display: block;
          cursor: grab;
          cursor: -webkit-grab;
          width: 100%;
          height: 100%;
        }

        slot svg {
          width: 100%;
          height: 100%;
          pointer-events: none;
        }

        slot:hover {
          outline: 1px dotted;
        }

        slot:active {
          cursor: grabbing;
          cursor: -webkit-grabbing;
        }
      </style>
      <slot><svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'><path d='M7 4a1 1 0 1 1-1-1 1 1 0 0 1 1 1zm3 1a1 1 0 1 0-1-1 1 1 0 0 0 1 1zM6 7a1 1 0 1 0 1 1 1 1 0 0 0-1-1zm4 0a1 1 0 1 0 1 1 1 1 0 0 0-1-1zm-4 4a1 1 0 1 0 1 1 1 1 0 0 0-1-1zm4 0a1 1 0 1 0 1 1 1 1 0 0 0-1-1z'/></svg></slot>
    `;

    this._handle = this.shadowRoot.querySelector("slot");

    this._offsetX = 0;
    this._offsetY = 0;

    this._dragStartX = 0;
    this._dragStartY = 0;

    this._preventDefaultBinded = this._preventDefault.bind(this);
    this._onPointerDownBinded = this._onPointerDown.bind(this);
    this._onPointerMoveBinded = this._onPointerMove.bind(this);
    this._onPointerUpBinded = this._onPointerUp.bind(this);
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) {
      return;
    }
    switch (name) {
      case "draggable":
        this.draggable = newValue === "true";
        break;
      case "data-target":
        this.target = eval(newValue);
        break;
      case "data-handle":
        this.handle = eval(newValue);
        break;
    }
  }

  get target() {
    return this._target;
  }

  set target(value) {
    this._target = value;
    this.draggable = this.draggable;
  }

  get handle() {
    return this._handle;
  }

  set handle(value) {
    this.handle.removeEventListener("pointerdown", this._onPointerDownBinded);
    this._handle = value;
    this.draggable = this.draggable;
  }

  get draggable() {
    return super.draggable;
  }

  set draggable(value) {
    super.draggable = value;

    this.handle.removeEventListener("pointerdown", this._onPointerDownBinded);

    if (!this.target) {
      return;
    }

    this.target.removeEventListener("dragstart", this._preventDefaultBinded);

    if (this.draggable) {
      this.handle.addEventListener("pointerdown", this._onPointerDownBinded);
      this.target.addEventListener("dragstart", this._preventDefaultBinded);
    }
  }

  _preventDefault(event) {
    event.preventDefault();
  }

  _onPointerDown(event) {
    if (event.path[0].tagName === "INPUT" || event.path[0].getAttribute("draggable") === "false") {
      return;
    }
    this._dragStartX = event.clientX;
    this._dragStartY = event.clientY;
    this._offsetX = this._target.offsetLeft;
    this._offsetY = this._target.offsetTop;

    this._target.style.willChange = "transform";
    window.addEventListener("pointermove", this._onPointerMoveBinded, { passive: false });
    window.addEventListener("pointerup", this._onPointerUpBinded);
    window.addEventListener("touchmove", this._preventDefaultBinded, { passive: false });
  }

  _onPointerMove(event) {
    this.target.style.transform = `translate(${event.clientX - this._dragStartX}px, ${event.clientY - this._dragStartY}px)`;
  }

  _onPointerUp(event) {
    this._target.style.willChange = "";
    window.removeEventListener("pointermove", this._onPointerMoveBinded);
    window.removeEventListener("pointerup", this._onPointerUpBinded);
    window.removeEventListener("touchmove", this._preventDefaultBinded);
    this._target.style.left = `${this._offsetX + event.clientX - this._dragStartX}px`;
    this._target.style.top = `${this._offsetY + event.clientY - this._dragStartY}px`;
    this.target.style.transform = "";
  }
}

window.customElements.define("dgui-draggable-handle", DraggableHandleElement);
