import Ticker from "../node_modules/dlib/utils/Ticker.js";
import Pointer from "../node_modules/dlib/input/Pointer.js";

const POINTER = Pointer.get();

export default class NodeLinkElement extends HTMLElement {
  constructor() {
    super();

    this.attachShadow({ mode: "open" }).innerHTML = `
      <style>
        :host {
          position: absolute;
          top: 0;
          left: 0;
          pointer-events: none;
        }
        svg {
          position: absolute;
          width: 100%;
          height: 100%;
        }
        #scale-marker {
          position: absolute;
          visibility: hidden;
          width: 1px;
          height: 1px;
        }
      </style>
      <div id="scale-marker"></div>
      <svg>
        <path d="M10 10 C 20 20, 40 20, 50 10" stroke="black" fill="transparent"/>
      </svg>
    `;

    this._svg = this.shadowRoot.querySelector("svg");
    this._path = this.shadowRoot.querySelector("path");
    this._scaleMarker = this.shadowRoot.querySelector("#scale-marker");

    this._updateBinded = this._update.bind(this);
  }

  connectedCallback() {
    Ticker.add(this._updateBinded);
  }

  disconnectedCallback() {
    Ticker.delete(this._updateBinded);
  }

  _update() {
    const rootBoundingRect = this.getBoundingClientRect();
    const scaleMarkerBoundingRect = this._scaleMarker.getBoundingClientRect();

    const inBoundingRect = this.in.getBoundingClientRect();
    let inX = (inBoundingRect.x + inBoundingRect.width * .5 - rootBoundingRect.x) / scaleMarkerBoundingRect.width;
    let inY = (inBoundingRect.y + inBoundingRect.height * .5 - rootBoundingRect.y) / scaleMarkerBoundingRect.height;

    let outX = (POINTER.x  - rootBoundingRect.x) / scaleMarkerBoundingRect.width;
    let outY = (POINTER.y - rootBoundingRect.y) / scaleMarkerBoundingRect.height;

    if (this.out) {
      const outBoundingRect = this.out.getBoundingClientRect();
      outX = (outBoundingRect.x + outBoundingRect.width * .5 - rootBoundingRect.x) / scaleMarkerBoundingRect.width;
      outY = (outBoundingRect.y + outBoundingRect.height * .5 - rootBoundingRect.y) / scaleMarkerBoundingRect.height;
    }

    this._svg.style.transform = `translate(${Math.min(inX, outX) - 1}px, ${Math.min(inY, outY) - 1}px)`;
    this._svg.style.width = `${Math.abs(inX - outX) + 2}px`;
    this._svg.style.height = `${Math.abs(inY - outY) + 2}px`;

    if(outX > inX) {
      outX = outX - inX;
      inX = 0;
    } else {
      inX = inX - outX;
      outX = 0;
    }

    if(outY > inY) {
      outY = outY - inY;
      inY = 0;
    } else {
      inY = inY - outY;
      outY = 0;
    }

    this._path.setAttribute("d", `M${inX + 1} ${inY + 1} C ${inX + (outX - inX) * .5} ${inY}, ${outX + (inX - outX) * .5} ${outY}, ${outX + 1} ${outY + 1}`);
  }

  get in() {
    return this._in;
  }

  set in(value) {
    this._in = value;
  }

  get out() {
    return this._out;
  }

  set out(value) {
    this._out = value;
  }
}

window.customElements.define("dgui-node-link", NodeLinkElement);
