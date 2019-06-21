import Config from "./Config.js";

let initialized = false;

export default class GraphElement extends HTMLElement {
  static initialize(configUrl) {
    if (initialized) {
      console.warn("Graph has already been initialized with a config file.");
      return Promise.resolve();
    }
    initialized = true;
    return (configUrl ? fetch(configUrl).then((response) => response.json()) : Promise.resolve({})).then((config) => {
      const customElementUrlsMap = new Map(Object.entries({ ...Config.customElementUrlsMap, ...config.customElementUrlsMap }));
      async function loadModules() {
        for (const [customElementName, customElementUrlMap] of customElementUrlsMap) {
          const module = await import(customElementUrlMap);
          customElements.define(customElementName, module.default);
        }
      };
      return loadModules();
    });
  }

  static get observedAttributes() {
    return ["draggable", "zoomable", "config"];
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
  }

  attributeChangedCallback(name, oldValue, newValue) {
    switch (name) {
      case "config":
        GraphElement.initialize(newValue);
        break;
      case "draggable":
        this._draggable.disabled = !newValue;
        break;
      case "zoomable":
        this._zoomable.disabled = !newValue;
        break;
    }
  }

  get zoomable() {
    return this.hasAttribute("zoomable");
  }

  set zoomable(value) {
    if (value) {
      this.setAttribute("zoomable", "");
    } else {
      this.removeAttribute("zoomable");
    }
  }

  get draggable() {
    return this.hasAttribute("draggable");
  }

  set draggable(value) {
    if (value) {
      this.setAttribute("draggable", "");
    } else {
      this.removeAttribute("draggable");
    }
  }
}
