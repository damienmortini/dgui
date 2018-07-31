let draggedElement;

export default class ZoomableElement extends HTMLElement {
  static get observedAttributes() {
    return ["data-listener", "min", "max", "zoom"];
  }

  constructor() {
    super();

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

    this._min = 0;
    this._max = Infinity;
    this._zoom = 1;
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) {
      return;
    }
    switch (name) {
      case "data-listener":
        this.listener = new Function(`return ${newValue}`).apply(this);
        break;
      default:
        this[name] = parseFloat(newValue);
        break;
    }
  }

  connectedCallback() {
    this.listener = this.listener || this;
  }

  disconnectedCallback() {
    this.removeEventListener("wheel", this._onWheelBinded);
  }

  _onWheel(event) {
    this.style.transformOrigin = "50% 50%";
    this.zoom += event.wheelDeltaY * .0004;
  }

  get listener() {
    return this._listener;
  }

  set listener(value) {
    if (this._listener) {
      this._listener.removeEventListener("wheel", this._onWheelBinded);
    }
    this._listener = value;
    this._listener.addEventListener("wheel", this._onWheelBinded = this._onWheelBinded || this._onWheel.bind(this));
  }

  get zoom() {
    return this._zoom;
  }

  set zoom(value) {

    if (value === this._zoom) {
      return;
    }

    this._zoom = value;

    this._zoom = Math.min(this.max, Math.max(this.min, this._zoom));

    this.style.transform = `scale(${this._zoom})`;

    this.dispatchEvent(new Event("zoom"));
  }

  get min() {
    return this._min;
  }

  set min(value) {
    this._min = value;
    this.zoom = this.zoom;
  }

  get max() {
    return this._max;
  }

  set max(value) {
    this._max = value;
    this.zoom = this.zoom;
  }
}

window.customElements.define("dgui-zoomable", ZoomableElement);
