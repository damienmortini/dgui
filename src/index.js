import Config from "./dnod.config.js";

for (const customElementName in Config.customElementsMap) {
  if (customElements.get(customElementName) === undefined) {
    customElements.define(customElementName, Config.customElementsMap[customElementName]);
  }
}
