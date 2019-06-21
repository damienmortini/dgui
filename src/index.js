import Config from "./Config.js";

for (const customElementName in Config.customElementsMap) {
  if (customElements.get(customElementName) === undefined) {
    customElements.define(customElementName, Config.customElementsMap[customElementName]);
  }
}

export default class GraphElement extends HTMLElement {
  static get observedAttributes() {
    return ["draggable", "zoomable"];
  }

  constructor() {
    super();

    this.attachShadow({ mode: "open" }).innerHTML = `
      <style>
        :host {
          display: block;
          font-family: sans-serif;
        }

        graph-zoomable, graph-draggable {
          position: absolute;
          width: 100%;
          height: 100%;
        }
      </style>
      <graph-zoomable handle="this.getRootNode().host" min=".1" max="3">
        <graph-draggable handle="this.getRootNode().host">
            <slot></slot>
        </graph-draggable>
      </graph-zoomable>
    `;

    this._zoomable = this.shadowRoot.querySelector("graph-zoomable");
    this._draggable = this.shadowRoot.querySelector("graph-draggable");

    this._zoomable.addEventListener("zoom", () => {
      this._draggable.dragFactor = 1 / this._zoomable.zoom;
    });

    this._nodesDataMap = new Map();
  }

  connectedCallback() {
    if (this.hasAttribute("config")) {
      fetch(this.getAttribute("config")).then((response) => response.json()).then((config) => {
        const customElementUrlsMap = new Map(Object.entries({ ...Config.customElementUrlsMap, ...config.customElementUrlsMap }));
        for (const [key, customElementUrlMap] of customElementUrlsMap) {
          import(customElementUrlMap).then((module) => {
            console.log(module);
          });
        }
      });
    }
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) {
      return;
    }
    this[name] = newValue === "true";
  }

  get zoomable() {
    return this._zoomable.disabled;
  }

  set zoomable(value) {
    this._zoomable.disabled = !value;
  }

  get draggable() {
    return this._draggable.disabled;
  }

  set draggable(value) {
    this._draggable.disabled = !value;
  }
}
