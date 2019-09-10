import Config from "./Config.js";

let initialized = false;

export default class GraphElement extends HTMLElement {
  static get observedAttributes() {
    return ["config"];
  }

  static initialize(configUrl) {
    if (initialized) {
      console.warn("Graph has already been initialized with a config file.");
      return Promise.resolve();
    }
    initialized = true;
    return (configUrl ? fetch(configUrl).then((response) => response.json()) : Promise.resolve({})).then((config) => {
      const customElementUrlsMap = new Map(Object.entries(Object.assign(Config.customElementUrlsMap, config.customElementUrlsMap)));
      async function loadModules() {
        for (const [customElementName, customElementUrlMap] of customElementUrlsMap) {
          const module = await import(customElementUrlMap);
          customElements.define(customElementName, module.default);
        }
      };
      return loadModules();
    });
  }

  constructor() {
    super();

    this.attachShadow({ mode: "open" }).innerHTML = `
      <style>
        :host {
          display: block;
          font-family: sans-serif;
        }

        graph-viewport {
          position: absolute;
          width: 100%;
          height: 100%;
        }
      </style>
      <graph-viewport>
        <slot></slot>
      </graph-viewport>
    `;
  }

  attributeChangedCallback(name, oldValue, newValue) {
    switch (name) {
      case "config":
        GraphElement.initialize(newValue);
        break;
    }
  }
}
