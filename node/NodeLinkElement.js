import Ticker from "../node_modules/dlib/utils/Ticker.js";
import Pointer from "../node_modules/dlib/input/Pointer.js";

const pointer = Pointer.get();
let currentLink;

const linkMap = new Map();

window.addEventListener("guinodeconnect", (event) => {
  currentLink = document.createElement("dgui-node-link");
  currentLink.in = event.path[0];
  document.body.appendChild(currentLink);
});

window.addEventListener("guinodeconnected", (event) => {
  currentLink.out = event.path[0];
  linkMap.set(currentLink.out, currentLink);
});

window.addEventListener("guinodedisconnected", (event) => {
  const link = linkMap.get(event.path[0]);
  if (link) {
    link.remove();
  }
});

export default class NodeLinkElement extends HTMLElement {
  constructor() {
    super();

    this.attachShadow({ mode: "open" }).innerHTML = `
      <style>
        :host {
          position: absolute;
          pointer-events: none;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 2;
        }
        svg {
          width: 100%;
          height: 100%;
        }
      </style>
      <svg>
        <path d="M10 10 C 20 20, 40 20, 50 10" stroke="black" fill="transparent"/>
      </svg>
    `;

    this._path = this.shadowRoot.querySelector("path");

    this._updateBinded = this._update.bind(this);
  }

  connectedCallback() {
    Ticker.add(this._updateBinded);
  }

  disconnectedCallback() {
    Ticker.delete(this._updateBinded);
  }

  _update() {
    const inBoundingRect = this.in.getBoundingClientRect();
    const inX = inBoundingRect.x + inBoundingRect.width * .5;
    const inY = inBoundingRect.y + inBoundingRect.height * .5;

    let outX = pointer.x;
    let outY = pointer.y;

    if (this.out) {
      const outBoundingRect = this.out.getBoundingClientRect();
      outX = outBoundingRect.x + outBoundingRect.width * .5;
      outY = outBoundingRect.y + outBoundingRect.height * .5;
    }

    this._path.setAttribute("d", `M${inX} ${inY} C ${inX + (outX - inX) * .5} ${inY}, ${outX + (inX - outX) * .5} ${outY}, ${outX} ${outY}`);
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
