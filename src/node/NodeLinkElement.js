import Ticker from "../../node_modules/dlib/utils/Ticker.js";
import Pointer from "../../node_modules/dlib/input/Pointer.js";

const POINTER = Pointer.get();

export default class NodeLinkElement extends HTMLElement {
  constructor() {
    super();

    this.in = null;
    this.out = null;

    this.attachShadow({ mode: "open" }).innerHTML = `
      <style>
        :host {
          position: absolute;
          top: 0;
          left: 0;
          // pointer-events: none;
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
        path {
          fill: transparent;
          stroke: black;
          stroke-width: 1px;
        }
        path:hover {
          stroke-width: 2px;
          stroke: red;
        }
      </style>
      <div id="scale-marker"></div>
      <svg>
        <path/>
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

    let pointerX = (POINTER.x - rootBoundingRect.x) / scaleMarkerBoundingRect.width;
    let pointerY = (POINTER.y - rootBoundingRect.y) / scaleMarkerBoundingRect.height;

    let inX = pointerX;
    let inY = pointerY;
    if (this.in) {
      const inBoundingRect = this.in.getBoundingClientRect();
      inX = (inBoundingRect.x + inBoundingRect.width * .5 - rootBoundingRect.x) / scaleMarkerBoundingRect.width;
      inY = (inBoundingRect.y + inBoundingRect.height * .5 - rootBoundingRect.y) / scaleMarkerBoundingRect.height;
    }

    let outX = pointerX;
    let outY = pointerY;
    if (this.out) {
      const outBoundingRect = this.out.getBoundingClientRect();
      outX = (outBoundingRect.x + outBoundingRect.width * .5 - rootBoundingRect.x) / scaleMarkerBoundingRect.width;
      outY = (outBoundingRect.y + outBoundingRect.height * .5 - rootBoundingRect.y) / scaleMarkerBoundingRect.height;
    }

    this._svg.style.transform = `translate(${Math.min(inX, outX) - 1}px, ${Math.min(inY, outY) - 1}px)`;
    this._svg.style.width = `${Math.abs(inX - outX) + 2}px`;
    this._svg.style.height = `${Math.abs(inY - outY) + 2}px`;

    if (outX > inX) {
      outX = outX - inX;
      inX = 0;
    } else {
      inX = inX - outX;
      outX = 0;
    }

    if (outY > inY) {
      outY = outY - inY;
      inY = 0;
    } else {
      inY = inY - outY;
      outY = 0;
    }

    this._path.setAttribute("d", `M${inX + 1} ${inY + 1} L ${outX + 1} ${outY + 1}`);
    // this._path.setAttribute("d", `M${inX + 1} ${inY + 1} C ${inX + (outX - inX) * .5} ${inY}, ${outX + (inX - outX) * .5} ${outY}, ${outX + 1} ${outY + 1}`);
  }
}

window.customElements.define("dnod-node-link", NodeLinkElement);
