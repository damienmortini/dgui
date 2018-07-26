let draggedElement;

export default class ZoomableElement extends HTMLElement {
  constructor() {
    super();

    this.zoom = 1;

    this.attachShadow({ mode: "open" }).innerHTML = `
      <style>
        :host {
          display: inline-block;
          position: relative;
          width: 20px;
          height: 20px;
        }
        
        slot {
          display: block;
          width: 100%;
          height: 100%;
        }

        slot svg {
          width: 100%;
          height: 100%;
          pointer-events: none;
        }
      </style>
      <slot></slot>
    `;
  }

  connectedCallback() {
    this.addEventListener("wheel", this._onWheelBinded = this._onWheelBinded || this._onWheel.bind(this));
  }

  disconnectedCallback() {
    this.removeEventListener("wheel", this._onWheelBinded);
  }

  _onWheel(event) {
    this.style.transformOrigin = "50% 50%";
    this.zoom += event.wheelDeltaY * .0002;
  }
  
  get zoom() {
    return this._zoom;
  }
  
  set zoom(value) {
    if(value === this._zoom) {
      return;
    }

    this._zoom = value;
    
    this._zoom = Math.max(0, this._zoom);
    
    this.style.transform = `scale(${this._zoom})`;
    
    this.dispatchEvent(new Event("zoom"));
  }
}

window.customElements.define("dgui-zoomable", ZoomableElement);
